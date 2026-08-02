import { createClient } from '@supabase/supabase-js';
const url = 'https://kpcwzxekzbndikfdnfnm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwY3d6eGVremJuZGlrZmRuZm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MzQ0NDcsImV4cCI6MjEwMTIxMDQ0N30.jranO-k10sc-PFFcoOtBl5EmyBjqNtTCHx12eYNAIik';
const supabase = createClient(url, key);
(async () => {
  const { error: e1 } = await supabase.from('academic_years').select('id, name, start_date, end_date, is_active').limit(1);
  console.log('academic_years check:', e1 ? e1.message : 'success');
  
  const { error: e2 } = await supabase.from('classes').select('id, name').limit(1);
  console.log('classes check:', e2 ? e2.message : 'success');
  
  const { error: e3 } = await supabase.from('students').select('academic_year').limit(1);
  console.log('students academic_year check:', e3 ? e3.message : 'success');
})();
