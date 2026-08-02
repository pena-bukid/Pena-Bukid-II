const fs = require('fs');
let code = fs.readFileSync('src/pages/GenerateQR.tsx', 'utf8');

const newStudentCard = `const StudentCard = ({ student, cardRef, onSelect, isSelected, selectable, schoolName }: any) => {
  return (
    <div 
      onClick={() => selectable && onSelect && onSelect(student.id)}
      ref={cardRef}
      className={cn(
        "relative overflow-hidden flex-shrink-0 transition-all font-sans bg-[#fbfaf8]",
        selectable ? "cursor-pointer hover:ring-4 hover:ring-primary/20" : "",
        isSelected ? "ring-4 ring-primary shadow-lg shadow-primary/20 scale-[1.02]" : ""
      )}
      style={{ 
         width: '55mm', 
         height: '85mm', 
         boxShadow: isSelected ? 'none' : '0 0 10px rgba(0,0,0,0.1)',
         borderRadius: '14px',
         border: '1px solid #f0f0f0'
      }}
    >
      {selectable && (
        <div className="absolute top-2 right-2 z-50 w-6 h-6 rounded-full border-2 border-[#da2228] bg-white flex items-center justify-center shadow-sm">
          {isSelected && <Check size={14} className="text-[#da2228] font-bold" />}
        </div>
      )}

      {/* Top Red Shape */}
      <svg className="absolute top-0 left-0 w-full z-0" style={{ height: '36mm' }} viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0,85 C25,100 75,70 100,95 L100,100 L0,100 Z" fill="none" stroke="#ffc800" strokeWidth="3" />
        <path d="M0,0 L100,0 L100,95 C75,70 25,100 0,85 Z" fill="#da2228" />
      </svg>
      
      {/* Top Decorations */}
      <div className="absolute top-[3mm] left-[4mm] text-transparent text-[12px] transform -rotate-12" style={{textShadow: '0 0 0 #ffc800'}}>☆</div>
      <div className="absolute top-[8mm] left-[3mm] text-transparent text-[10px] transform -rotate-12" style={{textShadow: '0 0 0 #ffffff'}}>♡</div>
      <div className="absolute top-[4mm] right-[4mm] text-[16px] transform rotate-12">🚀</div>

      <div className="absolute top-[16mm] left-[3mm] flex gap-[2px] transform -rotate-12 opacity-80">
        <div className="w-[3px] h-[3px] bg-[#ffc800]"></div>
        <div className="w-[3px] h-[3px] bg-[#ffc800]"></div>
      </div>
      <div className="absolute top-[20mm] right-[4mm] flex flex-col gap-[2px] transform rotate-12 opacity-80">
        <div className="w-[2px] h-[2px] bg-[#ffc800]"></div>
        <div className="w-[2px] h-[2px] bg-[#ffc800]"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-20 w-full h-full flex flex-col items-center pt-[4mm]">
        
        {/* Ribbon KARTU PRESENSI */}
        <div className="flex items-center justify-center gap-1.5 mb-[1.5mm]">
          <span className="text-[#ffc800] text-[8px] transform -rotate-12">✏️</span>
          <div className="text-white text-[8px] font-black tracking-widest uppercase">
            KARTU PRESENSI
          </div>
          <span className="text-[#ffc800] text-[8px] transform rotate-12">✏️</span>
        </div>

        {/* School Name */}
        <div 
          className="text-white text-[16px] font-black uppercase text-center leading-[1.05] w-[50mm] mt-[1mm] mb-[4mm]"
          style={{
            WebkitTextStroke: '1.5px #a01016',
            textShadow: '0px 2px 0px #a01016, 0px 3px 2px rgba(0,0,0,0.3)',
            fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif'
          }}
        >
          {schoolName || 'UPT SDN BUGULKIDUL II'}
        </div>

        {/* Center Star on the wave */}
        <div className="absolute top-[28mm] left-1/2 transform -translate-x-1/2 text-[#ffc800] text-[24px] z-30 filter drop-shadow-[0_2px_1px_rgba(0,0,0,0.2)]">
          ⭐
        </div>
        <div className="absolute top-[29mm] left-[20mm] text-white text-[10px]">✨</div>
        <div className="absolute top-[29mm] right-[20mm] text-white text-[8px]">✨</div>

        {/* Name */}
        <div className="text-[#da2228] font-black text-[10px] uppercase tracking-wide text-center w-[50mm] mt-[10mm] leading-tight truncate">
          {student.name}
        </div>

        {/* NISN */}
        <div className="mt-[1mm] text-[9px] font-black text-gray-900 flex justify-center gap-1">
          <span>NISN:</span>
          <span className="text-[#da2228]">{student.nisn || '-'}</span>
        </div>

        {/* Class Pill */}
        <div className="flex items-center gap-2 mt-[2mm] mb-[2mm]">
          <div className="text-[#ffc800] text-[10px] font-black transform rotate-12">/</div>
          <div className="bg-[#da2228] text-white text-[9px] font-black px-4 py-[2px] rounded-full relative">
             <div className="absolute inset-[1.5px] rounded-full border-[1px] border-dashed border-white opacity-80"></div>
            {student.class_name || student.class ? (student.class_name || student.class).toUpperCase() : 'KELAS 1'}
          </div>
          <div className="text-[#ffc800] text-[10px] font-black transform -rotate-12">\\\\</div>
        </div>

        {/* QR Code */}
        <div className="bg-white p-[1.5mm] rounded-[8px] border-[2px] border-[#da2228] relative z-20 mt-[0mm]">
          <QRCodeSVG value={student.nisn || student.token || '000000'} size={60} level="H" />
        </div>

      </div>

      {/* Background decorations */}
      <div className="absolute top-[44mm] left-[2mm] opacity-30 text-[10px] text-gray-400">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <circle cx="2" cy="2" r="1" fill="currentColor"/>
          <circle cx="5" cy="2" r="1" fill="currentColor"/>
          <circle cx="8" cy="2" r="1" fill="currentColor"/>
          <circle cx="2" cy="5" r="1" fill="currentColor"/>
          <circle cx="5" cy="5" r="1" fill="currentColor"/>
          <circle cx="8" cy="5" r="1" fill="currentColor"/>
        </svg>
      </div>
      <div className="absolute top-[40mm] right-[2mm] opacity-30 text-[12px] text-gray-400">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect x="2" y="2" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1"/>
          <line x1="2" y1="4" x2="10" y2="4" stroke="currentColor" strokeWidth="1"/>
          <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1"/>
        </svg>
      </div>
      <div className="absolute top-[52mm] left-[4mm] text-[#da2228] text-[12px] transform rotate-12">★</div>
      <div className="absolute top-[50mm] right-[4mm] text-[#da2228] text-[10px] transform -rotate-12">♥</div>

      {/* Bottom Floating Icons */}
      <div className="absolute bottom-[20mm] left-[2mm] text-[20px] drop-shadow-md z-30">🔴</div>
      <div className="absolute bottom-[10mm] left-[3mm] text-[24px] drop-shadow-md z-30 transform -rotate-[30deg]">✏️</div>
      <div className="absolute bottom-[24mm] right-[2mm] text-[20px] drop-shadow-md z-30">🟡</div>
      <div className="absolute bottom-[12mm] right-[2mm] text-[22px] drop-shadow-md z-30 transform rotate-12">📕</div>

      {/* Bottom Footer Red Shape */}
      <div className="absolute bottom-0 left-0 w-full h-[12mm] z-10 overflow-hidden">
        <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
           <path d="M0,25 C30,0 70,0 100,25" fill="none" stroke="#ffc800" strokeWidth="3" />
           <path d="M0,25 C30,0 70,0 100,25 L100,100 L0,100 Z" fill="#da2228" />
           <path d="M5,95 L95,95" fill="none" stroke="#ffc800" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
        
        {/* Footer Text */}
        <div className="absolute bottom-[3.5mm] w-full text-center flex justify-center items-center gap-1.5 text-white font-black text-[8px] drop-shadow-md font-sans">
          <span className="text-[#ffc800] text-[8px] transform rotate-12">///</span>
          <span>Belajar</span>
          <span className="text-[#ffc800] text-[5px]">●</span>
          <span>Disiplin</span>
          <span className="text-[#ffc800] text-[5px]">●</span>
          <span>Berprestasi</span>
          <span className="text-[#ffc800] text-[8px] transform -rotate-12">\\\\</span>
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
  console.log('Patched GenerateQR.tsx pixel-perfect match');
} else {
  console.log('Failed to find boundaries');
}
