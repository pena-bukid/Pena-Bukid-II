import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Camera, QrCode } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ScanQR() {
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    studentName?: string;
    className?: string;
    time?: string;
    message: string;
  } | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  const [scannerName, setScannerName] = useState('Admin');
  const [recentScans, setRecentScans] = useState<any[]>([]);

  useEffect(() => {
    const ts = localStorage.getItem('teacher_session');
    if (ts) {
      const teacher = JSON.parse(ts);
      if (teacher.name) {
        setScannerName(teacher.name);
      }
    }
  }, []);

  // Sound effects
  const playSuccessSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
      audio.volume = 0.5;
      audio.play();
    } catch (e) {
      // Ignore if autoplay blocked
    }
  };

  const startScanner = async () => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("reader");
    }

    try {
      setIsScanning(true);
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          if (isProcessingRef.current) return;
          isProcessingRef.current = true;
          
          // Handle successful scan
          // (We removed pausing so the camera keeps visually running, we just ignore scans while processing)

          
          if (navigator.vibrate) navigator.vibrate(200);
          playSuccessSound();

          // Find student by token
          // Search by nisn (or token fallback)
                    let student = null;
          try {
            const { data: studentByNisn } = await supabase.from('students').select('*').eq('nisn', decodedText).maybeSingle();
            if (studentByNisn) {
              student = studentByNisn;
            } else {
              const { data: studentByToken } = await supabase.from('students').select('*').eq('token', decodedText).maybeSingle();
              student = studentByToken;
            }
          } catch(e) {
            console.error(e);
          }
          
          if (student) {
            const now = new Date();
            
            // Format local date YYYY-MM-DD
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const today = `${year}-${month}-${day}`;
            
            const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                        try {
              const timeSettingsStr = localStorage.getItem('time_settings');
              const timeSettings = timeSettingsStr ? JSON.parse(timeSettingsStr) : {
                jamMasuk: '07:00',
                jamPulang: '12:00',
                jamPulangConfigs: [],
                toleransiKeterlambatan: 15
              };

              const scanTimeMins = now.getHours() * 60 + now.getMinutes();
              const [inH, inM] = (timeSettings.jamMasuk || '07:00').split(':').map(Number);
              
              // Determine jamPulang for this student's class
              let jamPulang = timeSettings.jamPulang || '12:00';
              if (timeSettings.jamPulangConfigs && timeSettings.jamPulangConfigs.length > 0) {
                const config = timeSettings.jamPulangConfigs.find((c: any) => c.classes.includes(student.class_name));
                if (config) {
                  jamPulang = config.time;
                }
              }

              const [outH, outM] = jamPulang.split(':').map(Number);
              const masukMins = inH * 60 + inM;
              const pulangMins = outH * 60 + outM;

              const midpoint = (masukMins + pulangMins) / 2;
              const isPulang = scanTimeMins >= midpoint;

              // Determine status for entry scan
              const isLate = scanTimeMins > masukMins + (timeSettings.toleransiKeterlambatan || 0);
              const status = isLate ? 'Terlambat' : 'Hadir';
              
              const notesValue = `Discan oleh: ${scannerName}`;

              // Check if already scanned today
              const { data: existingAttendance, error: selectError } = await supabase
                .from('attendance')
                .select('*')
                .eq('student_id', student.id)
                .eq('date', today)
                .maybeSingle();
                
              if (selectError) console.error("Select error:", selectError);

              let message = 'Presensi berhasil dicatat.';
              let hasError = false;

              if (existingAttendance) {
                if (isPulang) {
                  // Update time_out for exit scan
                  const { error: updateError } = await supabase
                    .from('attendance')
                    .update({ time_out: time, notes: notesValue })
                    .eq('id', existingAttendance.id);
                    
                  if (updateError) {
                    console.error("Update error:", updateError);
                    hasError = true;
                  } else {
                    message = 'Waktu pulang dicatat.';
                  }
                } else {
                  // It's still entry time, maybe updating the time_in or just ignoring?
                  // We can just update time_in and status
                  const { error: updateError } = await supabase
                    .from('attendance')
                    .update({ time_in: time, status: status, notes: notesValue })
                    .eq('id', existingAttendance.id);
                  if (updateError) {
                    console.error("Update error:", updateError);
                    hasError = true;
                  } else {
                    message = `Waktu masuk diperbarui (${status}).`;
                  }
                }
              } else {
                if (isPulang) {
                  // First scan of the day, but it's already exit time
                  const { error: insertError } = await supabase.from('attendance').insert([{
                    student_id: student.id,
                    date: today,
                    time_out: time,
                    status: 'Hadir', // They might be present but forgot to scan in
                    notes: notesValue
                  }]);
                  
                  if (insertError) {
                    console.error("Insert error:", insertError);
                    hasError = true;
                  } else {
                    message = 'Waktu pulang dicatat (Tanpa scan masuk).';
                  }
                } else {
                  // Normal entry scan
                  const { error: insertError } = await supabase.from('attendance').insert([{
                    student_id: student.id,
                    date: today,
                    time_in: time,
                    status: status,
                    notes: notesValue
                  }]);
                  
                  if (insertError) {
                    console.error("Insert error:", insertError);
                    hasError = true;
                  } else {
                    message = `Waktu masuk dicatat (${status}).`;
                  }
                }
              }

              if (hasError) {
                setScanResult({
                  success: false,
                  message: 'Gagal menyimpan data ke database.'
                });
              } else {
                setScanResult({
                  success: true,
                  studentName: student.name,
                  className: student.class_name,
                  time: time,
                  message: message
                });
                
                // Add to recent scans
                setRecentScans(prev => {
                  const newScans = [{
                    id: Date.now().toString(),
                    studentName: student.name,
                    className: student.class_name,
                    time: time,
                    status: isPulang ? 'Pulang' : status
                  }, ...prev];
                  return newScans.slice(0, 10); // Keep last 10
                });
              }
            } catch (dbError) {
              console.error("DB Operation failed:", dbError);
              setScanResult({
                success: false,
                message: 'Gagal menyimpan data ke database.'
              });
            }
          } else {
            setScanResult({
              success: false,
              message: 'QR Code tidak valid atau murid tidak ditemukan.'
            });
          }

          // Auto resume after 3 seconds
          setTimeout(() => {
            setScanResult(null);
            isProcessingRef.current = false;
          }, 1500);
        },
        (errorMessage) => {
          // Ignore general scan errors (happens every frame when no QR is in view)
        }
      );
    } catch (err) {
      console.error(err);
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Scan QR Presensi</h1>
        <p className="text-gray-500 text-sm mt-1">Arahkan kamera ke kartu QR murid</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Camera size={20} /> Kamera Aktif
          </div>
          <div className="flex gap-2">
            {!isScanning ? (
              <button 
                onClick={startScanner}
                className="px-4 py-1.5 bg-primary text-white text-sm font-bold rounded-full shadow-md"
              >
                Mulai Scan
              </button>
            ) : (
              <button 
                onClick={stopScanner}
                className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm font-bold rounded-full"
              >
                Stop
              </button>
            )}
          </div>
        </div>
        
        {/* Scanner Container */}
        <div className="relative aspect-square bg-black overflow-hidden flex items-center justify-center">
          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white bg-black/80">
              <QrCode size={48} className="mb-4 opacity-50" />
              <p className="font-medium">Kamera dimatikan</p>
            </div>
          )}
          <div id="reader" className="w-full h-full" style={{ border: 'none' }}></div>
          
          {/* Overlay Result */}
          <AnimatePresence>
            {scanResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                className="absolute inset-4 z-20 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-4 border-green-500 p-6 text-center"
              >
                {scanResult.success ? (
                  <CheckCircle2 size={64} className="text-green-500 mb-4" />
                ) : (
                  <XCircle size={64} className="text-red-500 mb-4" />
                )}
                
                <h3 className="text-2xl font-bold text-gray-900">{scanResult.studentName}</h3>
                <p className="text-gray-500 font-medium">{scanResult.className}</p>
                
                <div className="mt-4 inline-block bg-green-100 text-green-800 px-4 py-2 rounded-xl font-bold text-lg">
                  {scanResult.time} - Hadir
                </div>
                
                <p className="text-sm text-gray-500 mt-4">{scanResult.message}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="bg-blue-50 text-blue-800 p-4 rounded-2xl text-sm flex gap-3">
        <div className="shrink-0 mt-0.5">ℹ️</div>
        <p>Pastikan pencahayaan cukup. Kamera akan otomatis mendeteksi QR Code dan mencatat presensi seketika.</p>
      </div>

      {recentScans.length > 0 && (
        <div className="mt-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
            <span>Riwayat Scan ({scannerName})</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{recentScans.length} terbaru</span>
          </h3>
          <div className="space-y-3">
            {recentScans.map((scan) => (
              <div key={scan.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <div className="font-bold text-sm text-gray-900">{scan.studentName}</div>
                  <div className="text-xs text-gray-500">{scan.className}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-gray-900">{scan.time}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    scan.status === 'Hadir' ? 'bg-green-100 text-green-700' : 
                    scan.status === 'Pulang' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {scan.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
