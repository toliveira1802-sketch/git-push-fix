/**
 * useIAFlow - Persistencia do Flow Editor de IAs
 * Salva nodes + edges no ia_knowledge_base (categoria='ia_flows')
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './useSupabase';
import type { Node, Edge } from '@xyflow/react';

const FLOW_CATEGORY = 'ia_flows';
const FLOW_NAME = 'fluxo-principal';

export function useIAFlow() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const recordId = useRef<string | null>(null);

  // Load existing flow
  const loadFlow = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('ia_knowledge_base')
        .select('*')
        .eq('categoria', FLOW_CATEGORY)
        .eq('titulo', FLOW_NAME)
        .maybeSingle();

      if (data) {
        const meta = (data.metadata_json ?? {}) as Record<string, unknown>;
        setNodes((meta.nodes as Node[]) ?? []);
        setEdges((meta.edges as Edge[]) ?? []);
        recordId.current = data.id;
      }
    } catch (err) {
      console.error('[useIAFlow] Erro ao carregar flow:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlow();
  }, [loadFlow]);

  // Save flow (called by debounce in editor)
  const saveFlow = useCallback(async (newNodes: Node[], newEdges: Edge[]) => {
    setSaving(true);
    try {
      const meta = { nodes: newNodes, edges: newEdges };
      const conteudo = `${newNodes.length} agentes, ${newEdges.length} conexoes`;

      if (recordId.current) {
        await supabase
          .from('ia_knowledge_base')
          .update({
            metadata_json: meta,
            conteudo,
            atualizado_em: new Date().toISOString(),
          })
          .eq('id', recordId.current);
      } else {
        const { data } = await supabase
          .from('ia_knowledge_base')
          .insert({
            categoria: FLOW_CATEGORY,
            subcategoria: 'workflow',
            titulo: FLOW_NAME,
            conteudo,
            fonte: 'command-center',
            metadata_json: meta,
          })
          .select()
          .single();

        if (data) {
          recordId.current = data.id;
        }
      }
    } catch (err) {
      console.error('[useIAFlow] Erro ao salvar flow:', err);
    } finally {
      setSaving(false);
    }
  }, []);

  return { nodes, edges, loading, saving, setNodes, setEdges, saveFlow, loadFlow };
}
