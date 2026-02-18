import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Credenciais fixas — Doctor Auto Prime (acuufrgoyjwzlyhopaus)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://acuufrgoyjwzlyhopaus.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjdXVmcmdveWp3emx5aG9wYXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNjI5ODgsImV4cCI6MjA4MzgzODk4OH0.V7CgRaRFI8QAblr3TysttxPAY5E-e2vWEpmdu_2au4A';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL || '',
  SUPABASE_ANON_KEY || '',
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);