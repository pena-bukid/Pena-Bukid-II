import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Home, Users, QrCode, Settings, LogOut, Menu, X, Camera, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Scan QR', path: '/scan', icon: Camera },
  { name: 'Guru', path: '/teachers', icon: GraduationCap },
  { name: 'Murid', path: '/students', icon: Users },
  { name: 'Generate QR', path: '/generate-qr', icon: QrCode },
  { name: 'Pengaturan', path: '/settings', icon: Settings },
];

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'teacher'>('admin');
  const [teacherData, setTeacherData] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const teacherSession = localStorage.getItem('teacher_session');
      if (!session && !teacherSession) {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkSession = async () => {
    const teacherSessionStr = localStorage.getItem('teacher_session');
    
    if (teacherSessionStr) {
      try {
        const teacher = JSON.parse(teacherSessionStr);
        setUserRole('teacher');
        setTeacherData(teacher);
        setIsLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('teacher_session');
      }
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
    } else {
      setUserRole('admin');
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('teacher_session');
    await supabase.auth.signOut();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(item => {
    if (userRole === 'teacher') {
      return ['/', '/scan', '/students'].includes(item.path);
    }
    return true; // Admin sees all
  });

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">Memuat...</div>;
  }
  
  // Protect routes for teachers
  if (userRole === 'teacher' && ['/teachers', '/generate-qr', '/settings'].includes(location.pathname)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 flex-col gap-4">
        <h2 className="text-xl font-bold text-gray-800">Akses Ditolak</h2>
        <p className="text-gray-500">Guru tidak memiliki akses ke halaman ini.</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-primary text-white rounded-xl">Kembali ke Dashboard</button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface shadow-xl z-20 no-print">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
            {userRole === 'admin' ? 'P' : teacherData?.name?.charAt(0) || 'G'}
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">
              {userRole === 'admin' ? 'Pena Bukid 2' : teacherData?.name || 'Guru'}
            </h1>
            <p className="text-xs text-gray-500">
              {userRole === 'admin' ? 'SDN Bugulkidul II' : `NIP: ${teacherData?.nip || '-'}`}
            </p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200",
                location.pathname === item.path 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-primary"
              )}
            >
              <item.icon size={20} className={cn(location.pathname === item.path ? "text-white" : "text-gray-400")} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden print:overflow-visible print:bg-white print:block">
        {/* Mobile Header */}
        <header className="md:hidden bg-surface px-4 py-3 flex items-center justify-between shadow-sm z-20 relative no-print">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
              {userRole === 'admin' ? 'P' : teacherData?.name?.charAt(0) || 'G'}
            </div>
            <h1 className="font-bold text-gray-900">
              {userRole === 'admin' ? 'Pena Bukid' : teacherData?.name || 'Guru'}
            </h1>
          </div>
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 bg-gray-50 rounded-full"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-[60px] left-0 right-0 bg-surface shadow-xl z-30 p-4 md:hidden rounded-b-3xl"
            >
              <div className="flex flex-col gap-2">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl",
                      location.pathname === item.path 
                        ? "bg-primary/10 text-primary font-bold" 
                        : "text-gray-600"
                    )}
                  >
                    <item.icon size={20} className={location.pathname === item.path ? "text-primary" : "text-gray-400"} />
                    <span>{item.name}</span>
                  </Link>
                ))}
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 mt-2"
                >
                  <LogOut size={20} />
                  <span>Keluar</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 print:p-0 print:overflow-visible">
          <Outlet />
        </div>
        
        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-100 pb-safe z-20 px-6 py-2 no-print">
          <div className="flex justify-between items-center relative">
            {filteredNavItems.filter(i => ['/', '/students', '/settings'].includes(i.path)).map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className="flex flex-col items-center p-2 w-16"
              >
                <item.icon 
                  size={24} 
                  className={cn(
                    "mb-1 transition-colors duration-200", 
                    location.pathname === item.path ? "text-primary" : "text-gray-400"
                  )} 
                />
                <span className={cn(
                  "text-[10px] font-medium transition-colors duration-200",
                  location.pathname === item.path ? "text-primary" : "text-gray-400"
                )}>
                  {item.name}
                </span>
              </Link>
            ))}
            
            {/* Floating Scan Button */}
            <Link 
              to="/scan"
              className="absolute left-1/2 -translate-x-1/2 -top-8 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/40 text-white hover:scale-105 transition-transform"
            >
              <Camera size={28} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
