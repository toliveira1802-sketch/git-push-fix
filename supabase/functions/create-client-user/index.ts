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

interface CreateClientUserRequest {
  email: string;
  name: string;
  phone: string;
  cpf?: string;
  address?: string;
  city?: string;
}

// Gera senha temporária aleatória de 12 caracteres
const generateTempPassword = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

Deno.serve(async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("create-client-user: Starting request processing");

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("create-client-user: No authorization header");
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
      console.error("create-client-user: Error getting user", userError);
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("create-client-user: Requesting user:", requestingUser.id);

    // Check if user has admin/gestao/dev role
    const { data: roleData, error: roleError } = await supabaseUser
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .in("role", ["admin", "gestao", "dev"])
      .limit(1)
      .single();

    if (roleError || !roleData) {
      console.error("create-client-user: User doesn't have permission", roleError);
      return new Response(
        JSON.stringify({ error: "Sem permissão para criar usuários" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("create-client-user: User has role:", roleData.role);

    // Parse request body
    const body: CreateClientUserRequest = await req.json();
    
    if (!body.email || !body.name || !body.phone) {
      console.error("create-client-user: Missing required fields");
      return new Response(
        JSON.stringify({ error: "Email, nome e telefone são obrigatórios" }),
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

    console.log("create-client-user: Creating auth user for:", body.email);

    // Create admin client for user creation
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create auth user with default password
    const tempPassword = generateTempPassword();
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: body.name,
      },
    });

    if (authError) {
      console.error("create-client-user: Error creating auth user", authError);
      
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
    console.log("create-client-user: Auth user created:", newUserId);

    // Update colaboradores to set must_change_password = true
    const { error: profileError } = await supabaseAdmin
      .from("colaboradores")
      .update({ 
        must_change_password: true,
        full_name: body.name,
        phone: body.phone,
      })
      .eq("user_id", newUserId);

    if (profileError) {
      console.error("create-client-user: Error updating profile", profileError);
      // Profile is created by trigger, if update fails we should still continue
    }

    // Create client record linked to the new user
    const { data: clientData, error: clientError } = await supabaseAdmin
      .from("clientes")
      .insert({
        user_id: newUserId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        cpf: body.cpf || null,
        address: body.address || null,
        city: body.city || null,
        registration_source: "admin",
        pending_review: false,
      })
      .select()
      .single();

    if (clientError) {
      console.error("create-client-user: Error creating client", clientError);
      // If client creation fails, we should still return success for auth user
      // The admin can manually link later
    }

    console.log("create-client-user: Success! Client ID:", clientData?.id);

    // Log password server-side only for admin reference (never sent to client)
    console.log(`create-client-user: Temp password for ${body.email} generated. Admin should use password reset flow if needed.`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Cliente criado com sucesso. Uma senha temporária foi gerada. O cliente deverá usar "Esqueci minha senha" para definir o acesso.`,
        userId: newUserId,
        clientId: clientData?.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("create-client-user: Unexpected error", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
