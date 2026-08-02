import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

export default function Teachers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    nip: '',
    homeroom: ''
  });

  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    const { data } = await supabase.from('teachers').select('*').order('created_at', { ascending: false });
    if (data) setTeachers(data);
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.nip.includes(searchTerm)
  );

  const handleSave = async () => {
    const newTeacher = {
      name: formData.name,
      nip: formData.nip,
      homeroom: formData.homeroom || '-',
      status: 'Aktif'
    };
    
    try {
      const { data, error } = await supabase.from('teachers').insert([newTeacher]).select();
      
      if (error) {
        console.warn('Supabase DB error, using local state fallback:', error.message);
        // Fallback to local state if DB schema is not ready
        const localTeacher = { ...newTeacher, id: Date.now().toString(), created_at: new Date().toISOString() };
        setTeachers([localTeacher, ...teachers]);
        setShowModal(false);
        setFormData({ name: '', nip: '', homeroom: '' });
        alert('Data disimpan di memori lokal (Database Supabase belum siap/kolom tidak cocok).');
        return;
      }
      
      if (data) {
        setTeachers([...data, ...teachers]);
        setShowModal(false);
        setFormData({ name: '', nip: '', homeroom: '' });
      }
    } catch (err: any) {
      console.warn('Exception, using local state fallback:', err.message);
      const localTeacher = { ...newTeacher, id: Date.now().toString(), created_at: new Date().toISOString() };
      setTeachers([localTeacher, ...teachers]);
      setShowModal(false);
      setFormData({ name: '', nip: '', homeroom: '' });
      alert('Data disimpan di memori lokal (Koneksi ke Database gagal).');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus data guru ini?')) {
      try {
        const { error } = await supabase.from('teachers').delete().eq('id', id);
        if (!error) {
          setTeachers(teachers.filter(t => t.id !== id));
        } else {
          setTeachers(teachers.filter(t => t.id !== id));
          console.warn('Deleted locally due to DB error');
        }
      } catch (err) {
        setTeachers(teachers.filter(t => t.id !== id));
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Guru</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola data guru dan akses sistem</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl shadow-md shadow-primary/30 text-sm font-bold hover:bg-primary-dark transition-colors animate-shimmer"
          >
            <Plus size={16} /> Tambah Guru
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari nama atau NIP/NIPPPK..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Nama Guru</th>
                <th className="px-6 py-4">NIP/NIPPPK</th>
                <th className="px-6 py-4">Wali Kelas</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTeachers.map((teacher, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={teacher.id} 
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {teacher.name.charAt(0)}
                      </div>
                      {teacher.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-mono font-medium border border-gray-200">
                      {teacher.nip}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {teacher.homeroom !== '-' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {teacher.homeroom}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1">
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Data">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(teacher.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                      title="Hapus Data"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
              
              {filteredTeachers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data guru yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/50">
          <div>Menampilkan {filteredTeachers.length} guru</div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl relative z-10 w-full max-w-md overflow-hidden border border-gray-100"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900 text-lg">Tambah Guru</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Nama Lengkap & Gelar</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Budi Santoso, S.Pd" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm" 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">NIP / NIPPPK (Wajib untuk Login)</label>
                  <input 
                    type="text" 
                    placeholder="Masukkan NIP/NIPPPK" 
                    value={formData.nip}
                    onChange={(e) => setFormData({...formData, nip: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm font-mono" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Wali Kelas (Opsional)</label>
                  <select 
                    value={formData.homeroom}
                    onChange={(e) => setFormData({...formData, homeroom: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"
                  >
                    <option value="">Bukan Wali Kelas</option>
                    <option value="Kelas 1A">Kelas 1A</option>
                    <option value="Kelas 2A">Kelas 2A</option>
                    <option value="Kelas 3A">Kelas 3A</option>
                    <option value="Kelas 4A">Kelas 4A</option>
                    <option value="Kelas 5A">Kelas 5A</option>
                    <option value="Kelas 6A">Kelas 6A</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800">
                    <strong>Info:</strong> Akun guru akan menggunakan NIP/NIPPPK untuk login dengan kata sandi bawaan <strong>bukid2</strong>.
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
                <button 
                  onClick={() => setShowModal(false)} 
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={!formData.name || !formData.nip}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Simpan Guru
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
