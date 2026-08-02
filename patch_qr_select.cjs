const fs = require('fs');
let code = fs.readFileSync('src/pages/GenerateQR.tsx', 'utf8');

code = code.replace(
/<select \s*value=\{selectedClass\}\s*onChange=\{\(e\) => setSelectedClass\(e\.target\.value\)\}\s*className="px-4 py-2\.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary\/20 text-sm font-medium min-w-\[150px\]"\s*>\s*<option value="6A">Kelas 6A<\/option>\s*<option value="6B">Kelas 6B<\/option>\s*<option value="5A">Kelas 5A<\/option>\s*<\/select>/,
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
console.log('Patched GenerateQR.tsx select');
