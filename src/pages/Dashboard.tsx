import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { 
  Users, UserCheck, UserX, Clock, Calendar, 
  ChevronRight, Activity, TrendingUp, Bell, X
} from 'lucide-react';
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
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler
);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('hari_ini');
  const [statsData, setStatsData] = useState({ total: 0, hadir: 0, tidakHadir: 0 });
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [chartDataState, setChartDataState] = useState<any>(null);
  const [showClassDetail, setShowClassDetail] = useState(false);
  const [classStats, setClassStats] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Total Murid & class details
    const { data: studentsData } = await supabase.from('students').select('id, class_name');
    const total = studentsData?.length || 0;
    
    // Hadir Hari Ini
    const { data: attendanceToday } = await supabase.from('attendance').select('student_id, status, notes').eq('date', today);
    const hadirData = (attendanceToday || []).filter(a => a.status === 'Hadir' || a.status === 'Terlambat');
    const hadir = hadirData.length;
    const tidakHadir = total - hadir;

    setStatsData({
      total,
      hadir,
      tidakHadir
    });

    // Calculate class stats
    if (studentsData) {
      const classMap: any = {};
      studentsData.forEach(s => {
        if (!classMap[s.class_name]) classMap[s.class_name] = { total: 0, hadir: 0 };
        classMap[s.class_name].total++;
      });
      hadirData.forEach(a => {
        const student = studentsData.find(s => s.id === a.student_id);
        if (student && classMap[student.class_name]) {
          classMap[student.class_name].hadir++;
        }
      });
      const cs = Object.keys(classMap).map(k => ({
        class_name: k,
        total: classMap[k].total,
        hadir: classMap[k].hadir,
        tidakHadir: classMap[k].total - classMap[k].hadir
      })).sort((a, b) => a.class_name.localeCompare(b.class_name));
      setClassStats(cs);
    }

    // Process notifications (Teacher scans)
    if (attendanceToday) {
      const teacherScans: any = {};
      attendanceToday.forEach(a => {
        if (a.notes && a.notes.startsWith('Discan oleh: ')) {
          const teacherName = a.notes.replace('Discan oleh: ', '');
          if (!teacherScans[teacherName]) teacherScans[teacherName] = 0;
          teacherScans[teacherName]++;
        }
      });
      const notifs = Object.keys(teacherScans).map(t => ({
        id: Math.random().toString(),
        message: `${t} telah melakukan presensi masuk pada ${teacherScans[t]} murid hari ini`,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      }));
      setNotifications(notifs);
    }

    // Recent Scans
    const { data: recent } = await supabase.from('attendance').select('*, students(name, class_name)').eq('date', today).order('created_at', { ascending: false }).limit(5);
    if (recent) setRecentScans(recent);

    // Chart Data (7 days)
    const d = new Date();
    const past7Days = [];
    const labels = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(d);
      date.setDate(date.getDate() - i);
      past7Days.push(date.toISOString().split('T')[0]);
      labels.push(date.toLocaleDateString('id-ID', { weekday: 'short' }));
    }
    
    const { data: historyData } = await supabase.from('attendance').select('date, status').in('date', past7Days);
    const dailyHadir = past7Days.map(dateStr => {
      const dayData = (historyData || []).filter(h => h.date === dateStr);
      const hadirCount = dayData.filter(h => h.status === 'Hadir' || h.status === 'Terlambat').length;
      return total === 0 ? 0 : Math.round((hadirCount / total) * 100);
    });

    setChartDataState({
      labels,
      datasets: [
        {
          label: 'Kehadiran (%)',
          data: dailyHadir,
          borderColor: '#D32F2F',
          backgroundColor: 'rgba(211, 47, 47, 0.1)',
          fill: true,
          tension: 0.4,
        }
      ]
    });
  };

  const stats = [
    { title: 'Total Murid', value: statsData.total.toString(), icon: Users, color: 'bg-blue-500', onClick: () => setShowClassDetail(true) },
    { title: 'Hadir Hari Ini', value: statsData.hadir.toString(), icon: UserCheck, color: 'bg-accent-green' },
    { title: 'Tidak Hadir Hari Ini', value: statsData.tidakHadir.toString(), icon: UserX, color: 'bg-primary' },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { min: 0, max: 100 }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
            <Calendar size={14} />
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="flex gap-2 relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-primary transition-colors"
          >
            <Bell size={20} />
            {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-white"></span>}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-900 text-sm">Notifikasi</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">Belum ada notifikasi hari ini</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <p className="text-sm text-gray-800 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{n.time}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            onClick={stat.onClick}
            className={`bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group ${stat.onClick ? 'cursor-pointer hover:border-primary/30 hover:shadow-md' : ''}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-2xl text-white shadow-md ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-500 mt-1 font-medium">{stat.title}</p>
            </div>
            {/* Background decorative blob */}
            <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${stat.color}`}></div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white p-5 rounded-3xl shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-gray-900 text-lg">Tren Kehadiran</h2>
            <div className="flex bg-gray-50 rounded-lg p-1">
              <button className="px-3 py-1 text-xs font-medium bg-white shadow-sm rounded-md text-gray-800">Mingguan</button>
              <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-800">Bulanan</button>
            </div>
          </div>
          <div className="h-[250px] w-full relative">
            {chartDataState ? <Line data={chartDataState} options={chartOptions} /> : <div className="flex items-center justify-center h-full text-gray-400 font-bold text-sm">Memuat data...</div>}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
        >
          <div className="p-5 border-b border-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-900 text-lg">Scan Terbaru</h2>
            <button className="text-primary text-sm font-medium flex items-center">
              Lihat <ChevronRight size={16} />
            </button>
          </div>
          <div className="p-2 flex-1 overflow-y-auto">
            <div className="space-y-1">
              {recentScans.map((scan) => (
                <div key={scan.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex flex-shrink-0 items-center justify-center font-bold text-gray-600 text-sm">
                    {(scan.students?.name || 'U').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{scan.students?.name}</p>
                    <p className="text-xs text-gray-500">Kelas {scan.students?.class_name}</p>
                    {scan.notes && <p className="text-[10px] text-gray-400 mt-0.5">{scan.notes}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-gray-900">
                      {scan.time_in ? scan.time_in : '--:--'}
                      {scan.time_out ? ` - ${scan.time_out}` : ''}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      scan.status === 'Hadir' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {scan.status === 'Hadir' ? 'Hadir' : 'Terlambat'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Class Detail Modal */}
      {showClassDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowClassDetail(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl relative z-10 w-full max-w-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">Rincian Kehadiran Per Kelas</h3>
              <button 
                onClick={() => setShowClassDetail(false)}
                className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {classStats.map((cs) => (
                  <div key={cs.class_name} className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col gap-2">
                    <h4 className="font-bold text-gray-900">{cs.class_name}</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-medium">Total Murid</span>
                      <span className="font-bold text-gray-800 text-sm">{cs.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-medium">Hadir</span>
                      <span className="font-bold text-green-600 text-sm">{cs.hadir}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-medium">Tidak Hadir</span>
                      <span className="font-bold text-red-500 text-sm">{cs.tidakHadir}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
