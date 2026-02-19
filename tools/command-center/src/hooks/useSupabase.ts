import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Runtime env: docker-entrypoint.sh injeta window.__SUPABASE_URL__ e window.__SUPABASE_ANON_KEY__
const w = window as any;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || w.__SUPABASE_URL__ || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || w.__SUPABASE_ANON_KEY__ || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] URL ou ANON_KEY nao configuradas! Verifique env vars ou docker-entrypoint.'
  );
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  }
);

export function useSupabase() {
  return supabase;
}
