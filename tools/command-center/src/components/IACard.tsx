import { useState } from 'react';
import {
  Power,
  ChevronDown,
  ChevronRight,
  Activity,
  Clock,
  Cpu,
  MessageSquare,
  ScrollText,
  Crown,
  Bot,
  Server,
} from 'lucide-react';
import type { IAAgent, IAStatus } from '../types/ia';

const STATUS_COLORS: Record<IAStatus, { dot: string; text: string; bg: string }> = {
  online: { dot: 'bg-green-500', text: 'text-green-400', bg: 'bg-green-500/10' },
  offline: { dot: 'bg-slate-500', text: 'text-slate-400', bg: 'bg-slate-500/10' },
  erro: { dot: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/10' },
  pausado: { dot: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10' },
};

const TYPE_CONFIG = {
  lider: { label: 'Lider', color: 'text-purple-400 bg-purple-500/15 border-purple-500/30', icon: Crown },
  escravo: { label: 'Escravo', color: 'text-slate-400 bg-slate-500/15 border-slate-500/30', icon: Bot },
  bot_local: { label: 'Bot Local', color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30', icon: Server },
};

const LLM_BADGES: Record<string, { color: string; label: string }> = {
  ollama: { color: 'text-blue-300 bg-blue-500/15', label: 'Ollama' },
  kimi: { color: 'text-violet-300 bg-violet-500/15', label: 'Kimi' },
  claude: { color: 'text-amber-300 bg-amber-500/15', label: 'Claude' },
  local: { color: 'text-slate-300 bg-slate-500/15', label: 'Local' },
};

interface IACardProps {
  agent: IAAgent;
  isLeader?: boolean;
  onToggle: (id: string) => void;
  onShowLogs: (agentId: string, agentName: string) => void;
  children?: IAAgent[];
}

export default function IACard({ agent, isLeader, onToggle, onShowLogs, children }: IACardProps) {
  const [expanded, setExpanded] = useState(isLeader);
  const status = STATUS_COLORS[agent.status];
  const typeConfig = TYPE_CONFIG[agent.tipo];
  const TypeIcon = typeConfig.icon;
  const llm = LLM_BADGES[agent.llm_provider] ?? LLM_BADGES.local;

  const timeAgo = agent.ultimo_ping
    ? formatTimeAgo(agent.ultimo_ping)
    : 'Nunca';

  return (
    <div className={`rounded-xl border transition-all ${
      isLeader
        ? 'border-slate-600/60 bg-slate-800/60'
        : 'border-slate-700/40 bg-slate-800/40'
    }`}>
      {/* Main card */}
      <div className={`p-3 ${isLeader ? 'pb-2' : ''}`}>
        <div className="flex items-start gap-3">
          {/* Avatar / Status */}
          <div className="relative flex-shrink-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status.bg} border border-slate-700/50`}>
              <TypeIcon size={18} className={status.text} />
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800 ${status.dot} ${
              agent.status === 'online' ? 'animate-pulse' : ''
            }`} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-semibold truncate ${
                isLeader ? 'text-slate-100' : 'text-slate-300'
              }`}>
                {agent.nome}
              </h3>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${typeConfig.color} font-medium flex-shrink-0`}>
                {typeConfig.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              {agent.descricao}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${llm.color} font-medium`}>
                {llm.label}/{agent.modelo}
              </span>
              {agent.canais && agent.canais.length > 0 && agent.canais.map(c => (
                <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400 flex items-center gap-0.5">
                  <MessageSquare size={8} />
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Toggle + Actions */}
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <button
              onClick={() => onToggle(agent.id)}
              className={`p-1.5 rounded-lg transition-all ${
                agent.status === 'online'
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : 'bg-slate-700/50 text-slate-500 hover:bg-slate-700 hover:text-slate-300'
              }`}
              title={agent.status === 'online' ? 'Desligar' : 'Ligar'}
            >
              <Power size={14} />
            </button>
            <button
              onClick={() => onShowLogs(agent.id, agent.nome)}
              className="p-1.5 rounded-lg bg-slate-700/30 text-slate-500 hover:bg-slate-700 hover:text-slate-300 transition-all"
              title="Ver logs"
            >
              <ScrollText size={14} />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-slate-700/30">
          <span className={`flex items-center gap-1 text-[11px] ${status.text}`}>
            <Activity size={10} />
            {agent.status}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-500">
            <Cpu size={10} />
            {agent.tarefas_ativas} tasks
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-500">
            <Clock size={10} />
            {timeAgo}
          </span>
        </div>
      </div>

      {/* Children (escravos) */}
      {isLeader && children && children.length > 0 && (
        <div className="border-t border-slate-700/30">
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-500 hover:text-slate-300 hover:bg-slate-700/20 transition-colors"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {children.length} escravos
          </button>
          {expanded && (
            <div className="px-3 pb-3 space-y-2">
              {children.map(child => (
                <IACard
                  key={child.id}
                  agent={child}
                  isLeader={false}
                  onToggle={onToggle}
                  onShowLogs={onShowLogs}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d`;
}
