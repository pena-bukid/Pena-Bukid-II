const fs = require('fs');
let code = fs.readFileSync('src/pages/GenerateQR.tsx', 'utf8');

code = code.replace(
/export default function GenerateQR\(\) \{\s*const \[selectedClass, setSelectedClass\] = useState\('6A'\);/,
`export default function GenerateQR() {
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('');`
);

code = code.replace(
/const fetchStudents = async \(\) => \{\s*const \{ data \} = await supabase.from\('students'\).select\('\*'\);/,
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
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('*');`
);

code = code.replace(
/<select\s*value=\{selectedClass\}\s*onChange=\{\(e\) => setSelectedClass\(e.target.value\)\}\s*className="px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary\/20 text-sm font-medium min-w-\[150px\]"\s*>\s*<option value="6A">Kelas 6A<\/option>\s*<option value="6B">Kelas 6B<\/option>\s*<\/select>/,
`<select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm font-medium min-w-[150px]"
          >
            {classes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>`
);

fs.writeFileSync('src/pages/GenerateQR.tsx', code);
console.log('Patched GenerateQR.tsx');
