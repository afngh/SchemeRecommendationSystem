import { createClient } from '@supabase/supabase-js';

// Dynamic config evaluation to prevent stale Turbopack dev caching of environment variables
const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const configured = 
    url.length > 0 && 
    key.length > 0 && 
    url !== 'https://your-project-id.supabase.co' && 
    key !== 'your-supabase-anon-key-placeholder';
  return { url, key, configured };
};

export const isSupabaseConfigured = getSupabaseConfig().configured;

export const supabase = isSupabaseConfigured 
  ? createClient(getSupabaseConfig().url, getSupabaseConfig().key) 
  : null;

