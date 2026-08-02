import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, FileDown, Search } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement
);

import { supabase } from '../lib/supabase';
import React, { useState, useEffect } from 'react';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [selectedMonth, setSelectedMonth] = useState('08');
  const [selectedYear, setSelectedYear] = useState('2023');

  const [student, setStudent] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    const { data: studentData } = await supabase.from('students').select('*').eq('id', id).single();
    if (studentData) setStudent(studentData);

    const { data: attendanceData } = await supabase.from('attendance').select('*').eq('student_id', id).order('date', { ascending: false });
    if (attendanceData) setHistory(attendanceData);
  };

  if (!student) return <div className="p-8 text-center text-gray-500">Memuat data murid...</div>;

  // Mock Chart Data
  const attendanceStats = {
    labels: ['Hadir', 'Sakit', 'Izin', 'Alfa', 'Terlambat'],
    datasets: [
      {
        data: [20, 1, 0, 0, 1],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // Green
          'rgba(249, 115, 22, 0.8)', // Orange
          'rgba(59, 130, 246, 0.8)', // Blue
          'rgba(239, 68, 68, 0.8)', // Red
          'rgba(234, 179, 8, 0.8)', // Yellow
        ],
        borderWidth: 0,
      },
    ],
  };

  const monthlyTrendData = {
    labels: ['Mg 1', 'Mg 2', 'Mg 3', 'Mg 4'],
    datasets: [
      {
        label: 'Hadir',
        data: [5, 4, 5, 6], // example data
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Sakit/Izin/Alfa',
        data: [0, 1, 0, 0], // example data
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      }
    ],
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/students')}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Murid</h1>
            <p className="text-gray-500 text-sm mt-1">Profil dan riwayat kehadiran</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white border border-primary-dark rounded-xl shadow-md text-sm font-bold hover:bg-primary-dark transition-colors animate-shimmer">
            <FileDown size={16} /> Export Laporan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-1"
        >
          <div className="h-24 bg-primary relative">
            <div className="absolute -bottom-10 left-6 w-20 h-20 bg-white rounded-2xl p-1 shadow-md">
              <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 font-bold text-2xl border border-gray-200">
                {student.name.charAt(0)}
              </div>
            </div>
          </div>
          <div className="pt-14 p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">{student.name}</h2>
              <p className="text-sm text-gray-500 mt-1">NISN: {student.nisn} | NIS: {student.nis}</p>
            </div>
            
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                Kelas {student.class_name}
              </span>
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">
                {student.status}
              </span>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-3 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs font-medium">Jenis Kelamin</span>
                <span className="text-gray-900 font-medium">{student.gender}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs font-medium">Nama Wali</span>
                <span className="text-gray-900 font-medium">{student.parent_name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs font-medium">No. HP Wali</span>
                <span className="text-gray-900 font-medium">{student.parent_phone}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs font-medium">Alamat</span>
                <span className="text-gray-900 font-medium leading-relaxed">{student.address}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Analytics & History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden"
            >
              <h3 className="font-bold text-gray-900 text-sm mb-4 self-start w-full">Persentase Kehadiran</h3>
              <div className="h-[180px] w-full flex justify-center relative">
                <Doughnut 
                  data={attendanceStats} 
                  options={{ 
                    cutout: '75%',
                    plugins: { legend: { position: 'right', labels: { boxWidth: 10, usePointStyle: true, font: { size: 11 } } } } 
                  }} 
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none -ml-[80px]">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-gray-900">95%</span>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Hadir</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100"
            >
              <h3 className="font-bold text-gray-900 text-sm mb-4">Tren Mingguan</h3>
              <div className="h-[180px] w-full">
                <Bar 
                  data={monthlyTrendData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { stacked: true, grid: { display: false } },
                      y: { stacked: true, beginAtZero: true, max: 6, ticks: { stepSize: 1 } }
                    },
                    plugins: { legend: { display: false } },
                    elements: { bar: { borderRadius: 4 } }
                  }} 
                />
              </div>
            </motion.div>
          </div>

          {/* History List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/30">
              <h3 className="font-bold text-gray-900 text-lg">Riwayat Presensi</h3>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm font-medium shadow-sm w-full sm:w-auto"
                >
                  <option value="07">Juli</option>
                  <option value="08">Agustus</option>
                  <option value="09">September</option>
                </select>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm font-medium shadow-sm w-full sm:w-auto"
                >
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3">Tanggal</th>
                    <th className="px-5 py-3">Jam Masuk</th>
                    <th className="px-5 py-3">Jam Pulang</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          <CalendarIcon size={14} className="text-gray-400" />
                          {new Date(record.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600 font-mono text-xs">{record.time_in}</td>
                      <td className="px-5 py-4 text-gray-600 font-mono text-xs">{record.time_out}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          record.status === 'Hadir' ? 'bg-green-100 text-green-700 border border-green-200' : 
                          record.status === 'Terlambat' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 
                          record.status === 'Sakit' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{record.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/30">
              <div>Menampilkan 5 data presensi bulan Agustus 2023</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
