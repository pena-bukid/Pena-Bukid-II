const fs = require('fs');
let code = fs.readFileSync('src/pages/GenerateQR.tsx', 'utf8');

// Update StudentCard props
code = code.replace(
/const StudentCard = \(\{ student, cardRef, onSelect, isSelected, selectable \}: any\) => \(/,
`const StudentCard = ({ student, cardRef, onSelect, isSelected, selectable, schoolName }: any) => (`
);

// Update School Name rendering
code = code.replace(
/<div className="text-white text-\[10px\] font-bold uppercase tracking-wider">UPT SD Negeri<\/div>\s*<div className="text-white text-\[8px\] opacity-90">Bugulkidul II<\/div>/,
`<div className="text-white text-[10px] font-bold uppercase tracking-wider text-center px-1 truncate w-full">{schoolName || 'NAMA SEKOLAH'}</div>`
);

// Add state for schoolIdentity
code = code.replace(
/const \[students, setStudents\] = useState<any\[\]>\(\[\]\);/,
`const [students, setStudents] = useState<any[]>([]);
  const [schoolIdentity, setSchoolIdentity] = useState({
    schoolName: 'UPT SD Negeri Bugulkidul II'
  });`
);

// Load schoolIdentity
code = code.replace(
/useEffect\(\(\) => \{/,
`useEffect(() => {
    const storedIdentity = localStorage.getItem('school_identity');
    if (storedIdentity) {
      try {
        setSchoolIdentity(JSON.parse(storedIdentity));
      } catch (e) {}
    }`
);

// Pass schoolName to StudentCard
code = code.replace(
/<StudentCard \s*student=\{student\}\s*cardRef=\{undefined\}\s*onSelect=\{toggleSelection\}\s*isSelected=\{selectedIds\.includes\(student\.id\)\}\s*selectable=\{isPrintMode\}\s*\/>/g,
`<StudentCard 
                student={student}
                cardRef={undefined}
                onSelect={toggleSelection}
                isSelected={selectedIds.includes(student.id)}
                selectable={isPrintMode}
                schoolName={schoolIdentity.schoolName}
              />`
);

// Pass schoolName to Preview StudentCard
code = code.replace(
/<StudentCard student=\{student\} cardRef=\{el => cardRefs\.current\[student\.id\] = el\} \/>/g,
`<StudentCard student={student} cardRef={el => cardRefs.current[student.id] = el} schoolName={schoolIdentity.schoolName} />`
);

fs.writeFileSync('src/pages/GenerateQR.tsx', code);
console.log('Patched GenerateQR.tsx for school identity');
