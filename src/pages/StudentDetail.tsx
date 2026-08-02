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
  const [availableMonths, setAvailableMonths] = useState<{month: string, year: string, label: string}[]>([]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const generateMonths = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = [];
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    const endLimit = new Date(end.getFullYear(), end.getMonth(), 1);

    while (current <= endLimit) {
      months.push({
        month: String(current.getMonth() + 1).padStart(2, '0'),
        year: String(current.getFullYear()),
        label: `${monthNames[current.getMonth()]} ${current.getFullYear()}`
      });
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  };

  const fetchData = async () => {
    const { data: studentData } = await supabase.from('students').select('*').eq('id', id).single();
    if (studentData) setStudent(studentData);

    let monthsList: any[] = [];
    if (studentData?.academic_year) {
      const { data: academicYear } = await supabase.from('academic_years').select('*').eq('id', studentData.academic_year).maybeSingle();
      if (academicYear && academicYear.start_date && academicYear.end_date) {
        monthsList = generateMonths(academicYear.start_date, academicYear.end_date);
      }
    } else {
      const { data: activeYears } = await supabase.from('academic_years').select('*').eq('is_active', true).limit(1);
      if (activeYears && activeYears.length > 0 && activeYears[0].start_date && activeYears[0].end_date) {
        monthsList = generateMonths(activeYears[0].start_date, activeYears[0].end_date);
      }
    }
    
    if (monthsList.length > 0) {
      setAvailableMonths(monthsList);
      const now = new Date();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const currentYear = String(now.getFullYear());
      
      const exists = monthsList.find(m => m.month === currentMonth && m.year === currentYear);
      if (exists) {
        setSelectedMonth(currentMonth);
        setSelectedYear(currentYear);
      } else {
        setSelectedMonth(monthsList[monthsList.length - 1].month); // Select the latest month by default
        setSelectedYear(monthsList[monthsList.length - 1].year);
      }
    }

    const { data: attendanceData } = await supabase.from('attendance').select('*').eq('student_id', id).order('date', { ascending: false });
    if (attendanceData) setHistory(attendanceData);
  };

  if (!student) return <div className="p-8 text-center text-gray-500">Memuat data murid...</div>;

  const filteredHistory = history.filter(record => {
    const date = new Date(record.date);
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = String(date.getFullYear());
    return m === selectedMonth && y === selectedYear;
  });

  const statusCounts = {
    'Hadir': 0,
    'Sakit': 0,
    'Izin': 0,
    'Alfa': 0,
    'Terlambat': 0
  };

  const weeklyTrend = [
    { hadir: 0, absen: 0 },
    { hadir: 0, absen: 0 },
    { hadir: 0, absen: 0 },
    { hadir: 0, absen: 0 },
    { hadir: 0, absen: 0 }
  ];

  filteredHistory.forEach(record => {
    if (statusCounts[record.status as keyof typeof statusCounts] !== undefined) {
      statusCounts[record.status as keyof typeof statusCounts]++;
    }
    
    const date = new Date(record.date);
    const day = date.getDate();
    const weekIndex = Math.floor((day - 1) / 7);
    if (weekIndex >= 0 && weekIndex < 5) {
      if (record.status === 'Hadir' || record.status === 'Terlambat') {
        weeklyTrend[weekIndex].hadir++;
      } else {
        weeklyTrend[weekIndex].absen++;
      }
    }
  });

  const totalDays = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const totalHadir = statusCounts['Hadir'] + statusCounts['Terlambat'];
  const percentage = totalDays === 0 ? 0 : Math.round((totalHadir / totalDays) * 100);

  const attendanceStats = {
    labels: ['Hadir', 'Sakit', 'Izin', 'Alfa', 'Terlambat'],
    datasets: [
      {
        data: [
          statusCounts['Hadir'],
          statusCounts['Sakit'],
          statusCounts['Izin'],
          statusCounts['Alfa'],
          statusCounts['Terlambat']
        ],
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
    labels: ['Mg 1', 'Mg 2', 'Mg 3', 'Mg 4', 'Mg 5'],
    datasets: [
      {
        label: 'Hadir',
        data: weeklyTrend.map(w => w.hadir),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Sakit/Izin/Alfa',
        data: weeklyTrend.map(w => w.absen),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      }
    ],
  };

  const selectedMonthLabel = availableMonths.find(m => m.month === selectedMonth && m.year === selectedYear)?.label || `${selectedMonth} ${selectedYear}`;

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
              <p className="text-sm text-gray-500 mt-1">NISN: {student.nisn}</p>
            </div>
            
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                Kelas {student.class_name}
              </span>
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">
                Status: Aktif
              </span>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-3 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs font-medium">Jenis Kelamin</span>
                <span className="text-gray-900 font-medium">{student.gender === 'L' ? 'Laki-laki' : student.gender === 'P' ? 'Perempuan' : student.gender}</span>
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
                {totalDays === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-400">
                    Belum ada data
                  </div>
                ) : (
                  <>
                    <Doughnut 
                      data={attendanceStats} 
                      options={{ 
                        cutout: '75%',
                        plugins: { legend: { position: 'right', labels: { boxWidth: 10, usePointStyle: true, font: { size: 11 } } } }
                      }} 
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none -ml-[80px]">
                      <div className="text-center">
                        <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Hadir</p>
                      </div>
                    </div>
                  </>
                )}
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
                {totalDays === 0 ? (
                  <div className="h-full w-full flex items-center justify-center text-sm font-bold text-gray-400">
                    Belum ada data
                  </div>
                ) : (
                  <Bar 
                    data={monthlyTrendData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: { stacked: true, grid: { display: false } },
                        y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } }
                      },
                      plugins: { legend: { display: false } },
                      elements: { bar: { borderRadius: 4 } }
                    }} 
                  />
                )}
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
                  value={`${selectedMonth}-${selectedYear}`}
                  onChange={(e) => {
                    const [m, y] = e.target.value.split('-');
                    setSelectedMonth(m);
                    setSelectedYear(y);
                  }}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm font-medium shadow-sm w-full sm:w-auto"
                >
                  {availableMonths.length > 0 ? (
                    availableMonths.map(m => (
                      <option key={`${m.month}-${m.year}`} value={`${m.month}-${m.year}`}>
                        {m.label}
                      </option>
                    ))
                  ) : (
                    <option value={`${selectedMonth}-${selectedYear}`}>{selectedMonthLabel}</option>
                  )}
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
                  {filteredHistory.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          <CalendarIcon size={14} className="text-gray-400" />
                          {new Date(record.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600 font-mono text-xs">{record.time_in || '--:--'}</td>
                      <td className="px-5 py-4 text-gray-600 font-mono text-xs">{record.time_out || '--:--'}</td>
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
              <div>Menampilkan {filteredHistory.length} data presensi bulan {selectedMonthLabel}</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
