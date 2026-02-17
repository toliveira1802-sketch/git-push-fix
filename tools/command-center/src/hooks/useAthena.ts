import { useState, useEffect, useCallback } from 'react';
import { supabase } from './useSupabase';
import type { IAAgent } from '../types/ia';

export function useAthena() {
  const [athena, setAthena] = useState<IAAgent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAthena = useCallback(async () => {
    const { data } = await supabase
      .from('ia_agents')
      .select('*')
      .eq('nome', 'Athena')
      .single();

    if (data) setAthena(data as IAAgent);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAthena();

    const channel = supabase
      .channel('athena_status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ia_agents',
        },
        (payload) => {
          const updated = payload.new as IAAgent;
          if (updated.nome === 'Athena') {
            setAthena(updated);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAthena]);

  return { athena, loading, refetch: fetchAthena };
}
