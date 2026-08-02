const fs = require('fs');
let code = fs.readFileSync('src/pages/GenerateQR.tsx', 'utf8');

code = code.replace(/format: \[55, 90\]/g, 'format: [55, 85]');
code = code.replace(/pdf\.addImage\(imgData, 'PNG', 0, 0, 55, 90\)/g, "pdf.addImage(imgData, 'PNG', 0, 0, 55, 85)");

fs.writeFileSync('src/pages/GenerateQR.tsx', code);
console.log('Patched GenerateQR.tsx pdf dimensions');
