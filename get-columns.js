import { createClient } from '@supabase/supabase-js';
const url = 'https://kpcwzxekzbndikfdnfnm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwY3d6eGVremJuZGlrZmRuZm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MzQ0NDcsImV4cCI6MjEwMTIxMDQ0N30.jranO-k10sc-PFFcoOtBl5EmyBjqNtTCHx12eYNAIik';
const supabase = createClient(url, key);
(async () => {
  const { data: ay } = await supabase.from('academic_years').select('*').limit(1);
  console.log('academic_years cols:', ay && ay.length ? Object.keys(ay[0]) : 'empty table');
  
  const { data: cls } = await supabase.from('classes').select('*').limit(1);
  console.log('classes cols:', cls && cls.length ? Object.keys(cls[0]) : 'empty table');
  
  // Also checking if we can insert to see if we get errors
  const { error: e3 } = await supabase.from('academic_years').insert({ name: 'test', start_date: '2023-01-01', end_date: '2023-12-31', is_active: false });
  console.log('insert AY error:', e3 ? e3.message : 'success');
  
  const { error: e4 } = await supabase.from('classes').insert({ name: 'test_class' });
  console.log('insert Class error:', e4 ? e4.message : 'success');
})();
