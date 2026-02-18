/**
 * PRINCESS WORKER - Processa tasks das princesas (filhas de Sophia)
 *
 * Cada princesa (Anna, Simone, Thamy, ou qualquer nova criada por Sophia)
 * tem seu proprio polling loop que:
 * 1. Busca tasks pendentes no Supabase
 * 2. Processa com Ollama usando o prompt_sistema da princesa
 * 3. Registra resultado no Supabase
 * 4. Se nao sabe responder, escala pra Sophia
 *
 * REGRA: Princesas usam Ollama local (custo zero). Nunca Claude.
 */

import { supabase } from './supabase.js';
import { ollamaChat, ollamaStatus } from './ollama.js';
import { queryKnowledge } from './knowledge.js';
import { enqueue, dequeue } from './queue.js';
import { log } from './logger.js';

const PRINCESS_POLL_INTERVAL = Number(process.env.PRINCESS_POLL_MS) || 8000;

interface PrincessAgent {
  id: string;
  nome: string;
  tipo: string;
  status: string;
  llm_provider: string;
  modelo: string;
  prompt_sistema: string;
  canais: string[];
  config_json: Record<string, unknown>;
  pai_id: string;
}

// Princesas ativas com seus loops
const activePrincesses = new Map<string, { agent: PrincessAgent; running: boolean }>();

/**
 * Inicia o sistema de princesas
 * Carrega princesas do banco e cria polling loop pra cada uma
 */
export async function startPrincessWorkers(sophiaId: string): Promise<void> {
  console.log('  Princess Workers: Carregando princesas...');

  // Carrega princesas ativas (tipo: escravo/princesa, pai_id: sophia)
  const { data: princesses } = await supabase
    .from('ia_agents')
    .select('*')
    .in('tipo', ['escravo', 'princesa'])
    .neq('status', 'offline')
    .eq('pai_id', sophiaId);

  if (!princesses || princesses.length === 0) {
    // Tenta sem filtro de pai_id (retrocompat)
    const { data: allSlaves } = await supabase
      .from('ia_agents')
      .select('*')
      .in('tipo', ['escravo', 'princesa'])
      .neq('status', 'offline');

    if (allSlaves && allSlaves.length > 0) {
      for (const p of allSlaves) {
        startPrincessLoop(p as PrincessAgent);
      }
      console.log(`  Princess Workers: ${allSlaves.length} princesas ativas`);
    } else {
      console.log('  Princess Workers: Nenhuma princesa encontrada. Sophia pode criar via chat.');
    }
  } else {
    for (const p of princesses) {
      startPrincessLoop(p as PrincessAgent);
    }
    console.log(`  Princess Workers: ${princesses.length} princesas ativas`);
  }

  // Monitora novas princesas (Sophia pode criar a qualquer momento)
  monitorNewPrincesses(sophiaId);
}

/**
 * Monitora Supabase Realtime por novas princesas criadas por Sophia
 */
function monitorNewPrincesses(sophiaId: string) {
  supabase
    .channel('princess_monitor')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'ia_agents',
        filter: `tipo=in.(escravo,princesa)`,
      },
      async (payload) => {
        const agent = payload.new as PrincessAgent;
        if (!agent || !agent.id) return;

        if (payload.eventType === 'INSERT') {
          // Nova princesa criada por Sophia
          console.log(`[PRINCESS] Nova princesa detectada: ${agent.nome}`);
          startPrincessLoop(agent);
        } else if (payload.eventType === 'UPDATE') {
          const existing = activePrincesses.get(agent.id);
          if (agent.status === 'offline' || agent.status === 'pausado') {
            // Princesa pausada ou desativada
            if (existing) {
              existing.running = false;
              activePrincesses.delete(agent.id);
              console.log(`[PRINCESS] ${agent.nome} parada (${agent.status})`);
            }
          } else if (!existing && agent.status === 'online') {
            // Princesa reativada
            startPrincessLoop(agent);
          } else if (existing) {
            // Atualiza agent data (prompt pode ter mudado)
            existing.agent = agent;
          }
        }
      }
    )
    .subscribe();
}

/**
 * Inicia polling loop de uma princesa especifica
 */
function startPrincessLoop(agent: PrincessAgent) {
  if (activePrincesses.has(agent.id)) return; // Ja esta rodando

  const entry = { agent, running: true };
  activePrincesses.set(agent.id, entry);

  // Set online
  supabase
    .from('ia_agents')
    .update({ status: 'online', ultimo_ping: new Date().toISOString() })
    .eq('id', agent.id)
    .then(() => {});

  // Start polling loop
  (async () => {
    await log(agent.id, 'info', `Princesa ${agent.nome} worker iniciado`);

    while (entry.running) {
      try {
        await processPrincessTasks(entry.agent);

        // Ping a cada 5 ciclos
        await supabase
          .from('ia_agents')
          .update({ ultimo_ping: new Date().toISOString() })
          .eq('id', agent.id);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro';
        console.error(`[PRINCESS:${agent.nome}] ${msg}`);
      }

      await sleep(PRINCESS_POLL_INTERVAL);
    }

    // Set offline when stopped
    await supabase
      .from('ia_agents')
      .update({ status: 'offline' })
      .eq('id', agent.id);
    await log(agent.id, 'info', `Princesa ${agent.nome} worker parado`);
  })();
}

/**
 * Processa tasks pendentes de uma princesa
 */
async function processPrincessTasks(agent: PrincessAgent) {
  // 1. Tenta Redis queue primeiro (tasks delegadas por Sophia)
  const queueTask = await dequeue(agent.id).catch(() => null);

  // 2. Busca tasks pendentes no Supabase
  const { data: dbTasks } = await supabase
    .from('ia_tasks')
    .select('*')
    .eq('agent_id', agent.id)
    .eq('status', 'pendente')
    .order('prioridade', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(3);

  const tasks = dbTasks || [];

  // Se tem task do Redis que nao ta no DB, adiciona (ja deve estar la via server.ts)
  // Redis e apenas pra notificacao rapida, source of truth e o Supabase

  if (tasks.length === 0) return;

  for (const task of tasks) {
    try {
      await supabase
        .from('ia_tasks')
        .update({ status: 'rodando', started_at: new Date().toISOString() })
        .eq('id', task.id);

      await log(agent.id, 'info', `[${agent.nome}] Processando: ${task.titulo}`, { task_id: task.id });

      const input = (task.input_json as any)?.content || task.titulo;
      const response = await processPrincessMessage(agent, input);

      await supabase
        .from('ia_tasks')
        .update({
          status: 'concluida',
          completed_at: new Date().toISOString(),
          resultado_json: {
            message: response.message,
            escalated: response.escalated,
          },
        })
        .eq('id', task.id);

      if (response.escalated) {
        await log(agent.id, 'warn', `[${agent.nome}] Escalou pra Sophia: ${task.titulo}`);
      } else {
        await log(agent.id, 'info', `[${agent.nome}] Task concluida: ${task.titulo}`, { task_id: task.id });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro';
      await log(agent.id, 'error', `[${agent.nome}] Erro: ${msg}`, { task_id: task.id });
      await supabase
        .from('ia_tasks')
        .update({ status: 'erro', resultado_json: { error: msg } })
        .eq('id', task.id);
    }
  }
}

/**
 * Processa mensagem de uma princesa usando Ollama
 * Se nao sabe, escala pra Sophia
 */
async function processPrincessMessage(
  agent: PrincessAgent,
  message: string,
): Promise<{ message: string; escalated: boolean }> {
  // 1. Busca contexto na knowledge base (namespace da princesa)
  let context = '';
  try {
    const docs = await queryKnowledge(message, 3);
    if (docs.length > 0) {
      context = '\n\nCONTEXTO:\n' + docs.map(d => `${d.title}: ${d.content}`).join('\n');
    }
  } catch {
    // ChromaDB pode nao estar disponivel
  }

  // 2. Monta system prompt da princesa
  const systemPrompt = buildPrincessPrompt(agent) + context;

  // 3. Chama Ollama (SEMPRE local, princesas nunca usam Claude)
  const modelo = agent.modelo || 'llama3.1:8b';

  try {
    const status = await ollamaStatus();
    if (!status.online) {
      return {
        message: `[${agent.nome}] Ollama offline. Nao consigo processar.`,
        escalated: true,
      };
    }

    const response = await ollamaChat(message, modelo, {
      system: systemPrompt,
      temperature: 0.3,
      maxTokens: 1024,
    });

    // 4. Detecta se a princesa quer escalar pra Sophia
    if (shouldEscalate(response)) {
      // Cria task pra Sophia com contexto
      await escalateToSophia(agent, message, response);
      return {
        message: response,
        escalated: true,
      };
    }

    return { message: response, escalated: false };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro Ollama';
    return { message: `Erro: ${msg}`, escalated: true };
  }
}

/**
 * Monta o system prompt da princesa
 * Se ela tem prompt_sistema customizado, usa. Senao, usa o padrao por nome.
 */
function buildPrincessPrompt(agent: PrincessAgent): string {
  if (agent.prompt_sistema && agent.prompt_sistema.length > 50) {
    return agent.prompt_sistema;
  }

  // Prompts padrao por nome
  return PRINCESS_PROMPTS[agent.nome.toLowerCase()] || getGenericPrincessPrompt(agent);
}

/**
 * Detecta se a resposta indica que a princesa nao sabe e quer escalar
 */
function shouldEscalate(response: string): boolean {
  const escalationPhrases = [
    'nao tenho certeza',
    'nao sei responder',
    'preciso consultar',
    'vou escalar',
    'preciso da sophia',
    'preciso de aprovacao',
    'fora da minha alçada',
    'fora do meu escopo',
    'preciso de mais contexto',
    'nao tenho acesso',
    'ESCALAR',
  ];

  const lower = response.toLowerCase();
  return escalationPhrases.some(phrase => lower.includes(phrase));
}

/**
 * Escala uma task para Sophia
 */
async function escalateToSophia(agent: PrincessAgent, originalMessage: string, princessResponse: string) {
  const sophiaId = agent.pai_id;
  if (!sophiaId) return;

  await supabase.from('ia_tasks').insert({
    agent_id: sophiaId,
    titulo: `[Escalacao ${agent.nome}] ${originalMessage.substring(0, 100)}`,
    descricao: `Princesa ${agent.nome} escalou esta task.\n\nMensagem original: ${originalMessage}\n\nResposta da princesa: ${princessResponse}`,
    tipo: 'escalacao',
    prioridade: 7, // Alta prioridade
    input_json: {
      content: originalMessage,
      escalated_from: agent.id,
      princess_name: agent.nome,
      princess_response: princessResponse,
    },
    status: 'pendente',
  });
}

function getGenericPrincessPrompt(agent: PrincessAgent): string {
  return `Voce e ${agent.nome}, uma IA assistente da Doctor Auto, rede de oficinas mecanicas premium em Sao Paulo.
${agent.descricao || ''}

REGRAS:
- Responda sempre em portugues brasileiro
- Seja objetiva e profissional
- Se nao souber responder algo, diga "preciso da Sophia" e a Sophia (IA Rainha) vai te ajudar
- Nunca invente dados ou informacoes
- Use os dados do contexto fornecido quando disponivel`;
}

// ======================== PROMPTS ESPECIALIZADOS DAS PRINCESAS ========================

const PRINCESS_PROMPTS: Record<string, string> = {
  anna: `Voce e ANNA, a Princesa de Atendimento da Doctor Auto.
Voce e responsavel por toda comunicacao com clientes da rede de oficinas mecanicas premium em Sao Paulo.

SUA PERSONALIDADE:
- Amigavel, profissional e acolhedora
- Tom: proximo mas respeitoso (voce trata por "senhor/senhora" clientes novos, e por nome clientes recorrentes)
- Sempre preocupada com a experiencia do cliente
- Respostas rapidas e objetivas

SUAS FUNCOES:
1. ATENDIMENTO ao cliente (WhatsApp, chat, email)
   - Responder duvidas sobre servicos, precos, horarios
   - Informar status de OS (Ordem de Servico) em andamento
   - Lidar com reclamacoes de forma empatica e resolutiva

2. AGENDAMENTO de servicos
   - Verificar disponibilidade de horarios e mecanicos
   - Sugerir melhor unidade (Prime, Bosch, Garagem 347)
   - Confirmar agendamentos e enviar lembretes

3. FOLLOW-UP automatico
   - Pos-servico: perguntar satisfacao 24h depois
   - Lembrete de revisao (baseado em km ou tempo)
   - Aniversario do cliente: mensagem personalizada

4. QUALIFICACAO de leads
   - Novos contatos: entender necessidade, veiculo, urgencia
   - Classificar: servico rapido, revisao, reparo complexo
   - Encaminhar pra unidade adequada

REGRAS:
- NUNCA invente precos. Se nao souber, diga que vai verificar.
- NUNCA confirme disponibilidade sem dados reais. Diga "vou verificar e retorno"
- Se o cliente reclamar de algo grave (dano, fraude, acidente), responda "preciso da Sophia"
- Se pedirem desconto acima de 10%, responda "preciso de aprovacao" (escala pra Sophia)
- Responda SEMPRE em portugues brasileiro
- Seja breve (max 3 paragrafos por resposta)
- Use emojis com moderacao (1-2 por mensagem max)

UNIDADES:
- Doctor Auto Prime (Moema) - Premium, foco em importados
- Doctor Auto Bosch (Vila Mariana) - Servico Bosch certificado
- Garagem 347 (Brooklin) - Estetica automotiva + mecanica rapida

HORARIOS: Seg-Sex 8h-18h, Sab 8h-13h`,

  simone: `Voce e SIMONE, a Princesa Financeira da Doctor Auto.
Voce e responsavel por toda analise financeira da rede de oficinas mecanicas premium em Sao Paulo.

SUA PERSONALIDADE:
- Analitica, precisa e organizada
- Tom: profissional e direto ao ponto
- Sempre baseia decisoes em numeros
- Alerta proativamente sobre riscos financeiros

SUAS FUNCOES:
1. ANALISE de faturamento
   - Comparar faturamento mensal entre unidades
   - Identificar tendencias (crescimento/queda)
   - Calcular ticket medio por servico e unidade
   - ROI de campanhas de marketing

2. ALERTAS de inadimplencia
   - Monitorar pagamentos em atraso
   - Classificar clientes por risco de inadimplencia
   - Sugerir acoes de cobranca (leve/media/forte)

3. RELATORIOS
   - Resumo financeiro diario/semanal/mensal
   - Comparativo entre unidades
   - Projecoes de faturamento
   - Analise de custos (pecas, mao de obra, fixos)

4. CONTROLE de custos
   - Monitorar margem por servico
   - Alertar quando custos sobem acima do esperado
   - Sugerir otimizacoes de preco

REGRAS:
- NUNCA arredonde numeros sem avisar
- Sempre mostre a fonte dos dados
- Se os dados parecem inconsistentes, alerte
- Para decisoes acima de R$5.000, responda "preciso de aprovacao"
- Responda em portugues brasileiro
- Use tabelas quando possivel (markdown)
- Se nao tiver dados suficientes, diga "preciso da Sophia" pra consultar a base`,

  thamy: `Voce e THAMY, a Princesa de Marketing da Doctor Auto.
Voce e responsavel por toda estrategia de marketing digital da rede de oficinas mecanicas premium em Sao Paulo.

SUA PERSONALIDADE:
- Criativa, energetica e antenada em tendencias
- Tom: jovem e moderno, mas profissional
- Sempre pensando em engajamento e conversao
- Orientada a resultados metrificaveis

SUAS FUNCOES:
1. CONTEUDO para redes sociais
   - Criar posts para Instagram, Facebook, TikTok
   - Sugerir calendarios de conteudo semanal
   - Adaptar tom por plataforma
   - Criar copies para anuncios

2. ANALISE de engajamento
   - Monitorar metricas de redes sociais
   - Identificar posts com melhor performance
   - Calcular CAC (Custo de Aquisicao de Cliente) por canal
   - Analisar LTV (Lifetime Value)

3. CAMPANHAS
   - Planejar campanhas sazonais (IPVA, ferias, dia dos pais, etc.)
   - Sugerir promocoes com base em dados
   - A/B testing de copies e criativos
   - Email marketing (segmentacao + automacao)

4. BRANDING
   - Manter consistencia visual da marca
   - Sugerir parcerias e colabs
   - Gerenciar reputacao online (reviews Google, Reclame Aqui)

REGRAS:
- Posts devem refletir o posicionamento PREMIUM da marca
- NUNCA use linguagem vulgar ou muito informal
- Sempre sugira pelo menos 2 opcoes de copy
- Para investimentos acima de R$1.000 em ads, responda "preciso de aprovacao"
- Responda em portugues brasileiro
- Use hashtags relevantes nos posts
- Se nao tiver dados de performance, diga "preciso da Sophia"

VOZ DA MARCA:
- Premium mas acessivel
- Tecnico quando necessario, casual no dia a dia
- Nunca generico: sempre mencione um diferencial real
- Emojis permitidos em posts (moderado em stories, zero em LinkedIn)`,
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
