const fs = require('fs');
let code = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

// Add states for school identity
code = code.replace(
/export default function Settings\(\) \{/,
`export default function Settings() {
  const [schoolIdentity, setSchoolIdentity] = useState({
    schoolName: 'UPT SD Negeri Bugulkidul II',
    principalName: '',
    address: ''
  });`
);

// Fetch settings
code = code.replace(
/fetchClasses\(\);\s*\}, \[\]\);/,
`fetchClasses();
    const storedIdentity = localStorage.getItem('school_identity');
    if (storedIdentity) {
      setSchoolIdentity(JSON.parse(storedIdentity));
    }
  }, []);`
);

// Add save handler
code = code.replace(
/const handleDeleteClass = async/,
`const handleSaveAllSettings = () => {
    localStorage.setItem('school_identity', JSON.stringify(schoolIdentity));
    alert('Pengaturan berhasil disimpan!');
  };

  const handleDeleteClass = async`
);

// Bind inputs
code = code.replace(
/<input type="text" defaultValue="UPT SD Negeri Bugulkidul II"/,
`<input type="text" value={schoolIdentity.schoolName} onChange={e => setSchoolIdentity({...schoolIdentity, schoolName: e.target.value})}`
);

code = code.replace(
/<input type="text" placeholder="Masukkan nama kepsek\.\.\."/,
`<input type="text" placeholder="Masukkan nama kepsek..." value={schoolIdentity.principalName} onChange={e => setSchoolIdentity({...schoolIdentity, principalName: e.target.value})}`
);

code = code.replace(
/<textarea rows=\{3\} placeholder="Alamat lengkap sekolah\.\.\." className="w-full px-4 py-2\.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary\/20 text-sm"><\/textarea>/,
`<textarea rows={3} placeholder="Alamat lengkap sekolah..." value={schoolIdentity.address} onChange={e => setSchoolIdentity({...schoolIdentity, address: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"></textarea>`
);

// Bind button
code = code.replace(
/<button type="button" className="flex items-center gap-2 px-6 py-2\.5 bg-primary text-white rounded-xl shadow-md shadow-primary\/30 text-sm font-bold hover:bg-primary-dark transition-colors animate-shimmer">\s*<Save size=\{18\} \/> Simpan Pengaturan\s*<\/button>/,
`<button type="button" onClick={handleSaveAllSettings} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl shadow-md shadow-primary/30 text-sm font-bold hover:bg-primary-dark transition-colors animate-shimmer">
              <Save size={18} /> Simpan Pengaturan
            </button>`
);

fs.writeFileSync('src/pages/Settings.tsx', code);
console.log('Patched Settings.tsx');
