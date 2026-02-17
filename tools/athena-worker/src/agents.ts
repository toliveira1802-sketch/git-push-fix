import { supabase } from './supabase.js';
import { log } from './logger.js';

export interface AgentSpec {
  nome: string;
  tipo?: string;
  llm_provider: string;
  modelo: string;
  descricao: string;
  prompt_sistema?: string;
  canais?: string[];
  config_json?: Record<string, unknown>;
}

export async function createAgent(athenaId: string, spec: AgentSpec) {
  const { data, error } = await supabase
    .from('ia_agents')
    .insert({
      nome: spec.nome,
      tipo: spec.tipo || 'escravo',
      status: 'offline',
      llm_provider: spec.llm_provider,
      modelo: spec.modelo,
      descricao: spec.descricao,
      prompt_sistema: spec.prompt_sistema || '',
      canais: spec.canais || [],
      config_json: spec.config_json || {},
      pai_id: athenaId,
    })
    .select()
    .single();

  if (error) {
    await log(athenaId, 'error', `Erro ao criar agente: ${error.message}`, { spec });
    throw error;
  }

  await log(athenaId, 'action', `Agente criado: ${data.nome} (${data.id})`, {
    agent_id: data.id,
    nome: data.nome,
    llm_provider: data.llm_provider,
    modelo: data.modelo,
  });

  // Increment Athena's tarefas_ativas
  try {
    const { data: a } = await supabase
      .from('ia_agents')
      .select('tarefas_ativas')
      .eq('id', athenaId)
      .single();
    if (a) {
      await supabase
        .from('ia_agents')
        .update({ tarefas_ativas: (a.tarefas_ativas || 0) + 1 })
        .eq('id', athenaId);
    }
  } catch {
    // Non-critical, ignore
  }

  return data;
}

export async function adjustAgent(
  agentId: string,
  changes: Partial<{
    prompt_sistema: string;
    modelo: string;
    llm_provider: string;
    temperatura: number;
    config_json: Record<string, unknown>;
    canais: string[];
  }>,
) {
  const { error } = await supabase
    .from('ia_agents')
    .update(changes)
    .eq('id', agentId);

  if (error) throw error;

  await log(agentId, 'action', `Agente ajustado`, {
    changes: Object.keys(changes),
  });
}

export async function pauseAgent(agentId: string) {
  const { error } = await supabase
    .from('ia_agents')
    .update({ status: 'pausado' })
    .eq('id', agentId);

  if (error) throw error;

  await log(agentId, 'action', 'Agente pausado pela Athena');
}

export async function deleteAgent(agentId: string) {
  // Don't actually delete, just mark offline and log
  const { data: agent } = await supabase
    .from('ia_agents')
    .select('nome')
    .eq('id', agentId)
    .single();

  const { error } = await supabase
    .from('ia_agents')
    .update({ status: 'offline', config_json: { deleted_by_athena: true, deleted_at: new Date().toISOString() } })
    .eq('id', agentId);

  if (error) throw error;

  await log(agentId, 'action', `Agente ${agent?.nome || agentId} desativado pela Athena`);
}

export async function listActiveAgents() {
  const { data } = await supabase
    .from('ia_agents')
    .select('*')
    .neq('status', 'offline')
    .order('tipo');

  return data || [];
}

export async function getAgentById(id: string) {
  const { data } = await supabase
    .from('ia_agents')
    .select('*')
    .eq('id', id)
    .single();

  return data;
}
