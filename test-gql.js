import { createClient } from '@supabase/supabase-js';
const url = 'https://kpcwzxekzbndikfdnfnm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwY3d6eGVremJuZGlrZmRuZm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MzQ0NDcsImV4cCI6MjEwMTIxMDQ0N30.jranO-k10sc-PFFcoOtBl5EmyBjqNtTCHx12eYNAIik';

(async () => {
  const req = await fetch(`${url}/graphql/v1`, {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        {
          __type(name: "teachers") {
            fields {
              name
            }
          }
        }
      `
    })
  });
  console.log(JSON.stringify(await req.json(), null, 2));
})();
