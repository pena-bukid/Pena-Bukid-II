import { createClient } from '@supabase/supabase-js';
const url = 'https://kpcwzxekzbndikfdnfnm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwY3d6eGVremJuZGlrZmRuZm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MzQ0NDcsImV4cCI6MjEwMTIxMDQ0N30.jranO-k10sc-PFFcoOtBl5EmyBjqNtTCHx12eYNAIik';
const supabase = createClient(url, key);
(async () => {
  await supabase.auth.signInWithPassword({
    email: 'penabukid2@penabukid.sch.id',
    password: 'Admin123'
  });
  
  const req = await fetch(`${url}/rest/v1/teachers`, {
    method: 'POST',
    headers: { 
      apikey: key, 
      'Content-Type': 'application/json', 
      'Prefer': 'return=representation',
      'Authorization': `Bearer ${ (await supabase.auth.getSession()).data.session.access_token }`
    },
    body: JSON.stringify({})
  });
  const data = await req.json();
  console.log(data);
})();
