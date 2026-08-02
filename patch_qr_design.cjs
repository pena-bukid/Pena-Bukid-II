const fs = require('fs');
let code = fs.readFileSync('src/pages/GenerateQR.tsx', 'utf8');

const newStudentCard = `const StudentCard = ({ student, cardRef, onSelect, isSelected, selectable, schoolName }: any) => {
  const gender = student.gender || 'L';
  
  // Use generic high quality placeholders for boy/girl to simulate the requested photo
  // Using a stylized illustration url or UI avatars
  const seed = student.name.replace(/\\s+/g, '');
  const avatarUrl = gender === 'P' 
    ? \`https://api.dicebear.com/7.x/notionists/svg?seed=\${seed}&hair=long&clothing=shirt&backgroundColor=ffdfbf\`
    : \`https://api.dicebear.com/7.x/notionists/svg?seed=\${seed}&hair=short&clothing=shirt&backgroundColor=ffdfbf\`;

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
         backgroundColor: '#fffdf5',
         borderRadius: '12px',
         border: '4px solid #dc2626', // Outer red border
      }}
    >
      {/* Inner gold border */}
      <div className="absolute inset-1 border-2 border-[#d4af37] rounded-[8px] pointer-events-none z-10" />

      {selectable && (
        <div className="absolute top-2 right-2 z-50 w-6 h-6 rounded-full border-2 border-primary bg-white flex items-center justify-center shadow-sm">
          {isSelected && <Check size={14} className="text-primary font-bold" />}
        </div>
      )}
      
      {/* Top Red Shape with Gold Border */}
      <svg className="absolute top-0 left-0 w-full" viewBox="0 0 100 25" preserveAspectRatio="none" style={{ height: '16mm' }}>
        <path d="M0,0 L100,0 L100,15 C75,25 25,25 0,15 Z" fill="#dc2626" />
        <path d="M0,15 C25,25 75,25 100,15 L100,17 C75,27 25,27 0,17 Z" fill="#d4af37" />
      </svg>

      {/* Top Stars & Decorations */}
      <div className="absolute top-[2mm] left-[4mm] text-[#fcd34d] text-[10px]">⭐</div>
      <div className="absolute top-[8mm] left-[10mm] text-[#fcd34d] text-[6px]">✨</div>
      <div className="absolute top-[4mm] right-[6mm] text-[#fcd34d] text-[10px]">⭐</div>

      {/* Background patterns / decorations */}
      <div className="absolute top-[35mm] left-[4mm] text-[12px] opacity-20 transform -rotate-12">ABC</div>
      <div className="absolute top-[25mm] right-[5mm] text-[12px] opacity-20">✏️</div>
      <div className="absolute top-[45mm] right-[3mm] text-[10px] opacity-20">🚀</div>
      
      {/* Bottom Red Shape with Gold Border */}
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 100 25" preserveAspectRatio="none" style={{ height: '18mm' }}>
        <path d="M0,25 L100,25 L100,10 C75,0 25,0 0,10 Z" fill="#dc2626" />
        <path d="M0,10 C25,0 75,0 100,10 L100,8 C75,-2 25,-2 0,8 Z" fill="#d4af37" />
      </svg>

      <div className="relative z-20 w-full h-full flex flex-col items-center pt-[2mm]">
        {/* Ribbon KARTU PRESENSI */}
        <div className="relative flex justify-center items-center mb-1">
          <div className="absolute w-[35mm] h-[5mm] bg-[#991b1b] transform translate-y-[0.5mm] -z-10" style={{ clipPath: 'polygon(5% 0, 95% 0, 100% 50%, 95% 100%, 5% 100%, 0 50%)' }} />
          <div className="bg-[#dc2626] text-white text-[7px] font-black tracking-widest uppercase px-3 py-1 rounded-sm shadow-sm border-b-2 border-[#991b1b]">
            KARTU PRESENSI
          </div>
        </div>

        {/* School Name */}
        <div className="text-[#dc2626] text-[11px] font-black uppercase text-center leading-[1.1] w-[45mm] mt-[2mm] mb-[2mm] drop-shadow-sm">
          {schoolName || 'UPT SDN BUGULKIDUL II'}
        </div>

        {/* Avatar */}
        <div className="w-[18mm] h-[18mm] bg-[#dc2626] rounded-full flex justify-center items-center border-2 border-[#d4af37] shadow-md p-[2px] z-10 relative">
          <div className="w-full h-full bg-white rounded-full overflow-hidden">
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Name Pill */}
        <div className="bg-[#dc2626] border-2 border-[#d4af37] rounded-full px-3 py-1 mt-[-3mm] z-20 shadow-md w-[48mm] flex items-center justify-center gap-1">
          <span className="text-[#fcd34d] text-[8px]">⭐</span>
          <h3 className="font-bold text-white text-[8px] uppercase tracking-wide truncate text-center flex-1">
            {student.name}
          </h3>
          <span className="text-[#fcd34d] text-[8px]">⭐</span>
        </div>

        {/* NISN */}
        <div className="mt-[2mm] text-[8px] font-bold text-gray-800">
          <span className="text-[#dc2626]">NISN:</span> {student.nisn || '-'}
        </div>

        {/* Class Pill */}
        <div className="flex items-center gap-1 mt-[1.5mm] mb-[2mm]">
          <div className="text-[#dc2626] text-[8px] font-black transform rotate-12">/</div>
          <div className="text-[#dc2626] text-[8px] font-black transform rotate-12">/</div>
          <div className="bg-[#fcd34d] border-[1.5px] border-[#d4af37] text-[#dc2626] text-[8px] font-black px-4 py-0.5 rounded-full shadow-sm mx-1">
            {student.class_name || student.class ? (student.class_name || student.class).toUpperCase() : 'KELAS 1'}
          </div>
          <div className="text-[#dc2626] text-[8px] font-black transform -rotate-12">\\</div>
          <div className="text-[#dc2626] text-[8px] font-black transform -rotate-12">\\</div>
        </div>

        {/* QR Code */}
        <div className="bg-white p-[1.5mm] rounded-[10px] border-[2.5px] border-[#dc2626] shadow-sm relative z-20">
          <QRCodeSVG value={student.nisn || student.token || '000000'} size={65} level="H" />
        </div>

        {/* Bottom Absolute Decorations */}
        <div className="absolute bottom-[8mm] left-[1mm] text-[20px] drop-shadow-md z-30 transform -rotate-12">📚</div>
        <div className="absolute bottom-[10mm] left-[8mm] text-[14px] drop-shadow-md z-30 transform -rotate-45">🖍️</div>
        <div className="absolute bottom-[6mm] right-[1mm] text-[24px] drop-shadow-md z-30 transform rotate-12">🎒</div>
        <div className="absolute bottom-[18mm] right-[2mm] text-[#dc2626] text-[12px] drop-shadow-sm">⭐</div>

      </div>

      {/* Footer Text */}
      <div className="absolute bottom-[2mm] w-full text-center z-40 flex justify-center items-center gap-2 text-white font-bold text-[8px] drop-shadow-md">
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
