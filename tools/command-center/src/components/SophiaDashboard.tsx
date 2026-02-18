import { useState, useEffect, useCallback } from 'react';
import {
  Crown,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Activity,
  Database,
  Users,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { supabase } from '../hooks/useSupabase';
import type { IAAgent } from '../types/ia';

interface Decision {
  id: string;
  tipo_decisao: string;
  contexto: string | null;
  decisao: string;
  resultado: string | null;
  agente_afetado: string | null;
  aprovado_por: string | null;
  status: string;
  created_at: string;
}

interface SophiaDashboardProps {
  sophia: IAAgent | null;
}

const DECISION_LABELS: Record<string, { label: string; color: string }> = {
  criar_agente: { label: 'Criar Princesa', color: 'text-green-400 bg-green-500/10' },
  ajustar_agente: { label: 'Ajustar Agente', color: 'text-blue-400 bg-blue-500/10' },
  pausar_agente: { label: 'Pausar Agente', color: 'text-amber-400 bg-amber-500/10' },
  eliminar_agente: { label: 'Eliminar Agente', color: 'text-red-400 bg-red-500/10' },
  executar_task: { label: 'Executar Task', color: 'text-cyan-400 bg-cyan-500/10' },
  analise: { label: 'Analise', color: 'text-purple-400 bg-purple-500/10' },
  auto_learn: { label: 'Auto-Aprendizado', color: 'text-emerald-400 bg-emerald-500/10' },
};

const STATUS_BADGES: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pendente: { label: 'Pendente', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30', icon: Clock },
  aprovado: { label: 'Aprovado', color: 'text-green-400 bg-green-500/15 border-green-500/30', icon: CheckCircle },
  executado: { label: 'Executado', color: 'text-blue-400 bg-blue-500/15 border-blue-500/30', icon: Activity },
  rejeitado: { label: 'Rejeitado', color: 'text-red-400 bg-red-500/15 border-red-500/30', icon: XCircle },
};

export default function SophiaDashboard({ sophia }: SophiaDashboardProps) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [kbCount, setKbCount] = useState(0);
  const [observerCount, setObserverCount] = useState(0);
  const [childAgents, setChildAgents] = useState<IAAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'decisoes' | 'agentes' | 'knowledge' | 'observacoes'>('decisoes');

  const loadData = useCallback(async () => {
    if (!sophia) return;
    setLoading(true);

    const [decRes, kbRes, obsRes, agentsRes] = await Promise.all([
      supabase
        .from('ia_mae_decisoes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('ia_knowledge_base')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('ia_knowledge_base')
        .select('*', { count: 'exact', head: true })
        .eq('categoria', 'observer_event'),
      supabase
        .from('ia_agents')
        .select('*')
        .eq('pai_id', sophia.id)
        .order('created_at', { ascending: false }),
    ]);

    if (decRes.data) setDecisions(decRes.data as Decision[]);
    setKbCount(kbRes.count ?? 0);
    setObserverCount(obsRes.count ?? 0);
    if (agentsRes.data) setChildAgents(agentsRes.data as IAAgent[]);
    setLoading(false);
  }, [sophia]);

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel('sophia_dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ia_mae_decisoes' },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  const handleDecision = async (decisionId: string, approve: boolean) => {
    const status = approve ? 'aprovado' : 'rejeitado';
    await supabase
      .from('ia_mae_decisoes')
      .update({ status, aprovado_por: 'thales@command-center' })
      .eq('id', decisionId);

    await supabase.from('ia_logs').insert({
      agent_id: sophia?.id,
      tipo: 'action',
      mensagem: `Decisao ${approve ? 'aprovada' : 'rejeitada'}`,
      metadata_json: { decision_id: decisionId, status },
    });

    loadData();
  };

  if (!sophia) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-500">Sophia nao encontrada</p>
      </div>
    );
  }

  const pendingCount = decisions.filter((d) => d.status === 'pendente').length;
  const approvedCount = decisions.filter((d) => d.status === 'aprovado').length;

  return (
    <div className="flex-1 bg-slate-950 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              {sophia.avatar_url ? (
                <img src={sophia.avatar_url} alt="Sophia" className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <Crown size={24} className="text-purple-400" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Dashboard Sophia
                <Sparkles size={14} className="text-purple-400" />
              </h1>
              <p className="text-xs text-slate-500">
                Modo: {(sophia.config_json as any)?.decision_mode ?? 'semi-auto'} •
                Princesas: {childAgents.length}/3 •
                Budget: R${(sophia.config_json as any)?.budget_mensal_llm ?? 200}/mes
              </p>
            </div>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg transition-colors border border-slate-700"
          >
            <RefreshCw size={12} />
            Atualizar
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <div className="bg-amber-500/10 border border-slate-700/40 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-amber-400 mb-1">
              <Clock size={14} />
              <span className="text-[10px] font-medium uppercase tracking-wider">Pendentes</span>
            </div>
            <span className="text-xl font-bold text-amber-400">{pendingCount}</span>
          </div>
          <div className="bg-green-500/10 border border-slate-700/40 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-green-400 mb-1">
              <CheckCircle size={14} />
              <span className="text-[10px] font-medium uppercase tracking-wider">Aprovadas</span>
            </div>
            <span className="text-xl font-bold text-green-400">{approvedCount}</span>
          </div>
          <div className="bg-cyan-500/10 border border-slate-700/40 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-cyan-400 mb-1">
              <Users size={14} />
              <span className="text-[10px] font-medium uppercase tracking-wider">Princesas</span>
            </div>
            <span className="text-xl font-bold text-cyan-400">{childAgents.length}</span>
          </div>
          <div className="bg-purple-500/10 border border-slate-700/40 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-purple-400 mb-1">
              <Database size={14} />
              <span className="text-[10px] font-medium uppercase tracking-wider">Knowledge</span>
            </div>
            <span className="text-xl font-bold text-purple-400">{kbCount}</span>
          </div>
          <div className="bg-emerald-500/10 border border-slate-700/40 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
              <Eye size={14} />
              <span className="text-[10px] font-medium uppercase tracking-wider">Observado</span>
            </div>
            <span className="text-xl font-bold text-emerald-400">{observerCount}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-slate-700/50 pb-0">
          {[
            { key: 'decisoes' as const, label: 'Decisoes', count: decisions.length },
            { key: 'agentes' as const, label: 'Princesas', count: childAgents.length },
            { key: 'knowledge' as const, label: 'Knowledge', count: kbCount },
            { key: 'observacoes' as const, label: 'Observer', count: observerCount },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-[1px] ${
                tab === t.key
                  ? 'text-purple-400 border-purple-400'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-[10px] opacity-60">({t.count})</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw size={20} className="text-purple-400 animate-spin" />
          </div>
        ) : tab === 'decisoes' ? (
          <DecisionsList decisions={decisions} onDecision={handleDecision} />
        ) : tab === 'agentes' ? (
          <PrincessesList agents={childAgents} />
        ) : tab === 'observacoes' ? (
          <ObserverTab sophiaId={sophia.id} />
        ) : (
          <KnowledgeTab kbCount={kbCount} />
        )}
      </div>
    </div>
  );
}

/* Sub-components */

function DecisionsList({ decisions, onDecision }: { decisions: Decision[]; onDecision: (id: string, approve: boolean) => void }) {
  if (decisions.length === 0) {
    return (
      <div className="text-center py-12">
        <Crown size={32} className="mx-auto text-slate-700 mb-2" />
        <p className="text-sm text-slate-500">Nenhuma decisao registrada</p>
        <p className="text-xs text-slate-600 mt-1">
          Quando Sophia propor acoes, elas aparecrao aqui para aprovacao
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {decisions.map((dec) => {
        const typeConfig = DECISION_LABELS[dec.tipo_decisao] ?? {
          label: dec.tipo_decisao,
          color: 'text-slate-400 bg-slate-500/10',
        };
        const statusConfig = STATUS_BADGES[dec.status] ?? STATUS_BADGES.pendente;
        const StatusIcon = statusConfig.icon;

        return (
          <div
            key={dec.id}
            className={`rounded-xl border p-4 transition-all ${
              dec.status === 'pendente'
                ? 'border-amber-500/30 bg-slate-800/60'
                : 'border-slate-700/40 bg-slate-800/30'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeConfig.color}`}>
                    {typeConfig.label}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 ${statusConfig.color}`}>
                    <StatusIcon size={8} />
                    {statusConfig.label}
                  </span>
                </div>
                <p className="text-sm text-slate-200 mb-1">{dec.decisao}</p>
                {dec.contexto && <p className="text-xs text-slate-500 mb-1">{dec.contexto}</p>}
                {dec.resultado && <p className="text-xs text-green-400/70 mt-1">Resultado: {dec.resultado}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <Clock size={10} className="text-slate-600" />
                  <span className="text-[10px] text-slate-600">
                    {new Date(dec.created_at).toLocaleString('pt-BR')}
                  </span>
                  {dec.aprovado_por && (
                    <>
                      <ChevronRight size={8} className="text-slate-700" />
                      <span className="text-[10px] text-slate-500">por {dec.aprovado_por}</span>
                    </>
                  )}
                </div>
              </div>

              {dec.status === 'pendente' && (
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onDecision(dec.id, true)}
                    className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-green-600/20 border border-green-500/40 text-green-400 hover:bg-green-600/30 transition-colors"
                  >
                    <CheckCircle size={12} />
                    Aprovar
                  </button>
                  <button
                    onClick={() => onDecision(dec.id, false)}
                    className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600/30 transition-colors"
                  >
                    <XCircle size={12} />
                    Rejeitar
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PrincessesList({ agents }: { agents: IAAgent[] }) {
  if (agents.length === 0) {
    return (
      <div className="text-center py-12">
        <Sparkles size={32} className="mx-auto text-slate-700 mb-2" />
        <p className="text-sm text-slate-500">Nenhuma princesa criada ainda</p>
        <p className="text-xs text-slate-600 mt-1">
          Sophia criara suas princesas quando o worker estiver rodando na VPS
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {agents.map((agent) => (
        <div key={agent.id} className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-slate-700/40 flex items-center justify-center overflow-hidden">
              {agent.avatar_url ? (
                <img src={agent.avatar_url} alt={agent.nome} className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                <Sparkles size={16} className="text-purple-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-200 font-medium">{agent.nome}</p>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  agent.status === 'online' ? 'bg-green-500' :
                  agent.status === 'erro' ? 'bg-red-500' : 'bg-slate-500'
                }`} />
              </div>
              <p className="text-xs text-slate-500">{agent.descricao || 'Princesa de Sophia'}</p>
            </div>
            <span className="text-[10px] text-slate-500">
              {agent.llm_provider}/{agent.modelo}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ObserverTab({ sophiaId }: { sophiaId: string }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('ia_knowledge_base')
        .select('*')
        .eq('categoria', 'observer_event')
        .order('created_at', { ascending: false })
        .limit(30);

      if (data) setEvents(data);
      setLoading(false);
    };
    load();
  }, [sophiaId]);

  if (loading) return <div className="text-center py-8 text-slate-500 text-sm">Carregando...</div>;

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Eye size={32} className="mx-auto text-slate-700 mb-2" />
        <p className="text-sm text-slate-500">Nenhuma observacao ainda</p>
        <p className="text-xs text-slate-600 mt-1">
          Sophia observa automaticamente suas acoes no Command Center e aprende
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((ev) => (
        <div key={ev.id} className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Eye size={12} className="text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-medium uppercase">{ev.subcategoria}</span>
            <span className="text-[9px] text-slate-600 ml-auto">
              {new Date(ev.created_at).toLocaleString('pt-BR')}
            </span>
          </div>
          <p className="text-xs text-slate-300">{ev.titulo}</p>
          {ev.conteudo && (
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{ev.conteudo}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function KnowledgeTab({ kbCount }: { kbCount: number }) {
  return (
    <div className="text-center py-12">
      <Database size={32} className="mx-auto text-slate-700 mb-2" />
      <p className="text-sm text-slate-500">
        {kbCount === 0
          ? 'Knowledge base vazia'
          : `${kbCount} documentos na base`}
      </p>
      <p className="text-xs text-slate-600 mt-1">
        Alimente a base preenchendo METRICAS_NEGOCIO.md e REGRAS_NEGOCIO.md
      </p>
      {kbCount === 0 && (
        <div className="mt-4 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 max-w-md mx-auto">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-slate-400 text-left">
              Para Sophia funcionar com inteligencia total, preencha os templates
              METRICAS_NEGOCIO.md e REGRAS_NEGOCIO.md na raiz do projeto com dados
              reais da Doctor Auto. Depois, execute o script de ingestao no ChromaDB.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
