const fs = require('fs');
let code = fs.readFileSync('src/pages/Students.tsx', 'utf8');

code = code.replace(
/const newStudents = \[\];\s*for \(let i = startIndex; i < lines.length; i\+\+\) \{\s*const parts = lines\[i\].split\(','\).map\(p => p.trim\(\)\);\s*if \(parts.length >= 4\) \{\s*newStudents.push\(\{\s*nisn: parts\[0\],\s*name: parts\[1\],\s*gender: parts\[2\] === 'P' \? 'P' : 'L',\s*class_name: parts\[3\],\s*status: 'Aktif'\s*\}\);\s*\}\s*\}/,
`const newStudents = [];
    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length >= 4) {
        newStudents.push({
          nisn: parts[0],
          name: parts[1],
          gender: parts[2] === 'P' ? 'P' : 'L',
          class_name: parts[3],
          academic_year: activeYearId || null,
          status: 'Aktif'
        });
      }
    }`
);

code = code.replace(
/const newStudent = \{\s*name: formData.name,\s*nisn: formData.nisn,\s*gender: formData.gender,\s*class_name: formData.class_name,\s*status: 'Aktif'\s*\};/,
`const newStudent = {
      name: formData.name,
      nisn: formData.nisn,
      gender: formData.gender,
      class_name: formData.class_name,
      academic_year: activeYearId || null,
      status: 'Aktif'
    };`
);

fs.writeFileSync('src/pages/Students.tsx', code);
console.log('Patched Students.tsx inserts');
