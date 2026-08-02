const fs = require('fs');
let code = fs.readFileSync('src/pages/ScanQR.tsx', 'utf8');

code = code.replace(
/let \{ data: student \} = await supabase\.from\('students'\)\.select\('\*'\)\.eq\('nisn', decodedText\)\.single\(\);\s*if \(!student\) \{\s*const \{ data: studentByToken \} = await supabase\.from\('students'\)\.select\('\*'\)\.eq\('token', decodedText\)\.single\(\);\s*student = studentByToken;\s*\}/,
`          let student = null;
          try {
            const { data: studentByNisn } = await supabase.from('students').select('*').eq('nisn', decodedText).maybeSingle();
            if (studentByNisn) {
              student = studentByNisn;
            } else {
              const { data: studentByToken } = await supabase.from('students').select('*').eq('token', decodedText).maybeSingle();
              student = studentByToken;
            }
          } catch(e) {
            console.error(e);
          }`
);

fs.writeFileSync('src/pages/ScanQR.tsx', code);
console.log('Patched ScanQR.tsx lookup');
