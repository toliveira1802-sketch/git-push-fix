import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // === AUTHENTICATION CHECK ===
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("ai-oficina: No authorization header");
      return new Response(
        JSON.stringify({ error: "Não autorizado - Token não fornecido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("ai-oficina: Auth error", authError);
      return new Response(
        JSON.stringify({ error: "Não autorizado - Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("ai-oficina: User authenticated:", user.email);
    // === END AUTHENTICATION CHECK ===

    const { type, messages } = await req.json();

    return new Response(
      JSON.stringify({ 
        response: "IA temporariamente indisponível.",
        success: true 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ai-oficina: Error", error);
    return new Response(
      JSON.stringify({ error: "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
