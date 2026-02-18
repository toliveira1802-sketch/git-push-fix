export type RouteCategory = 'auth' | 'admin' | 'gestao' | 'cliente' | 'public' | 'dev' | 'orphan';
export type RouteStatus = 'active' | 'orphan' | 'lazy-loaded';

export interface RouteConfig {
  id: string;
  path: string;
  component: string;
  category: RouteCategory;
  status: RouteStatus;
  requiresAuth: boolean;
  roles: string[];
  description: string;
  fileName: string;
  x?: number;
  y?: number;
  connections?: string[];
}

export interface RouteGroup {
  category: RouteCategory;
  label: string;
  color: string;
  icon: string;
  routes: RouteConfig[];
}

export const CATEGORY_CONFIG: Record<RouteCategory, { label: string; color: string; bgColor: string }> = {
  auth: { label: 'Autenticacao', color: '#8b5cf6', bgColor: 'bg-violet-500/20' },
  admin: { label: 'Admin', color: '#3b82f6', bgColor: 'bg-blue-500/20' },
  gestao: { label: 'Gestao', color: '#06b6d4', bgColor: 'bg-cyan-500/20' },
  cliente: { label: 'Cliente', color: '#22c55e', bgColor: 'bg-green-500/20' },
  public: { label: 'Publico', color: '#94a3b8', bgColor: 'bg-slate-500/20' },
  dev: { label: 'Dev', color: '#f59e0b', bgColor: 'bg-amber-500/20' },
  orphan: { label: 'Orfa', color: '#ef4444', bgColor: 'bg-red-500/20' },
};

export const STATUS_CONFIG: Record<RouteStatus, { label: string; color: string; dot: string }> = {
  active: { label: 'Ativa', color: '#22c55e', dot: 'bg-green-500' },
  orphan: { label: 'Orfa', color: '#ef4444', dot: 'bg-red-500' },
  'lazy-loaded': { label: 'Lazy', color: '#f59e0b', dot: 'bg-amber-500' },
};
