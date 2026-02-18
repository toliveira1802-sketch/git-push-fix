/**
 * SOPHIA HTTP SERVER - API REST na porta 3000
 * Recebe comandos do Command Center via Nginx proxy /api/
 *
 * Endpoints:
 * GET  /health                - Health check
 * POST /chat                  - Enviar mensagem pra Sophia
 * POST /task                  - Criar task pra Sophia ou princesa
 * POST /decision/:id/approve  - Aprovar decisao pendente
 * POST /decision/:id/reject   - Rejeitar decisao pendente
 * GET  /agents                - Listar agentes ativos
 * GET  /agents/:id            - Detalhes de um agente
 * POST /agents/:id/delegate   - Delegar task pra princesa especifica
 * GET  /status                - Status geral do sistema
 * GET  /decisions              - Listar decisoes recentes
 * POST /knowledge/ingest      - Ingerir documento na knowledge base
 * POST /knowledge/query       - Buscar na knowledge base
 * POST /sync                  - Sincronizar dados do site com knowledge base
 * POST /webhook               - Receber eventos do site (OS, pagamentos, leads, etc.)
 * GET  /metrics               - Metricas rapidas (cache Redis)
 */

import http from 'http';
import { supabase } from './supabase.js';
import { processMessage, executeDecision } from './athena.js';
import { listActiveAgents, getAgentById } from './agents.js';
import { queryKnowledge, ingestDocument, syncBusinessData } from './knowledge.js';
import { enqueue, queueLength, cacheGet } from './queue.js';
import { log } from './logger.js';
import { handleWebhook } from './cronjobs.js';

const PORT = Number(process.env.SOPHIA_PORT) || 3000;

// Helper: parse JSON body
function parseBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Helper: JSON response
function jsonResponse(res: http.ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

// Helper: extract path and params
function parsePath(url: string): { path: string; params: URLSearchParams } {
  const u = new URL(url, 'http://localhost');
  return { path: u.pathname, params: u.searchParams };
}

let sophiaId: string | null = null;

async function getSophiaId(): Promise<string> {
  if (sophiaId) return sophiaId;
  let result = await supabase.from('ia_agents').select('id').eq('nome', 'Sophia').single();
  if (result.error || !result.data) {
    result = await supabase.from('ia_agents').select('id').eq('nome', 'Athena').single();
  }
  if (result.error || !result.data) throw new Error('Sophia/Athena not found');
  sophiaId = result.data.id;
  return sophiaId;
}

async function handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const { path, params } = parsePath(req.url || '/');

  try {
    // ==================== HEALTH ====================
    if (req.method === 'GET' && path === '/health') {
      const id = await getSophiaId();
      const { data: agent } = await supabase
        .from('ia_agents')
        .select('status,ultimo_ping')
        .eq('id', id)
        .single();

      return jsonResponse(res, 200, {
        status: 'ok',
        service: 'sophia-worker',
        agent_id: id,
        agent_status: agent?.status || 'unknown',
        last_ping: agent?.ultimo_ping || null,
        uptime: process.uptime(),
      });
    }

    // ==================== CHAT ====================
    if (req.method === 'POST' && path === '/chat') {
      const body = await parseBody(req);
      if (!body.message) {
        return jsonResponse(res, 400, { error: 'Campo "message" obrigatorio' });
      }

      const id = await getSophiaId();
      const response = await processMessage(id, body.message);

      return jsonResponse(res, 200, {
        message: response.message,
        action: response.action || null,
      });
    }

    // ==================== CREATE TASK ====================
    if (req.method === 'POST' && path === '/task') {
      const body = await parseBody(req);
      if (!body.titulo) {
        return jsonResponse(res, 400, { error: 'Campo "titulo" obrigatorio' });
      }

      // Se agent_id fornecido, cria task direto pra esse agente
      // Senao, cria pra Sophia
      const targetId = body.agent_id || await getSophiaId();

      const { data, error } = await supabase
        .from('ia_tasks')
        .insert({
          agent_id: targetId,
          titulo: body.titulo,
          descricao: body.descricao || '',
          tipo: body.tipo || 'comando',
          prioridade: body.prioridade || 5,
          input_json: body.input || { content: body.titulo },
          status: 'pendente',
        })
        .select()
        .single();

      if (error) {
        return jsonResponse(res, 500, { error: error.message });
      }

      // Se tem agent_id de princesa, enfileira no Redis tambem
      if (body.agent_id && body.agent_id !== await getSophiaId()) {
        await enqueue(body.agent_id, {
          id: data.id,
          agent_id: body.agent_id,
          type: body.tipo || 'comando',
          payload: body.input || { content: body.titulo },
          priority: body.prioridade || 5,
        });
      }

      return jsonResponse(res, 201, { task: data });
    }

    // ==================== APPROVE DECISION ====================
    if (req.method === 'POST' && path.startsWith('/decision/') && path.endsWith('/approve')) {
      const decisionId = path.split('/')[2];

      const { data: dec, error } = await supabase
        .from('ia_mae_decisoes')
        .select('*')
        .eq('id', decisionId)
        .single();

      if (error || !dec) {
        return jsonResponse(res, 404, { error: 'Decisao nao encontrada' });
      }

      await supabase
        .from('ia_mae_decisoes')
        .update({ status: 'aprovado' })
        .eq('id', decisionId);

      const id = await getSophiaId();
      await log(id, 'action', `Decisao aprovada pelo Thales: ${decisionId}`);

      return jsonResponse(res, 200, { message: 'Decisao aprovada. Sera executada no proximo ciclo.' });
    }

    // ==================== REJECT DECISION ====================
    if (req.method === 'POST' && path.startsWith('/decision/') && path.endsWith('/reject')) {
      const decisionId = path.split('/')[2];
      const body = await parseBody(req);

      await supabase
        .from('ia_mae_decisoes')
        .update({ status: 'rejeitado', resultado: body.motivo || 'Rejeitado pelo Thales' })
        .eq('id', decisionId);

      const id = await getSophiaId();
      await log(id, 'action', `Decisao rejeitada pelo Thales: ${decisionId}`);

      return jsonResponse(res, 200, { message: 'Decisao rejeitada.' });
    }

    // ==================== LIST AGENTS ====================
    if (req.method === 'GET' && path === '/agents') {
      const agents = await listActiveAgents();

      // Adiciona queue length pra cada agente
      const enriched = await Promise.all(agents.map(async (a: any) => ({
        ...a,
        queue_length: await queueLength(a.id).catch(() => 0),
      })));

      return jsonResponse(res, 200, { agents: enriched });
    }

    // ==================== GET AGENT ====================
    if (req.method === 'GET' && path.startsWith('/agents/') && !path.includes('/delegate')) {
      const agentId = path.split('/')[2];
      const agent = await getAgentById(agentId);
      if (!agent) {
        return jsonResponse(res, 404, { error: 'Agente nao encontrado' });
      }

      // Get recent tasks
      const { data: tasks } = await supabase
        .from('ia_tasks')
        .select('id,titulo,status,tipo,created_at,completed_at')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get recent logs
      const { data: logs } = await supabase
        .from('ia_logs')
        .select('tipo,mensagem,created_at')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
        .limit(10);

      return jsonResponse(res, 200, {
        agent,
        recent_tasks: tasks || [],
        recent_logs: logs || [],
        queue_length: await queueLength(agentId).catch(() => 0),
      });
    }

    // ==================== DELEGATE TO PRINCESS ====================
    if (req.method === 'POST' && path.startsWith('/agents/') && path.endsWith('/delegate')) {
      const agentId = path.split('/')[2];
      const body = await parseBody(req);

      if (!body.titulo) {
        return jsonResponse(res, 400, { error: 'Campo "titulo" obrigatorio' });
      }

      const agent = await getAgentById(agentId);
      if (!agent) {
        return jsonResponse(res, 404, { error: 'Agente nao encontrado' });
      }

      // Cria task no Supabase
      const { data: task, error } = await supabase
        .from('ia_tasks')
        .insert({
          agent_id: agentId,
          titulo: body.titulo,
          descricao: body.descricao || '',
          tipo: body.tipo || 'delegacao',
          prioridade: body.prioridade || 5,
          input_json: body.input || { content: body.titulo },
          status: 'pendente',
        })
        .select()
        .single();

      if (error) {
        return jsonResponse(res, 500, { error: error.message });
      }

      // Enfileira no Redis pra princesa
      await enqueue(agentId, {
        id: task.id,
        agent_id: agentId,
        type: body.tipo || 'delegacao',
        payload: body.input || { content: body.titulo },
        priority: body.prioridade || 5,
      });

      const id = await getSophiaId();
      await log(id, 'action', `Task delegada pra ${(agent as any).nome}: ${body.titulo}`, {
        princess_id: agentId,
        task_id: task.id,
      });

      return jsonResponse(res, 201, { task, agent_name: (agent as any).nome });
    }

    // ==================== SYSTEM STATUS ====================
    if (req.method === 'GET' && path === '/status') {
      const id = await getSophiaId();

      const [
        { data: agents },
        { data: pendingTasks },
        { data: pendingDecisions },
        { data: recentLogs },
      ] = await Promise.all([
        supabase.from('ia_agents').select('id,nome,tipo,status,ultimo_ping,tarefas_ativas').order('tipo'),
        supabase.from('ia_tasks').select('id').eq('status', 'pendente'),
        supabase.from('ia_mae_decisoes').select('id').eq('status', 'pendente'),
        supabase.from('ia_logs').select('tipo,mensagem,created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      return jsonResponse(res, 200, {
        sophia_id: id,
        agents: agents || [],
        pending_tasks: (pendingTasks || []).length,
        pending_decisions: (pendingDecisions || []).length,
        recent_activity: recentLogs || [],
        uptime: process.uptime(),
      });
    }

    // ==================== DECISIONS ====================
    if (req.method === 'GET' && path === '/decisions') {
      const limit = Number(params.get('limit')) || 20;
      const status = params.get('status'); // pendente, aprovado, rejeitado, executado

      let query = supabase
        .from('ia_mae_decisoes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (status) query = query.eq('status', status);

      const { data } = await query;
      return jsonResponse(res, 200, { decisions: data || [] });
    }

    // ==================== KNOWLEDGE INGEST ====================
    if (req.method === 'POST' && path === '/knowledge/ingest') {
      const body = await parseBody(req);
      if (!body.titulo || !body.conteudo) {
        return jsonResponse(res, 400, { error: 'Campos "titulo" e "conteudo" obrigatorios' });
      }

      const docId = await ingestDocument({
        categoria: body.categoria || 'geral',
        subcategoria: body.subcategoria,
        titulo: body.titulo,
        conteudo: body.conteudo,
        fonte: body.fonte || 'api',
      });

      return jsonResponse(res, 201, { id: docId, message: 'Documento ingerido' });
    }

    // ==================== KNOWLEDGE QUERY ====================
    if (req.method === 'POST' && path === '/knowledge/query') {
      const body = await parseBody(req);
      if (!body.query) {
        return jsonResponse(res, 400, { error: 'Campo "query" obrigatorio' });
      }

      const docs = await queryKnowledge(body.query, body.limit || 5);
      return jsonResponse(res, 200, { results: docs });
    }

    // ==================== SYNC BUSINESS DATA ====================
    if (req.method === 'POST' && path === '/sync') {
      const id = await getSophiaId();
      const count = await syncBusinessData(id);
      return jsonResponse(res, 200, { synced: count, message: `${count} documentos sincronizados` });
    }

    // ==================== WEBHOOK (eventos do site) ====================
    if (req.method === 'POST' && path === '/webhook') {
      const body = await parseBody(req);
      if (!body.event) {
        return jsonResponse(res, 400, { error: 'Campo "event" obrigatorio' });
      }

      await handleWebhook(body.event, body.payload || body);
      return jsonResponse(res, 200, { received: true, event: body.event });
    }

    // ==================== METRICS (cache Redis - pra Command Center) ====================
    if (req.method === 'GET' && path === '/metrics') {
      const metrics = await cacheGet('metrics:quick').catch(() => null);
      return jsonResponse(res, 200, { metrics: metrics || { message: 'Aguardando coleta (cronjob)' } });
    }

    // ==================== 404 ====================
    jsonResponse(res, 404, { error: 'Endpoint nao encontrado' });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno';
    console.error(`[HTTP] ${req.method} ${path} -> ERROR:`, msg);
    jsonResponse(res, 500, { error: msg });
  }
}

export function startServer(): http.Server {
  const server = http.createServer(handleRequest);

  server.listen(PORT, () => {
    console.log(`  HTTP Server: http://0.0.0.0:${PORT}`);
    console.log(`  Endpoints: /health, /chat, /task, /agents, /status, /decisions`);
  });

  return server;
}
