import { useCallback, useRef } from 'react';
import { supabase } from './useSupabase';
import type { IAAgent } from '../types/ia';

/**
 * Sophia Observer Pattern
 * ========================
 * Sophia observa TUDO que o usuario faz no Command Center:
 * - Paginas visitadas (page_view)
 * - Edicoes salvas no PageEditor (editor_save)
 * - Conexoes criadas entre paginas (connection_create)
 * - Notas adicionadas (note_add)
 * - KPIs configurados (kpi_config)
 *
 * Cada evento e salvo no ia_knowledge_base como categoria='observer_event'
 * para que Sophia possa processar e auto-aprender.
 */

interface ObserverEvent {
  subcategoria: string;
  titulo: string;
  conteudo: string;
  tags: string[];
}

// Debounce - evita flood de eventos (ex: scroll rapido entre paginas)
const DEBOUNCE_MS = 2000;

export function useSophiaObserver(sophia: IAAgent | null) {
  const lastEvent = useRef<Record<string, number>>({});

  const emit = useCallback(async (event: ObserverEvent) => {
    if (!sophia) return;

    // Debounce por subcategoria
    const now = Date.now();
    const key = `${event.subcategoria}:${event.titulo}`;
    if (lastEvent.current[key] && now - lastEvent.current[key] < DEBOUNCE_MS) {
      return;
    }
    lastEvent.current[key] = now;

    try {
      await supabase.from('ia_knowledge_base').insert({
        categoria: 'observer_event',
        subcategoria: event.subcategoria,
        titulo: event.titulo,
        conteudo: event.conteudo,
        tags: event.tags,
        fonte: 'command-center-observer',
      });

      // Tambem loga pro Sophia saber em tempo real
      await supabase.from('ia_logs').insert({
        agent_id: sophia.id,
        tipo: 'info',
        mensagem: `[Observer] ${event.subcategoria}: ${event.titulo}`,
        metadata_json: {
          source: 'observer',
          event_type: event.subcategoria,
          ...event,
        },
      });
    } catch (err) {
      console.warn('[SophiaObserver] Erro ao emitir evento:', err);
    }
  }, [sophia]);

  // === Event Trackers ===

  const trackPageView = useCallback((routeId: string, path: string, component: string) => {
    emit({
      subcategoria: 'page_view',
      titulo: `Thales visualizou: ${component}`,
      conteudo: `Rota: ${path} (${routeId}). O diretor esta analisando esta pagina no Command Center.`,
      tags: ['page_view', routeId, component],
    });
  }, [emit]);

  const trackEditorSave = useCallback((routeId: string, data: any) => {
    const changes: string[] = [];
    if (data.description) changes.push(`descricao: "${data.description}"`);
    if (data.kpis?.length) changes.push(`${data.kpis.length} KPIs configurados`);
    if (data.notes) changes.push(`notas adicionadas`);
    if (data.tags?.length) changes.push(`tags: ${data.tags.join(', ')}`);
    if (data.priority) changes.push(`prioridade: ${data.priority}`);
    if (data.category) changes.push(`categoria: ${data.category}`);

    emit({
      subcategoria: 'editor_save',
      titulo: `Thales configurou pagina: ${routeId}`,
      conteudo: `Configuracoes salvas: ${changes.join(' | ')}. Dados completos: ${JSON.stringify(data).substring(0, 500)}`,
      tags: ['editor_save', routeId, ...(data.tags || [])],
    });
  }, [emit]);

  const trackConnectionCreate = useCallback((fromId: string, toId: string, label?: string) => {
    emit({
      subcategoria: 'connection_create',
      titulo: `Fluxo criado: ${fromId} -> ${toId}`,
      conteudo: `Thales conectou a pagina ${fromId} com a pagina ${toId}${label ? ` (${label})` : ''}. Isso indica um fluxo de navegacao do sistema.`,
      tags: ['connection', 'flow', fromId, toId],
    });
  }, [emit]);

  const trackConnectionDelete = useCallback((fromId: string, toId: string) => {
    emit({
      subcategoria: 'connection_delete',
      titulo: `Fluxo removido: ${fromId} -> ${toId}`,
      conteudo: `Thales removeu a conexao entre ${fromId} e ${toId}.`,
      tags: ['connection', 'flow_removed', fromId, toId],
    });
  }, [emit]);

  const trackNoteAdd = useCallback((routeId: string, note: string) => {
    emit({
      subcategoria: 'note_add',
      titulo: `Nota adicionada em: ${routeId}`,
      conteudo: `Nota do Thales: "${note}"`,
      tags: ['note', routeId],
    });
  }, [emit]);

  const trackKpiConfig = useCallback((routeId: string, kpis: any[]) => {
    emit({
      subcategoria: 'kpi_config',
      titulo: `KPIs configurados em: ${routeId}`,
      conteudo: `${kpis.length} KPIs definidos: ${kpis.map(k => k.label).join(', ')}`,
      tags: ['kpi', routeId],
    });
  }, [emit]);

  const trackAvatarChange = useCallback((agentName: string, avatarUrl: string) => {
    emit({
      subcategoria: 'avatar_change',
      titulo: `Avatar atualizado: ${agentName}`,
      conteudo: `Thales personalizou o avatar de ${agentName}. Nova URL: ${avatarUrl}`,
      tags: ['avatar', agentName],
    });
  }, [emit]);

  return {
    trackPageView,
    trackEditorSave,
    trackConnectionCreate,
    trackConnectionDelete,
    trackNoteAdd,
    trackKpiConfig,
    trackAvatarChange,
  };
}
