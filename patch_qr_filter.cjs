const fs = require('fs');
let code = fs.readFileSync('src/pages/GenerateQR.tsx', 'utf8');

// Add activeYearId state
code = code.replace(
/const \[students, setStudents\] = useState<any\[\]>\(\[\]\);/,
`const [students, setStudents] = useState<any[]>([]);
  const [activeYearId, setActiveYearId] = useState('');`
);

// Fetch active year
code = code.replace(
/useEffect\(\(\) => \{/,
`useEffect(() => {
    supabase.from('academic_years').select('id').eq('is_active', true).limit(1).then(({data}) => {
      if (data && data.length > 0) {
        setActiveYearId(data[0].id);
      }
    });`
);

// Update filter
const filterOriginal = `const filteredStudents = students.filter(s => 
    (s.class_name || s.class) === selectedClass && s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );`;

const filterReplacement = `const filteredStudents = students.filter(s => {
    const matchesClass = (s.class_name || s.class) === selectedClass;
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = activeYearId ? s.academic_year === activeYearId : true;
    return matchesClass && matchesSearch && matchesYear;
  });`;

code = code.replace(filterOriginal, filterReplacement);

fs.writeFileSync('src/pages/GenerateQR.tsx', code);
console.log('Patched GenerateQR filter');
