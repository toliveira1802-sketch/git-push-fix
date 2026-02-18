/**
 * SOPHIA WORKER - IA Rainha da Doctor Auto
 * Processo Node.js que roda na VPS
 *
 * Faz 3 coisas:
 * 1. HTTP Server (porta 3000) - recebe comandos do Command Center
 * 2. Polling Loop - processa tasks pendentes de Sophia e decisoes aprovadas
 * 3. Princess Workers - processa tasks das princesas (Anna, Simone, Thamy)
 */

import 'dotenv/config';
import { supabase } from './supabase.js';
import { processMessage, executeDecision } from './athena.js';
import { log } from './logger.js';
import { startServer } from './server.js';
import { startPrincessWorkers } from './princess-worker.js';
import { startCronjobs, stopCronjobs } from './cronjobs.js';
import { ensureDefaultPrincesses } from './agents.js';

const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS) || 5000;

let sophiaId: string | null = null;
let running = true;

async function getSophiaId(): Promise<string> {
  if (sophiaId) return sophiaId;

  // Tenta Sophia primeiro, fallback pra Athena (retrocompat)
  let result = await supabase
    .from('ia_agents')
    .select('id')
    .eq('nome', 'Sophia')
    .single();

  if (result.error || !result.data) {
    result = await supabase
      .from('ia_agents')
      .select('id')
      .eq('nome', 'Athena')
      .single();
  }

  if (result.error || !result.data) {
    throw new Error('Sophia/Athena agent not found in ia_agents table. Run the migration first.');
  }

  sophiaId = result.data.id as string;
  return sophiaId;
}

/**
 * Set Sophia status to online and update ping
 */
async function setOnline() {
  const id = await getSophiaId();
  await supabase
    .from('ia_agents')
    .update({
      status: 'online',
      ultimo_ping: new Date().toISOString(),
    })
    .eq('id', id);
}

/**
 * Set Sophia status to offline
 */
async function setOffline() {
  if (!sophiaId) return;
  await supabase
    .from('ia_agents')
    .update({ status: 'offline' })
    .eq('id', sophiaId);
}

/**
 * Update ping timestamp
 */
async function ping() {
  if (!sophiaId) return;
  await supabase
    .from('ia_agents')
    .update({ ultimo_ping: new Date().toISOString() })
    .eq('id', sophiaId);
}

/**
 * Process pending tasks from ia_tasks (Sophia only)
 */
async function processPendingTasks() {
  const id = await getSophiaId();

  const { data: tasks, error } = await supabase
    .from('ia_tasks')
    .select('*')
    .eq('agent_id', id)
    .eq('status', 'pendente')
    .order('prioridade', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(5);

  if (error) {
    await log(id, 'error', `Erro ao buscar tasks: ${error.message}`);
    return;
  }

  if (!tasks || tasks.length === 0) return;

  for (const task of tasks) {
    try {
      await supabase
        .from('ia_tasks')
        .update({ status: 'rodando', started_at: new Date().toISOString() })
        .eq('id', task.id);

      await log(id, 'info', `Processando task: ${task.titulo}`, { task_id: task.id });

      const input = (task.input_json as any)?.content || task.titulo;
      const response = await processMessage(id, input);

      await supabase
        .from('ia_tasks')
        .update({
          status: 'concluida',
          completed_at: new Date().toISOString(),
          resultado_json: {
            message: response.message,
            action: response.action?.type || null,
          },
        })
        .eq('id', task.id);

      await log(id, 'info', `Task concluida: ${task.titulo}`, {
        task_id: task.id,
        had_action: !!response.action,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      await log(id, 'error', `Erro na task ${task.titulo}: ${msg}`, { task_id: task.id });

      await supabase
        .from('ia_tasks')
        .update({ status: 'erro', resultado_json: { error: msg } })
        .eq('id', task.id);
    }
  }
}

/**
 * Process approved decisions that haven't been executed yet
 */
async function processApprovedDecisions() {
  const id = await getSophiaId();

  const { data: decisions } = await supabase
    .from('ia_mae_decisoes')
    .select('*')
    .eq('status', 'aprovado')
    .order('created_at', { ascending: true })
    .limit(5);

  if (!decisions || decisions.length === 0) return;

  for (const dec of decisions) {
    try {
      const jsonMatch = dec.decisao.match(/\{[\s\S]*"action"\s*:\s*"[^"]+?"[\s\S]*\}/);
      if (!jsonMatch) {
        await supabase.from('ia_mae_decisoes').update({
          status: 'executado',
          resultado: 'Sem acao executavel',
        }).eq('id', dec.id);
        continue;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const action = { type: parsed.action, data: parsed };

      await log(id, 'action', `Executando decisao aprovada: ${action.type}`, {
        decision_id: dec.id,
      });

      await executeDecision(id, dec.id, action);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro';
      await log(id, 'error', `Erro ao executar decisao: ${msg}`, { decision_id: dec.id });
    }
  }
}

/**
 * Main polling loop
 */
async function mainLoop() {
  const id = await getSophiaId();
  const model = process.env.SOPHIA_MODEL || process.env.ATHENA_MODEL || 'llama3.1:8b';

  console.log('\n========================================');
  console.log('  SOPHIA - IA Rainha da Doctor Auto');
  console.log('========================================');
  console.log(`  Agent ID: ${id}`);
  console.log(`  Poll interval: ${POLL_INTERVAL}ms`);
  console.log(`  Model: ${model}`);
  console.log(`  Mode: Ollama local (custo R$0)`);

  // Start HTTP server (porta 3000 - Nginx faz proxy pra /api/)
  startServer();

  // Garante que as 3 princesas padrao existem (Anna, Simone, Thamy)
  await ensureDefaultPrincesses(id);

  // Start princess workers (processa tasks de Anna, Simone, Thamy)
  await startPrincessWorkers(id);

  // Start cronjobs (bots intermediarios: coleta dados do site pra Sophia)
  startCronjobs(id);

  console.log('========================================\n');

  await setOnline();
  await log(id, 'info', 'Sophia worker iniciado (HTTP + Polling + Princesas)');

  let pingCounter = 0;

  while (running) {
    try {
      await processPendingTasks();
      await processApprovedDecisions();

      pingCounter++;
      if (pingCounter >= 6) {
        await ping();
        pingCounter = 0;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro no loop principal';
      console.error(`[FATAL] ${msg}`);
    }

    await sleep(POLL_INTERVAL);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nDesligando Sophia...');
  running = false;
  stopCronjobs();
  await setOffline();
  if (sophiaId) await log(sophiaId, 'info', 'Sophia worker encerrado (SIGINT)');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  running = false;
  stopCronjobs();
  await setOffline();
  if (sophiaId) await log(sophiaId, 'info', 'Sophia worker encerrado (SIGTERM)');
  process.exit(0);
});

mainLoop().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
