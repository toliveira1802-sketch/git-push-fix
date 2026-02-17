import { useState, useEffect, useCallback } from 'react';
import { supabase } from './useSupabase';
import type { UserConnection } from '../components/Connections';

/**
 * useConnections
 * ===============
 * Persiste conexoes criadas pelo usuario no Supabase (ia_knowledge_base)
 * categoria='page_connections', subcategoria='flow'
 *
 * Cada conexao e salva como um registro individual pra facilitar CRUD
 */

const CATEGORY = 'page_connections';
const SUBCATEGORIA = 'flow';

export function useConnections() {
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [editable, setEditable] = useState(false);

  // Load connections from Supabase
  const loadConnections = useCallback(async () => {
    const { data } = await supabase
      .from('ia_knowledge_base')
      .select('*')
      .eq('categoria', CATEGORY)
      .eq('subcategoria', SUBCATEGORIA);

    if (data) {
      setConnections(
        data.map((row) => {
          const meta = row.metadata_json || {};
          return {
            id: row.id,
            fromId: meta.fromId || '',
            toId: meta.toId || '',
            label: meta.label || '',
            color: meta.color || '',
            type: meta.type || 'flow',
          };
        }).filter(c => c.fromId && c.toId)
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadConnections();

    // Realtime
    const channel = supabase
      .channel('page_connections')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ia_knowledge_base',
          filter: `categoria=eq.${CATEGORY}`,
        },
        () => loadConnections()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadConnections]);

  // Create new connection
  const createConnection = useCallback(async (
    fromId: string,
    toId: string,
    opts?: { label?: string; color?: string; type?: string }
  ): Promise<UserConnection | null> => {
    // Evita duplicata
    const exists = connections.some(c => c.fromId === fromId && c.toId === toId);
    if (exists) return null;

    // Evita self-connection
    if (fromId === toId) return null;

    const { data, error } = await supabase
      .from('ia_knowledge_base')
      .insert({
        categoria: CATEGORY,
        subcategoria: SUBCATEGORIA,
        titulo: `${fromId} -> ${toId}`,
        conteudo: opts?.label || `Fluxo de ${fromId} para ${toId}`,
        tags: ['connection', 'flow', fromId, toId],
        fonte: 'command-center',
        metadata_json: {
          fromId,
          toId,
          label: opts?.label || '',
          color: opts?.color || '',
          type: opts?.type || 'flow',
        },
      })
      .select()
      .single();

    if (error) {
      console.error('[useConnections] Erro ao criar:', error);
      return null;
    }

    const conn: UserConnection = {
      id: data.id,
      fromId,
      toId,
      label: opts?.label,
      color: opts?.color,
      type: (opts?.type || 'flow') as UserConnection['type'],
    };

    setConnections(prev => [...prev, conn]);
    return conn;
  }, [connections]);

  // Delete connection
  const deleteConnection = useCallback(async (connectionId: string) => {
    await supabase
      .from('ia_knowledge_base')
      .delete()
      .eq('id', connectionId);

    setConnections(prev => prev.filter(c => c.id !== connectionId));
  }, []);

  // Update connection label/type
  const updateConnection = useCallback(async (connectionId: string, updates: Partial<UserConnection>) => {
    const existing = connections.find(c => c.id === connectionId);
    if (!existing) return;

    const meta = {
      fromId: existing.fromId,
      toId: existing.toId,
      label: updates.label ?? existing.label,
      color: updates.color ?? existing.color,
      type: updates.type ?? existing.type,
    };

    await supabase
      .from('ia_knowledge_base')
      .update({
        conteudo: meta.label || `Fluxo de ${meta.fromId} para ${meta.toId}`,
        metadata_json: meta,
      })
      .eq('id', connectionId);

    setConnections(prev => prev.map(c =>
      c.id === connectionId ? { ...c, ...updates } : c
    ));
  }, [connections]);

  // Start connection mode (user clicks a node to start)
  const startConnecting = useCallback((fromId: string) => {
    setConnectingFrom(fromId);
  }, []);

  // Finish connection (user clicks target node)
  const finishConnecting = useCallback(async (toId: string) => {
    if (!connectingFrom) return null;
    const result = await createConnection(connectingFrom, toId);
    setConnectingFrom(null);
    return result;
  }, [connectingFrom, createConnection]);

  // Cancel connection mode
  const cancelConnecting = useCallback(() => {
    setConnectingFrom(null);
  }, []);

  // Toggle edit mode
  const toggleEditable = useCallback(() => {
    setEditable(v => !v);
    setConnectingFrom(null);
  }, []);

  return {
    connections,
    loading,
    editable,
    connectingFrom,
    createConnection,
    deleteConnection,
    updateConnection,
    startConnecting,
    finishConnecting,
    cancelConnecting,
    toggleEditable,
  };
}
