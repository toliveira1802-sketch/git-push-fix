import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Route, Bot, Crown, Server, Wifi, WifiOff, Power } from 'lucide-react';
import {
  RouteConfig,
  RouteCategory,
  CATEGORY_CONFIG,
  STATUS_CONFIG,
} from '../types/routes';
import { DOCTOR_AUTO_ROUTES, getRouteStats } from '../data/routes';
import { useIAManager } from '../hooks/useIAManager';
import type { IAAgent } from '../types/ia';

interface SidebarProps {
  selectedRouteId: string | null;
  onSelectRoute: (route: RouteConfig) => void;
  activeTab: 'rotas' | 'ias';
  onTabChange: (tab: 'rotas' | 'ias') => void;
}

export default function Sidebar({
  selectedRouteId,
  onSelectRoute,
  activeTab,
  onTabChange,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<
    Set<RouteCategory>
  >(new Set(['auth', 'admin', 'gestao', 'cliente', 'dev', 'orphan', 'public']));

  const stats = useMemo(() => getRouteStats(), []);

  const groupedRoutes = useMemo(() => {
    const filtered = DOCTOR_AUTO_ROUTES.filter((route) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        route.path.toLowerCase().includes(q) ||
        route.component.toLowerCase().includes(q) ||
        route.description.toLowerCase().includes(q) ||
        route.category.toLowerCase().includes(q)
      );
    });

    const groups: Record<RouteCategory, RouteConfig[]> = {
      auth: [],
      admin: [],
      gestao: [],
      cliente: [],
      public: [],
      dev: [],
      orphan: [],
    };

    filtered.forEach((route) => {
      groups[route.category].push(route);
    });

    return groups;
  }, [searchQuery]);

  const toggleCategory = (category: RouteCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const categoryOrder: RouteCategory[] = [
    'auth',
    'admin',
    'gestao',
    'cliente',
    'public',
    'dev',
    'orphan',
  ];

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-700 flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => onTabChange('rotas')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'rotas'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
          }`}
        >
          <Route size={16} />
          Rotas
        </button>
        <button
          onClick={() => onTabChange('ias')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'ias'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
          }`}
        >
          <Bot size={16} />
          IAs
        </button>
      </div>

      {activeTab === 'ias' ? (
        /* IAs sidebar - quick agent list */
        <IAAgentsSidebar />
      ) : (
        <>
          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                placeholder="Buscar rotas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Route Groups */}
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {categoryOrder.map((category) => {
              const routes = groupedRoutes[category];
              const config = CATEGORY_CONFIG[category];
              const isExpanded = expandedCategories.has(category);

              if (routes.length === 0 && searchQuery.trim()) return null;

              return (
                <div key={category} className="mb-1">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-slate-800/60 transition-colors group"
                  >
                    {isExpanded ? (
                      <ChevronDown size={14} className="text-slate-500" />
                    ) : (
                      <ChevronRight size={14} className="text-slate-500" />
                    )}
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="text-sm font-medium text-slate-300 flex-1 text-left">
                      {config.label}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${config.bgColor} text-slate-300`}
                    >
                      {routes.length}
                    </span>
                  </button>

                  {/* Route List */}
                  {isExpanded && (
                    <div className="ml-5 space-y-0.5">
                      {routes.map((route) => {
                        const statusCfg = STATUS_CONFIG[route.status];
                        const isSelected = route.id === selectedRouteId;

                        return (
                          <button
                            key={route.id}
                            onClick={() => onSelectRoute(route)}
                            className={`w-full text-left px-2 py-1.5 rounded-md transition-colors group ${
                              isSelected
                                ? 'bg-blue-500/20 border border-blue-500/40'
                                : 'hover:bg-slate-800/50 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusCfg.dot}`}
                              />
                              <span
                                className={`text-xs font-medium truncate ${
                                  isSelected
                                    ? 'text-blue-300'
                                    : 'text-slate-300'
                                }`}
                              >
                                {route.component}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 ml-3.5 truncate mt-0.5">
                              {route.path}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stats Bar */}
          <div className="border-t border-slate-700 px-3 py-2.5 bg-slate-900/80">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-slate-400">
                  Total:{' '}
                  <span className="text-slate-200 font-medium">
                    {stats.total}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-slate-400">
                  Ativas:{' '}
                  <span className="text-green-400 font-medium">
                    {stats.active}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-slate-400">
                  Orfas:{' '}
                  <span className="text-red-400 font-medium">
                    {stats.orphan}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ----- IA Agents Sidebar List ----- */

function IAAgentsSidebar() {
  const { agents, loading, toggleAgent } = useIAManager();

  const allAgents = agents.flatMap(a => [a, ...(a.children ?? [])]);
  const onlineCount = allAgents.filter(a => a.status === 'online').length;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-sm text-slate-500">Carregando...</div>
      </div>
    );
  }

  const leaders = agents.filter(a => a.tipo === 'lider');
  const bots = agents.filter(a => a.tipo === 'bot_local');

  return (
    <>
      {/* Stats mini */}
      <div className="px-3 py-2 border-b border-slate-700/50">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 text-slate-400">
            <Bot size={12} />
            {allAgents.length} agentes
          </span>
          <span className="flex items-center gap-1 text-green-400">
            <Wifi size={10} />
            {onlineCount} online
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
        {/* Leaders */}
        <div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
            <Crown size={12} />
            Lideres
          </div>
          <div className="space-y-0.5">
            {leaders.map(leader => (
              <SidebarAgentItem key={leader.id} agent={leader} onToggle={toggleAgent}>
                {leader.children?.map(child => (
                  <SidebarAgentItem key={child.id} agent={child} onToggle={toggleAgent} indented />
                ))}
              </SidebarAgentItem>
            ))}
          </div>
        </div>

        {/* Bots */}
        {bots.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
              <Server size={12} />
              Turma RAG
            </div>
            <div className="space-y-0.5">
              {bots.map(bot => (
                <SidebarAgentItem key={bot.id} agent={bot} onToggle={toggleAgent} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 px-3 py-2.5 bg-slate-900/80">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Wifi size={10} className="text-green-400" />
            Online: <span className="text-green-400 font-medium">{onlineCount}</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <WifiOff size={10} />
            Offline: <span className="font-medium">{allAgents.length - onlineCount}</span>
          </span>
        </div>
      </div>
    </>
  );
}

function SidebarAgentItem({
  agent,
  onToggle,
  indented,
  children,
}: {
  agent: IAAgent;
  onToggle: (id: string) => void;
  indented?: boolean;
  children?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = React.Children.count(children) > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-800/50 transition-colors group ${
          indented ? 'ml-4' : ''
        }`}
      >
        {hasChildren && (
          <button onClick={() => setExpanded(v => !v)} className="text-slate-500 hover:text-slate-300 -ml-0.5">
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        )}
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          agent.status === 'online' ? 'bg-green-500' :
          agent.status === 'erro' ? 'bg-red-500' :
          agent.status === 'pausado' ? 'bg-amber-500' :
          'bg-slate-500'
        }`} />
        <span className={`text-xs flex-1 truncate ${
          agent.status === 'online' ? 'text-slate-200' : 'text-slate-500'
        }`}>
          {agent.nome}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(agent.id); }}
          className={`p-0.5 rounded opacity-0 group-hover:opacity-100 transition-all ${
            agent.status === 'online'
              ? 'text-green-400 hover:text-green-300'
              : 'text-slate-500 hover:text-slate-300'
          }`}
          title={agent.status === 'online' ? 'Desligar' : 'Ligar'}
        >
          <Power size={10} />
        </button>
      </div>
      {hasChildren && expanded && children}
    </div>
  );
}
