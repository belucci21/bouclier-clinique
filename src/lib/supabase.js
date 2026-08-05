import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_URL = 'https://tmcxgiqmmjpgxqrivbod.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable__1Ch9Iq0kJbrqkoRUqO3-Q_nxT95ani';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_PROJECT_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  || import.meta.env.VITE_SUPABASE_ANON_KEY
  || SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
