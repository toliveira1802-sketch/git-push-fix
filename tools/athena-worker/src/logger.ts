import { supabase } from './supabase.js';

type LogType = 'info' | 'warn' | 'error' | 'action' | 'message';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LEVELS: Record<string, number> = { info: 0, warn: 1, error: 2, action: 0, message: 0 };

export async function log(
  agentId: string,
  tipo: LogType,
  mensagem: string,
  metadata?: Record<string, unknown>,
) {
  // Console output
  const timestamp = new Date().toISOString().substring(11, 19);
  const prefix = tipo === 'error' ? '\x1b[31m[ERROR]\x1b[0m' :
                 tipo === 'warn'  ? '\x1b[33m[WARN]\x1b[0m' :
                 tipo === 'action' ? '\x1b[36m[ACTION]\x1b[0m' :
                 '\x1b[32m[INFO]\x1b[0m';
  console.log(`${timestamp} ${prefix} ${mensagem}`);

  // Persist to Supabase
  try {
    await supabase.from('ia_logs').insert({
      agent_id: agentId,
      tipo,
      mensagem,
      metadata_json: metadata || {},
    });
  } catch (err) {
    console.error('Failed to persist log:', err);
  }
}
