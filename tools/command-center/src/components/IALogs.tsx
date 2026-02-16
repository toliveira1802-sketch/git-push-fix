import { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Info,
  AlertTriangle,
  XCircle,
  Zap,
  MessageCircle,
  Filter,
  Clock,
  ArrowDown,
} from 'lucide-react';
import { supabase } from '../hooks/useSupabase';
import type { IALog, LogType } from '../types/ia';

const LOG_TYPE_CONFIG: Record<LogType, { icon: typeof Info; color: string; bg: string; label: string }> = {
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Info' },
  warn: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Warn' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Error' },
  action: { icon: Zap, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Action' },
  message: { icon: MessageCircle, color: 'text-violet-400', bg: 'bg-violet-500/10', label: 'Msg' },
};

interface IALogsProps {
  agentId: string;
  agentName: string;
  onClose: () => void;
}

export default function IALogs({ agentId, agentName, onClose }: IALogsProps) {
  const [logs, setLogs] = useState<IALog[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<LogType | 'all'>('all');
  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | 'all'>('24h');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('ia_logs')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(200);

    if (typeFilter !== 'all') {
      query = query.eq('tipo', typeFilter);
    }

    if (timeFilter !== 'all') {
      const now = new Date();
      const since = new Date(now);
      if (timeFilter === '24h') since.setHours(since.getHours() - 24);
      else since.setDate(since.getDate() - 7);
      query = query.gte('created_at', since.toISOString());
    }

    const { data } = await query;
    setLogs((data ?? []) as IALog[]);
    setLoading(false);
  }, [agentId, typeFilter, timeFilter]);

  // Fetch on mount and filter changes
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`ia_logs_${agentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ia_logs',
          filter: `agent_id=eq.${agentId}`,
        },
        (payload) => {
          const newLog = payload.new as IALog;
          if (typeFilter !== 'all' && newLog.tipo !== typeFilter) return;
          setLogs(prev => [newLog, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId, typeFilter]);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs, autoScroll]);

  // ESC to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-[700px] max-w-[90vw] h-[600px] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <h2 className="text-sm font-semibold text-slate-200">
              Logs - {agentName}
            </h2>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              {logs.length} registros
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-700/50 bg-slate-800/30">
          <Filter size={12} className="text-slate-500" />

          {/* Type filter */}
          <div className="flex items-center gap-0.5 bg-slate-800 rounded-lg p-0.5">
            <FilterBtn active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
              Todos
            </FilterBtn>
            {(Object.keys(LOG_TYPE_CONFIG) as LogType[]).map(type => {
              const cfg = LOG_TYPE_CONFIG[type];
              return (
                <FilterBtn key={type} active={typeFilter === type} onClick={() => setTypeFilter(type)}>
                  <cfg.icon size={10} />
                  {cfg.label}
                </FilterBtn>
              );
            })}
          </div>

          <div className="w-px h-4 bg-slate-700 mx-1" />

          {/* Time filter */}
          <div className="flex items-center gap-0.5 bg-slate-800 rounded-lg p-0.5">
            <FilterBtn active={timeFilter === '24h'} onClick={() => setTimeFilter('24h')}>
              <Clock size={10} /> 24h
            </FilterBtn>
            <FilterBtn active={timeFilter === '7d'} onClick={() => setTimeFilter('7d')}>
              7d
            </FilterBtn>
            <FilterBtn active={timeFilter === 'all'} onClick={() => setTimeFilter('all')}>
              Tudo
            </FilterBtn>
          </div>

          <div className="flex-1" />

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(v => !v)}
            className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition-colors ${
              autoScroll
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            <ArrowDown size={10} />
            Auto-scroll
          </button>
        </div>

        {/* Log entries */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-slate-500">Carregando logs...</div>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Info size={28} className="mx-auto text-slate-600 mb-2" />
                <p className="text-sm text-slate-500">Nenhum log encontrado</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Logs aparecerao aqui em tempo real
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {logs.map(log => {
                const cfg = LOG_TYPE_CONFIG[log.tipo] ?? LOG_TYPE_CONFIG.info;
                const Icon = cfg.icon;
                const time = new Date(log.created_at);
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 px-5 py-2.5 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className={`mt-0.5 p-1 rounded ${cfg.bg} flex-shrink-0`}>
                      <Icon size={12} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {log.mensagem}
                      </p>
                      {log.metadata_json && Object.keys(log.metadata_json).length > 0 && (
                        <code className="text-[10px] text-slate-600 mt-0.5 block truncate">
                          {JSON.stringify(log.metadata_json)}
                        </code>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-600 flex-shrink-0 text-right">
                      <div>{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                      <div>{time.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
      }`}
    >
      {children}
    </button>
  );
}
