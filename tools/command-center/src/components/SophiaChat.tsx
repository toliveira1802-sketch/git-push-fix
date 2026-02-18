import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  Crown,
  Sparkles,
  Clock,
  AlertCircle,
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Zap,
  Timer,
  Server,
  ChevronDown,
} from 'lucide-react';
import { useSophiaChat } from '../hooks/useSophiaChat';
import type { ChatMessage } from '../hooks/useSophiaChat';
import type { IAAgent } from '../types/ia';

interface SophiaChatProps {
  sophia: IAAgent | null;
}

const QUICK_COMMANDS = [
  { label: 'Status geral', message: 'Qual o status geral do sistema e das princesas?' },
  { label: 'Metricas', message: 'Como estao nossas metricas hoje?' },
  { label: 'Gargalos', message: 'Qual o gargalo operacional mais critico?' },
  { label: 'Princesas', message: 'Qual o status de cada princesa?' },
  { label: 'CAC vs LTV', message: 'Analise nosso CAC vs LTV' },
  { label: 'Follow-up pendente', message: 'Existem follow-ups pendentes? Quais?' },
];

const CONNECTION_LABELS = {
  http: { label: 'VPS Direta', color: 'text-green-400', bg: 'bg-green-500/15', icon: Zap },
  supabase: { label: 'Supabase', color: 'text-blue-400', bg: 'bg-blue-500/15', icon: Database },
  checking: { label: 'Verificando...', color: 'text-amber-400', bg: 'bg-amber-500/15', icon: RefreshCw },
  offline: { label: 'Offline', color: 'text-red-400', bg: 'bg-red-500/15', icon: WifiOff },
};

export default function SophiaChat({ sophia }: SophiaChatProps) {
  const {
    messages,
    loading,
    sending,
    connectionMode,
    thinkingTime,
    sendMessage,
    clearChat,
    retryConnection,
  } = useSophiaChat(sophia);

  const [input, setInput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [showQuickCommands, setShowQuickCommands] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput('');
    setShowQuickCommands(false);
    await sendMessage(msg);
    inputRef.current?.focus();
  };

  const handleQuickCommand = async (message: string) => {
    setShowQuickCommands(false);
    setInput('');
    await sendMessage(message);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatThinkingTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  // Sophia not found
  if (!sophia) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <AlertCircle size={28} className="mx-auto text-slate-600 mb-2" />
          <p className="text-sm text-slate-500">Sophia nao encontrada</p>
          <p className="text-xs text-slate-600 mt-1">Configure a Rainha na tabela ia_agents</p>
        </div>
      </div>
    );
  }

  const connConfig = CONNECTION_LABELS[connectionMode];
  const ConnIcon = connConfig.icon;

  return (
    <div className="flex-1 flex flex-col bg-slate-950">
      {/* ==================== HEADER ==================== */}
      <div className="border-b border-slate-700/60 px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                {sophia.avatar_url ? (
                  <img src={sophia.avatar_url} alt="Sophia" className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <Crown size={20} className="text-purple-400" />
                )}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                  sophia.status === 'online'
                    ? 'bg-green-500 animate-pulse'
                    : 'bg-slate-500'
                }`}
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                Sophia
                <Sparkles size={12} className="text-purple-400" />
              </h2>
              <p className="text-[11px] text-slate-500">
                {sophia.llm_provider}/{sophia.modelo} •{' '}
                {(sophia.config_json as any)?.decision_mode ?? 'semi-auto'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Connection mode badge */}
            <button
              onClick={retryConnection}
              className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-medium ${connConfig.bg} ${connConfig.color} hover:opacity-80 transition-opacity`}
              title="Clique para reconectar"
            >
              <ConnIcon size={10} className={connectionMode === 'checking' ? 'animate-spin' : ''} />
              {connConfig.label}
            </button>

            {/* Agent status */}
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                sophia.status === 'online'
                  ? 'bg-green-500/15 text-green-400'
                  : 'bg-slate-700/50 text-slate-500'
              }`}
            >
              {sophia.status}
            </span>

            {/* Clear chat */}
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-slate-800/60 transition-colors"
                title="Limpar conversa"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ==================== MESSAGES ==================== */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <RefreshCw size={14} className="animate-spin" />
              Carregando historico...
            </div>
          </div>
        ) : messages.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Crown size={48} className="text-purple-500/30" />
            <div className="text-center">
              <p className="text-sm text-slate-400">
                Converse com a Sophia
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Ela conhece tudo da Doctor Auto. Pergunte sobre metricas, crie princesas, analise gargalos.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 max-w-lg justify-center">
              {QUICK_COMMANDS.slice(0, 4).map((cmd) => (
                <button
                  key={cmd.label}
                  onClick={() => handleQuickCommand(cmd.message)}
                  disabled={sending}
                  className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-purple-300 hover:border-purple-500/30 transition-colors disabled:opacity-30"
                >
                  {cmd.label}
                </button>
              ))}
            </div>

            {/* Connection info */}
            <div className="mt-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 max-w-sm">
              <div className="flex items-start gap-2">
                <Server size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-400">
                    {connectionMode === 'http' ? (
                      <>Conectado via <span className="text-green-400 font-medium">VPS direta</span> — respostas instantaneas</>
                    ) : connectionMode === 'supabase' ? (
                      <>Conectado via <span className="text-blue-400 font-medium">Supabase</span> — o worker precisa estar rodando na VPS</>
                    ) : (
                      <>Verificando conexao com a VPS...</>
                    )}
                  </p>
                  {connectionMode === 'supabase' && sophia.status !== 'online' && (
                    <p className="text-[10px] text-amber-400/80 mt-1">
                      Sophia esta offline. Ligue o worker na VPS para conversar.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Messages list */
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              thinkingTime={thinkingTime}
              formatThinkingTime={formatThinkingTime}
              onCopy={copyMessage}
              copied={copied}
              sophia={sophia}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ==================== QUICK COMMANDS POPUP ==================== */}
      {showQuickCommands && (
        <div className="border-t border-slate-700/30 bg-slate-900/80 px-5 py-2">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_COMMANDS.map((cmd) => (
              <button
                key={cmd.label}
                onClick={() => handleQuickCommand(cmd.message)}
                disabled={sending}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-colors disabled:opacity-30"
              >
                {cmd.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ==================== INPUT ==================== */}
      <div className="border-t border-slate-700/60 px-5 py-3">
        {/* Thinking indicator */}
        {sending && thinkingTime > 0 && (
          <div className="flex items-center gap-2 mb-2 text-[11px] text-purple-400/80">
            <Timer size={10} className="animate-pulse" />
            <span>Sophia pensando... {formatThinkingTime(thinkingTime)}</span>
            {connectionMode === 'supabase' && (
              <span className="text-slate-600 ml-1">(via Supabase — pode demorar mais)</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Quick commands toggle */}
          <button
            onClick={() => setShowQuickCommands(v => !v)}
            className={`p-2.5 rounded-xl transition-colors ${
              showQuickCommands
                ? 'bg-purple-600/20 border border-purple-500/40 text-purple-400'
                : 'bg-slate-800/60 border border-slate-700/40 text-slate-500 hover:text-slate-300'
            }`}
            title="Comandos rapidos"
          >
            <ChevronDown size={14} className={`transition-transform ${showQuickCommands ? 'rotate-180' : ''}`} />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              sending
                ? 'Sophia esta pensando...'
                : sophia.status === 'online' || connectionMode === 'http'
                  ? 'Fale com a Sophia...'
                  : 'Sophia offline — mensagem sera enfileirada'
            }
            disabled={sending}
            className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:opacity-50"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="p-2.5 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 hover:bg-purple-600/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==================== MESSAGE BUBBLE ==================== */

function MessageBubble({
  msg,
  thinkingTime,
  formatThinkingTime,
  onCopy,
  copied,
  sophia,
}: {
  msg: ChatMessage;
  thinkingTime: number;
  formatThinkingTime: (s: number) => string;
  onCopy: (id: string, content: string) => void;
  copied: string | null;
  sophia: IAAgent;
}) {
  // Thinking/waiting state
  if (msg.status === 'waiting') {
    return (
      <div className="flex justify-start">
        <div className="bg-purple-600/10 border border-purple-500/20 rounded-2xl px-4 py-3 max-w-[70%]">
          <div className="flex items-center gap-2">
            <Crown size={12} className="text-purple-400 animate-pulse" />
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            {thinkingTime > 2 && (
              <span className="text-[10px] text-purple-400/60 ml-1">
                {formatThinkingTime(thinkingTime)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (msg.status === 'error') {
    return (
      <div className="flex justify-start">
        <div className="bg-amber-600/10 border border-amber-500/20 rounded-2xl px-4 py-2.5 max-w-[70%]">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertCircle size={10} className="text-amber-400" />
            <span className="text-[10px] text-amber-400 font-medium">Timeout</span>
          </div>
          <p className="text-sm text-amber-200/80">{msg.content}</p>
        </div>
      </div>
    );
  }

  // Normal messages
  const isUser = msg.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 relative ${
          isUser
            ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
            : 'bg-purple-600/10 border border-purple-500/20 text-slate-200'
        }`}
      >
        {/* Sophia label */}
        {!isUser && (
          <div className="flex items-center gap-1 mb-1">
            {sophia.avatar_url ? (
              <img src={sophia.avatar_url} alt="S" className="w-3 h-3 rounded-full" />
            ) : (
              <Crown size={10} className="text-purple-400" />
            )}
            <span className="text-[10px] text-purple-400 font-medium">Sophia</span>
            {typeof msg.metadata?.action === 'string' && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 ml-1">
                {msg.metadata.action}
              </span>
            )}
          </div>
        )}

        {/* Content */}
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>

        {/* Footer: time + actions */}
        <div className={`flex items-center gap-1.5 mt-1.5 ${isUser ? 'justify-end' : 'justify-between'}`}>
          <div className="flex items-center gap-1">
            <Clock size={8} className="text-slate-600" />
            <span className="text-[9px] text-slate-600">
              {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Copy button */}
          {!isUser && msg.content.length > 20 && (
            <button
              onClick={() => onCopy(msg.id, msg.content)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-slate-600 hover:text-slate-400"
              title="Copiar"
            >
              {copied === msg.id ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
