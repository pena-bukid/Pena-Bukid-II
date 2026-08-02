const fs = require('fs');
let code = fs.readFileSync('src/pages/Students.tsx', 'utf8');

code = code.replace(
/<button onClick=\{\(\) => setShowAddModal\(true\)\} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl shadow-md shadow-primary\/30 text-sm font-bold hover:bg-primary-dark transition-colors animate-shimmer">/,
`<button onClick={() => {
                setFormData({ name: '', nisn: '', gender: 'L', class_name: classes[0] || 'Kelas 1', academic_year: activeYearId });
                setShowAddModal(true);
              }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl shadow-md shadow-primary/30 text-sm font-bold hover:bg-primary-dark transition-colors animate-shimmer">`
);

fs.writeFileSync('src/pages/Students.tsx', code);
console.log('Patched Students.tsx add btn');
