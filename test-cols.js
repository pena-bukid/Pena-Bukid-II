import { createClient } from '@supabase/supabase-js';
const url = 'https://kpcwzxekzbndikfdnfnm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwY3d6eGVremJuZGlrZmRuZm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MzQ0NDcsImV4cCI6MjEwMTIxMDQ0N30.jranO-k10sc-PFFcoOtBl5EmyBjqNtTCHx12eYNAIik';
const supabase = createClient(url, key);
(async () => {
  let cols = ['nama_lengkap', 'nama_guru', 'nama', 'fullname', 'teacher_name'];
  for (let c of cols) {
    const res = await supabase.from('teachers').select(c).limit(1);
    if (!res.error) console.log(c, 'exists!');
  }
})();
