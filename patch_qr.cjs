const fs = require('fs');
let code = fs.readFileSync('src/pages/GenerateQR.tsx', 'utf8');

code = code.replace(
/useEffect\(\(\) => \{\s*fetchStudents\(\);\s*\}, \[\]\);\s*const fetchStudents = async \(\) => \{\s*const \{ data \} = await supabase\.from\('students'\)\.select\('\*'\)\.order\('name'\);/,
`useEffect(() => {
    supabase.from('classes').select('*').order('name').then(({data}) => {
      if (data && data.length > 0) {
        const cls = data.map((c: any) => c.name);
        setClasses(cls);
        setSelectedClass(cls[0]);
      } else {
        const cls = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];
        setClasses(cls);
        setSelectedClass(cls[0]);
      }
    });
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('*').order('name');`
);

fs.writeFileSync('src/pages/GenerateQR.tsx', code);
console.log('Patched GenerateQR.tsx again');
