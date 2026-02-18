/**
 * CRONJOBS - Bots intermediarios que coletam dados do site pra Sophia
 *
 * Sophia e INVISIVEL no site. Ninguem interage com ela diretamente.
 * Esses cronjobs sao os "olhos e ouvidos" dela:
 *
 * 1. Bot Coletor: coleta metricas do Supabase (OS, faturamento, estoque)
 * 2. Bot Alimentador: envia dados pro ChromaDB (knowledge base)
 * 3. Bot Monitor: detecta anomalias e cria alertas
 *
 * Fluxo: Site (Supabase) -> Cronjob -> Sophia (knowledge base + alerts)
 */

import { supabase } from './supabase.js';
import { ingestDocument, syncBusinessData } from './knowledge.js';
import { log } from './logger.js';
import { publish, cacheSet, cacheGet } from './queue.js';

interface CronConfig {
  name: string;
  interval: number; // ms
  handler: (sophiaId: string) => Promise<void>;
  enabled: boolean;
}

let sophiaId: string | null = null;
let running = true;

/**
 * Inicia todos os cronjobs
 */
export function startCronjobs(id: string) {
  sophiaId = id;
  console.log('  Cronjobs: Iniciando bots intermediarios...');

  const jobs: CronConfig[] = [
    {
      name: 'metricas-rapidas',
      interval: 5 * 60 * 1000,  // 5 min
      handler: collectQuickMetrics,
      enabled: true,
    },
    {
      name: 'sync-knowledge',
      interval: 60 * 60 * 1000,  // 1 hora
      handler: syncKnowledgeBase,
      enabled: true,
    },
    {
      name: 'monitor-anomalias',
      interval: 15 * 60 * 1000,  // 15 min
      handler: monitorAnomalies,
      enabled: true,
    },
    {
      name: 'monitor-os-abertas',
      interval: 10 * 60 * 1000,  // 10 min
      handler: monitorOpenOrders,
      enabled: true,
    },
    {
      name: 'cleanup-logs',
      interval: 24 * 60 * 60 * 1000,  // 24h
      handler: cleanupOldLogs,
      enabled: true,
    },
  ];

  for (const job of jobs) {
    if (!job.enabled) continue;
    startCronLoop(job);
  }

  console.log(`  Cronjobs: ${jobs.filter(j => j.enabled).length} jobs ativos`);
}

function startCronLoop(job: CronConfig) {
  (async () => {
    // Delay inicial pra nao sobrecarregar no boot
    await sleep(Math.random() * 30000 + 5000);

    while (running) {
      try {
        if (sophiaId) {
          await job.handler(sophiaId);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro';
        console.error(`[CRON:${job.name}] ${msg}`);
      }
      await sleep(job.interval);
    }
  })();
}

// ======================== METRICAS RAPIDAS ========================

/**
 * Coleta metricas rapidas do Supabase e salva no Redis cache
 * Essas metricas ficam disponiveis pro Command Center e pra Sophia
 */
async function collectQuickMetrics(sid: string) {
  const metrics: Record<string, unknown> = {};

  // 1. Total de agentes ativos
  const { count: agentCount } = await supabase
    .from('ia_agents')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'online');
  metrics.agents_online = agentCount || 0;

  // 2. Tasks pendentes
  const { count: pendingTasks } = await supabase
    .from('ia_tasks')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pendente');
  metrics.tasks_pending = pendingTasks || 0;

  // 3. Tasks concluidas hoje
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: completedToday } = await supabase
    .from('ia_tasks')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'concluida')
    .gte('completed_at', today.toISOString());
  metrics.tasks_completed_today = completedToday || 0;

  // 4. Decisoes pendentes de aprovacao
  const { count: pendingDecisions } = await supabase
    .from('ia_mae_decisoes')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pendente');
  metrics.decisions_pending = pendingDecisions || 0;

  // 5. Logs de erro nas ultimas 24h
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const { count: errorCount } = await supabase
    .from('ia_logs')
    .select('id', { count: 'exact', head: true })
    .eq('tipo', 'error')
    .gte('created_at', yesterday.toISOString());
  metrics.errors_24h = errorCount || 0;

  // 6. Tenta coletar metricas de negocio (se tabelas existirem)
  try {
    const { count: osCount } = await supabase
      .from('ordens_servico')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'aberta');
    metrics.os_abertas = osCount || 0;
  } catch { /* tabela pode nao existir */ }

  try {
    const { count: clientCount } = await supabase
      .from('clientes')
      .select('id', { count: 'exact', head: true });
    metrics.total_clientes = clientCount || 0;
  } catch { /* tabela pode nao existir */ }

  // Salva no Redis com TTL de 10 min
  try {
    await cacheSet('metrics:quick', metrics, 600);
  } catch {
    // Redis pode nao estar disponivel
  }

  metrics.collected_at = new Date().toISOString();

  // Publica evento pra quem estiver ouvindo
  try {
    await publish('metrics:update', metrics);
  } catch {
    // Redis offline
  }
}

// ======================== SYNC KNOWLEDGE BASE ========================

/**
 * Sincroniza dados das tabelas de negocio pro knowledge base
 */
async function syncKnowledgeBase(sid: string) {
  const count = await syncBusinessData(sid);
  if (count > 0) {
    await log(sid, 'info', `[CRON] Sync knowledge: ${count} documentos atualizados`);
  }
}

// ======================== MONITOR ANOMALIAS ========================

/**
 * Detecta anomalias e cria alertas pra Sophia
 */
async function monitorAnomalies(sid: string) {
  const alerts: string[] = [];

  // 1. Agentes que deveriam estar online mas nao fazem ping ha mais de 10 min
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data: staleAgents } = await supabase
    .from('ia_agents')
    .select('nome,status,ultimo_ping')
    .eq('status', 'online')
    .lt('ultimo_ping', tenMinAgo);

  if (staleAgents && staleAgents.length > 0) {
    for (const a of staleAgents) {
      alerts.push(`Agente ${a.nome} sem ping ha mais de 10 min (ultimo: ${a.ultimo_ping})`);
      // Marca como offline
      await supabase.from('ia_agents').update({ status: 'offline' }).eq('nome', a.nome);
    }
  }

  // 2. Tasks rodando ha mais de 30 min (possivelmente travadas)
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data: stuckTasks } = await supabase
    .from('ia_tasks')
    .select('id,titulo,agent_id,started_at')
    .eq('status', 'rodando')
    .lt('started_at', thirtyMinAgo);

  if (stuckTasks && stuckTasks.length > 0) {
    for (const t of stuckTasks) {
      alerts.push(`Task "${t.titulo}" travada ha 30+ min`);
      // Marca como erro
      await supabase.from('ia_tasks').update({
        status: 'erro',
        resultado_json: { error: 'Timeout: task travada por mais de 30 min' },
      }).eq('id', t.id);
    }
  }

  // 3. Muitos erros recentes (mais de 10 na ultima hora)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentErrors } = await supabase
    .from('ia_logs')
    .select('id', { count: 'exact', head: true })
    .eq('tipo', 'error')
    .gte('created_at', oneHourAgo);

  if ((recentErrors || 0) > 10) {
    alerts.push(`Alto volume de erros: ${recentErrors} erros na ultima hora`);
  }

  // Se tem alertas, loga e cria task pra Sophia
  if (alerts.length > 0) {
    const alertText = alerts.join('\n');
    await log(sid, 'warn', `[MONITOR] ${alerts.length} anomalias detectadas`, { alerts });

    // Cria task pra Sophia analisar
    await supabase.from('ia_tasks').insert({
      agent_id: sid,
      titulo: `[ALERTA] ${alerts.length} anomalia(s) detectada(s)`,
      descricao: alertText,
      tipo: 'alerta',
      prioridade: 8, // Alta prioridade
      input_json: { content: `Anomalias detectadas pelo monitor:\n\n${alertText}\n\nAnalise e sugira acoes.`, alerts },
      status: 'pendente',
    });
  }
}

// ======================== MONITOR OS ABERTAS ========================

/**
 * Monitora ordens de servico abertas e cria alertas
 */
async function monitorOpenOrders(sid: string) {
  try {
    // Busca OS abertas ha mais de 3 dias (atrasadas)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const { data: overdueOrders } = await supabase
      .from('ordens_servico')
      .select('id,numero,cliente_nome,status,created_at')
      .eq('status', 'aberta')
      .lt('created_at', threeDaysAgo)
      .limit(10);

    if (overdueOrders && overdueOrders.length > 0) {
      const summary = overdueOrders.map((o: any) =>
        `OS #${o.numero || o.id}: ${o.cliente_nome || 'Cliente'} (aberta desde ${o.created_at})`
      ).join('\n');

      await log(sid, 'warn', `[CRON] ${overdueOrders.length} OS atrasadas (3+ dias)`, {
        count: overdueOrders.length,
      });

      // Salva no cache pra o Command Center mostrar
      await cacheSet('alerts:os-atrasadas', {
        count: overdueOrders.length,
        orders: overdueOrders,
        checked_at: new Date().toISOString(),
      }, 900); // 15 min TTL
    }
  } catch {
    // Tabela ordens_servico pode nao existir ainda
  }
}

// ======================== CLEANUP ========================

/**
 * Limpa logs antigos pra nao estourar o banco
 */
async function cleanupOldLogs(sid: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Remove logs de info/message com mais de 30 dias
  const { count } = await supabase
    .from('ia_logs')
    .delete()
    .in('tipo', ['info', 'message'])
    .lt('created_at', thirtyDaysAgo)
    .select('id', { count: 'exact', head: true });

  if (count && count > 0) {
    await log(sid, 'info', `[CRON] Cleanup: ${count} logs antigos removidos`);
  }
}

// ======================== WEBHOOK LISTENER ========================

/**
 * Handler para webhooks recebidos do site
 * Usado pelo server.ts quando recebe POST /webhook
 */
export async function handleWebhook(
  event: string,
  payload: Record<string, unknown>,
): Promise<void> {
  if (!sophiaId) return;

  const eventHandlers: Record<string, () => Promise<void>> = {
    'os.criada': async () => {
      await ingestDocument({
        categoria: 'operacional',
        subcategoria: 'ordem-servico',
        titulo: `OS Criada: ${payload.numero || payload.id}`,
        conteudo: JSON.stringify(payload, null, 2),
        fonte: 'webhook:site',
      });
      await log(sophiaId!, 'info', `[WEBHOOK] Nova OS: ${payload.numero || payload.id}`);
    },
    'pagamento.recebido': async () => {
      await log(sophiaId!, 'info', `[WEBHOOK] Pagamento: R$${payload.valor} - ${payload.cliente}`, { payload });
    },
    'reclamacao.nova': async () => {
      // Reclamacao e urgente - cria task pra Sophia
      await supabase.from('ia_tasks').insert({
        agent_id: sophiaId!,
        titulo: `[URGENTE] Reclamacao: ${(payload.assunto as string || '').substring(0, 80)}`,
        tipo: 'alerta',
        prioridade: 9,
        input_json: { content: `Nova reclamacao recebida:\n${JSON.stringify(payload, null, 2)}`, ...payload },
        status: 'pendente',
      });
      await log(sophiaId!, 'warn', `[WEBHOOK] Reclamacao recebida!`, { payload });
    },
    'lead.novo': async () => {
      // Novo lead - delega pra Anna (se ativa)
      const { data: anna } = await supabase
        .from('ia_agents')
        .select('id')
        .eq('nome', 'Anna')
        .eq('status', 'online')
        .single();

      const targetId = anna?.id || sophiaId!;

      await supabase.from('ia_tasks').insert({
        agent_id: targetId,
        titulo: `Novo lead: ${payload.nome || payload.email || 'Sem nome'}`,
        tipo: 'lead',
        prioridade: 6,
        input_json: { content: `Qualifique este novo lead:\n${JSON.stringify(payload, null, 2)}`, ...payload },
        status: 'pendente',
      });
    },
    'agendamento.novo': async () => {
      await log(sophiaId!, 'info', `[WEBHOOK] Agendamento: ${payload.servico} - ${payload.data}`, { payload });
    },
  };

  const handler = eventHandlers[event];
  if (handler) {
    await handler();
  } else {
    // Evento desconhecido - loga pra Sophia saber
    await log(sophiaId!, 'info', `[WEBHOOK] Evento: ${event}`, { payload });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function stopCronjobs() {
  running = false;
}
