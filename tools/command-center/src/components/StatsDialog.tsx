import React, { useMemo } from 'react';
import { X, AlertTriangle, BarChart3, Shield, ShieldOff } from 'lucide-react';
import { DOCTOR_AUTO_ROUTES, getRouteStats } from '../data/routes';
import { CATEGORY_CONFIG, STATUS_CONFIG, RouteCategory } from '../types/routes';

interface StatsDialogProps {
  open: boolean;
  onClose: () => void;
}

const PRIORITY_ORPHANS = [
  'AdminDashboardIAs',
  'AdminMonitoramentoKommo',
  'AdminPainelTV',
];

export default function StatsDialog({ open, onClose }: StatsDialogProps) {
  const stats = useMemo(() => getRouteStats(), []);

  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    DOCTOR_AUTO_ROUTES.forEach((route) => {
      counts[route.category] = (counts[route.category] || 0) + 1;
    });
    return counts;
  }, []);

  const authStats = useMemo(() => {
    const requiresAuth = DOCTOR_AUTO_ROUTES.filter((r) => r.requiresAuth).length;
    const isPublic = DOCTOR_AUTO_ROUTES.filter((r) => !r.requiresAuth).length;
    return { requiresAuth, isPublic };
  }, []);

  const priorityOrphanRoutes = useMemo(() => {
    return DOCTOR_AUTO_ROUTES.filter((r) =>
      PRIORITY_ORPHANS.includes(r.component)
    );
  }, []);

  const maxCategoryCount = useMemo(() => {
    return Math.max(...Object.values(categoryBreakdown));
  }, [categoryBreakdown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <BarChart3 size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-100">
              Estatisticas do Sistema
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(85vh-64px)] space-y-6">

          {/* Total Routes */}
          <div className="text-center py-3">
            <div className="text-4xl font-bold text-slate-100">{stats.total}</div>
            <div className="text-sm text-slate-400 mt-1">Rotas Totais Mapeadas</div>
          </div>

          {/* Status Breakdown - Colored Bars */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Status das Rotas</h3>

            {/* Full-width stacked bar */}
            <div className="flex h-8 rounded-lg overflow-hidden mb-3">
              <div
                className="flex items-center justify-center text-xs font-medium text-white transition-all"
                style={{
                  width: `${(stats.active / stats.total) * 100}%`,
                  backgroundColor: STATUS_CONFIG.active.color,
                }}
              >
                {stats.active}
              </div>
              <div
                className="flex items-center justify-center text-xs font-medium text-white transition-all"
                style={{
                  width: `${(stats.orphan / stats.total) * 100}%`,
                  backgroundColor: STATUS_CONFIG.orphan.color,
                }}
              >
                {stats.orphan}
              </div>
              <div
                className="flex items-center justify-center text-xs font-medium text-white transition-all"
                style={{
                  width: `${(stats.lazy / stats.total) * 100}%`,
                  backgroundColor: STATUS_CONFIG['lazy-loaded'].color,
                }}
              >
                {stats.lazy}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-sm ${STATUS_CONFIG.active.dot}`} />
                <span className="text-xs text-slate-400">
                  Ativas: <span className="text-slate-200 font-medium">{stats.active}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-sm ${STATUS_CONFIG.orphan.dot}`} />
                <span className="text-xs text-slate-400">
                  Orfas: <span className="text-slate-200 font-medium">{stats.orphan}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-sm ${STATUS_CONFIG['lazy-loaded'].dot}`} />
                <span className="text-xs text-slate-400">
                  Lazy-loaded: <span className="text-slate-200 font-medium">{stats.lazy}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Routes by Category - Bar Chart */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Rotas por Categoria</h3>
            <div className="space-y-2">
              {(Object.keys(CATEGORY_CONFIG) as RouteCategory[]).map((category) => {
                const config = CATEGORY_CONFIG[category];
                const count = categoryBreakdown[category] || 0;
                const percentage = maxCategoryCount > 0 ? (count / maxCategoryCount) * 100 : 0;

                return (
                  <div key={category} className="flex items-center gap-3">
                    <div className="w-20 text-right">
                      <span className="text-xs font-medium text-slate-400">
                        {config.label}
                      </span>
                    </div>
                    <div className="flex-1 h-6 bg-slate-800 rounded-md overflow-hidden relative">
                      <div
                        className="h-full rounded-md transition-all duration-500 ease-out"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: config.color,
                          opacity: 0.7,
                        }}
                      />
                      <span className="absolute inset-0 flex items-center px-2 text-xs font-medium text-slate-200">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Auth vs Public */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Autenticacao</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 text-center">
                <Shield size={20} className="mx-auto text-blue-400 mb-2" />
                <div className="text-2xl font-bold text-slate-100">{authStats.requiresAuth}</div>
                <div className="text-xs text-slate-400 mt-1">Requer Autenticacao</div>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 text-center">
                <ShieldOff size={20} className="mx-auto text-slate-400 mb-2" />
                <div className="text-2xl font-bold text-slate-100">{authStats.isPublic}</div>
                <div className="text-xs text-slate-400 mt-1">Publicas</div>
              </div>
            </div>
          </div>

          {/* Priority Orphans to Reconnect */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-amber-400" />
              <h3 className="text-sm font-medium text-amber-300">
                Orfas Prioritarias para Reconectar
              </h3>
            </div>
            <div className="space-y-2">
              {priorityOrphanRoutes.map((route) => (
                <div
                  key={route.id}
                  className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-lg px-4 py-3"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200">
                      {route.component}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {route.path} &mdash; {route.description}
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                    RECONECTAR
                  </span>
                </div>
              ))}
              {priorityOrphanRoutes.length === 0 && (
                <p className="text-xs text-slate-500 italic">
                  Nenhuma orfa prioritaria encontrada.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
