import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cdpuzjfhrqkshdpstyoh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SlIDVzlZr5FjF6odYl4SHw_BN8jm-td';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSchema() {
  console.log('🔍 Checking Opportunities schema...');
  const { data, error } = await supabase.from('opportunities').select().limit(0);
  if (error) {
    console.error('❌ Schema check failed:', error.message);
  } else {
    // If we have data (even empty), we might get column info if we were using a more advanced tool,
    // but here we can just try to see what fields are accepted by trying a dry run or checking error details.
    console.log('✅ Connected to opportunities table.');
  }
}

checkSchema();
