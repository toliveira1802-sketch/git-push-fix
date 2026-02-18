import { useState, useEffect, useCallback } from 'react';
import { supabase } from './useSupabase';
import type { RouteConfig, RouteCategory, RouteStatus } from '../types/routes';

/**
 * usePageConfigs
 * ==============
 * CRUD completo pra tabela cc_page_configs
 * Persiste TUDO: anotacoes, KPIs, status, posicao, tags, prioridade
 *
 * Cada rota do Command Center pode ter um registro
 * que sobrescreve (override) os dados hardcoded
 */

export interface PageConfig {
  id: string;
  route_id: string;
  path: string;
  component: string;
  file_name: string;
  description: string;
  status: RouteStatus;
  category: RouteCategory;
  requires_auth: boolean;
  roles: string[];
  pos_x: number;
  pos_y: number;
  notes: string;
  priority: 'alta' | 'media' | 'baixa' | 'nenhuma';
  tags: string[];
  kpis: KPI[];
  connections: string[];
  updated_at: string;
}

export interface KPI {
  id: string;
  label: string;
  value: string;
  type: 'numero' | 'percentual' | 'moeda' | 'texto';
  meta?: string;
}

// Campos que podem ser atualizados
export type PageConfigUpdate = Partial<Omit<PageConfig, 'id' | 'route_id' | 'updated_at'>>;

export function usePageConfigs() {
  const [configs, setConfigs] = useState<Map<string, PageConfig>>(new Map());
  const [loading, setLoading] = useState(true);

  // Carrega todos os configs de uma vez (mapa route_id → config)
  const loadAll = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('cc_page_configs')
        .select('*')
        .order('route_id');

      if (error) {
        console.error('[usePageConfigs] Erro ao carregar:', error.message);
        return;
      }

      const map = new Map<string, PageConfig>();
      (data ?? []).forEach((row: any) => {
        map.set(row.route_id, {
          id: row.id,
          route_id: row.route_id,
          path: row.path || '',
          component: row.component || '',
          file_name: row.file_name || '',
          description: row.description || '',
          status: row.status || 'active',
          category: row.category || 'orphan',
          requires_auth: row.requires_auth ?? true,
          roles: row.roles || [],
          pos_x: Number(row.pos_x) || 0,
          pos_y: Number(row.pos_y) || 0,
          notes: row.notes || '',
          priority: row.priority || 'nenhuma',
          tags: row.tags || [],
          kpis: row.kpis || [],
          connections: row.connections || [],
          updated_at: row.updated_at || '',
        });
      });

      setConfigs(map);
    } catch (err) {
      console.error('[usePageConfigs] Erro:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega na montagem + Realtime
  useEffect(() => {
    loadAll();

    const channel = supabase
      .channel('cc_page_configs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cc_page_configs' },
        () => loadAll()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAll]);

  // Pega config de uma rota especifica
  const getConfig = useCallback((routeId: string): PageConfig | undefined => {
    return configs.get(routeId);
  }, [configs]);

  // Salva config (upsert: cria ou atualiza)
  const saveConfig = useCallback(async (
    routeId: string,
    route: RouteConfig,
    updates: PageConfigUpdate
  ): Promise<boolean> => {
    try {
      const existing = configs.get(routeId);

      if (existing?.id) {
        // UPDATE
        const { error } = await supabase
          .from('cc_page_configs')
          .update({
            ...updates,
            kpis: updates.kpis ? JSON.parse(JSON.stringify(updates.kpis)) : undefined,
          })
          .eq('id', existing.id);

        if (error) {
          console.error('[usePageConfigs] Erro update:', error.message);
          return false;
        }
      } else {
        // INSERT — preenche tudo do route hardcoded + updates
        const { error } = await supabase
          .from('cc_page_configs')
          .insert({
            route_id: routeId,
            path: route.path,
            component: route.component,
            file_name: route.fileName,
            description: updates.description ?? route.description,
            status: updates.status ?? route.status,
            category: updates.category ?? route.category,
            requires_auth: updates.requires_auth ?? route.requiresAuth,
            roles: updates.roles ?? route.roles,
            pos_x: updates.pos_x ?? route.x ?? 0,
            pos_y: updates.pos_y ?? route.y ?? 0,
            notes: updates.notes ?? '',
            priority: updates.priority ?? 'nenhuma',
            tags: updates.tags ?? [],
            kpis: updates.kpis ? JSON.parse(JSON.stringify(updates.kpis)) : [],
            connections: updates.connections ?? [],
          });

        if (error) {
          console.error('[usePageConfigs] Erro insert:', error.message);
          return false;
        }
      }

      // Atualiza cache local imediatamente
      await loadAll();
      return true;
    } catch (err) {
      console.error('[usePageConfigs] Erro:', err);
      return false;
    }
  }, [configs, loadAll]);

  // Salva posicao (drag & drop rapido, sem precisar de route inteiro)
  const savePosition = useCallback(async (routeId: string, x: number, y: number) => {
    const existing = configs.get(routeId);
    if (existing?.id) {
      await supabase
        .from('cc_page_configs')
        .update({ pos_x: x, pos_y: y })
        .eq('id', existing.id);
    }
    // Se nao existe registro, nao salva posicao isolada (precisa do saveConfig primeiro)
  }, [configs]);

  // Salva posicao com upsert — cria registro se nao existir (para drag & drop)
  const savePositionUpsert = useCallback(async (routeId: string, route: RouteConfig, x: number, y: number) => {
    const existing = configs.get(routeId);
    if (existing?.id) {
      await supabase
        .from('cc_page_configs')
        .update({ pos_x: x, pos_y: y })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('cc_page_configs')
        .insert({
          route_id: routeId,
          path: route.path,
          component: route.component,
          file_name: route.fileName,
          description: route.description,
          status: route.status,
          category: route.category,
          requires_auth: route.requiresAuth,
          roles: route.roles,
          pos_x: x,
          pos_y: y,
          notes: '',
          priority: 'nenhuma',
          tags: [],
          kpis: [],
          connections: [],
        });
      await loadAll();
    }
  }, [configs, loadAll]);

  // Deleta config (volta pro hardcoded)
  const deleteConfig = useCallback(async (routeId: string) => {
    const existing = configs.get(routeId);
    if (existing?.id) {
      await supabase
        .from('cc_page_configs')
        .delete()
        .eq('id', existing.id);

      setConfigs(prev => {
        const next = new Map(prev);
        next.delete(routeId);
        return next;
      });
    }
  }, [configs]);

  // Merge: aplica configs do banco nos routes hardcoded
  const mergeWithRoutes = useCallback((routes: RouteConfig[]): RouteConfig[] => {
    return routes.map(route => {
      const cfg = configs.get(route.id);
      if (!cfg) return route;

      return {
        ...route,
        description: cfg.description || route.description,
        status: cfg.status || route.status,
        category: cfg.category || route.category,
        requiresAuth: cfg.requires_auth ?? route.requiresAuth,
        roles: cfg.roles?.length ? cfg.roles : route.roles,
        x: cfg.pos_x || route.x,
        y: cfg.pos_y || route.y,
        connections: cfg.connections?.length ? cfg.connections : route.connections,
      };
    });
  }, [configs]);

  return {
    configs,
    loading,
    getConfig,
    saveConfig,
    savePosition,
    savePositionUpsert,
    deleteConfig,
    mergeWithRoutes,
    reload: loadAll,
  };
}
