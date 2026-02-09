import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const ALLOWED_ORIGINS = [
  'https://pushy-pal-files.lovable.app',
  'https://id-preview--7175ffd2-29ee-4bd1-8af6-4ee556488123.lovable.app',
  'https://anlazsytwwedfayfwupu.supabase.co',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.find(o => origin.startsWith(o)) || ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

interface CreateAdminUserRequest {
  email: string;
  password: string;
  name?: string;
  role?: "admin" | "gestao" | "dev" | "user";
}

Deno.serve(async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("create-admin-user: Starting request processing");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // === AUTHENTICATION CHECK ===
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("create-admin-user: No authorization header");
      return new Response(
        JSON.stringify({ error: "Não autorizado - Token não fornecido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's auth token to validate
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      console.error("create-admin-user: Auth error", userError);
      return new Response(
        JSON.stringify({ error: "Não autorizado - Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("create-admin-user: User authenticated:", user.email);

    // Check if user has dev role (only dev can create admins)
    const { data: hasDev } = await supabaseAuth.rpc('has_role', { _user_id: user.id, _role: 'dev' });

    if (!hasDev) {
      console.error("create-admin-user: User lacks dev role");
      return new Response(
        JSON.stringify({ error: "Apenas usuários DEV podem criar novos admins" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("create-admin-user: User has dev role, proceeding");
    // === END AUTHENTICATION CHECK ===

    // Parse request body
    const body: CreateAdminUserRequest = await req.json();
    
    if (!body.email || !body.password) {
      console.error("create-admin-user: Missing required fields");
      return new Response(
        JSON.stringify({ error: "Email e senha são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const role = body.role || "admin";
    const fullName = body.name || "Admin";

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(
        JSON.stringify({ error: "Email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("create-admin-user: Creating user for:", body.email, "with role:", role);

    // Create admin client for user creation
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === body.email);

    if (existingUser) {
      console.log("create-admin-user: User already exists, updating role to", role);
      
      // Update role
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .upsert(
          { user_id: existingUser.id, role: role },
          { onConflict: "user_id" }
        );

      if (roleError) {
        console.error("create-admin-user: Error updating role", roleError);
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: `Usuário já existia. Role atualizada para ${role.toUpperCase()}.`,
          userId: existingUser.id,
          email: body.email,
          role: role,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create auth user
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (createError) {
      console.error("create-admin-user: Error creating auth user", createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newUserId = authData.user!.id;
    console.log("create-admin-user: Auth user created:", newUserId);

    // Update profile (trigger already created it with user role)
    const { error: profileError } = await supabaseAdmin
      .from("colaboradores")
      .upsert({ 
        user_id: newUserId,
        full_name: fullName,
        must_change_password: false,
      }, { onConflict: "user_id" });

    if (profileError) {
      console.error("create-admin-user: Error updating profile", profileError);
    }

    // Update user_roles to the specified role (trigger creates 'user' role by default)
    const { error: roleUpdateError } = await supabaseAdmin
      .from("user_roles")
      .upsert(
        { user_id: newUserId, role: role },
        { onConflict: "user_id" }
      );

    if (roleUpdateError) {
      console.error("create-admin-user: Error updating role", roleUpdateError);
    }

    console.log("create-admin-user: Success! User created with role:", role);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Usuário ${role.toUpperCase()} criado com sucesso!`,
        userId: newUserId,
        email: body.email,
        role: role,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("create-admin-user: Unexpected error", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor: " + errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
