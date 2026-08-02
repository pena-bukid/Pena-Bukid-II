const fs = require('fs');

// 1. Update index.html to include Fredoka and Nunito fonts
let htmlCode = fs.readFileSync('index.html', 'utf8');
if (!htmlCode.includes('fonts.googleapis.com')) {
  htmlCode = htmlCode.replace('</head>', `  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@700&family=Nunito:wght@700;900&display=swap" rel="stylesheet">\n</head>`);
  fs.writeFileSync('index.html', htmlCode);
  console.log('Added fonts to index.html');
}

// 2. Update GenerateQR.tsx with the pixel-perfect StudentCard
let code = fs.readFileSync('src/pages/GenerateQR.tsx', 'utf8');

const newStudentCard = `const StudentCard = ({ student, cardRef, onSelect, isSelected, selectable, schoolName }: any) => {
  return (
    <div 
      onClick={() => selectable && onSelect && onSelect(student.id)}
      ref={cardRef}
      className={cn(
        "relative overflow-hidden flex-shrink-0 transition-all bg-[#fbfaf8]",
        selectable ? "cursor-pointer hover:ring-4 hover:ring-primary/20" : "",
        isSelected ? "ring-4 ring-primary shadow-lg shadow-primary/20 scale-[1.02]" : ""
      )}
      style={{ 
         width: '340px', 
         height: '540px', 
         boxShadow: isSelected ? 'none' : '0 4px 15px rgba(0,0,0,0.1)',
         borderRadius: '24px',
         border: '1px solid #f0f0f0',
         WebkitPrintColorAdjust: 'exact',
         printColorAdjust: 'exact'
      }}
    >
       {/* SVG Background Layer */}
       <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 340 540" fill="none" xmlns="http://www.w3.org/2000/svg">
         {/* Top Red Area */}
         <path d="M0,0 L340,0 L340,140 C280,110 210,160 170,160 C130,160 60,110 0,140 Z" fill="#d91f27" />
         {/* Top Yellow Stroke */}
         <path d="M0,140 C60,110 130,160 170,160 C210,160 280,110 340,140" fill="none" stroke="#f9bb16" strokeWidth="8" strokeLinecap="round" />
         {/* Top Dashed White Line */}
         <path d="M0,132 C60,102 130,152 170,152 C210,152 280,102 340,132" fill="none" stroke="white" strokeWidth="2" strokeDasharray="6 6" strokeLinecap="round" opacity="0.6"/>

         {/* Bottom Red Area */}
         <path d="M0,540 L340,540 L340,490 C250,470 150,510 0,470 Z" fill="#d91f27" />
         {/* Bottom Yellow Swoosh */}
         <path d="M-20,470 C100,520 250,450 360,510" fill="none" stroke="#f9bb16" strokeWidth="12" strokeLinecap="round" />
         {/* Bottom Dashed White Line */}
         <path d="M-20,470 C100,520 250,450 360,510" fill="none" stroke="white" strokeWidth="2" strokeDasharray="6 6" strokeLinecap="round" />
       </svg>

       {/* Top Decorations */}
       <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 340 540" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Star Left */}
          <g transform="translate(45, 45) rotate(15)">
            <path d="M0,-15 L4,-5 L15,-4 L7,3 L9,14 L0,8 L-9,14 L-7,3 L-15,-4 L-4,-5 Z" stroke="#f9bb16" strokeWidth="2.5" fill="none" />
          </g>
          {/* Heart Left */}
          <path d="M30,90 A10,10 0 0,1 50,90 A10,10 0 0,1 70,90 Q70,110 50,120 Q30,110 30,90 Z" stroke="white" strokeWidth="2" fill="none" transform="scale(0.35) translate(80, 220) rotate(-25)" />
          {/* Paper Plane Right */}
          <g transform="translate(290, 45) rotate(15) scale(0.6)">
            <path d="M-20,-20 L30,0 L-20,20 L-10,0 Z" fill="#f9bb16" />
            <path d="M-10,0 L10,30 L30,0" fill="none" stroke="#f9bb16" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          {/* Small orange dots/stars */}
          <rect x="30" y="160" width="6" height="6" fill="#f9bb16" transform="rotate(20 30 160)" />
          <rect x="40" y="150" width="4" height="4" fill="#f9bb16" transform="rotate(45 40 150)" />
          <rect x="300" y="140" width="5" height="5" fill="#f9bb16" transform="rotate(15 300 140)" />
          
          {/* Yellow Star Center */}
          <g transform="translate(170, 160) scale(1.6)">
            <path d="M0,-15 L4,-5 L15,-4 L7,3 L9,14 L0,8 L-9,14 L-7,3 L-15,-4 L-4,-5 Z" fill="#f9bb16" />
            <path d="M0,-15 L4,-5 L15,-4 L7,3 L9,14 L0,8 L-9,14 L-7,3 L-15,-4 L-4,-5 Z" fill="none" stroke="#d91f27" strokeWidth="1" opacity="0.3" />
          </g>
       </svg>

       {/* KARTU PRESENSI Ribbon */}
       <div className="absolute top-[20px] left-0 w-full flex justify-center items-center gap-2">
         <div className="flex gap-1">
           <div className="w-2 h-1 bg-white rounded-full transform -rotate-12 opacity-80"></div>
           <div className="w-2 h-1 bg-white rounded-full transform -rotate-12 opacity-80"></div>
           <div className="w-2 h-1 bg-white rounded-full transform -rotate-12 opacity-80"></div>
         </div>
         <span className="text-white font-black tracking-widest text-[14px]" style={{fontFamily: "'Nunito', sans-serif"}}>KARTU PRESENSI</span>
         <div className="flex gap-1">
           <div className="w-2 h-1 bg-white rounded-full transform rotate-12 opacity-80"></div>
           <div className="w-2 h-1 bg-white rounded-full transform rotate-12 opacity-80"></div>
           <div className="w-2 h-1 bg-white rounded-full transform rotate-12 opacity-80"></div>
         </div>
       </div>

       {/* UPT SDN BUGULKIDUL II */}
       <div className="absolute top-[40px] left-0 w-full flex justify-center px-4">
         <div 
           className="text-white text-center leading-[1.05] font-bold uppercase"
           style={{
             fontFamily: "'Fredoka', sans-serif",
             fontSize: '36px',
             WebkitTextStroke: '6px #a8161b',
             paintOrder: 'stroke fill',
             textShadow: '0px 4px 0px #a8161b'
           }}
         >
           {schoolName || 'UPT SDN BUGULKIDUL II'}
         </div>
       </div>
       <div className="absolute top-[40px] left-0 w-full flex justify-center px-4 pointer-events-none">
         <div 
           className="text-white text-center leading-[1.05] font-bold uppercase"
           style={{
             fontFamily: "'Fredoka', sans-serif",
             fontSize: '36px',
             WebkitTextStroke: '0px',
           }}
         >
           {schoolName || 'UPT SDN BUGULKIDUL II'}
         </div>
       </div>

       {/* Content Box */}
       <div className="absolute top-[195px] left-0 w-full flex flex-col items-center z-10 px-8">
         {/* Name */}
         <div className="text-[#d91f27] font-black text-[18px] uppercase text-center w-full leading-[1.1] mb-2" style={{fontFamily: "'Nunito', sans-serif"}}>
           {student.name}
         </div>

         {/* Dashed Line */}
         <div className="w-full max-w-[200px] h-0 border-t-[2px] border-dashed border-[#f9bb16] my-1 opacity-70"></div>

         {/* NISN */}
         <div className="text-[16px] font-black flex justify-center items-center gap-1 mt-1" style={{fontFamily: "'Nunito', sans-serif"}}>
           <span className="text-gray-800">NISN:</span>
           <span className="text-[#d91f27]">{student.nisn || '0146003657'}</span>
         </div>

         {/* Class Pill */}
         <div className="mt-3 flex items-center justify-center gap-2 relative">
           <div className="absolute -left-6 flex gap-1 transform rotate-[20deg]">
             <div className="w-2 h-1 bg-[#f9bb16] rounded-full"></div>
             <div className="w-2 h-1 bg-[#f9bb16] rounded-full"></div>
           </div>
           
           <div className="bg-[#d91f27] text-white px-6 py-[2px] rounded-full relative shadow-sm">
             <div className="absolute inset-[3px] rounded-full border-[1.5px] border-dashed border-white opacity-80"></div>
             <span className="relative z-10 font-black text-[14px] tracking-widest uppercase" style={{fontFamily: "'Nunito', sans-serif"}}>
               {student.class_name || student.class || 'KELAS 1'}
             </span>
           </div>

           <div className="absolute -right-6 flex gap-1 transform -rotate-[20deg]">
             <div className="w-2 h-1 bg-[#f9bb16] rounded-full"></div>
             <div className="w-2 h-1 bg-[#f9bb16] rounded-full"></div>
           </div>
         </div>
       </div>

       {/* QR Code */}
       <div className="absolute top-[305px] left-1/2 transform -translate-x-1/2 z-20">
         <div className="bg-white p-[6px] rounded-[14px] border-[3px] border-[#d91f27] shadow-sm">
            <QRCodeSVG value={student.nisn || student.token || '000000'} size={140} level="H" />
         </div>
       </div>

       {/* Bottom Footer Text */}
       <div className="absolute bottom-[8px] left-0 w-full flex justify-center items-center gap-2 z-20">
          <div className="flex gap-1 transform -rotate-[20deg]">
             <div className="w-2 h-1 bg-[#f9bb16] rounded-full"></div>
             <div className="w-2 h-1 bg-[#f9bb16] rounded-full"></div>
             <div className="w-2 h-1 bg-[#f9bb16] rounded-full"></div>
          </div>
          <div className="text-white font-black text-[12px] flex items-center gap-2 tracking-wide" style={{fontFamily: "'Nunito', sans-serif"}}>
            <span>Belajar</span>
            <span className="text-[#f9bb16] text-[6px]">●</span>
            <span>Disiplin</span>
            <span className="text-[#f9bb16] text-[6px]">●</span>
            <span>Berprestasi</span>
          </div>
          <div className="flex gap-1 transform rotate-[20deg]">
             <div className="w-2 h-1 bg-[#f9bb16] rounded-full"></div>
             <div className="w-2 h-1 bg-[#f9bb16] rounded-full"></div>
             <div className="w-2 h-1 bg-[#f9bb16] rounded-full"></div>
          </div>
       </div>

       {/* Bottom Floating Illustrations */}
       <svg className="absolute inset-0 w-full h-full pointer-events-none z-30" viewBox="0 0 340 540" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Pencil Left */}
          <g transform="translate(30, 440) rotate(-35) scale(1.1)">
             <path d="M0,0 L20,0 L20,45 L10,65 L0,45 Z" fill="#d91f27" />
             <path d="M0,0 L20,0 L20,12 L0,12 Z" fill="#f9bb16" />
             <path d="M0,45 L20,45 L10,65 Z" fill="#fdd8b1" />
             <path d="M6,56 L14,56 L10,65 Z" fill="#333" />
             <line x1="10" y1="12" x2="10" y2="45" stroke="#a8161b" strokeWidth="2" opacity="0.3"/>
          </g>

          {/* Red Face Left */}
          <g transform="translate(45, 340) scale(1.1)">
            <circle cx="20" cy="20" r="18" fill="#d91f27" />
            <circle cx="20" cy="20" r="18" fill="none" stroke="white" strokeWidth="2" strokeDasharray="4 4" opacity="0.6"/>
            <path d="M12,18 Q15,15 18,18" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
            <circle cx="25" cy="17" r="2.5" fill="#333" />
            <path d="M15,22 Q20,28 25,22 Z" fill="#333" />
            <path d="M18,22 Q20,26 22,22 Z" fill="#ff7f7f" />
          </g>
          {/* Dotted line from red face to QR */}
          <path d="M50,330 Q50,300 70,300" fill="none" stroke="#ccc" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8"/>

          {/* Yellow Face Right */}
          <g transform="translate(265, 360) scale(1)">
            <circle cx="20" cy="20" r="18" fill="#f9bb16" />
            <circle cx="20" cy="20" r="18" fill="none" stroke="white" strokeWidth="2" strokeDasharray="4 4" opacity="0.8"/>
            <circle cx="13" cy="16" r="2.5" fill="#333" />
            <circle cx="25" cy="16" r="2.5" fill="#333" />
            <path d="M13,22 Q19,28 25,22 Z" fill="#333" />
            <path d="M17,22 Q19,25 21,22 Z" fill="#ff7f7f" />
          </g>
          {/* Dotted line from yellow face to bottom */}
          <path d="M285,395 Q300,410 290,430" fill="none" stroke="#ccc" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8"/>

          {/* Heart Right */}
          <path d="M280,310 A6,6 0 0,1 292,310 A6,6 0 0,1 304,310 Q304,322 292,330 Q280,322 280,310 Z" fill="#d91f27" transform="rotate(15 292 310)" />

          {/* Book Right */}
          <g transform="translate(245, 430) rotate(15) scale(0.9)">
            <path d="M0,15 L50,0 L65,45 L15,60 Z" fill="#d91f27" />
            <path d="M-2,18 L48,3 L53,16 L3,31 Z" fill="#fff" />
            <path d="M15,22 L40,14 L43,26 L18,34 Z" fill="#f9bb16" opacity="0.8"/>
            <path d="M0,15 L15,60" stroke="#fff" strokeWidth="2"/>
          </g>
       </svg>

       {/* Background Dots Pattern (Left and Right) */}
       <div className="absolute top-[200px] left-[15px] grid grid-cols-2 gap-2 opacity-15">
         {[...Array(12)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>)}
       </div>
       <div className="absolute top-[220px] right-[15px] grid grid-cols-2 gap-2 opacity-15">
         {[...Array(10)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>)}
       </div>

    </div>
  );
};`;

const startIndex = code.indexOf('const StudentCard');
const endIndex = code.indexOf('export default function GenerateQR()');

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + newStudentCard + '\n\n' + code.substring(endIndex);
  fs.writeFileSync('src/pages/GenerateQR.tsx', code);
  console.log('Patched GenerateQR.tsx with ultimate pixel-perfect SVGs');
} else {
  console.log('Failed to find boundaries in GenerateQR.tsx');
}
