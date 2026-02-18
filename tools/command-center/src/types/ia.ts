export type IAType = 'lider' | 'rainha' | 'princesa' | 'escravo' | 'bot_local';
export type IAStatus = 'online' | 'offline' | 'erro' | 'pausado';
export type LLMProvider = 'ollama' | 'kimi' | 'claude' | 'local';
export type TaskStatus = 'pendente' | 'rodando' | 'concluida' | 'erro' | 'cancelada';
export type LogType = 'info' | 'warn' | 'error' | 'action' | 'message';

export interface IAAgent {
  id: string;
  nome: string;
  tipo: IAType;
  status: IAStatus;
  llm_provider: LLMProvider;
  modelo: string;
  temperatura: number;
  prompt_sistema?: string;
  tarefas_ativas: number;
  ultimo_ping?: string;
  config_json: Record<string, unknown>;
  pai_id?: string;
  avatar_url?: string;
  descricao?: string;
  canais: string[];
  created_at: string;
  updated_at: string;
  children?: IAAgent[];
}

export interface IALog {
  id: string;
  agent_id: string;
  tipo: LogType;
  mensagem: string;
  metadata_json: Record<string, unknown>;
  created_at: string;
}

export interface IATask {
  id: string;
  agent_id?: string;
  titulo: string;
  descricao?: string;
  status: TaskStatus;
  prioridade: number;
  cron_expression?: string;
  input_json: Record<string, unknown>;
  resultado_json: Record<string, unknown>;
  criado_por: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}
