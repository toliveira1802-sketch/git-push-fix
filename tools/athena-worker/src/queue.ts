/**
 * REDIS QUEUE - Filas de tarefas entre bots
 *
 * Padroes:
 * - queue:tasks:{agent_id}  -> tarefas pendentes do agente
 * - queue:results:{task_id} -> resultado de uma tarefa
 * - cache:schema            -> schema do banco (TTL 1h)
 * - cache:knowledge:{hash}  -> queries de conhecimento (TTL 30min)
 */

import { createClient, RedisClientType } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let client: RedisClientType | null = null;

async function getClient(): Promise<RedisClientType> {
  if (client && client.isOpen) return client;

  client = createClient({ url: REDIS_URL }) as RedisClientType;

  client.on('error', (err) => {
    console.error('[REDIS] Erro:', err.message);
  });

  await client.connect();
  return client;
}

// ========== FILAS ==========

export interface QueueTask {
  id: string;
  agent_id: string;
  type: string;
  payload: Record<string, unknown>;
  priority: number;
  created_at: string;
}

/**
 * Enfileira tarefa pra um agente
 */
export async function enqueue(agentId: string, task: Omit<QueueTask, 'created_at'>): Promise<void> {
  const redis = await getClient();
  const item: QueueTask = {
    ...task,
    created_at: new Date().toISOString(),
  };
  await redis.lPush(`queue:tasks:${agentId}`, JSON.stringify(item));
}

/**
 * Consome proxima tarefa de um agente (FIFO)
 */
export async function dequeue(agentId: string): Promise<QueueTask | null> {
  const redis = await getClient();
  const raw = await redis.rPop(`queue:tasks:${agentId}`);
  if (!raw) return null;
  return JSON.parse(raw);
}

/**
 * Ve quantas tarefas pendentes um agente tem
 */
export async function queueLength(agentId: string): Promise<number> {
  const redis = await getClient();
  return redis.lLen(`queue:tasks:${agentId}`);
}

/**
 * Salva resultado de uma tarefa
 */
export async function setResult(taskId: string, result: unknown, ttlSeconds = 3600): Promise<void> {
  const redis = await getClient();
  await redis.setEx(`queue:results:${taskId}`, ttlSeconds, JSON.stringify(result));
}

/**
 * Busca resultado de uma tarefa
 */
export async function getResult(taskId: string): Promise<unknown | null> {
  const redis = await getClient();
  const raw = await redis.get(`queue:results:${taskId}`);
  if (!raw) return null;
  return JSON.parse(raw);
}

// ========== CACHE ==========

/**
 * Cache generico com TTL
 */
export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const redis = await getClient();
  await redis.setEx(`cache:${key}`, ttlSeconds, JSON.stringify(value));
}

export async function cacheGet<T = unknown>(key: string): Promise<T | null> {
  const redis = await getClient();
  const raw = await redis.get(`cache:${key}`);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

export async function cacheDelete(key: string): Promise<void> {
  const redis = await getClient();
  await redis.del(`cache:${key}`);
}

// ========== PUB/SUB (pra eventos entre bots) ==========

/**
 * Publica evento num canal
 */
export async function publish(channel: string, message: unknown): Promise<void> {
  const redis = await getClient();
  await redis.publish(channel, JSON.stringify(message));
}

/**
 * Fecha conexao
 */
export async function closeRedis(): Promise<void> {
  if (client && client.isOpen) {
    await client.quit();
    client = null;
  }
}
