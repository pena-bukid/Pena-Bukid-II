const fs = require('fs');
let code = fs.readFileSync('src/pages/Students.tsx', 'utf8');

code = code.replace(
/supabase\.from\('academic_years'\)\.select\('id'\)\.eq\('is_active', true\)\.limit\(1\)\.then\(\(\{data\}\) => \{\s*if \(data && data\.length > 0\) \{\s*setActiveYearId\(data\[0\]\.id\);\s*\}\s*\}\);/,
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

fs.writeFileSync('src/pages/Students.tsx', code);
console.log('Patched Students.tsx AY fetch');
