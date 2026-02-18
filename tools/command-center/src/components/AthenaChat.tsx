import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  Brain,
  Sparkles,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../hooks/useSupabase';
import type { IAAgent } from '../types/ia';

interface ChatMessage {
  id: string;
  role: 'user' | 'athena';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface AthenaChatProps {
  athena: IAAgent | null;
}

export default function AthenaChat({ athena }: AthenaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load chat history from ia_logs
  useEffect(() => {
    if (!athena) return;

    const loadHistory = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('ia_logs')
        .select('*')
        .eq('agent_id', athena.id)
        .eq('tipo', 'message')
        .order('created_at', { ascending: true })
        .limit(100);

      if (data) {
        setMessages(
          data.map((log) => ({
            id: log.id,
            role: log.metadata_json?.role === 'user' ? 'user' : 'athena',
            content: log.mensagem,
            timestamp: log.created_at,
            metadata: log.metadata_json,
          }))
        );
      }
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    };

    loadHistory();

    // Realtime subscription for new messages
    const channel = supabase
      .channel('athena_chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ia_logs',
          filter: `agent_id=eq.${athena.id}`,
        },
        (payload) => {
          const log = payload.new as any;
          if (log.tipo !== 'message') return;

          setMessages((prev) => {
            if (prev.some((m) => m.id === log.id)) return prev;
            return [
              ...prev,
              {
                id: log.id,
                role: log.metadata_json?.role === 'user' ? 'user' : 'athena',
                content: log.mensagem,
                timestamp: log.created_at,
                metadata: log.metadata_json,
              },
            ];
          });
          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [athena, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim() || !athena || sending) return;

    const content = input.trim();
    setInput('');
    setSending(true);

    // Add optimistic user message
    const tempId = 'temp-' + Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      },
    ]);
    setTimeout(scrollToBottom, 50);

    // Insert user message as log
    await supabase.from('ia_logs').insert({
      agent_id: athena.id,
      tipo: 'message',
      mensagem: content,
      metadata_json: { role: 'user', source: 'command-center' },
    });

    // Create a task for Athena to process
    await supabase.from('ia_tasks').insert({
      agent_id: athena.id,
      titulo: content,
      descricao: `Mensagem do Command Center: ${content}`,
      status: 'pendente',
      criado_por: 'command-center',
      input_json: { type: 'chat_message', content },
    });

    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!athena) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <AlertCircle size={28} className="mx-auto text-slate-600 mb-2" />
          <p className="text-sm text-slate-500">Athena nao encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-700/60 px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                <Brain size={20} className="text-purple-400" />
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                  athena.status === 'online'
                    ? 'bg-green-500 animate-pulse'
                    : 'bg-slate-500'
                }`}
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                Athena
                <Sparkles size={12} className="text-purple-400" />
              </h2>
              <p className="text-[11px] text-slate-500">
                IA Mae • {athena.llm_provider}/{athena.modelo} •{' '}
                {(athena.config_json as any)?.decision_mode ?? 'semi-auto'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                athena.status === 'online'
                  ? 'bg-green-500/15 text-green-400'
                  : 'bg-slate-700/50 text-slate-500'
              }`}
            >
              {athena.status}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-slate-500">Carregando historico...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Brain size={48} className="text-purple-500/30" />
            <div className="text-center">
              <p className="text-sm text-slate-400">
                Converse com a Athena
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Ela conhece tudo sobre a Doctor Auto e pode criar agentes, analisar dados e tomar decisoes.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 max-w-md justify-center">
              {[
                'Como estao nossas metricas hoje?',
                'Crie um agente de follow-up de leads',
                'Qual o gargalo operacional mais critico?',
                'Analise nosso CAC vs LTV',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-purple-300 hover:border-purple-500/30 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
                    : 'bg-purple-600/10 border border-purple-500/20 text-slate-200'
                }`}
              >
                {msg.role === 'athena' && (
                  <div className="flex items-center gap-1 mb-1">
                    <Brain size={10} className="text-purple-400" />
                    <span className="text-[10px] text-purple-400 font-medium">
                      Athena
                    </span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <div
                  className={`flex items-center gap-1 mt-1 ${
                    msg.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  <Clock size={8} className="text-slate-600" />
                  <span className="text-[9px] text-slate-600">
                    {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-purple-600/10 border border-purple-500/20 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Brain size={12} className="text-purple-400 animate-pulse" />
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-700/60 px-5 py-3">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              athena.status === 'online'
                ? 'Digite uma mensagem para Athena...'
                : 'Athena esta offline. Ligue-a para conversar.'
            }
            disabled={sending}
            className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
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
