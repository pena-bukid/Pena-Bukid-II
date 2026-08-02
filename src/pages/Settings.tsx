import React, { useState, useEffect } from 'react';
import { Save, School, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

export default function Settings() {
  const [schoolIdentity, setSchoolIdentity] = useState({
    schoolName: 'UPT SD Negeri Bugulkidul II',
    principalName: '',
    address: ''
  });
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [activeYearId, setActiveYearId] = useState('');
  const [isAddingYear, setIsAddingYear] = useState(false);
  const [newYear, setNewYear] = useState({ name: '', start_date: '', end_date: '' });

  const [holidays, setHolidays] = useState<any[]>([]);
  const [isAddingHoliday, setIsAddingHoliday] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '' });

  const [classes, setClasses] = useState<any[]>([]);
  const [newClass, setNewClass] = useState('');
  const [isAddingClass, setIsAddingClass] = useState(false);

  useEffect(() => {
    fetchHolidays();
    fetchAcademicYears();
    fetchClasses();
    const storedIdentity = localStorage.getItem('school_identity');
    if (storedIdentity) {
      setSchoolIdentity(JSON.parse(storedIdentity));
    }
  }, []);

  const fetchAcademicYears = async () => {
    try {
      const { data } = await supabase.from('academic_years').select('*').order('start_date', { ascending: false });
      if (data) {
        setAcademicYears(data);
        const active = data.find(y => y.is_active);
        if (active) setActiveYearId(active.id);
      }
    } catch(e) {
      console.warn("Could not fetch academic years");
    }
  };

  const fetchClasses = async () => {
    try {
      const { data } = await supabase.from('classes').select('*').order('name');
      if (data && data.length > 0) {
        setClasses(data);
      } else {
        // Fallback for initial UI view if RLS fails or empty
        const storedClasses = localStorage.getItem('school_classes');
        if (storedClasses) {
          setClasses(JSON.parse(storedClasses).map((c: string) => ({ id: c, name: c })));
        } else {
          setClasses([{id: '1', name: 'Kelas 1'}, {id: '2', name: 'Kelas 2'}]);
        }
      }
    } catch(e) {
      console.warn("Could not fetch classes");
    }
  };

  const fetchHolidays = async () => {
    const { data } = await supabase.from('holidays').select('*').order('date', { ascending: false });
    if (data) setHolidays(data);
  };

  const handleAddYear = async () => {
    if (newYear.name && newYear.start_date && newYear.end_date) {
      // If it's the first one, make it active
      const is_active = academicYears.length === 0;
      try {
        const { data, error } = await supabase.from('academic_years').insert([{
          name: newYear.name,
          start_date: newYear.start_date,
          end_date: newYear.end_date,
          is_active
        }]).select();
        
        if (data && !error) {
          setAcademicYears([...data, ...academicYears]);
          if (is_active) setActiveYearId(data[0].id);
          setNewYear({ name: '', start_date: '', end_date: '' });
          setIsAddingYear(false);
        } else {
          alert('Gagal menyimpan (Pastikan RLS sudah diperbarui di Supabase)');
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDeleteYear = async (id: string) => {
    try {
      const { error } = await supabase.from('academic_years').delete().eq('id', id);
      if (!error) {
        setAcademicYears(academicYears.filter(y => y.id !== id));
        if (activeYearId === id) setActiveYearId('');
      } else {
        alert('Gagal menghapus');
      }
    } catch(e) {
      console.error(e);
    }
  };

  const handleSetActiveYear = async (id: string) => {
    try {
      // Set all to inactive first
      await supabase.from('academic_years').update({ is_active: false }).neq('id', id);
      // Set chosen to active
      const { error } = await supabase.from('academic_years').update({ is_active: true }).eq('id', id);
      if (!error) {
        setActiveYearId(id);
        const updated = academicYears.map(y => ({ ...y, is_active: y.id === id }));
        setAcademicYears(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddHoliday = async () => {
    if (newHoliday.name && newHoliday.date) {
      const { data, error } = await supabase.from('holidays').insert([{ name: newHoliday.name, date: newHoliday.date }]).select();
      if (data && !error) {
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

  const handleAddClass = async () => {
    if (newClass.trim()) {
      try {
        const { data, error } = await supabase.from('classes').insert([{ name: newClass.trim() }]).select();
        if (data && !error) {
          setClasses([...classes, data[0]]);
          setNewClass('');
          setIsAddingClass(false);
        } else {
          alert('Gagal menyimpan (Pastikan RLS sudah diperbarui)');
        }
      } catch(e) {
        console.error(e);
      }
    }
  };

  const handleSaveAllSettings = () => {
    localStorage.setItem('school_identity', JSON.stringify(schoolIdentity));
    alert('Pengaturan berhasil disimpan!');
  };

  const handleDeleteClass = async (id: string) => {
    try {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (!error) {
        setClasses(classes.filter(c => c.id !== id));
      }
    } catch(e) {
      console.error(e);
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
                <input type="text" value={schoolIdentity.schoolName} onChange={e => setSchoolIdentity({...schoolIdentity, schoolName: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">Nama Kepala Sekolah</label>
                <input type="text" placeholder="Masukkan nama kepsek..." value={schoolIdentity.principalName} onChange={e => setSchoolIdentity({...schoolIdentity, principalName: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Alamat</label>
                <textarea rows={3} placeholder="Alamat lengkap sekolah..." value={schoolIdentity.address} onChange={e => setSchoolIdentity({...schoolIdentity, address: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"></textarea>
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
                  onChange={(e) => handleSetActiveYear(e.target.value)}
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
                          value={newYear.start_date}
                          onChange={e => setNewYear({...newYear, start_date: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Tgl Selesai</label>
                        <input 
                          type="date" 
                          value={newYear.end_date}
                          onChange={e => setNewYear({...newYear, end_date: e.target.value})}
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
                          {new Date(year.start_date).toLocaleDateString('id-ID')} - {new Date(year.end_date).toLocaleDateString('id-ID')}
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

          {/* Bagian 4: Pengaturan Kelas */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex justify-between items-center">
              Daftar Kelas
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-700 text-sm">Kelas yang tersedia</h3>
                <button 
                  onClick={() => setIsAddingClass(!isAddingClass)}
                  className="text-sm font-bold text-primary hover:text-primary-dark flex items-center gap-1"
                >
                  <Plus size={16} /> Tambah Kelas
                </button>
              </div>

              <AnimatePresence>
                {isAddingClass && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-4 overflow-hidden"
                  >
                    <div className="mb-3 space-y-1">
                      <label className="text-xs font-bold text-gray-600">Nama Kelas (Contoh: Kelas 1A)</label>
                      <input 
                        type="text" 
                        value={newClass}
                        onChange={e => setNewClass(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" 
                        placeholder="Masukkan nama kelas..."
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setIsAddingClass(false)} className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg">Batal</button>
                      <button onClick={handleAddClass} className="px-3 py-1.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-dark">Simpan Kelas</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {classes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {classes.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-primary/50 transition-colors shadow-sm">
                      <span className="font-bold text-gray-800 text-sm">{c.name}</span>
                      <button 
                        onClick={() => handleDeleteClass(c.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Hapus Kelas"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-200 border-dashed text-sm text-gray-500">
                  Belum ada kelas yang ditambahkan.
                </div>
              )}
            </div>
          </section>
          
          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button type="button" onClick={handleSaveAllSettings} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl shadow-md shadow-primary/30 text-sm font-bold hover:bg-primary-dark transition-colors animate-shimmer">
              <Save size={18} /> Simpan Pengaturan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
