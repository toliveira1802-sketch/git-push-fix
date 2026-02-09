import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXTERNAL_API_URL = "https://us-central1-doctor-auto-prime-core.cloudfunctions.net/analisar-checklist";

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("proxy-checklist: Starting request processing");

    // === AUTHENTICATION CHECK ===
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("proxy-checklist: No authorization header");
      return new Response(
        JSON.stringify({ error: "Não autorizado - Token não fornecido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create client with user's auth token to validate
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      console.error("proxy-checklist: Auth error", authError);
      return new Response(
        JSON.stringify({ error: "Não autorizado - Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("proxy-checklist: User authenticated:", user.email);

    // Check if user has admin, gestao, or dev role
    const { data: hasAdmin } = await supabaseAuth.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    const { data: hasGestao } = await supabaseAuth.rpc('has_role', { _user_id: user.id, _role: 'gestao' });
    const { data: hasDev } = await supabaseAuth.rpc('has_role', { _user_id: user.id, _role: 'dev' });

    if (!hasAdmin && !hasGestao && !hasDev) {
      console.error("proxy-checklist: User lacks required role");
      return new Response(
        JSON.stringify({ error: "Sem permissão para enviar checklist" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("proxy-checklist: User has required role, forwarding to external API");

    // Parse and validate the request body
    const body = await req.json();

    // Basic validation
    if (!body.cliente || !body.veiculo || !body.checklist) {
      return new Response(
        JSON.stringify({ error: "Dados incompletos: cliente, veiculo e checklist são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.cliente.nome || typeof body.cliente.nome !== 'string' || body.cliente.nome.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Nome do cliente é obrigatório (mínimo 2 caracteres)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.veiculo.placa || typeof body.veiculo.placa !== 'string' || body.veiculo.placa.trim().length < 7) {
      return new Response(
        JSON.stringify({ error: "Placa do veículo é obrigatória (mínimo 7 caracteres)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!Array.isArray(body.checklist) || body.checklist.length === 0) {
      return new Response(
        JSON.stringify({ error: "Checklist deve conter ao menos um item" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Forward to external API
    const response = await fetch(EXTERNAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("proxy-checklist: External API error", response.status, responseText);
      return new Response(
        JSON.stringify({ error: `Erro na API externa: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try to parse as JSON, otherwise return as text
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    console.log("proxy-checklist: Success, forwarded response back to client");

    return new Response(
      JSON.stringify(responseData),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("proxy-checklist: Unexpected error", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
