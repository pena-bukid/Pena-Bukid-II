import { createClient } from '@supabase/supabase-js';
const url = 'https://kpcwzxekzbndikfdnfnm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwY3d6eGVremJuZGlrZmRuZm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MzQ0NDcsImV4cCI6MjEwMTIxMDQ0N30.jranO-k10sc-PFFcoOtBl5EmyBjqNtTCHx12eYNAIik';
const supabase = createClient(url, key);
(async () => {
  const { data, error } = await supabase.auth.signUp({
    email: 'test_teacher2@penabukid.sch.id',
    password: 'bukid2'
  });
  console.log(data.session ? 'Logged in automatically' : 'Not logged in automatically');
})();
