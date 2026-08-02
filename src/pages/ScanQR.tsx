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
          // Handle successful scan
          if (scannerRef.current) {
            scannerRef.current.pause(true); // Pause scanning while processing
          }
          
          if (navigator.vibrate) navigator.vibrate(200);
          playSuccessSound();

          // Find student by token
          const { data: student } = await supabase.from('students').select('*').eq('token', decodedText).single();
          
          if (student) {
            const today = new Date().toISOString().split('T')[0];
            const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
            
            // Note: In real app, calculate status based on rules. Hardcoded to Hadir for demo.
            await supabase.from('attendance').insert([{
              student_id: student.id,
              date: today,
              time_in: time,
              status: 'Hadir'
            }]);

            setScanResult({
              success: true,
              studentName: student.name,
              className: student.class_name,
              time: time,
              message: 'Presensi berhasil dicatat.'
            });
          } else {
            setScanResult({
              success: false,
              message: 'QR Code tidak valid atau murid tidak ditemukan.'
            });
          }

          // Auto resume after 3 seconds
          setTimeout(() => {
            setScanResult(null);
            if (scannerRef.current && scannerRef.current.getState() === 2) { // 2 = PAUSED
              scannerRef.current.resume();
            }
          }, 3000);
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
    </div>
  );
}
