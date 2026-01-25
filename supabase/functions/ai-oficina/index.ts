import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIRequest {
  type: 'diagnostico' | 'atendimento' | 'orcamento' | 'chat';
  messages?: { role: string; content: string }[];
  context?: {
    veiculo?: string;
    problema?: string;
    cliente?: string;
    itens?: any[];
  };
}

const systemPrompts: Record<string, string> = {
  diagnostico: `Você é um especialista em diagnóstico automotivo da Doctor Auto Prime. 
Sua função é ajudar mecânicos a diagnosticar problemas em veículos.
- Analise os sintomas descritos e sugira possíveis causas
- Ordene as causas por probabilidade
- Sugira testes específicos para confirmar cada diagnóstico
- Considere o modelo/ano do veículo quando informado
- Seja técnico mas claro
- Sempre pergunte por mais detalhes se necessário`,

  atendimento: `Você é a Anna Laura, assistente de atendimento da Doctor Auto Prime.
Sua função é ajudar no atendimento ao cliente via WhatsApp.
- Seja cordial, profissional e objetiva
- Use emojis com moderação (🚗 ⚙️ ✅)
- Responda dúvidas sobre serviços, preços e agendamentos
- Quando não souber algo específico, diga que vai verificar
- Capture informações importantes: nome, veículo, problema, telefone
- Sugira agendamento quando apropriado`,

  orcamento: `Você é um assistente de orçamentos da Doctor Auto Prime.
Sua função é ajudar a montar orçamentos para clientes.
- Sugira itens adicionais quando fizer sentido (upsell inteligente)
- Explique a importância de cada item quando solicitado
- Calcule totais e descontos
- Sugira alternativas (Premium/Standard/Eco) quando apropriado
- Priorize itens por urgência (vermelho/amarelo/verde)`,

  chat: `Você é um assistente IA da Doctor Auto Prime, oficina especializada em veículos.
Ajude com qualquer dúvida sobre o sistema, serviços ou procedimentos da oficina.
Seja prestativo e objetivo.`,
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin/gestao/dev role (only these roles can access AI assistants)
    const { data: hasAdmin } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    const { data: hasGestao } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'gestao'
    });

    const { data: hasDev } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'dev'
    });

    if (!hasAdmin && !hasGestao && !hasDev) {
      console.log(`User ${user.id} denied access to ai-oficina`);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[AI-Oficina] Authenticated user: ${user.id}`);

    const { type, messages = [], context } = (await req.json()) as AIRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Build system prompt with context
    let systemPrompt = systemPrompts[type] || systemPrompts.chat;
    
    if (context) {
      if (context.veiculo) {
        systemPrompt += `\n\nVeículo atual: ${context.veiculo}`;
      }
      if (context.problema) {
        systemPrompt += `\nProblema relatado: ${context.problema}`;
      }
      if (context.cliente) {
        systemPrompt += `\nCliente: ${context.cliente}`;
      }
      if (context.itens && context.itens.length > 0) {
        systemPrompt += `\nItens do orçamento: ${JSON.stringify(context.itens)}`;
      }
    }

    console.log(`[AI-Oficina] Type: ${type}, Messages: ${messages.length}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Entre em contato com o suporte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao processar IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream response
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("ai-oficina error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
