/**
 * useSophiaChat - Hook de comunicacao real com a Sophia
 *
 * Fluxo:
 * 1. Tenta HTTP direto na VPS (VITE_SOPHIA_API_URL ou /api/chat)
 * 2. Fallback: Supabase (cria ia_task + escuta resposta via Realtime)
 * 3. Sempre salva historico no ia_logs
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './useSupabase';
import type { IAAgent } from '../types/ia';

export interface ChatMessage {
  id: string;
  role: 'user' | 'sophia';
  content: string;
  timestamp: string;
  status?: 'sending' | 'waiting' | 'delivered' | 'error';
  metadata?: Record<string, unknown>;
}

type ConnectionMode = 'http' | 'supabase' | 'checking' | 'offline';

// API URL configuravel - pode ser a VPS direta ou via proxy
const SOPHIA_API_URL = import.meta.env.VITE_SOPHIA_API_URL || '';

export function useSophiaChat(sophia: IAAgent | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('checking');
  const [thinkingTime, setThinkingTime] = useState(0);
  const thinkingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingTaskRef = useRef<string | null>(null);

  // ==================== CHECK VPS CONNECTION ====================
  const checkConnection = useCallback(async () => {
    if (!SOPHIA_API_URL) {
      setConnectionMode('supabase');
      return;
    }

    try {
      const res = await fetch(`${SOPHIA_API_URL}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        setConnectionMode('http');
      } else {
        setConnectionMode('supabase');
      }
    } catch {
      setConnectionMode('supabase');
    }
  }, []);

  useEffect(() => {
    checkConnection();
    // Re-check every 60s
    const interval = setInterval(checkConnection, 60000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  // ==================== LOAD CHAT HISTORY ====================
  useEffect(() => {
    if (!sophia) return;

    const loadHistory = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('ia_logs')
        .select('*')
        .eq('agent_id', sophia.id)
        .eq('tipo', 'message')
        .order('created_at', { ascending: true })
        .limit(100);

      if (data) {
        setMessages(
          data.map((log) => ({
            id: log.id,
            role: log.metadata_json?.role === 'user' ? 'user' as const : 'sophia' as const,
            content: log.mensagem,
            timestamp: log.created_at,
            status: 'delivered' as const,
            metadata: log.metadata_json,
          }))
        );
      }
      setLoading(false);
    };

    loadHistory();
  }, [sophia?.id]);

  // ==================== REALTIME SUBSCRIPTION ====================
  useEffect(() => {
    if (!sophia) return;

    const channel = supabase
      .channel('sophia_chat_live')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ia_logs',
          filter: `agent_id=eq.${sophia.id}`,
        },
        (payload) => {
          const log = payload.new as any;
          if (log.tipo !== 'message') return;

          // Se e resposta da Sophia, remove o timer de thinking
          if (log.metadata_json?.role === 'sophia') {
            stopThinking();
            setSending(false);
            pendingTaskRef.current = null;
          }

          setMessages((prev) => {
            if (prev.some((m) => m.id === log.id)) return prev;
            // Se e resposta da Sophia, remove msg temp 'waiting'
            const filtered = log.metadata_json?.role === 'sophia'
              ? prev.filter(m => m.status !== 'waiting')
              : prev;
            return [
              ...filtered,
              {
                id: log.id,
                role: log.metadata_json?.role === 'user' ? 'user' as const : 'sophia' as const,
                content: log.mensagem,
                timestamp: log.created_at,
                status: 'delivered' as const,
                metadata: log.metadata_json,
              },
            ];
          });
        }
      )
      .subscribe();

    // Tambem escuta task completions (pra saber quando a resposta chegou via Supabase flow)
    const taskChannel = supabase
      .channel('sophia_tasks_completion')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ia_tasks',
          filter: `agent_id=eq.${sophia.id}`,
        },
        (payload) => {
          const task = payload.new as any;
          if (
            pendingTaskRef.current === task.id &&
            (task.status === 'concluida' || task.status === 'erro')
          ) {
            // Task completed - response should arrive via ia_logs realtime
            // But if it doesn't after 2s, force stop thinking
            setTimeout(() => {
              if (pendingTaskRef.current === task.id) {
                stopThinking();
                setSending(false);
                pendingTaskRef.current = null;
              }
            }, 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(taskChannel);
    };
  }, [sophia?.id]);

  // ==================== THINKING TIMER ====================
  const startThinking = useCallback(() => {
    setThinkingTime(0);
    thinkingTimer.current = setInterval(() => {
      setThinkingTime(prev => prev + 1);
    }, 1000);
  }, []);

  const stopThinking = useCallback(() => {
    if (thinkingTimer.current) {
      clearInterval(thinkingTimer.current);
      thinkingTimer.current = null;
    }
    setThinkingTime(0);
  }, []);

  // ==================== SEND MESSAGE ====================
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !sophia || sending) return;

    const trimmed = content.trim();
    setSending(true);
    startThinking();

    // Add optimistic user message
    const tempUserMsgId = 'user-' + Date.now();
    const userMsg: ChatMessage = {
      id: tempUserMsgId,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
      status: 'sending',
    };
    setMessages(prev => [...prev, userMsg]);

    // Save user message to ia_logs
    const { data: savedLog } = await supabase.from('ia_logs').insert({
      agent_id: sophia.id,
      tipo: 'message',
      mensagem: trimmed,
      metadata_json: { role: 'user', source: 'command-center' },
    }).select().single();

    // Update optimistic message with real ID
    if (savedLog) {
      setMessages(prev =>
        prev.map(m => m.id === tempUserMsgId ? { ...m, id: savedLog.id, status: 'delivered' as const } : m)
      );
    }

    // Add "thinking" placeholder
    const waitingMsg: ChatMessage = {
      id: 'thinking-' + Date.now(),
      role: 'sophia',
      content: '',
      timestamp: new Date().toISOString(),
      status: 'waiting',
    };
    setMessages(prev => [...prev, waitingMsg]);

    // ---- TRY HTTP DIRECT (fast path) ----
    if (connectionMode === 'http' && SOPHIA_API_URL) {
      try {
        const res = await fetch(`${SOPHIA_API_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed }),
          signal: AbortSignal.timeout(120000), // 2 min timeout
        });

        if (res.ok) {
          const data = await res.json();

          // Remove waiting msg
          setMessages(prev => prev.filter(m => m.status !== 'waiting'));
          stopThinking();
          setSending(false);

          // Add sophia response (o server.ts ja salva no ia_logs, mas Realtime pode demorar)
          // Entao adicionamos otimisticamente aqui
          const sophiaMsg: ChatMessage = {
            id: 'http-' + Date.now(),
            role: 'sophia',
            content: data.message || 'Sem resposta.',
            timestamp: new Date().toISOString(),
            status: 'delivered',
            metadata: data.action ? { action: data.action } : undefined,
          };
          setMessages(prev => {
            // Evita duplicacao se Realtime chegar antes
            const withoutDupes = prev.filter(m =>
              m.role !== 'sophia' || m.content !== sophiaMsg.content || m.status === 'waiting'
            );
            return [...withoutDupes, sophiaMsg];
          });
          return;
        } else {
          // HTTP falhou - fall through to Supabase
          console.warn('[SophiaChat] HTTP failed, falling back to Supabase');
          setConnectionMode('supabase');
        }
      } catch (err) {
        console.warn('[SophiaChat] HTTP error, falling back to Supabase:', err);
        setConnectionMode('supabase');
      }
    }

    // ---- SUPABASE FALLBACK (async path) ----
    const { data: task } = await supabase.from('ia_tasks').insert({
      agent_id: sophia.id,
      titulo: trimmed,
      descricao: `Mensagem do Command Center: ${trimmed}`,
      status: 'pendente',
      prioridade: 8, // Chat tem prioridade alta
      criado_por: 'command-center',
      input_json: { type: 'chat_message', content: trimmed },
    }).select().single();

    if (task) {
      pendingTaskRef.current = task.id;
    }

    // O Realtime subscription vai capturar a resposta quando o worker processar
    // Timeout de seguranca: 90s
    setTimeout(() => {
      if (pendingTaskRef.current === task?.id) {
        stopThinking();
        setSending(false);
        pendingTaskRef.current = null;

        setMessages(prev => {
          const hasResponse = prev.some(m => m.status === 'waiting');
          if (hasResponse) {
            return prev.map(m =>
              m.status === 'waiting'
                ? {
                    ...m,
                    content: sophia.status === 'online'
                      ? 'Sophia esta processando... a resposta aparecera em instantes.'
                      : 'Sophia esta offline. A mensagem foi salva e sera processada quando ela voltar.',
                    status: 'error' as const,
                  }
                : m
            );
          }
          return prev;
        });
      }
    }, 90000);
  }, [sophia, sending, connectionMode, startThinking, stopThinking]);

  // ==================== CLEAR CHAT ====================
  const clearChat = useCallback(async () => {
    if (!sophia) return;
    // Nao deleta do banco, apenas limpa local
    setMessages([]);
  }, [sophia]);

  // ==================== RETRY CONNECTION ====================
  const retryConnection = useCallback(() => {
    setConnectionMode('checking');
    checkConnection();
  }, [checkConnection]);

  return {
    messages,
    loading,
    sending,
    connectionMode,
    thinkingTime,
    sendMessage,
    clearChat,
    retryConnection,
  };
}
