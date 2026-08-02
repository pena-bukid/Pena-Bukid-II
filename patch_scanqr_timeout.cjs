const fs = require('fs');
let code = fs.readFileSync('src/pages/ScanQR.tsx', 'utf8');

code = code.replace(/}, 3000\);/g, '}, 1500);');

fs.writeFileSync('src/pages/ScanQR.tsx', code);
console.log('Patched ScanQR.tsx timeout to 1500ms');
