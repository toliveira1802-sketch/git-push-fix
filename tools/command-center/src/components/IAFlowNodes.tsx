/**
 * IAFlowNodes - Custom React Flow node components
 * QueenNode, PrincessNode, BotNode, TriggerNode
 */
import { Handle, Position } from '@xyflow/react';
import { Crown, Sparkles, Server, Bot, Zap } from 'lucide-react';
import type { NodeProps, Node } from '@xyflow/react';

// Node data shape
export type IANodeData = {
  agentId: string;
  nome: string;
  tipo: string;
  status: string;
  llm_provider: string;
  modelo: string;
};

export type TriggerNodeData = {
  label: string;
};

export type IAFlowNode = Node<IANodeData, 'iaAgent'>;
export type TriggerFlowNode = Node<TriggerNodeData, 'trigger'>;

// Styles per agent type
const TYPE_STYLES: Record<string, {
  border: string;
  glow: string;
  icon: typeof Crown;
  label: string;
  accent: string;
}> = {
  rainha: {
    border: 'border-purple-500/60',
    glow: 'shadow-purple-500/20',
    icon: Crown,
    label: 'Rainha',
    accent: 'text-purple-400',
  },
  princesa: {
    border: 'border-pink-500/60',
    glow: 'shadow-pink-500/20',
    icon: Sparkles,
    label: 'Princesa',
    accent: 'text-pink-400',
  },
  bot_local: {
    border: 'border-cyan-500/60',
    glow: 'shadow-cyan-500/20',
    icon: Server,
    label: 'Bot',
    accent: 'text-cyan-400',
  },
  lider: {
    border: 'border-amber-500/60',
    glow: 'shadow-amber-500/20',
    icon: Crown,
    label: 'Lider',
    accent: 'text-amber-400',
  },
  escravo: {
    border: 'border-slate-500/60',
    glow: 'shadow-slate-500/20',
    icon: Bot,
    label: 'Escravo',
    accent: 'text-slate-400',
  },
};

const HANDLE_CLASS = '!w-3 !h-3 !bg-slate-600 !border-2 !border-slate-400 hover:!bg-purple-400 transition-colors';

// IA Agent Node
export function IAAgentNode({ data }: NodeProps<IAFlowNode>) {
  const style = TYPE_STYLES[data.tipo] ?? TYPE_STYLES.escravo;
  const Icon = style.icon;
  const isOnline = data.status === 'online';

  return (
    <div className={`
      relative bg-slate-800 border-2 ${style.border} rounded-xl
      shadow-lg ${style.glow} min-w-[160px] px-4 py-3
      cursor-grab active:cursor-grabbing select-none
      hover:shadow-xl transition-shadow
    `}>
      <Handle type="target" position={Position.Left} className={HANDLE_CLASS} />

      <div className="flex items-center gap-2 mb-2">
        <div className="relative">
          <div className={`w-8 h-8 rounded-lg bg-slate-700/80 flex items-center justify-center`}>
            <Icon size={14} className={isOnline ? style.accent : 'text-slate-500'} />
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-800 ${
            isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-500'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-100 truncate">{data.nome}</p>
          <p className={`text-[10px] ${style.accent}`}>{style.label}</p>
        </div>
      </div>

      <div className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400 w-fit truncate max-w-full">
        {data.llm_provider}/{data.modelo}
      </div>

      <Handle type="source" position={Position.Right} className={HANDLE_CLASS} />
    </div>
  );
}

// Trigger Node (entry point — "Cliente chega", "Webhook", etc.)
export function TriggerNode({ data }: NodeProps<TriggerFlowNode>) {
  return (
    <div className="bg-amber-500/10 border-2 border-amber-500/50 rounded-xl px-4 py-3 min-w-[140px] shadow-lg shadow-amber-500/10 cursor-grab active:cursor-grabbing select-none">
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-amber-600 !border-2 !border-amber-400"
      />
      <div className="flex items-center gap-2">
        <Zap size={14} className="text-amber-400" />
        <p className="text-xs font-bold text-amber-300">{data.label}</p>
      </div>
      <p className="text-[9px] text-amber-500/70 mt-1">Gatilho</p>
    </div>
  );
}

// Node types map for ReactFlow
export const nodeTypes = {
  iaAgent: IAAgentNode,
  trigger: TriggerNode,
};
