import { useState, useCallback, useMemo } from 'react';
import { RouteConfig } from '../types/routes';
import { DOCTOR_AUTO_ROUTES } from '../data/routes';

export function useRouteMap() {
  const [selectedRoute, setSelectedRoute] = useState<RouteConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredRoutes = useMemo(() => {
    return DOCTOR_AUTO_ROUTES.filter(route => {
      const matchesSearch = !searchQuery ||
        route.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || route.category === categoryFilter;
      const matchesStatus = !statusFilter || route.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, categoryFilter, statusFilter]);

  const selectRoute = useCallback((route: RouteConfig) => {
    setSelectedRoute(prev => prev?.id === route.id ? null : route);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRoute(null);
  }, []);

  return {
    routes: DOCTOR_AUTO_ROUTES,
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
