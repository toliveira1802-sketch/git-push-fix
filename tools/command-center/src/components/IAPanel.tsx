import { useState } from 'react';
import {
  Wifi,
  WifiOff,
  AlertTriangle,
  Pause,
  Activity,
  RefreshCw,
  Crown,
  Server,
} from 'lucide-react';
import { useIAManager } from '../hooks/useIAManager';
import IACard from './IACard';
import IALogs from './IALogs';

export default function IAPanel() {
  const { agents, loading, error, listAgents, toggleAgent } = useIAManager();
  const [logTarget, setLogTarget] = useState<{ id: string; name: string } | null>(null);

  // Compute stats from all agents (leaders + their children + standalone bots)
  const allAgents = agents.flatMap(a => [a, ...(a.children ?? [])]);
  const stats = {
    total: allAgents.length,
    online: allAgents.filter(a => a.status === 'online').length,
    offline: allAgents.filter(a => a.status === 'offline').length,
    erro: allAgents.filter(a => a.status === 'erro').length,
    pausado: allAgents.filter(a => a.status === 'pausado').length,
    tasks: allAgents.reduce((sum, a) => sum + (a.tarefas_ativas ?? 0), 0),
  };

  const leaders = agents.filter(a => a.tipo === 'lider');
  const botLocals = agents.filter(a => a.tipo === 'bot_local');

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={24} className="text-blue-400 animate-spin" />
          <span className="text-sm text-slate-400">Carregando agentes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <AlertTriangle size={28} className="mx-auto text-red-400 mb-2" />
          <p className="text-sm text-red-400 mb-1">Erro ao carregar agentes</p>
          <p className="text-xs text-slate-500 mb-3">{error}</p>
          <button
            onClick={listAgents}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-slate-100">Painel de IAs</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Gerenciamento dos {stats.total} agentes do Doctor Auto
            </p>
          </div>
          <button
            onClick={listAgents}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg transition-colors border border-slate-700"
          >
            <RefreshCw size={12} />
            Atualizar
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <StatCard icon={<Activity size={14} />} label="Total" value={stats.total} color="text-blue-400" bg="bg-blue-500/10" />
          <StatCard icon={<Wifi size={14} />} label="Online" value={stats.online} color="text-green-400" bg="bg-green-500/10" />
          <StatCard icon={<WifiOff size={14} />} label="Offline" value={stats.offline} color="text-slate-400" bg="bg-slate-500/10" />
          <StatCard icon={<AlertTriangle size={14} />} label="Erro" value={stats.erro} color="text-red-400" bg="bg-red-500/10" />
          <StatCard icon={<Pause size={14} />} label="Pausado" value={stats.pausado} color="text-amber-400" bg="bg-amber-500/10" />
          <StatCard icon={<Activity size={14} />} label="Tasks Ativas" value={stats.tasks} color="text-cyan-400" bg="bg-cyan-500/10" />
        </div>

        {/* Leaders section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Crown size={16} className="text-purple-400" />
            <h2 className="text-sm font-semibold text-slate-200">Lideres</h2>
            <span className="text-[10px] bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-full">
              {leaders.length}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {leaders.map(leader => (
              <IACard
                key={leader.id}
                agent={leader}
                isLeader
                onToggle={toggleAgent}
                onShowLogs={(id, name) => setLogTarget({ id, name })}
                children={leader.children}
              />
            ))}
          </div>
        </div>

        {/* RAG section */}
        {botLocals.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Server size={16} className="text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-200">Turma RAG</h2>
              <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2 py-0.5 rounded-full">
                {botLocals.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {botLocals.map(bot => (
                <IACard
                  key={bot.id}
                  agent={bot}
                  isLeader={false}
                  onToggle={toggleAgent}
                  onShowLogs={(id, name) => setLogTarget({ id, name })}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Logs modal */}
      {logTarget && (
        <IALogs
          agentId={logTarget.id}
          agentName={logTarget.name}
          onClose={() => setLogTarget(null)}
        />
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} border border-slate-700/40 rounded-xl px-3 py-2.5`}>
      <div className={`flex items-center gap-1.5 ${color} mb-1`}>
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <span className={`text-xl font-bold ${color}`}>{value}</span>
    </div>
  );
}
