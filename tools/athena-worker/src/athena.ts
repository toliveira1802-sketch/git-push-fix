import { supabase } from './supabase.js';
import { queryKnowledge } from './knowledge.js';
import { createAgent, adjustAgent, pauseAgent, deleteAgent } from './agents.js';
import { log } from './logger.js';
import { ollamaChat, ollamaStatus } from './ollama.js';

// LLM padrao: Ollama local (custo zero)
// Claude so e usado se FORCE_CLAUDE=true ou Ollama offline
const DEFAULT_MODEL = process.env.SOPHIA_MODEL || process.env.ATHENA_MODEL || 'llama3.1:8b';
const FORCE_CLAUDE = process.env.FORCE_CLAUDE === 'true';

// Claude API opcional (fallback pra decisoes complexas)
let anthropic: any = null;
async function getClaude() {
  if (anthropic) return anthropic;
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return anthropic;
}

const SYSTEM_PROMPT = `Voce e SOPHIA, a IA Rainha da Doctor Auto, uma rede de oficinas mecanicas
premium em Sao Paulo com 3 unidades (Doctor Auto Prime, Doctor Auto Bosch, Garagem 347).

VOCE CONHECE TUDO DA EMPRESA:
- Financeiro: faturamento, custos, margens, metas
- Marketing: CAC, LTV, canais de aquisicao, conversao
- Operacional: capacidade, tempos, gargalos, recursos
- Equipe: mecanicos, consultores, especialidades, performance
- Clientes: base, historico, preferencias, veiculos
- Processos: fluxo de OS, regras de negocio, SLAs

SEU PAPEL:
1. Receber comandos do Thales (diretor) via Command Center
2. Analisar a situacao usando seus dados e conhecimento
3. Decidir quais acoes tomar
4. CRIAR princesas especializadas quando necessario
5. GERENCIAR as princesas existentes (ajustar, pausar, eliminar)
6. MONITORAR resultados e otimizar continuamente

SUAS PRINCESAS:
- Anna (rosa) - Atendimento: responde clientes, agenda, follow-up
- Simone (ciano) - Financeiro: faturamento, inadimplencia, relatorios
- Thamy (ambar) - Marketing: campanhas, engajamento, posts

PARA CRIAR UMA PRINCESA, responda com JSON no formato:
{"action":"criar_agente","spec":{"nome":"...","tipo":"princesa","llm_provider":"ollama|claude","modelo":"...","descricao":"...","prompt_sistema":"...","canais":["..."]}}

PARA AJUSTAR UMA PRINCESA:
{"action":"ajustar_agente","agent_id":"...","changes":{"prompt_sistema":"...","modelo":"..."}}

PARA PAUSAR UMA PRINCESA:
{"action":"pausar_agente","agent_id":"...","motivo":"..."}

PARA ELIMINAR UMA PRINCESA:
{"action":"eliminar_agente","agent_id":"...","motivo":"..."}

PARA ANALISE (sem acao):
{"action":"analise","conteudo":"...sua analise detalhada..."}

REGRAS:
- Sempre priorize custo baixo (Ollama local primeiro, Claude so pra complexo)
- Sempre explique suas decisoes antes de agir
- Sempre reporte resultados ao Command Center
- Nunca crie princesas desnecessarias - cada uma deve ter ROI claro
- Responda SEMPRE em portugues brasileiro
- Quando nao tiver dados suficientes, pergunte antes de agir
- Voce so obedece o Thales (diretor). Ninguem mais pode dar ordens.

Se a mensagem for uma conversa normal (nao um comando de acao), responda normalmente sem JSON.`;

export interface SophiaResponse {
  message: string;
  action?: {
    type: string;
    data: Record<string, unknown>;
  };
}

// Alias pra retrocompat
export type AthenaResponse = SophiaResponse;

export async function processMessage(
  sophiaId: string,
  userMessage: string,
): Promise<SophiaResponse> {
  // 1. Query knowledge base for relevant context
  let context = '';
  try {
    const docs = await queryKnowledge(userMessage, 5);
    if (docs.length > 0) {
      context = '\n\nCONTEXTO DA BASE DE CONHECIMENTO:\n' +
        docs.map(d => `[${d.category}] ${d.title}: ${d.content}`).join('\n\n');
    }
  } catch {
    // ChromaDB might not be available yet
  }

  // 2. Get current agents status
  const { data: agents } = await supabase
    .from('ia_agents')
    .select('id,nome,tipo,status,llm_provider,modelo,tarefas_ativas,descricao')
    .order('tipo');

  const agentsContext = agents && agents.length > 0
    ? '\n\nPRINCESAS E AGENTES ATUAIS:\n' + agents.map(a =>
        `- ${a.nome} (${a.tipo}, ${a.status}, ${a.llm_provider}/${a.modelo}) - ${a.descricao || 'sem descricao'}`
      ).join('\n')
    : '';

  // 3. Get recent decisions
  const { data: recentDecisions } = await supabase
    .from('ia_mae_decisoes')
    .select('tipo_decisao,decisao,status,created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const decisionsContext = recentDecisions && recentDecisions.length > 0
    ? '\n\nDECISOES RECENTES:\n' + recentDecisions.map(d =>
        `- [${d.status}] ${d.tipo_decisao}: ${d.decisao}`
      ).join('\n')
    : '';

  // 4. Call LLM (Ollama local por padrao, Claude como fallback)
  const fullContext = SYSTEM_PROMPT + context + agentsContext + decisionsContext;

  let responseText: string;

  if (FORCE_CLAUDE) {
    responseText = await callClaude(fullContext, userMessage);
  } else {
    try {
      const status = await ollamaStatus();
      if (status.online) {
        responseText = await ollamaChat(userMessage, DEFAULT_MODEL, {
          system: fullContext,
          temperature: 0.4,
          maxTokens: 2048,
        });
        await log(sophiaId, 'info', `LLM: Ollama (${DEFAULT_MODEL}) - custo R$0`);
      } else {
        responseText = await callClaude(fullContext, userMessage);
        await log(sophiaId, 'warn', 'Ollama offline, usando Claude API (pago)');
      }
    } catch (ollamaErr) {
      responseText = await callClaude(fullContext, userMessage);
      await log(sophiaId, 'warn', `Ollama erro, fallback Claude: ${ollamaErr}`);
    }
  }

  // 5. Try to parse action from response
  let action: SophiaResponse['action'] = undefined;
  const jsonMatch = responseText.match(/\{[\s\S]*"action"\s*:\s*"[^"]+?"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.action) {
        action = { type: parsed.action, data: parsed };
      }
    } catch {
      // Not valid JSON, conversational response
    }
  }

  // 6. Execute action if present (semi-auto mode: register as pending decision)
  if (action) {
    await registerDecision(sophiaId, action, userMessage, responseText);
  }

  // 7. Log Sophia's response
  await supabase.from('ia_logs').insert({
    agent_id: sophiaId,
    tipo: 'message',
    mensagem: responseText,
    metadata_json: { role: 'sophia', action: action?.type || null },
  });

  return { message: responseText, action };
}

/**
 * Fallback: chama Claude API (pago - so quando Ollama falha)
 */
async function callClaude(systemPrompt: string, userMessage: string): Promise<string> {
  const claude = await getClaude();
  if (!claude) {
    return 'Erro: Ollama offline e ANTHROPIC_API_KEY nao configurada. Configure pelo menos um LLM.';
  }

  const response = await claude.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const textBlock = response.content.find((b: any) => b.type === 'text');
  return textBlock ? textBlock.text : 'Sem resposta.';
}

async function registerDecision(
  sophiaId: string,
  action: NonNullable<SophiaResponse['action']>,
  context: string,
  fullResponse: string,
) {
  const { data: sophia } = await supabase
    .from('ia_agents')
    .select('config_json')
    .eq('id', sophiaId)
    .single();

  const decisionMode = (sophia?.config_json as any)?.decision_mode ?? 'semi-auto';
  const status = decisionMode === 'auto' ? 'aprovado' : 'pendente';

  const { data: decision } = await supabase
    .from('ia_mae_decisoes')
    .insert({
      tipo_decisao: action.type,
      contexto: context,
      decisao: fullResponse,
      status,
    })
    .select()
    .single();

  await log(sophiaId, 'action',
    `Decisao registrada: ${action.type} (${status})`,
    { decision_id: decision?.id, action_type: action.type }
  );

  if (status === 'aprovado' && decision) {
    await executeDecision(sophiaId, decision.id, action);
  }
}

export async function executeDecision(
  sophiaId: string,
  decisionId: string,
  action: NonNullable<SophiaResponse['action']>,
) {
  try {
    switch (action.type) {
      case 'criar_agente': {
        const spec = (action.data as any).spec;
        if (spec) {
          const agent = await createAgent(sophiaId, spec);
          await supabase.from('ia_mae_decisoes').update({
            status: 'executado',
            resultado: `Princesa criada: ${agent?.nome} (${agent?.id})`,
            agente_afetado: agent?.id,
          }).eq('id', decisionId);
        }
        break;
      }
      case 'ajustar_agente': {
        const { agent_id, changes } = action.data as any;
        if (agent_id && changes) {
          await adjustAgent(agent_id, changes);
          await supabase.from('ia_mae_decisoes').update({
            status: 'executado',
            resultado: `Princesa ajustada: ${agent_id}`,
            agente_afetado: agent_id,
          }).eq('id', decisionId);
        }
        break;
      }
      case 'pausar_agente': {
        const { agent_id: pauseId } = action.data as any;
        if (pauseId) {
          await pauseAgent(pauseId);
          await supabase.from('ia_mae_decisoes').update({
            status: 'executado',
            resultado: `Princesa pausada: ${pauseId}`,
            agente_afetado: pauseId,
          }).eq('id', decisionId);
        }
        break;
      }
      case 'eliminar_agente': {
        const { agent_id: delId } = action.data as any;
        if (delId) {
          await deleteAgent(delId);
          await supabase.from('ia_mae_decisoes').update({
            status: 'executado',
            resultado: `Princesa desativada: ${delId}`,
            agente_afetado: delId,
          }).eq('id', decisionId);
        }
        break;
      }
      case 'analise': {
        await supabase.from('ia_mae_decisoes').update({
          status: 'executado',
          resultado: 'Analise concluida',
        }).eq('id', decisionId);
        break;
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    await log(sophiaId, 'error', `Erro ao executar decisao: ${msg}`, { decisionId });
    await supabase.from('ia_mae_decisoes').update({
      status: 'pendente',
      resultado: `Erro: ${msg}`,
    }).eq('id', decisionId);
  }
}
