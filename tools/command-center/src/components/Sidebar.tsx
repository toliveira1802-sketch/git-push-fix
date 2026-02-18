import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Route, Bot, Crown, Server, Wifi, WifiOff, Power, Brain, MessageSquare, LayoutDashboard, Sparkles, Image, AlertTriangle } from 'lucide-react';
import {
  RouteConfig,
  RouteCategory,
  CATEGORY_CONFIG,
  STATUS_CONFIG,
} from '../types/routes';
import { DOCTOR_AUTO_ROUTES, getRouteStats } from '../data/routes';
import { useIAManager } from '../hooks/useIAManager';
import type { IAAgent } from '../types/ia';

type TabType = 'rotas' | 'ias' | 'sophia-chat' | 'sophia-dashboard' | 'sophia-avatars';

interface SidebarProps {
  selectedRouteId: string | null;
  onSelectRoute: (route: RouteConfig) => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
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

  const isSophiaTab = activeTab === 'sophia-chat' || activeTab === 'sophia-dashboard' || activeTab === 'sophia-avatars';

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-700 flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        {([
          { key: 'rotas' as TabType, icon: Route, label: 'Rotas' },
          { key: 'ias' as TabType, icon: Bot, label: 'IAs' },
          { key: 'sophia-chat' as TabType, icon: Crown, label: 'Sophia' },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-xs font-medium transition-colors ${
              (activeTab === tab.key || (tab.key === 'sophia-chat' && isSophiaTab))
                ? (tab.key === 'sophia-chat' ? 'text-purple-400 border-b-2 border-purple-400 bg-slate-800/50' : 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50')
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sophia sub-tabs */}
      {isSophiaTab && (
        <div className="flex border-b border-slate-700/50 bg-slate-900/50">
          <button
            onClick={() => onTabChange('sophia-chat')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-[11px] font-medium transition-colors ${
              activeTab === 'sophia-chat'
                ? 'text-purple-400 bg-purple-500/10'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <MessageSquare size={12} />
            Chat
          </button>
          <button
            onClick={() => onTabChange('sophia-dashboard')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-[11px] font-medium transition-colors ${
              activeTab === 'sophia-dashboard'
                ? 'text-purple-400 bg-purple-500/10'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <LayoutDashboard size={12} />
            Dashboard
          </button>
          <button
            onClick={() => onTabChange('sophia-avatars')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-[11px] font-medium transition-colors ${
              activeTab === 'sophia-avatars'
                ? 'text-purple-400 bg-purple-500/10'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Image size={12} />
            Avatars
          </button>
        </div>
      )}

      {isSophiaTab ? (
        /* Sophia sidebar - info summary */
        <SophiaSidebarInfo />
      ) : activeTab === 'ias' ? (
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

  const rainha = agents.find(a => a.tipo === 'rainha');
  const princesas = rainha?.children ?? [];
  const bots = agents.filter(a => a.tipo === 'bot_local');
  const legacyLiders = agents.filter(a => a.tipo === 'lider');

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
        {/* Rainha */}
        {rainha && (
          <div>
            <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
              <Crown size={12} />
              Rainha
            </div>
            <div className="space-y-0.5">
              <SidebarAgentItem agent={rainha} onToggle={toggleAgent} />
            </div>
          </div>
        )}

        {/* Princesas */}
        <div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold text-pink-400 uppercase tracking-wider">
            <Sparkles size={12} />
            Princesas
            <span className="text-[9px] bg-pink-500/15 text-pink-400 px-1.5 py-0.5 rounded-full ml-auto">
              {princesas.length}
            </span>
          </div>
          <div className="space-y-0.5">
            {princesas.length > 0 ? (
              princesas.map(p => (
                <SidebarAgentItem key={p.id} agent={p} onToggle={toggleAgent} />
              ))
            ) : (
              <p className="text-[10px] text-slate-600 px-2 py-1">
                Serao criadas pelo worker
              </p>
            )}
          </div>
        </div>

        {/* Turma RAG */}
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

        {/* Legacy (se existir) */}
        {legacyLiders.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
              <AlertTriangle size={12} />
              Legado
            </div>
            <div className="space-y-0.5">
              {legacyLiders.map(l => (
                <SidebarAgentItem key={l.id} agent={l} onToggle={toggleAgent}>
                  {l.children?.map(child => (
                    <SidebarAgentItem key={child.id} agent={child} onToggle={toggleAgent} indented />
                  ))}
                </SidebarAgentItem>
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

/* ----- Sophia Sidebar Info ----- */

function SophiaSidebarInfo() {
  const [vpsStatus, setVpsStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // Check VPS status
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_SOPHIA_API_URL;
    if (!apiUrl) {
      setVpsStatus('offline');
      return;
    }

    const check = async () => {
      try {
        const res = await fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(5000) });
        setVpsStatus(res.ok ? 'online' : 'offline');
      } catch {
        setVpsStatus('offline');
      }
    };

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {/* Sophia identity */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
            <Crown size={20} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1">
              Sophia
              <Sparkles size={10} className="text-purple-400" />
            </h3>
            <p className="text-[10px] text-slate-500">Rainha • IA Mae</p>
          </div>
        </div>

        {/* VPS Status */}
        <div className="mb-4 rounded-lg border border-slate-700/40 p-2.5 bg-slate-800/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              VPS Worker
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
              vpsStatus === 'online'
                ? 'bg-green-500/15 text-green-400'
                : vpsStatus === 'checking'
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-red-500/15 text-red-400'
            }`}>
              {vpsStatus === 'online' ? <Wifi size={8} /> : vpsStatus === 'checking' ? <Brain size={8} /> : <WifiOff size={8} />}
              {vpsStatus === 'online' ? 'Online' : vpsStatus === 'checking' ? 'Verificando' : 'Offline'}
            </span>
          </div>
          {vpsStatus === 'offline' && (
            <p className="text-[10px] text-slate-600 mt-1.5">
              Worker offline. Chat funciona via Supabase.
            </p>
          )}
        </div>

        {/* Hierarchy */}
        <div className="space-y-2 mb-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1">
            Hierarquia
          </p>
          <div className="rounded-lg bg-slate-800/40 border border-slate-700/30 p-2.5">
            <div className="flex items-center gap-2 mb-2">
              <Crown size={12} className="text-purple-400" />
              <span className="text-[11px] text-purple-300 font-medium">Sophia (Rainha)</span>
            </div>
            <div className="ml-4 space-y-1.5 border-l border-slate-700/40 pl-3">
              {[
                { nome: 'Anna', cor: 'text-pink-400', desc: 'Atendimento' },
                { nome: 'Simone', cor: 'text-cyan-400', desc: 'Financeiro' },
                { nome: 'Thamy', cor: 'text-amber-400', desc: 'Marketing' },
              ].map(p => (
                <div key={p.nome} className="flex items-center gap-2">
                  <Sparkles size={8} className={p.cor} />
                  <span className={`text-[11px] ${p.cor} font-medium`}>{p.nome}</span>
                  <span className="text-[9px] text-slate-600">{p.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What Sophia does */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1">
            O que Sophia faz
          </p>
          {[
            'Responde sobre o negocio',
            'Cria e gerencia princesas',
            'Analisa metricas e gargalos',
            'Consulta knowledge base',
            'Toma decisoes estrategicas',
            'Observa e aprende',
          ].map((cap) => (
            <div
              key={cap}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-slate-800/30"
            >
              <span className="w-1 h-1 rounded-full bg-purple-400 flex-shrink-0" />
              <span className="text-[11px] text-slate-400">{cap}</span>
            </div>
          ))}
        </div>

        {/* Info box */}
        <div className="mt-4 p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/15">
          <p className="text-[10px] text-purple-300/60 leading-relaxed">
            Use a aba <strong className="text-purple-300/80">Chat</strong> para conversar. Sophia responde sobre metricas,
            cria princesas e executa acoes. Decisoes aparecem no <strong className="text-purple-300/80">Dashboard</strong>.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 px-3 py-2.5 bg-slate-900/80">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Crown size={10} className="text-purple-400" />
            Modo: <span className="text-purple-400 font-medium">Semi-auto</span>
          </span>
          <span className={`flex items-center gap-1 text-[10px] ${
            vpsStatus === 'online' ? 'text-green-400' : 'text-slate-600'
          }`}>
            {vpsStatus === 'online' ? <Wifi size={8} /> : <WifiOff size={8} />}
            VPS
          </span>
        </div>
      </div>
    </>
  );
}
