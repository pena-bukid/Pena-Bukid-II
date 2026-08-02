import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { 
  Users, UserCheck, UserX, Clock, Calendar, 
  ChevronRight, Activity, TrendingUp, Bell
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
  const [statsData, setStatsData] = useState({ total: 0, hadir: 0, sakitIzin: 0, tanpaKeterangan: 0 });
  const [recentScans, setRecentScans] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Total Murid
    const { count: total } = await supabase.from('students').select('*', { count: 'exact', head: true });
    
    // Hadir Hari Ini
    const { count: hadir } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', today).eq('status', 'Hadir');
    
    // Sakit/Izin
    const { count: sakitIzin } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', today).in('status', ['Sakit', 'Izin']);
    
    // Tanpa Keterangan
    const { count: tanpaKeterangan } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', today).eq('status', 'Alfa');
    
    setStatsData({
      total: total || 0,
      hadir: hadir || 0,
      sakitIzin: sakitIzin || 0,
      tanpaKeterangan: tanpaKeterangan || 0
    });

    // Recent Scans
    const { data: recent } = await supabase.from('attendance').select('*, students(name, class_name)').eq('date', today).order('created_at', { ascending: false }).limit(5);
    if (recent) setRecentScans(recent);
  };

  const stats = [
    { title: 'Total Murid', value: statsData.total.toString(), icon: Users, color: 'bg-blue-500' },
    { title: 'Hadir Hari Ini', value: statsData.hadir.toString(), icon: UserCheck, color: 'bg-accent-green' },
    { title: 'Sakit/Izin', value: statsData.sakitIzin.toString(), icon: Activity, color: 'bg-accent-orange' },
    { title: 'Tanpa Keterangan', value: statsData.tanpaKeterangan.toString(), icon: UserX, color: 'bg-primary' },
  ];

  const chartData = {
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
    datasets: [
      {
        label: 'Kehadiran (%)',
        data: [96, 95, 98, 97, 95, 99],
        borderColor: '#D32F2F',
        backgroundColor: 'rgba(211, 47, 47, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { min: 80, max: 100 }
    }
  };


  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
            <Calendar size={14} />
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button className="relative p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-primary transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-white"></span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group"
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
          transition={{ delay: 0.4 }}
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
            <Line data={chartData} options={chartOptions} />
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
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-gray-900">{scan.time_in}{scan.time_out ? ` - ${scan.time_out}` : ''}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      scan.status === 'hadir' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {scan.status === 'hadir' ? 'Hadir' : 'Terlambat'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
