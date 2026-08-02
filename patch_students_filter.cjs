const fs = require('fs');
let code = fs.readFileSync('src/pages/Students.tsx', 'utf8');

const filterOriginal = `const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.nisn?.includes(searchTerm)
  );`;

const filterReplacement = `const filteredStudents = students.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.nisn?.includes(searchTerm);
    const matchesYear = activeYearId ? s.academic_year === activeYearId : true;
    return matchesSearch && matchesYear;
  });`;

code = code.replace(filterOriginal, filterReplacement);

fs.writeFileSync('src/pages/Students.tsx', code);
console.log('Patched Students.tsx filter');
