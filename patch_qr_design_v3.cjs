const fs = require('fs');
let code = fs.readFileSync('src/pages/GenerateQR.tsx', 'utf8');

const newStudentCard = `const StudentCard = ({ student, cardRef, onSelect, isSelected, selectable, schoolName }: any) => {
  return (
    <div 
      onClick={() => selectable && onSelect && onSelect(student.id)}
      ref={cardRef}
      className={cn(
        "relative overflow-hidden flex-shrink-0 transition-all font-sans bg-[#fefdf9]",
        selectable ? "cursor-pointer hover:ring-4 hover:ring-primary/20" : "",
        isSelected ? "ring-4 ring-primary shadow-lg shadow-primary/20 scale-[1.02]" : ""
      )}
      style={{ 
         width: '55mm', 
         height: '85mm', 
         boxShadow: isSelected ? 'none' : '0 0 10px rgba(0,0,0,0.1)',
         borderRadius: '12px',
         border: '1px solid #f0f0f0'
      }}
    >
      {selectable && (
        <div className="absolute top-2 right-2 z-50 w-6 h-6 rounded-full border-2 border-[#e31b23] bg-white flex items-center justify-center shadow-sm">
          {isSelected && <Check size={14} className="text-[#e31b23] font-bold" />}
        </div>
      )}

      {/* Top Red Shape */}
      <svg className="absolute top-0 left-0 w-full z-0" style={{ height: '35mm' }} viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Red background */}
        <path d="M0,0 L100,0 L100,85 C70,110 30,75 0,95 Z" fill="#e31b23" />
        {/* Yellow stroke line below it */}
        <path d="M0,95 C30,75 70,110 100,85" fill="none" stroke="#facc15" strokeWidth="2.5" />
      </svg>
      
      {/* Top Decorations */}
      <div className="absolute top-[3mm] left-[4mm] text-[#facc15] text-[14px] transform -rotate-12">⭐</div>
      <div className="absolute top-[10mm] left-[2mm] text-white text-[12px] transform -rotate-12">♡</div>
      <div className="absolute top-[3mm] right-[4mm] text-[#facc15] text-[16px] transform rotate-12">✈️</div>

      {/* Small floating squares/dots in top red */}
      <div className="absolute top-[18mm] left-[4mm] flex gap-[2px] transform -rotate-12 opacity-80">
        <div className="w-[3px] h-[3px] bg-[#facc15]"></div>
        <div className="w-[4px] h-[4px] bg-[#facc15]"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-20 w-full h-full flex flex-col items-center pt-[3mm]">
        
        {/* Ribbon KARTU PRESENSI */}
        <div className="flex items-center justify-center gap-1.5 mb-[1.5mm]">
          <span className="text-[#facc15] text-[8px] transform -rotate-12">☀️</span>
          <div className="text-white text-[8px] font-black tracking-widest uppercase">
            KARTU PRESENSI
          </div>
          <span className="text-[#facc15] text-[8px] transform rotate-12">☀️</span>
        </div>

        {/* School Name (Bubble text style simulation) */}
        <div 
          className="text-white text-[17px] font-black uppercase text-center leading-[1.05] w-[50mm] mt-[1mm] mb-[4mm]"
          style={{
            WebkitTextStroke: '1px #b91c1c',
            textShadow: '0px 2px 0px #991b1b, 0px 3px 2px rgba(0,0,0,0.3)',
            fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif'
          }}
        >
          {schoolName || 'UPT SDN BUGULKIDUL II'}
        </div>

        {/* Center Star on the wave */}
        <div className="absolute top-[29mm] left-1/2 transform -translate-x-1/2 text-[#facc15] text-[28px] drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)] z-30">
          ⭐
        </div>
        {/* Sparkles around center star */}
        <div className="absolute top-[28mm] left-[20mm] text-white text-[12px]">✨</div>
        <div className="absolute top-[28mm] right-[20mm] text-white text-[10px]">✨</div>

        {/* Name */}
        <div className="text-[#e31b23] font-black text-[11px] uppercase tracking-wide text-center w-[50mm] mt-[10mm] leading-tight truncate">
          {student.name}
        </div>

        {/* NISN */}
        <div className="mt-[1.5mm] text-[10px] font-black text-gray-900 flex justify-center gap-1">
          <span>NISN:</span>
          <span className="text-[#e31b23]">{student.nisn || '-'}</span>
        </div>

        {/* Class Pill */}
        <div className="flex items-center gap-1.5 mt-[2.5mm] mb-[2.5mm]">
          <div className="text-[#facc15] text-[10px] font-black transform rotate-12">/</div>
          <div className="bg-[#e31b23] text-white text-[10px] font-black px-4 py-[2px] rounded-full shadow-sm relative">
             <div className="absolute inset-[1.5px] rounded-full border-[1.5px] border-dashed border-white opacity-90"></div>
            {student.class_name || student.class ? (student.class_name || student.class).toUpperCase() : 'KELAS 1'}
          </div>
          <div className="text-[#facc15] text-[10px] font-black transform -rotate-12">\\</div>
        </div>

        {/* QR Code */}
        <div className="bg-white p-[2mm] rounded-[10px] border-[2.5px] border-[#e31b23] shadow-sm relative z-20 mt-[0.5mm]">
          <QRCodeSVG value={student.nisn || student.token || '000000'} size={65} level="H" />
        </div>

      </div>

      {/* Background decorations (dots & doodles) */}
      <div className="absolute top-[42mm] left-[3mm] flex flex-wrap w-[8mm] gap-[2.5px] opacity-20">
        {[...Array(9)].map((_, i) => <div key={i} className="w-[1.5px] h-[1.5px] bg-[#e31b23] rounded-full"></div>)}
      </div>
      <div className="absolute top-[42mm] right-[3mm] flex flex-wrap w-[8mm] gap-[2.5px] opacity-20">
        {[...Array(9)].map((_, i) => <div key={i} className="w-[1.5px] h-[1.5px] bg-[#e31b23] rounded-full"></div>)}
      </div>
      <div className="absolute top-[48mm] left-[3mm] text-[#e31b23] text-[14px]">⭐</div>
      <div className="absolute top-[48mm] right-[4mm] text-[#e31b23] text-[12px]">❤️</div>

      {/* Bottom Floating Icons (Emojis for approximation) */}
      <div className="absolute bottom-[16mm] left-[2mm] text-[28px] drop-shadow-md z-30 transform -rotate-12">✏️</div>
      <div className="absolute bottom-[24mm] left-[3mm] text-[20px] drop-shadow-md z-30">🔴</div>
      <div className="absolute bottom-[20mm] right-[2mm] text-[24px] drop-shadow-md z-30">🙂</div>
      <div className="absolute bottom-[11mm] right-[2mm] text-[26px] drop-shadow-md z-30 transform rotate-12">📕</div>

      {/* Bottom Footer Red Shape */}
      <div className="absolute bottom-0 left-0 w-full h-[14mm] z-10 overflow-hidden">
        <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
           <path d="M0,100 L100,100 L100,30 C75,10 25,45 0,20 Z" fill="#e31b23" />
           <path d="M0,20 C25,45 75,10 100,30" fill="none" stroke="#facc15" strokeWidth="2.5" strokeDasharray="4 4" />
        </svg>
        
        {/* Footer Text */}
        <div className="absolute bottom-[2.5mm] w-full text-center flex justify-center items-center gap-1.5 text-white font-black text-[9px] drop-shadow-md">
          <span className="text-[#facc15] text-[8px] transform rotate-12">///</span>
          <span>Belajar</span>
          <span className="text-[#facc15] text-[6px]">●</span>
          <span>Disiplin</span>
          <span className="text-[#facc15] text-[6px]">●</span>
          <span>Berprestasi</span>
          <span className="text-[#facc15] text-[8px] transform -rotate-12">\\\\</span>
        </div>
      </div>

    </div>
  );
};`;

const startIndex = code.indexOf('const StudentCard');
const endIndex = code.indexOf('export default function GenerateQR()');

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + newStudentCard + '\n\n' + code.substring(endIndex);
  fs.writeFileSync('src/pages/GenerateQR.tsx', code);
  console.log('Patched GenerateQR.tsx layout explicitly matching the uploaded image');
} else {
  console.log('Failed to find boundaries');
}
