import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  'https://izvwnnsianzfoiptjods.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_N1sUFA0bQBTiGjVedffIRA_0drPOGcR';

// Supabase 클라이언트 인스턴스
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
