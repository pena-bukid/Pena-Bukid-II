const fs = require('fs');
let code = fs.readFileSync('src/pages/Students.tsx', 'utf8');

code = code.replace(
/const \[isTeacher, setIsTeacher\] = useState\(false\);\s*const \[classes, setClasses\] = useState<string\[\]>\(\[\]\);\s*const \[showImportModal, setShowImportModal\] = useState\(false\);\s*const \[importText, setImportText\] = useState\(''\);\s*useEffect\(\(\) => \{\s*fetchStudents\(\);\s*setIsTeacher\(!!localStorage.getItem\('teacher_session'\)\);\s*const storedClasses = localStorage.getItem\('school_classes'\);\s*if \(storedClasses\) \{\s*const parsedClasses = JSON.parse\(storedClasses\);\s*setClasses\(parsedClasses\);\s*if \(parsedClasses.length > 0\) \{\s*setFormData\(prev => \(\{ ...prev, class_name: parsedClasses\[0\] \}\)\);\s*\}\s*\} else \{\s*const defaultClasses = \['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'\];\s*setClasses\(defaultClasses\);\s*setFormData\(prev => \(\{ ...prev, class_name: defaultClasses\[0\] \}\)\);\s*\}\s*\}, \[\]\);/,
`const [isTeacher, setIsTeacher] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [activeYearId, setActiveYearId] = useState('');

  useEffect(() => {
    fetchStudents();
    setIsTeacher(!!localStorage.getItem('teacher_session'));
    
    supabase.from('classes').select('*').order('name').then(({data}) => {
      if (data && data.length > 0) {
        const cls = data.map((c: any) => c.name);
        setClasses(cls);
        setFormData(prev => ({ ...prev, class_name: cls[0] }));
      } else {
        const defaultClasses = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];
        setClasses(defaultClasses);
        setFormData(prev => ({ ...prev, class_name: defaultClasses[0] }));
      }
    });

    supabase.from('academic_years').select('id').eq('is_active', true).limit(1).then(({data}) => {
      if (data && data.length > 0) {
        setActiveYearId(data[0].id);
      }
    });
  }, []);`
);

fs.writeFileSync('src/pages/Students.tsx', code);
console.log('Patched');
