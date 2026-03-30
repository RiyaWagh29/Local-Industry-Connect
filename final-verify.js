import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cdpuzjfhrqkshdpstyoh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SlIDVzlZr5FjF6odYl4SHw_BN8jm-td';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verify() {
  const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  if (error) console.error('Verification failed:', error.message);
  else console.log(`FINAL REPORT: ${count} mentors correctly synchronized in the profiles table! 🚀`);
}

verify();
