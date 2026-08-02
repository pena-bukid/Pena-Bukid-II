const fs = require('fs');
let code = fs.readFileSync('src/pages/GenerateQR.tsx', 'utf8');

const newStudentCard = `const StudentCard = ({ student, cardRef, onSelect, isSelected, selectable, schoolName }: any) => {
  const gender = student.gender || 'L';
  const seed = student.name.replace(/\\s+/g, '');
  
  // High-quality illustration avatars
  const avatarUrl = gender === 'P' 
    ? \`https://api.dicebear.com/7.x/notionists/svg?seed=\${seed}&hair=long&clothing=shirt&backgroundColor=ffdfbf\`
    : \`https://api.dicebear.com/7.x/notionists/svg?seed=\${seed}&hair=short&clothing=shirt&backgroundColor=ffdfbf\`;

  return (
    <div 
      onClick={() => selectable && onSelect && onSelect(student.id)}
      ref={cardRef}
      className={cn(
        "relative overflow-hidden flex-shrink-0 transition-all font-sans bg-white",
        selectable ? "cursor-pointer hover:ring-4 hover:ring-primary/20" : "",
        isSelected ? "ring-4 ring-primary shadow-lg shadow-primary/20 scale-[1.02]" : ""
      )}
      style={{ 
         width: '55mm', 
         height: '85mm', 
         boxShadow: isSelected ? 'none' : '0 0 15px rgba(0,0,0,0.1)',
         borderRadius: '12px',
         border: '4px solid #dc2626',
         backgroundColor: '#fffdf5',
      }}
    >
      {selectable && (
        <div className="absolute top-2 right-2 z-50 w-6 h-6 rounded-full border-2 border-primary bg-white flex items-center justify-center shadow-sm">
          {isSelected && <Check size={14} className="text-primary font-bold" />}
        </div>
      )}

      {/* Top Red Shape */}
      <div className="absolute top-0 left-0 w-full h-[28mm] bg-[#dc2626] rounded-b-[15mm] border-b-[3px] border-[#fcd34d] z-0"></div>
      
      {/* Top Decorations */}
      <div className="absolute top-[2mm] left-[3mm] text-[12px] opacity-90 transform -rotate-12">⭐</div>
      <div className="absolute top-[5mm] left-[10mm] text-[10px] text-white opacity-80 font-black">♡</div>
      <div className="absolute top-[2mm] right-[4mm] text-[14px] opacity-90 transform rotate-12">✈️</div>

      {/* Middle Background faint patterns */}
      <div className="absolute top-[35mm] left-[3mm] text-[16px] opacity-10">✏️</div>
      <div className="absolute top-[45mm] right-[3mm] text-[16px] opacity-10">📖</div>

      {/* Bottom Red Shape */}
      <div className="absolute bottom-0 left-0 w-full h-[12mm] bg-[#dc2626] rounded-t-[10mm] border-t-[2.5px] border-[#fcd34d] z-0"></div>
      
      {/* Content Container */}
      <div className="relative z-20 w-full h-full flex flex-col items-center pt-[2mm]">
        
        {/* Ribbon KARTU PRESENSI */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[#fcd34d] text-[6px] transform rotate-12">■</span>
          <div className="bg-transparent text-white text-[8px] font-black tracking-widest uppercase">
            KARTU PRESENSI
          </div>
          <span className="text-[#fcd34d] text-[6px] transform -rotate-12">■</span>
        </div>

        {/* School Name (Bubble text style simulation) */}
        <div className="text-white text-[12px] font-black uppercase text-center leading-[1] w-[48mm] drop-shadow-[0_2px_1px_rgba(153,27,27,1)] mt-[1mm] mb-[1mm]">
          {schoolName || 'UPT SDN BUGULKIDUL II'}
        </div>

        {/* Avatar */}
        <div className="w-[16mm] h-[16mm] bg-white rounded-full flex justify-center items-center border-[2.5px] border-[#fcd34d] shadow-md p-[1px] mt-[1mm] z-10 relative">
          <div className="w-full h-full bg-[#ffdfbf] rounded-full overflow-hidden flex items-center justify-center">
            <img src={avatarUrl} alt="Avatar" className="w-[120%] h-[120%] object-cover object-top" />
          </div>
        </div>

        {/* Name */}
        <div className="text-[#dc2626] font-black text-[9px] uppercase tracking-wide text-center w-[48mm] mt-[2mm] drop-shadow-sm leading-tight truncate">
          {student.name}
        </div>

        {/* NISN */}
        <div className="mt-[1mm] text-[8px] font-black text-gray-900">
          NISN: <span className="text-[#dc2626]">{student.nisn || '-'}</span>
        </div>

        {/* Class Pill */}
        <div className="flex items-center gap-1 mt-[1.5mm] mb-[2mm]">
          <div className="text-[#fcd34d] text-[8px] font-black transform rotate-12">/</div>
          <div className="bg-[#dc2626] border-[1.5px] border-[#dc2626] text-white text-[8px] font-black px-4 py-0.5 rounded-full shadow-sm mx-1 outline outline-[1.5px] outline-dashed outline-white outline-offset-[-2px]">
            {student.class_name || student.class ? (student.class_name || student.class).toUpperCase() : 'KELAS 1'}
          </div>
          <div className="text-[#fcd34d] text-[8px] font-black transform -rotate-12">\\</div>
        </div>

        {/* QR Code */}
        <div className="bg-white p-[1.5mm] rounded-[8px] border-[2.5px] border-[#dc2626] shadow-sm relative z-20 mt-[-1mm]">
          <QRCodeSVG value={student.nisn || student.token || '000000'} size={60} level="H" />
        </div>

        {/* Bottom Absolute Decorations */}
        <div className="absolute bottom-[9mm] left-[2mm] text-[20px] drop-shadow-md z-30 transform -rotate-12">✏️</div>
        <div className="absolute bottom-[16mm] left-[1mm] text-[16px] drop-shadow-md z-30 transform -rotate-12">🔴</div>
        <div className="absolute bottom-[14mm] right-[1mm] text-[16px] drop-shadow-md z-30 transform rotate-12">🟡</div>
        <div className="absolute bottom-[7mm] right-[3mm] text-[20px] drop-shadow-md z-30 transform rotate-12">📖</div>

      </div>

      {/* Footer Text */}
      <div className="absolute bottom-[2mm] w-full text-center z-40 flex justify-center items-center gap-2 text-white font-black text-[7px] drop-shadow-md">
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
