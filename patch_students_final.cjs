const fs = require('fs');
let code = fs.readFileSync('src/pages/Students.tsx', 'utf8');

// 1. Add academicYears state
code = code.replace(
/const \[activeYearId, setActiveYearId\] = useState\(''\);/,
`const [activeYearId, setActiveYearId] = useState('');
  const [academicYears, setAcademicYears] = useState<any[]>([]);`
);

// 2. Update formData
code = code.replace(
/class_name: 'Kelas 1'/,
`class_name: 'Kelas 1',
    academic_year: ''`
);

// 3. Fetch academic years
code = code.replace(
/supabase\.from\('academic_years'\)\.select\('id'\)\.eq\('is_active', true\)\.limit\(1\)\.then\(\{data\}\) => \{\s*if \(data && data\.length > 0\) \{\s*setActiveYearId\(data\[0\]\.id\);\s*\}\s*\}\);/,
`supabase.from('academic_years').select('*').order('start_date', {ascending: false}).then(({data}) => {
      if (data && data.length > 0) {
        setAcademicYears(data);
        const active = data.find((y: any) => y.is_active);
        const actId = active ? active.id : data[0].id;
        setActiveYearId(actId);
        setFormData(prev => ({ ...prev, academic_year: actId }));
      }
    });`
);

// 4. Download template update
code = code.replace(
/const csvContent = "data:text\/csv;charset=utf-8,NISN,Nama Murid,Jenis Kelamin\(L\/P\),Kelas\\n1234567890,Budi Santoso,L,Kelas 1\\n0987654321,Siti Aminah,P,Kelas 1";/,
`const csvContent = "data:text/csv;charset=utf-8,NISN,Nama Murid,Jenis Kelamin(L/P),Kelas,Tahun Ajaran\\n1234567890,Budi Santoso,L,Kelas 1,2024/2025\\n0987654321,Siti Aminah,P,Kelas 1,2024/2025";`
);

// 5. Import Modal text update
code = code.replace(
/<li>Format kolom: <strong>NISN, Nama Lengkap, Jenis Kelamin \(L\/P\), Kelas<\/strong><\/li>/,
`<li>Format kolom: <strong>NISN, Nama Lengkap, Jenis Kelamin (L/P), Kelas, Tahun Ajaran</strong></li>`
);

code = code.replace(
/placeholder="Contoh:&#10;1234567890, Budi Santoso, L, Kelas 1&#10;0987654321, Siti Aminah, P, Kelas 2"/,
`placeholder="Contoh:&#10;1234567890, Budi Santoso, L, Kelas 1, 2024/2025&#10;0987654321, Siti Aminah, P, Kelas 2, 2024/2025"`
);

// 6. Process import
code = code.replace(
/const newStudents = \[\];\s*for \(let i = startIndex; i < lines\.length; i\+\+\) \{\s*const parts = lines\[i\]\.split\(','\)\.map\(p => p\.trim\(\)\);\s*if \(parts\.length >= 4\) \{\s*newStudents\.push\(\{\s*nisn: parts\[0\],\s*name: parts\[1\],\s*gender: parts\[2\] === 'P' \? 'P' : 'L',\s*class_name: parts\[3\],\s*academic_year: activeYearId \|\| null,\s*status: 'Aktif'\s*\}\);\s*\}\s*\}/,
`const newStudents = [];
    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length >= 4) {
        let ayId = activeYearId || null;
        if (parts[4]) {
          const match = academicYears.find(y => y.name.toLowerCase() === parts[4].toLowerCase());
          if (match) ayId = match.id;
        }
        newStudents.push({
          nisn: parts[0],
          name: parts[1],
          gender: parts[2] === 'P' ? 'P' : 'L',
          class_name: parts[3],
          academic_year: ayId,
          status: 'Aktif'
        });
      }
    }`
);

// 7. handleSaveStudent fix
code = code.replace(
/const newStudent = \{\s*name: formData\.name,\s*nisn: formData\.nisn,\s*gender: formData\.gender,\s*class_name: formData\.class_name,\s*academic_year: activeYearId \|\| null,\s*status: 'Aktif'\s*\};/,
`const newStudent = {
      name: formData.name,
      nisn: formData.nisn,
      gender: formData.gender,
      class_name: formData.class_name,
      academic_year: formData.academic_year || activeYearId || null,
      status: 'Aktif'
    };`
);

// Reset form data after save (2 instances)
code = code.replace(
/setFormData\(\{ name: '', nisn: '', gender: 'L', class_name: classes\[0\] \|\| 'Kelas 1' \}\);/g,
`setFormData({ name: '', nisn: '', gender: 'L', class_name: classes[0] || 'Kelas 1', academic_year: activeYearId });`
);


// 8. Add Student Modal UI
code = code.replace(
/<div className="space-y-1\.5">\s*<label className="text-sm font-bold text-gray-700 ml-1">Kelas<\/label>\s*<select \s*value=\{formData\.class_name\}\s*onChange=\{\(e\) => setFormData\(\{...formData, class_name: e\.target\.value\}\)\}\s*className="w-full px-4 py-2\.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary\/20 text-sm"\s*>\s*\{classes\.map\(c => \(\s*<option key=\{c\} value=\{c\}>\{c\}<\/option>\s*\)\)\}\s*<\/select>\s*<\/div>/,
`<div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 ml-1">Kelas</label>
                    <select 
                      value={formData.class_name}
                      onChange={(e) => setFormData({...formData, class_name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"
                    >
                      {classes.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2 mt-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Tahun Ajaran</label>
                    <select 
                      value={formData.academic_year}
                      onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"
                    >
                      {academicYears.map(y => (
                        <option key={y.id} value={y.id}>{y.name}</option>
                      ))}
                    </select>
                  </div>`
);

// 9. Filter students list
code = code.replace(
/const filteredStudents = students\.filter\(student =>\s*student\.name\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\) \|\|\s*student\.nisn?.includes\(searchTerm\)\s*\);/,
`const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.nisn?.includes(searchTerm);
    const matchesYear = activeYearId ? student.academic_year === activeYearId : true;
    return matchesSearch && matchesYear;
  });`
);

fs.writeFileSync('src/pages/Students.tsx', code);
console.log('Patched Students.tsx');
