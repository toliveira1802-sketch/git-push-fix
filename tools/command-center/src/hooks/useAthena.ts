import { useState, useEffect, useCallback } from 'react';
import { supabase } from './useSupabase';
import type { IAAgent } from '../types/ia';

// Sophia = Rainha (IA Mae) | Princesas: Anna, Simone, Thamy
export function useSophia() {
  const [sophia, setSophia] = useState<IAAgent | null>(null);
  const [princesses, setPrincesses] = useState<IAAgent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSophia = useCallback(async () => {
    // Busca Sophia (tenta 'Sophia' primeiro, fallback 'Athena' pra retrocompatibilidade)
    let { data } = await supabase
      .from('ia_agents')
      .select('*')
      .eq('nome', 'Sophia')
      .single();

    if (!data) {
      const fallback = await supabase
        .from('ia_agents')
        .select('*')
        .eq('nome', 'Athena')
        .single();
      data = fallback.data;
    }

    if (data) {
      setSophia(data as IAAgent);

      // Busca as princesas (filhas diretas da Sophia)
      const { data: children } = await supabase
        .from('ia_agents')
        .select('*')
        .eq('pai_id', data.id)
        .order('nome');

      if (children) setPrincesses(children as IAAgent[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSophia();

    const channel = supabase
      .channel('sophia_status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ia_agents',
        },
        (payload) => {
          const updated = payload.new as IAAgent;
          if (updated.nome === 'Sophia' || updated.nome === 'Athena') {
            setSophia(updated);
          }
          // Atualiza princesas se necessario
          if (sophia && updated.pai_id === sophia.id) {
            setPrincesses(prev => {
              const idx = prev.findIndex(p => p.id === updated.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = updated;
                return next;
              }
              return [...prev, updated];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSophia]);

  return { sophia, princesses, loading, refetch: fetchSophia };
}

// Alias para retrocompatibilidade
export function useAthena() {
  const { sophia, loading, refetch } = useSophia();
  return { athena: sophia, loading, refetch };
}
