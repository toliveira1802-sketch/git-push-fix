import { useState, useCallback, useMemo } from 'react';
import { RouteConfig } from '../types/routes';
import { DOCTOR_AUTO_ROUTES } from '../data/routes';
import type { PageConfig } from './usePageConfigs';

/**
 * useRouteMap
 * ===========
 * Gerencia rotas do mapa, filtragem e selecao.
 * Aceita configs do banco (cc_page_configs) pra sobrescrever dados hardcoded.
 */
export function useRouteMap(pageConfigs?: Map<string, PageConfig>) {
  const [selectedRoute, setSelectedRoute] = useState<RouteConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Merge: aplica dados do banco por cima dos hardcoded
  const mergedRoutes = useMemo(() => {
    if (!pageConfigs || pageConfigs.size === 0) return DOCTOR_AUTO_ROUTES;

    return DOCTOR_AUTO_ROUTES.map(route => {
      const cfg = pageConfigs.get(route.id);
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
  }, [pageConfigs]);

  const filteredRoutes = useMemo(() => {
    return mergedRoutes.filter(route => {
      const matchesSearch = !searchQuery ||
        route.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || route.category === categoryFilter;
      const matchesStatus = !statusFilter || route.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [mergedRoutes, searchQuery, categoryFilter, statusFilter]);

  const selectRoute = useCallback((route: RouteConfig) => {
    setSelectedRoute(prev => prev?.id === route.id ? null : route);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRoute(null);
  }, []);

  return {
    routes: mergedRoutes,
    filteredRoutes,
    selectedRoute,
    selectRoute,
    clearSelection,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
  };
}
