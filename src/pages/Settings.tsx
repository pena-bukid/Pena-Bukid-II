import React, { useState, useEffect } from 'react';
import { Save, School, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

export default function Settings() {
  const [academicYears, setAcademicYears] = useState([
    { id: '1', name: '2023/2024', startDate: '2023-07-15', endDate: '2024-06-20', isActive: false },
    { id: '2', name: '2024/2025', startDate: '2024-07-15', endDate: '2025-06-20', isActive: true },
  ]);
  const [activeYearId, setActiveYearId] = useState('2');
  const [isAddingYear, setIsAddingYear] = useState(false);
  const [newYear, setNewYear] = useState({ name: '', startDate: '', endDate: '' });

  const [holidays, setHolidays] = useState<any[]>([]);
  const [isAddingHoliday, setIsAddingHoliday] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '' });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    const { data } = await supabase.from('holidays').select('*').order('date', { ascending: false });
    if (data) setHolidays(data);
  };

  const handleAddYear = () => {
    if (newYear.name && newYear.startDate && newYear.endDate) {
      setAcademicYears([...academicYears, { ...newYear, id: Date.now().toString(), isActive: false }]);
      setNewYear({ name: '', startDate: '', endDate: '' });
      setIsAddingYear(false);
    }
  };

  const handleDeleteYear = (id: string) => {
    setAcademicYears(academicYears.filter(y => y.id !== id));
    if (activeYearId === id) setActiveYearId('');
  };

  const handleAddHoliday = async () => {
    if (newHoliday.name && newHoliday.date) {
      const { data } = await supabase.from('holidays').insert([{ name: newHoliday.name, date: newHoliday.date }]).select();
      if (data) {
        setHolidays([...data, ...holidays]);
        setNewHoliday({ name: '', date: '' });
        setIsAddingHoliday(false);
      }
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    const { error } = await supabase.from('holidays').delete().eq('id', id);
    if (!error) {
      setHolidays(holidays.filter(h => h.id !== id));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sekolah</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola identitas dan sistem aplikasi</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          
          {/* Bagian 1: Identitas Sekolah */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Identitas Sekolah</h2>
            <div className="flex items-center gap-6 pb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 relative overflow-hidden shrink-0">
                <School size={32} />
                <button className="absolute inset-0 bg-black/50 text-white text-xs font-medium flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  Ubah Logo
                </button>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Logo Sekolah</h3>
                <p className="text-sm text-gray-500">PNG atau JPG, maks 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">Nama Sekolah</label>
                <input type="text" defaultValue="UPT SD Negeri Bugulkidul II" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">Nama Kepala Sekolah</label>
                <input type="text" placeholder="Masukkan nama kepsek..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Alamat</label>
                <textarea rows={3} placeholder="Alamat lengkap sekolah..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"></textarea>
              </div>
            </div>
          </section>

          {/* Bagian 2: Tahun Ajaran & Semester */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex justify-between items-center">
              Tahun Ajaran & Semester
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">Tahun Ajaran Aktif</label>
                <select 
                  value={activeYearId}
                  onChange={(e) => setActiveYearId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                >
                  <option value="" disabled>Pilih Tahun Ajaran</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>{year.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500 ml-1 mt-1">Aplikasi akan menggunakan rentang tanggal dari tahun ajaran ini.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">Semester Aktif</label>
                <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm font-medium">
                  <option>Ganjil</option>
                  <option>Genap</option>
                </select>
              </div>
            </div>

            {/* Manajemen Daftar Tahun Ajaran */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-700 text-sm">Daftar Tahun Ajaran</h3>
                <button 
                  onClick={() => setIsAddingYear(!isAddingYear)}
                  className="text-sm font-bold text-primary hover:text-primary-dark flex items-center gap-1"
                >
                  <Plus size={16} /> Tambah Baru
                </button>
              </div>

              <AnimatePresence>
                {isAddingYear && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-4 overflow-hidden"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Nama (Contoh: 2025/2026)</label>
                        <input 
                          type="text" 
                          value={newYear.name}
                          onChange={e => setNewYear({...newYear, name: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Tgl Mulai</label>
                        <input 
                          type="date" 
                          value={newYear.startDate}
                          onChange={e => setNewYear({...newYear, startDate: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Tgl Selesai</label>
                        <input 
                          type="date" 
                          value={newYear.endDate}
                          onChange={e => setNewYear({...newYear, endDate: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" 
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setIsAddingYear(false)} className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg">Batal</button>
                      <button onClick={handleAddYear} className="px-3 py-1.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-dark">Simpan Tahun</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
                {academicYears.map((year) => (
                  <div key={year.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 hover:bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${activeYearId === year.id ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                          {year.name}
                          {activeYearId === year.id && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Aktif Saat Ini</span>}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {new Date(year.startDate).toLocaleDateString('id-ID')} - {new Date(year.endDate).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end shrink-0">
                      <button 
                        onClick={() => handleDeleteYear(year.id)}
                        disabled={activeYearId === year.id}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                        title={activeYearId === year.id ? "Tidak dapat menghapus tahun ajaran yang sedang aktif" : "Hapus tahun ajaran"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {/* Bagian 3: Hari Libur */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex justify-between items-center">
              Hari Libur
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-700 text-sm">Daftar Tanggal Libur</h3>
                <button 
                  onClick={() => setIsAddingHoliday(!isAddingHoliday)}
                  className="text-sm font-bold text-primary hover:text-primary-dark flex items-center gap-1"
                >
                  <Plus size={16} /> Tambah Libur
                </button>
              </div>

              <AnimatePresence>
                {isAddingHoliday && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-4 overflow-hidden"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Nama Libur (Contoh: Idul Fitri)</label>
                        <input 
                          type="text" 
                          value={newHoliday.name}
                          onChange={e => setNewHoliday({...newHoliday, name: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Tanggal</label>
                        <input 
                          type="date" 
                          value={newHoliday.date}
                          onChange={e => setNewHoliday({...newHoliday, date: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" 
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setIsAddingHoliday(false)} className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg">Batal</button>
                      <button onClick={handleAddHoliday} className="px-3 py-1.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-dark">Simpan Libur</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {holidays.length > 0 ? (
                <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
                  {holidays.map((holiday) => (
                    <div key={holiday.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 hover:bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">
                            {holiday.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {new Date(holiday.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end shrink-0">
                        <button 
                          onClick={() => handleDeleteHoliday(holiday.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Libur"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-200 border-dashed text-sm text-gray-500">
                  Belum ada tanggal libur yang ditambahkan.
                </div>
              )}
            </div>
          </section>
          
          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button type="button" className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl shadow-md shadow-primary/30 text-sm font-bold hover:bg-primary-dark transition-colors animate-shimmer">
              <Save size={18} /> Simpan Pengaturan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
