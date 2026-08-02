const fs = require('fs');
let code = fs.readFileSync('src/pages/ScanQR.tsx', 'utf8');

// Add isProcessingRef
code = code.replace(
/const scannerRef = useRef<Html5Qrcode \| null>\(null\);/,
`const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);`
);

// Use isProcessingRef in scan callback
code = code.replace(
/async \(decodedText\) => \{[\s\S]*?\/\/ Handle successful scan\s*if \(scannerRef\.current\) \{\s*scannerRef\.current\.pause\(true\); \/\/ Pause scanning while processing\s*\}/,
`async (decodedText) => {
          if (isProcessingRef.current) return;
          isProcessingRef.current = true;
          
          // Handle successful scan
          // (We removed pausing so the camera keeps visually running, we just ignore scans while processing)
`
);

// Reset isProcessingRef in setTimeout
code = code.replace(
/setTimeout\(\(\) => \{[\s\S]*?setScanResult\(null\);[\s\S]*?try \{[\s\S]*?if \(scannerRef\.current\) \{[\s\S]*?scannerRef\.current\.resume\(\);[\s\S]*?\}[\s\S]*?\} catch\(e\) \{\}[\s\S]*?\}, 1500\);/g,
`setTimeout(() => {
            setScanResult(null);
            isProcessingRef.current = false;
          }, 1500);`
);

fs.writeFileSync('src/pages/ScanQR.tsx', code);
console.log('Patched ScanQR.tsx processing flag');
