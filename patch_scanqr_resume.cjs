const fs = require('fs');
let code = fs.readFileSync('src/pages/ScanQR.tsx', 'utf8');

code = code.replace(
/if \(scannerRef\.current && scannerRef\.current\.getState\(\) === 2\) \{ \/\/ 2 = PAUSED\s*scannerRef\.current\.resume\(\);\s*\}/g,
`try {
              if (scannerRef.current) {
                scannerRef.current.resume();
              }
            } catch(e) {}`
);

fs.writeFileSync('src/pages/ScanQR.tsx', code);
console.log('Patched ScanQR.tsx resume logic');
