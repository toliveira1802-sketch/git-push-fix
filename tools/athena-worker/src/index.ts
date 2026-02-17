/**
 * ATHENA WORKER - IA Mae da Doctor Auto
 * Processo Node.js que roda na VPS
 * Polls ia_tasks, processa com Claude API, executa decisoes
 */

import 'dotenv/config';
import { supabase } from './supabase.js';
import { processMessage, executeDecision } from './athena.js';
import { log } from './logger.js';

const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS) || 5000;

let athenaId: string | null = null;
let running = true;

async function getAthenaId(): Promise<string> {
  if (athenaId) return athenaId;

  const { data, error } = await supabase
    .from('ia_agents')
    .select('id')
    .eq('nome', 'Athena')
    .single();

  if (error || !data) {
    throw new Error('Athena agent not found in ia_agents table. Run the migration first.');
  }

  athenaId = data.id as string;
  return athenaId;
}

/**
 * Set Athena status to online and update ping
 */
async function setOnline() {
  const id = await getAthenaId();
  await supabase
    .from('ia_agents')
    .update({
      status: 'online',
      ultimo_ping: new Date().toISOString(),
    })
    .eq('id', id);
}

/**
 * Set Athena status to offline
 */
async function setOffline() {
  if (!athenaId) return;
  await supabase
    .from('ia_agents')
    .update({ status: 'offline' })
    .eq('id', athenaId);
}

/**
 * Update ping timestamp
 */
async function ping() {
  if (!athenaId) return;
  await supabase
    .from('ia_agents')
    .update({ ultimo_ping: new Date().toISOString() })
    .eq('id', athenaId);
}

/**
 * Process pending tasks from ia_tasks
 */
async function processPendingTasks() {
  const id = await getAthenaId();

  // 1. Get pending tasks for Athena
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
      // Mark as running
      await supabase
        .from('ia_tasks')
        .update({ status: 'rodando', started_at: new Date().toISOString() })
        .eq('id', task.id);

      await log(id, 'info', `Processando task: ${task.titulo}`, { task_id: task.id });

      // Determine input - chat messages or command
      const input = (task.input_json as any)?.content || task.titulo;

      // Process with Athena brain
      const response = await processMessage(id, input);

      // Mark as completed
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
        .update({
          status: 'erro',
          resultado_json: { error: msg },
        })
        .eq('id', task.id);
    }
  }
}

/**
 * Process approved decisions that haven't been executed yet
 */
async function processApprovedDecisions() {
  const id = await getAthenaId();

  const { data: decisions } = await supabase
    .from('ia_mae_decisoes')
    .select('*')
    .eq('status', 'aprovado')
    .order('created_at', { ascending: true })
    .limit(5);

  if (!decisions || decisions.length === 0) return;

  for (const dec of decisions) {
    try {
      // Parse the action from the decisao text
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
  const id = await getAthenaId();
  console.log('\n========================================');
  console.log('  ATHENA WORKER - Doctor Auto IA Mae');
  console.log('========================================');
  console.log(`  Agent ID: ${id}`);
  console.log(`  Poll interval: ${POLL_INTERVAL}ms`);
  console.log(`  Model: ${process.env.ATHENA_MODEL || 'claude-sonnet-4-5-20250929'}`);
  console.log('========================================\n');

  await setOnline();
  await log(id, 'info', 'Athena worker iniciado');

  let pingCounter = 0;

  while (running) {
    try {
      // Process tasks
      await processPendingTasks();

      // Process approved decisions
      await processApprovedDecisions();

      // Ping every 6 cycles (~30s with 5s interval)
      pingCounter++;
      if (pingCounter >= 6) {
        await ping();
        pingCounter = 0;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro no loop principal';
      console.error(`[FATAL] ${msg}`);
      // Don't crash - just wait and retry
    }

    await sleep(POLL_INTERVAL);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  running = false;
  await setOffline();
  if (athenaId) {
    await log(athenaId, 'info', 'Athena worker encerrado (SIGINT)');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  running = false;
  await setOffline();
  if (athenaId) {
    await log(athenaId, 'info', 'Athena worker encerrado (SIGTERM)');
  }
  process.exit(0);
});

// Start
mainLoop().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
