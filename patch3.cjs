const fs = require('fs');
let code = fs.readFileSync('src/pages/Teachers.tsx', 'utf8');

code = code.replace(
/const \[classes, setClasses\] = useState<string\[\]>\(\[\]\);\s*useEffect\(\(\) => \{\s*fetchTeachers\(\);\s*const storedClasses = localStorage.getItem\('school_classes'\);\s*if \(storedClasses\) \{\s*setClasses\(JSON.parse\(storedClasses\)\);\s*\} else \{\s*setClasses\(\['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'\]\);\s*\}\s*\}, \[\]\);/,
`const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    fetchTeachers();
    
    supabase.from('classes').select('*').order('name').then(({data}) => {
      if (data && data.length > 0) {
        setClasses(data.map((c: any) => c.name));
      } else {
        setClasses(['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6']);
      }
    });
  }, []);`
);

fs.writeFileSync('src/pages/Teachers.tsx', code);
console.log('Patched Teachers.tsx');
