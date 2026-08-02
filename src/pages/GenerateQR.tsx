import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, Check, Search, FileDown, LayoutGrid, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { cn } from '../lib/utils';

// Reusable component for the physical card size (55mm x 90mm)
const StudentCard = ({ student, cardRef, onSelect, isSelected, selectable }: any) => (
  <div 
    onClick={() => selectable && onSelect && onSelect(student.id)}
    ref={cardRef}
    className={cn(
      "bg-white relative overflow-hidden flex-shrink-0 transition-all",
      selectable ? "cursor-pointer hover:ring-4 hover:ring-primary/20" : "",
      isSelected ? "ring-4 ring-primary shadow-lg shadow-primary/20 scale-[1.02]" : ""
    )}
    style={{ 
      width: '55mm', 
      height: '90mm', 
      boxShadow: isSelected ? 'none' : '0 0 15px rgba(0,0,0,0.1)',
      border: '1px solid #f3f4f6',
      borderRadius: '8px'
    }}
  >
    {selectable && (
      <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full border-2 border-primary bg-white flex items-center justify-center shadow-sm">
        {isSelected && <Check size={14} className="text-primary font-bold" />}
      </div>
    )}
    
    {/* Card Design (Red Elegant Theme) */}
    <div className="h-[25mm] bg-primary rounded-b-[30px] flex flex-col items-center pt-[3mm] relative">
       <div className="text-white text-[10px] font-bold uppercase tracking-wider">UPT SD Negeri</div>
       <div className="text-white text-[8px] opacity-90">Bugulkidul II</div>
       
       {/* Avatar overlap */}
       <div className="absolute -bottom-[6mm] w-[14mm] h-[14mm] bg-white rounded-full p-[2px] shadow-sm">
         <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg border border-gray-200">
            {student.name.charAt(0)}
         </div>
       </div>
    </div>

    <div className="mt-[16mm] px-2 text-center flex flex-col items-center">
      <h3 className="font-bold text-gray-900 leading-tight text-xs max-h-[8mm] overflow-hidden">{student.name}</h3>
      <p className="text-[8px] text-gray-500 mt-0.5">NISN: {student.nisn}</p>
      <div className="inline-block px-2 py-0.5 bg-red-50 text-primary text-[8px] font-bold rounded-full mt-1 border border-red-100">
        Kelas {student.class}
      </div>
    </div>

    <div className="absolute bottom-[9mm] w-full flex justify-center">
      <div className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
        <QRCodeSVG value={student.token} size={65} level="H" />
      </div>
    </div>
    
    <div className="absolute bottom-[2mm] w-full text-center text-[6px] text-gray-400 font-medium">
      Kartu Presensi Elektronik
    </div>
  </div>
);


export default function GenerateQR() {
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewStudents, setPreviewStudents] = useState<any[]>([]);

  const [students, setStudents] = useState<any[]>([]);
  const [activeYearId, setActiveYearId] = useState('');

  useEffect(() => {
    supabase.from('academic_years').select('id').eq('is_active', true).limit(1).then(({data}) => {
      if (data && data.length > 0) {
        setActiveYearId(data[0].id);
      }
    });
    supabase.from('classes').select('*').order('name').then(({data}) => {
      if (data && data.length > 0) {
        const cls = data.map((c: any) => c.name);
        setClasses(cls);
        setSelectedClass(cls[0]);
      } else {
        const cls = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];
        setClasses(cls);
        setSelectedClass(cls[0]);
      }
    });
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('*').order('name');
    if (data) setStudents(data);
  };

  const filteredStudents = students.filter(s => {
    const matchesClass = (s.class_name || s.class) === selectedClass;
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = activeYearId ? s.academic_year === activeYearId : true;
    return matchesClass && matchesSearch && matchesYear;
  });

  const cardRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  const downloadCardPDF = async (studentId: string, studentName: string) => {
    const cardElement = cardRefs.current[studentId];
    if (!cardElement) return;

    try {
      const canvas = await html2canvas(cardElement, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [55, 90]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 55, 90);
      pdf.save(`Kartu_QR_${studentName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Error generating PDF", error);
    }
  };

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      if (selectedIds.length >= 9) {
        alert("Maksimal 9 murid untuk satu kali pemilihan (satu lembar A4).");
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleOpenPrintPreview = (all: boolean) => {
    if (all) {
      setPreviewStudents(filteredStudents);
    } else {
      if (selectedIds.length === 0) return;
      setPreviewStudents(students.filter(s => selectedIds.includes(s.id)));
    }
    setShowPrintPreview(true);
  };

  // Pagination for A4 printing
  const printPages = [];
  for (let i = 0; i < previewStudents.length; i += 9) {
    printPages.push(previewStudents.slice(i, i + 9));
  }

  return (
    <>
      <div className={cn("space-y-6 max-w-5xl mx-auto", showPrintPreview ? "hidden" : "block")}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kartu QR Murid</h1>
            <p className="text-gray-500 text-sm mt-1">Generate dan cetak kartu identitas presensi</p>
          </div>
          <div className="flex gap-2">
            {isPrintMode ? (
              <>
                <button 
                  onClick={() => setIsPrintMode(false)}
                  className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={() => handleOpenPrintPreview(false)}
                  disabled={selectedIds.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl shadow-md text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  <Printer size={16} /> Cetak Terpilih ({selectedIds.length}/9)
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setIsPrintMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LayoutGrid size={16} /> Mode Pilih
                </button>
                <button 
                  onClick={() => handleOpenPrintPreview(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white border border-primary-dark rounded-xl shadow-md text-sm font-bold hover:bg-primary-dark transition-colors animate-shimmer"
                >
                  <Printer size={16} /> Cetak Semua ({filteredStudents.length})
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari nama murid..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm font-medium min-w-[150px]"
          >
            <option value="6A">Kelas 6A</option>
            <option value="6B">Kelas 6B</option>
            <option value="5A">Kelas 5A</option>
          </select>
        </div>

        {isPrintMode && (
          <div className="bg-blue-50 text-blue-800 p-3 rounded-xl text-sm flex gap-2 items-center font-medium border border-blue-100">
            <Check size={18} /> Silakan klik kartu murid yang ingin dicetak (maksimal 9 kartu untuk 1 lembar A4).
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white p-3 md:p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
              
              <div className="w-full flex justify-center py-2 relative">
                {/* Visual Representation in UI, scaled down slightly if needed, but exact mm dimensions are used inside */}
                <div className="scale-[0.8] md:scale-[0.9] origin-top h-[75mm]">
                  <StudentCard 
                    student={student} 
                    cardRef={(el: any) => cardRefs.current[student.id] = el}
                    selectable={isPrintMode}
                    isSelected={selectedIds.includes(student.id)}
                    onSelect={toggleSelection}
                  />
                </div>
              </div>

              {!isPrintMode && (
                <div className="flex gap-2 w-full mt-2">
                  <button 
                    onClick={() => downloadCardPDF(student.id, student.name)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 hover:bg-primary hover:text-white text-gray-700 text-sm font-bold rounded-xl transition-colors"
                  >
                    <FileDown size={16} /> PDF
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Print Preview Overlay Container */}
      {showPrintPreview && (
        <div className="fixed inset-0 z-50 bg-gray-900/80 overflow-y-auto backdrop-blur-sm print:static print:bg-white print:overflow-visible">
          <div className="sticky top-0 bg-white shadow-md px-6 py-4 flex justify-between items-center no-print z-50">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Preview Cetak (A4)</h2>
              <p className="text-sm text-gray-500">Mencetak {previewStudents.length} kartu murid ke {printPages.length} halaman A4.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowPrintPreview(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200"
              >
                Tutup Preview
              </button>
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-primary text-white font-bold rounded-xl animate-shimmer shadow-lg shadow-primary/30 flex items-center gap-2"
              >
                <Printer size={18} /> Cetak Sekarang
              </button>
            </div>
          </div>
          
          <div className="py-8 print:py-0">
            {printPages.map((pageStudents, pageIdx) => (
              <div 
                key={pageIdx} 
                className="a4-page bg-white shadow-2xl relative"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 55mm)',
                  gridTemplateRows: 'repeat(3, 90mm)',
                  justifyContent: 'space-between',
                  alignContent: 'space-between'
                }}
              >
                 {pageStudents.map(student => (
                   <StudentCard key={student.id} student={student} />
                 ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
