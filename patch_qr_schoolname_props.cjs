const fs = require('fs');
let code = fs.readFileSync('src/pages/GenerateQR.tsx', 'utf8');

code = code.replace(
/<StudentCard \s*student=\{student\} \s*cardRef=\{\(el: any\) => cardRefs\.current\[student\.id\] = el\}\s*selectable=\{isPrintMode\}\s*isSelected=\{selectedIds\.includes\(student\.id\)\}\s*onSelect=\{toggleSelection\}\s*\/>/g,
`<StudentCard 
                    student={student} 
                    cardRef={(el: any) => cardRefs.current[student.id] = el}
                    selectable={isPrintMode}
                    isSelected={selectedIds.includes(student.id)}
                    onSelect={toggleSelection}
                    schoolName={schoolIdentity.schoolName}
                  />`
);

code = code.replace(
/<StudentCard key=\{student\.id\} student=\{student\} \/>/g,
`<StudentCard key={student.id} student={student} schoolName={schoolIdentity.schoolName} />`
);

fs.writeFileSync('src/pages/GenerateQR.tsx', code);
console.log('Patched GenerateQR.tsx missing schoolName props');
