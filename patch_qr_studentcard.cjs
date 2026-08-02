const fs = require('fs');
let code = fs.readFileSync('src/pages/GenerateQR.tsx', 'utf8');

const newStudentCard = `const StudentCard = ({ student, cardRef, onSelect, isSelected, selectable, schoolName }: any) => {
  const gender = student.gender || 'L';
  const seed = student.name.replace(/\\s+/g, '');
  const avatarUrl = gender === 'P' 
    ? \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${seed}&hair=longHairStraight,longHairCurvy&clothing=shirtCrewNeck&clothingColor=white&backgroundColor=dc2626\`
    : \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${seed}&hair=shortHairShortFlat,shortHairShortRound&clothing=shirtCrewNeck&clothingColor=white&backgroundColor=dc2626\`;

  return (
    <div 
      onClick={() => selectable && onSelect && onSelect(student.id)}
      ref={cardRef}
      className={cn(
        "relative overflow-hidden flex-shrink-0 transition-all font-sans",
        selectable ? "cursor-pointer hover:ring-4 hover:ring-primary/20" : "",
        isSelected ? "ring-4 ring-primary shadow-lg shadow-primary/20 scale-[1.02]" : ""
      )}
      style={{ 
         width: '55mm', 
         height: '85mm', 
         boxShadow: isSelected ? 'none' : '0 0 15px rgba(0,0,0,0.1)',
         backgroundColor: '#fffcf2',
         borderRadius: '12px',
         border: '4px solid #dc2626',
      }}
    >
      {/* Inner gold border */}
      <div className="absolute inset-1 border-[1.5px] border-[#d4af37] rounded-[8px] pointer-events-none" />

      {selectable && (
        <div className="absolute top-2 right-2 z-50 w-6 h-6 rounded-full border-2 border-primary bg-white flex items-center justify-center shadow-sm">
          {isSelected && <Check size={14} className="text-primary font-bold" />}
        </div>
      )}
      
      {/* Top Red Shape */}
      <svg className="absolute top-0 left-0 w-full" viewBox="0 0 100 30" preserveAspectRatio="none" style={{ height: '20mm' }}>
        <path d="M0,0 L100,0 L100,10 C80,25 20,25 0,10 Z" fill="#dc2626" />
        <path d="M0,8 C20,23 80,23 100,8 L100,10 C80,25 20,25 0,10 Z" fill="#d4af37" />
      </svg>

      {/* Bottom Red Shape */}
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 100 30" preserveAspectRatio="none" style={{ height: '20mm' }}>
        <path d="M0,30 L100,30 L100,15 C80,5 20,5 0,15 Z" fill="#dc2626" />
        <path d="M0,17 C20,7 80,7 100,17 L100,15 C80,5 20,5 0,15 Z" fill="#d4af37" />
      </svg>

      {/* Background patterns / decorations */}
      <div className="absolute top-[25mm] left-[5mm] text-[8px] opacity-20 transform -rotate-12">ABC</div>
      <div className="absolute top-[20mm] right-[8mm] text-[12px] opacity-80">✈️</div>
      <div className="absolute top-[55mm] left-[3mm] text-[16px] opacity-90">📚</div>
      <div className="absolute top-[60mm] right-[3mm] text-[18px] opacity-90">🎒</div>
      <div className="absolute top-[10mm] left-[8mm] text-[#d4af37] text-[10px]">⭐</div>
      <div className="absolute top-[15mm] right-[4mm] text-[#dc2626] text-[8px]">⭐</div>
      <div className="absolute top-[50mm] right-[8mm] text-[#dc2626] text-[12px]">⭐</div>

      <div className="relative z-10 w-full h-full flex flex-col items-center pt-[3mm]">
        {/* Ribbon KARTU PRESENSI */}
        <div className="relative flex justify-center items-center mb-1">
          <div className="absolute w-[35mm] h-[6mm] bg-[#991b1b] transform translate-y-[1mm] -z-10" style={{ clipPath: 'polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%)' }} />
          <div className="bg-[#dc2626] text-white text-[7px] font-black tracking-widest uppercase px-3 py-1 rounded-sm shadow-sm border-b-2 border-[#991b1b]">
            KARTU PRESENSI
          </div>
        </div>

        {/* School Name */}
        <div className="text-[#dc2626] text-[11px] font-black uppercase text-center leading-[1.1] w-[45mm] mt-1 mb-1" style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.8)' }}>
          {schoolName || 'UPT SDN BUGULKIDUL II'}
        </div>

        {/* Avatar */}
        <div className="w-[18mm] h-[18mm] bg-[#dc2626] rounded-full flex justify-center items-center border-[1.5px] border-[#d4af37] shadow-md p-[1px] z-10">
          <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover bg-white" />
        </div>

        {/* Name Pill */}
        <div className="bg-[#dc2626] border-[1.5px] border-[#d4af37] rounded-full px-3 py-1 mt-[-3mm] z-20 shadow-md max-w-[48mm] flex items-center justify-center gap-1">
          <span className="text-[#d4af37] text-[7px]">⭐</span>
          <h3 className="font-bold text-white text-[8px] uppercase tracking-wide truncate max-w-[36mm]">
            {student.name}
          </h3>
          <span className="text-[#d4af37] text-[7px]">⭐</span>
        </div>

        {/* NISN */}
        <div className="mt-[1mm] text-[8px] font-bold text-gray-800">
          <span className="text-[#dc2626]">NISN:</span> {student.nisn || '-'}
        </div>

        {/* Class Pill */}
        <div className="flex items-center gap-1 mt-[1mm] mb-[1.5mm]">
          <div className="text-[#dc2626] text-[6px] font-black transform rotate-12">///</div>
          <div className="bg-[#fcd34d] border border-[#d4af37] text-[#991b1b] text-[7px] font-black px-3 py-0.5 rounded-full shadow-sm">
            {student.class_name || student.class ? (student.class_name || student.class).toUpperCase() : 'KELAS 1'}
          </div>
          <div className="text-[#dc2626] text-[6px] font-black transform -rotate-12">\\\\</div>
        </div>

        {/* QR Code */}
        <div className="bg-white p-[1.5mm] rounded-[8px] border-2 border-[#dc2626] shadow-[0_4px_10px_rgba(220,38,38,0.2)]">
          <QRCodeSVG value={student.nisn || student.token || '000000'} size={75} level="H" />
        </div>

      </div>

      {/* Footer Text */}
      <div className="absolute bottom-[2mm] w-full text-center z-10 flex justify-center items-center gap-1.5 text-white font-bold text-[7px] drop-shadow-md">
        <span>⭐ Belajar</span>
        <span>⭐ Disiplin</span>
        <span>⭐ Berprestasi</span>
      </div>
    </div>
  );
};`;

const startIndex = code.indexOf('const StudentCard');
const endIndex = code.indexOf('export default function GenerateQR()');

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + newStudentCard + '\n\n' + code.substring(endIndex);
  fs.writeFileSync('src/pages/GenerateQR.tsx', code);
  console.log('Patched GenerateQR.tsx successfully');
} else {
  console.log('Failed to find boundaries');
}
