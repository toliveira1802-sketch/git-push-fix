import { useState, useEffect, useCallback } from 'react';
import { supabase } from './useSupabase';
import type { IAAgent, IALog, IATask } from '../types/ia';

export function useIAManager() {
  const [agents, setAgents] = useState<IAAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all agents with hierarchy (leaders + children)
  const listAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('ia_agents')
        .select('*')
        .order('tipo', { ascending: true })
        .order('nome', { ascending: true });

      if (err) {
        console.error('[useIAManager] Erro Supabase:', err.message, err.details);
        throw err;
      }

      // Build hierarchy: Sophia (rainha) > princesas > bot_local
      const allAgents = (data ?? []) as IAAgent[];
      console.log(`[useIAManager] ${allAgents.length} agentes carregados`);

      // Rainha = Sophia (top level, princesas are her children)
      const rainha = allAgents.find(a => a.tipo === 'rainha');
      const princesas = allAgents.filter(a => a.tipo === 'princesa');
      const botLocals = allAgents.filter(a => a.tipo === 'bot_local');

      // Attach princesas as children of rainha
      const rainhaWithChildren = rainha
        ? { ...rainha, children: princesas }
        : null;

      // Also support legacy 'lider' type agents (if any remain in DB)
      const legacyLiders = allAgents.filter(a => a.tipo === 'lider' && a.nome !== 'Sophia');
      const lidersWithChildren = legacyLiders.map(lider => ({
        ...lider,
        children: allAgents.filter(a => a.pai_id === lider.id),
      }));

      const result: IAAgent[] = [];
      if (rainhaWithChildren) result.push(rainhaWithChildren);
      result.push(...lidersWithChildren);
      result.push(...botLocals);

      setAgents(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar agentes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle agent status online <-> offline
  const toggleAgent = useCallback(async (id: string) => {
    const agent = agents.find(a => a.id === id) ??
      agents.flatMap(a => a.children ?? []).find(a => a.id === id);
    if (!agent) return;

    const newStatus = agent.status === 'online' ? 'offline' : 'online';

    const { error: err } = await supabase
      .from('ia_agents')
      .update({ status: newStatus, ultimo_ping: new Date().toISOString() })
      .eq('id', id);

    if (err) {
      setError(err.message);
      return;
    }

    // Log the toggle action
    await supabase.from('ia_logs').insert({
      agent_id: id,
      tipo: 'action',
      mensagem: `Status alterado para ${newStatus}`,
      metadata_json: { previous: agent.status, new: newStatus },
    });

    await listAgents();
  }, [agents, listAgents]);

  // Get logs for a specific agent
  const getAgentLogs = useCallback(async (agentId: string, limit = 50): Promise<IALog[]> => {
    const { data, error: err } = await supabase
      .from('ia_logs')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (err) {
      setError(err.message);
      return [];
    }

    return (data ?? []) as IALog[];
  }, []);

  // Create a new task for an agent
  const createTask = useCallback(async (
    agentId: string,
    titulo: string,
    descricao?: string
  ): Promise<IATask | null> => {
    const { data, error: err } = await supabase
      .from('ia_tasks')
      .insert({
        agent_id: agentId,
        titulo,
        descricao,
        status: 'pendente',
        criado_por: 'command-center',
      })
      .select()
      .single();

    if (err) {
      setError(err.message);
      return null;
    }

    // Log the task creation
    await supabase.from('ia_logs').insert({
      agent_id: agentId,
      tipo: 'action',
      mensagem: `Task criada: ${titulo}`,
      metadata_json: { task_id: data.id },
    });

    return data as IATask;
  }, []);

  // Subscribe to realtime changes on ia_agents
  useEffect(() => {
    listAgents();

    const channel = supabase
      .channel('ia_agents_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ia_agents' },
        () => { listAgents(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listAgents]);

  return {
    agents,
    loading,
    error,
    listAgents,
    toggleAgent,
    getAgentLogs,
    createTask,
  };
}
