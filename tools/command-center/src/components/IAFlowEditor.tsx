/**
 * IAFlowEditor - Editor visual de fluxo de IAs (tipo n8n)
 * Usa @xyflow/react para drag, connect, pan/zoom
 */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Connection,
  type Node,
} from '@xyflow/react';
import { Save, RefreshCw, Trash2, Plus, GitBranch, Zap } from 'lucide-react';
import { nodeTypes, type IANodeData } from './IAFlowNodes';
import { useIAFlow } from '../hooks/useIAFlow';
import { useIAManager } from '../hooks/useIAManager';

function FlowCanvas() {
  const { agents, loading: agentsLoading } = useIAManager();
  const {
    nodes: savedNodes,
    edges: savedEdges,
    loading: flowLoading,
    saving,
    saveFlow,
  } = useIAFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const isInitialized = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize from saved data once
  useEffect(() => {
    if (!flowLoading && !isInitialized.current) {
      if (savedNodes.length > 0 || savedEdges.length > 0) {
        setNodes(savedNodes);
        setEdges(savedEdges);
      }
      isInitialized.current = true;
    }
  }, [flowLoading, savedNodes, savedEdges, setNodes, setEdges]);

  // Debounced auto-save
  const scheduleSave = useCallback((currentNodes: Node[], currentEdges: typeof edges) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveFlow(currentNodes, currentEdges);
    }, 1500);
  }, [saveFlow]);

  // When nodes change (drag, delete)
  const handleNodesChange: typeof onNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    // Schedule save after drag/resize
    const hasDrag = changes.some((c) => c.type === 'position' && !c.dragging);
    const hasRemove = changes.some((c) => c.type === 'remove');
    if (hasDrag || hasRemove) {
      setNodes((current) => {
        setEdges((currentEdges) => {
          scheduleSave(current, currentEdges);
          return currentEdges;
        });
        return current;
      });
    }
  }, [onNodesChange, scheduleSave, setNodes, setEdges]);

  // When edges change (delete)
  const handleEdgesChange: typeof onEdgesChange = useCallback((changes) => {
    onEdgesChange(changes);
    const hasRemove = changes.some((c) => c.type === 'remove');
    if (hasRemove) {
      setNodes((currentNodes) => {
        setEdges((current) => {
          scheduleSave(currentNodes, current);
          return current;
        });
        return currentNodes;
      });
    }
  }, [onEdgesChange, scheduleSave, setNodes, setEdges]);

  // On connect (new edge)
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => {
      const newEdges = addEdge(
        { ...params, animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } },
        eds
      );
      setNodes((currentNodes) => {
        scheduleSave(currentNodes, newEdges);
        return currentNodes;
      });
      return newEdges;
    });
  }, [setEdges, setNodes, scheduleSave]);

  // Add agent node
  const addAgentToFlow = useCallback((agent: {
    id: string; nome: string; tipo: string; status: string; llm_provider: string; modelo: string;
  }) => {
    setNodes((current) => {
      const exists = current.find((n) => (n.data as IANodeData)?.agentId === agent.id);
      if (exists) return current;

      const newNode: Node = {
        id: `agent-${agent.id}`,
        type: 'iaAgent',
        position: { x: 250 + current.length * 30, y: 120 + current.length * 30 },
        data: {
          agentId: agent.id,
          nome: agent.nome,
          tipo: agent.tipo,
          status: agent.status,
          llm_provider: agent.llm_provider,
          modelo: agent.modelo,
        } satisfies IANodeData,
      };
      const updated = [...current, newNode];
      setEdges((currentEdges) => {
        scheduleSave(updated, currentEdges);
        return currentEdges;
      });
      return updated;
    });
  }, [setNodes, setEdges, scheduleSave]);

  // Add trigger node
  const addTrigger = useCallback(() => {
    setNodes((current) => {
      const newNode: Node = {
        id: `trigger-${Date.now()}`,
        type: 'trigger',
        position: { x: 50, y: 120 },
        data: { label: 'Cliente chega' },
      };
      const updated = [...current, newNode];
      setEdges((currentEdges) => {
        scheduleSave(updated, currentEdges);
        return currentEdges;
      });
      return updated;
    });
  }, [setNodes, setEdges, scheduleSave]);

  // Clear everything
  const clearFlow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    saveFlow([], []);
  }, [setNodes, setEdges, saveFlow]);

  // Agents available to add (not yet in flow)
  const allAgents = useMemo(() => {
    return agents.flatMap((a) => [a, ...(a.children ?? [])]);
  }, [agents]);

  const agentsNotInFlow = useMemo(() => {
    const inFlow = new Set(
      nodes.map((n) => (n.data as IANodeData)?.agentId).filter(Boolean)
    );
    return allAgents.filter((a) => !inFlow.has(a.id));
  }, [allAgents, nodes]);

  if (agentsLoading || flowLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <RefreshCw size={24} className="text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-700/50 bg-slate-900/80 flex-shrink-0">
        <GitBranch size={16} className="text-purple-400" />
        <span className="text-sm font-semibold text-slate-200">Editor de Fluxo IA</span>
        <span className="text-[10px] text-slate-500">
          Arraste agentes do painel, conecte com setas
        </span>
        <div className="ml-auto flex items-center gap-2">
          {saving && (
            <span className="text-[10px] text-purple-400 flex items-center gap-1">
              <Save size={10} className="animate-pulse" />
              Salvando...
            </span>
          )}
          <button
            onClick={addTrigger}
            className="flex items-center gap-1.5 text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Zap size={12} />
            Gatilho
          </button>
          <button
            onClick={clearFlow}
            className="flex items-center gap-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 size={12} />
            Limpar
          </button>
        </div>
      </div>

      {/* Main layout: agent picker + canvas */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: agents to add */}
        <div className="w-52 bg-slate-900/50 border-r border-slate-700/40 flex flex-col overflow-hidden flex-shrink-0">
          <div className="px-3 py-2 border-b border-slate-700/30">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Adicionar ao Fluxo
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            {agentsNotInFlow.map((agent) => (
              <button
                key={agent.id}
                onClick={() => addAgentToFlow({
                  id: agent.id,
                  nome: agent.nome,
                  tipo: agent.tipo,
                  status: agent.status,
                  llm_provider: agent.llm_provider,
                  modelo: agent.modelo,
                })}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-700/60 text-left transition-colors border border-slate-700/30 group"
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  agent.status === 'online' ? 'bg-green-500' : 'bg-slate-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-300 truncate">{agent.nome}</p>
                  <p className="text-[9px] text-slate-600 truncate">{agent.tipo}</p>
                </div>
                <Plus size={10} className="text-slate-600 group-hover:text-slate-300 flex-shrink-0" />
              </button>
            ))}
            {agentsNotInFlow.length === 0 && (
              <p className="text-[10px] text-slate-600 px-2 py-4 text-center">
                Todos os agentes estao no fluxo
              </p>
            )}
          </div>
        </div>

        {/* React Flow canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            deleteKeyCode="Delete"
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: '#a855f7', strokeWidth: 2 },
            }}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color="#334155"
            />
            <Controls
              showInteractive={false}
              className="!bg-slate-800 !border-slate-700 !rounded-lg !shadow-xl"
            />
            <MiniMap
              nodeColor={(node) => {
                const tipo = (node.data as IANodeData)?.tipo;
                if (tipo === 'rainha') return '#a855f7';
                if (tipo === 'princesa') return '#ec4899';
                if (tipo === 'bot_local') return '#06b6d4';
                return '#f59e0b'; // trigger
              }}
              maskColor="rgba(15, 23, 42, 0.8)"
              className="!bg-slate-900 !border-slate-700 !rounded-lg"
            />
          </ReactFlow>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <GitBranch size={48} className="mx-auto text-slate-800 mb-3" />
                <p className="text-sm text-slate-600">Canvas vazio</p>
                <p className="text-xs text-slate-700 mt-1">
                  Clique nos agentes a esquerda para adicionar ao fluxo
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrap in provider
export default function IAFlowEditor() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
