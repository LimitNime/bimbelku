import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: s } = await supabase.from('siswa').select('id, nama, email, user_id, programs:siswa_programs(nama_program)').ilike('nama', '%Hanif Yani%');
  console.log('--- DATA SISWA ---');
  console.log(JSON.stringify(s, null, 2));

  if (s && s.length > 0) {
    const { data: r, error } = await supabase.from('raport').select('*').eq('siswa_id', s[0].id);
    if (error) console.error('Error fetching raport:', error);
    console.log('\n--- DATA RAPORT ---');
    console.log(JSON.stringify(r, null, 2));
  }
}

run();
