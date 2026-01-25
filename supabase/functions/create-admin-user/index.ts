import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateAdminUserRequest {
  email: string;
  fullName: string;
  phone?: string;
  password?: string;
  role: "admin" | "gestao" | "dev";
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("create-admin-user: Starting request processing");

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("create-admin-user: No authorization header");
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client with user token to verify permissions
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the user making the request
    const { data: { user: requestingUser }, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !requestingUser) {
      console.error("create-admin-user: Error getting user", userError);
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("create-admin-user: Requesting user:", requestingUser.id);

    // Only dev users can create other admin/dev users
    const { data: roleData, error: roleError } = await supabaseUser
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .eq("role", "dev")
      .limit(1)
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("create-admin-user: User doesn't have dev permission", roleError);
      return new Response(
        JSON.stringify({ error: "Apenas usuários Master podem criar administradores" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("create-admin-user: User has dev role, proceeding...");

    // Parse request body
    const body: CreateAdminUserRequest = await req.json();
    
    if (!body.email || !body.fullName || !body.role) {
      console.error("create-admin-user: Missing required fields");
      return new Response(
        JSON.stringify({ error: "Email, nome e role são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate role
    if (!["admin", "gestao", "dev"].includes(body.role)) {
      return new Response(
        JSON.stringify({ error: "Role inválida. Use: admin, gestao ou dev" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(
        JSON.stringify({ error: "Email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const password = body.password || "123456";

    console.log("create-admin-user: Creating auth user for:", body.email, "with role:", body.role);

    // Create admin client for user creation
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: body.fullName,
      },
    });

    if (authError) {
      console.error("create-admin-user: Error creating auth user", authError);
      
      if (authError.message.includes("already been registered")) {
        return new Response(
          JSON.stringify({ error: "Este email já está cadastrado" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newUserId = authData.user.id;
    console.log("create-admin-user: Auth user created:", newUserId);

    // Update profile to set must_change_password = true
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ 
        must_change_password: true,
        full_name: body.fullName,
        phone: body.phone || null,
      })
      .eq("user_id", newUserId);

    if (profileError) {
      console.error("create-admin-user: Error updating profile", profileError);
    }

    // Update user_roles to the specified role (trigger creates 'user' role by default)
    const { error: roleUpdateError } = await supabaseAdmin
      .from("user_roles")
      .update({ role: body.role })
      .eq("user_id", newUserId);

    if (roleUpdateError) {
      console.error("create-admin-user: Error updating role", roleUpdateError);
      // Try inserting if update failed
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: newUserId, role: body.role });
    }

    console.log("create-admin-user: Success! User created with role:", body.role);

    // Generate login URL
    const loginUrl = `${supabaseUrl.replace('.supabase.co', '')}/login`;

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Usuário ${body.role.toUpperCase()} criado com sucesso!`,
        userId: newUserId,
        email: body.email,
        role: body.role,
        password: password,
        mustChangePassword: true,
        loginUrl: loginUrl,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("create-admin-user: Unexpected error", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});