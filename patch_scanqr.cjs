const fs = require('fs');
let code = fs.readFileSync('src/pages/ScanQR.tsx', 'utf8');

// Update to search by nisn
code = code.replace(
/const \{ data: student \} = await supabase\.from\('students'\)\.select\('\*'\)\.eq\('token', decodedText\)\.single\(\);/,
`// Search by nisn (or token fallback)
          let { data: student } = await supabase.from('students').select('*').eq('nisn', decodedText).single();
          if (!student) {
            const { data: studentByToken } = await supabase.from('students').select('*').eq('token', decodedText).single();
            student = studentByToken;
          }`
);

fs.writeFileSync('src/pages/ScanQR.tsx', code);
console.log('Patched ScanQR.tsx');
