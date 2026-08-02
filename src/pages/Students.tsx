import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, Edit2, Trash2, Download, History, X, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

export default function Students() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudentHistory, setSelectedStudentHistory] = useState<any>(null);

  const [students, setStudents] = useState<any[]>([]);
  const [mockHistory, setMockHistory] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    nisn: '',
    gender: 'L',
    class_name: 'Kelas 1',
    academic_year: ''
  });

  const [isTeacher, setIsTeacher] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [activeYearId, setActiveYearId] = useState('');
  const [academicYears, setAcademicYears] = useState<any[]>([]);

  useEffect(() => {
    fetchStudents();
    setIsTeacher(!!localStorage.getItem('teacher_session'));
    
    supabase.from('classes').select('*').order('name').then(({data}) => {
      if (data && data.length > 0) {
        const cls = data.map((c: any) => c.name);
        setClasses(cls);
        setFormData(prev => ({ ...prev, class_name: cls[0] }));
      } else {
        const defaultClasses = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];
        setClasses(defaultClasses);
        setFormData(prev => ({ ...prev, class_name: defaultClasses[0] }));
      }
    });

    supabase.from('academic_years').select('id').eq('is_active', true).limit(1).then(({data}) => {
      if (data && data.length > 0) {
        setActiveYearId(data[0].id);
      }
    });
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
      if (error) {
        console.warn('Error fetching students:', error.message);
      }
      if (data) setStudents(data);
    } catch (err) {
      console.warn('Exception fetching students:', err);
    }
  };

  const handleViewHistory = async (student: any) => {
    setSelectedStudentHistory(student);
    setShowHistoryModal(true);
    try {
      const { data } = await supabase.from('attendance').select('*').eq('student_id', student.id).order('date', { ascending: false }).limit(5);
      if (data) setMockHistory(data);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,NISN,Nama Murid,Jenis Kelamin(L/P),Kelas,Tahun Ajaran\n1234567890,Budi Santoso,L,Kelas 1,2024/2025\n0987654321,Siti Aminah,P,Kelas 1,2024/2025";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_murid.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = () => {
    setShowImportModal(true);
  };

  const processImport = async () => {
    if (!importText.trim()) return;
    
    // Parse CSV (simple split by newline and comma)
    const lines = importText.trim().split('\n');
    // Skip header line if it contains 'NISN'
    const startIndex = lines[0].toLowerCase().includes('nisn') ? 1 : 0;
    
    const newStudents = [];
    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length >= 4) {
        let ayId = activeYearId || null;
        if (parts[4]) {
          const match = academicYears.find(y => y.name.toLowerCase() === parts[4].toLowerCase());
          if (match) ayId = match.id;
        }
        newStudents.push({
          nisn: parts[0],
          name: parts[1],
          gender: parts[2] === 'P' ? 'P' : 'L',
          class_name: parts[3],
          academic_year: ayId,
          status: 'Aktif'
        });
      }
    }
    
    if (newStudents.length > 0) {
      try {
        const { data, error } = await supabase.from('students').insert(newStudents).select();
        if (error) {
          console.warn('DB error, using local fallback', error.message);
          const localStudents = newStudents.map(s => ({ ...s, id: Math.random().toString(), created_at: new Date().toISOString() }));
          setStudents([...localStudents, ...students]);
        } else if (data) {
          setStudents([...data, ...students]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    
    setImportText('');
    setShowImportModal(false);
  };

  const handleSaveStudent = async () => {
    const newStudent = {
      name: formData.name,
      nisn: formData.nisn,
      gender: formData.gender,
      class_name: formData.class_name,
      academic_year: formData.academic_year || activeYearId || null,
      status: 'Aktif'
    };
    
    try {
      const { data, error } = await supabase.from('students').insert([newStudent]).select();
      
      if (error) {
        console.warn('Supabase DB error, using local state fallback:', error.message);
        const localStudent = { ...newStudent, id: Date.now().toString(), created_at: new Date().toISOString() };
        setStudents([localStudent, ...students]);
        setShowAddModal(false);
        setFormData({ name: '', nisn: '', gender: 'L', class_name: classes[0] || 'Kelas 1', academic_year: activeYearId });
        alert('Data disimpan di memori lokal (Database Supabase belum siap/kolom tidak cocok).');
        return;
      }
      
      if (data) {
        setStudents([...data, ...students]);
        setShowAddModal(false);
        setFormData({ name: '', nisn: '', gender: 'L', class_name: classes[0] || 'Kelas 1', academic_year: activeYearId });
      }
    } catch (err: any) {
      console.warn('Exception, using local state fallback:', err.message);
      const localStudent = { ...newStudent, id: Date.now().toString(), created_at: new Date().toISOString() };
      setStudents([localStudent, ...students]);
      setShowAddModal(false);
      setFormData({ name: '', nisn: '', gender: 'L', class_name: classes[0] || 'Kelas 1', academic_year: activeYearId });
      alert('Data disimpan di memori lokal (Koneksi ke Database gagal).');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus data murid ini?')) {
      try {
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (!error) {
          setStudents(students.filter(s => s.id !== id));
        } else {
          setStudents(students.filter(s => s.id !== id));
          console.warn('Deleted locally due to DB error');
        }
      } catch (err) {
        setStudents(students.filter(s => s.id !== id));
      }
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.nisn?.includes(searchTerm);
    const matchesYear = activeYearId ? s.academic_year === activeYearId : true;
    return matchesSearch && matchesYear;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Murid</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola data murid dan kelas</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isTeacher && (
            <>
              <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                <Download size={16} /> Template
              </button>
              <button onClick={handleImport} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                <FileSpreadsheet size={16} className="text-green-600" /> Import
              </button>
              <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl shadow-md shadow-primary/30 text-sm font-bold hover:bg-primary-dark transition-colors animate-shimmer">
                <Plus size={16} /> Tambah Murid
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari nama, NISN..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 w-full md:w-auto hover:bg-gray-50">
              <Filter size={16} /> Semua Kelas
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Nama Murid</th>
                <th className="px-6 py-4">NISN</th>
                <th className="px-6 py-4">L/P</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.map((student, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={student.id} 
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link to={`/students/${student.id}`} className="font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-2 group">
                      {student.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{student.nisn}</td>
                  <td className="px-6 py-4 text-gray-600">{student.gender}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {student.class_name || student.class}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                      {student.status || 'Aktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1">
                    <button 
                      onClick={() => handleViewHistory(student)}
                      className="p-1.5 text-gray-400 hover:text-primary hover:bg-red-50 rounded-lg transition-colors tooltip"
                      title="Riwayat Kehadiran"
                    >
                      <History size={16} />
                    </button>
                    {!isTeacher && (
                      <>
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Data">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Hapus Data"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </motion.tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data murid yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/50">
          <div>Menampilkan {filteredStudents.length} murid</div>
        </div>
      </div>

      {/* Add Student Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl relative z-10 w-full max-w-md overflow-hidden border border-gray-100"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900 text-lg">Tambah Murid</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Nama Lengkap Murid</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Budi Santoso" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm" 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">NISN</label>
                  <input 
                    type="text" 
                    placeholder="Masukkan NISN" 
                    value={formData.nisn}
                    onChange={(e) => setFormData({...formData, nisn: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm font-mono" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 ml-1">Jenis Kelamin</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 ml-1">Kelas</label>
                    <select 
                      value={formData.class_name}
                      onChange={(e) => setFormData({...formData, class_name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"
                    >
                      {classes.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2 mt-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Tahun Ajaran</label>
                    <select 
                      value={formData.academic_year}
                      onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"
                    >
                      {academicYears.map(y => (
                        <option key={y.id} value={y.id}>{y.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveStudent} 
                  disabled={!formData.name || !formData.nisn}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Simpan Murid
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowImportModal(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl relative z-10 w-full max-w-lg overflow-hidden border border-gray-100"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900 text-lg">Import Data Murid</h3>
                <button 
                  onClick={() => setShowImportModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-xl border border-blue-100">
                  <p className="font-bold mb-1">Panduan Import:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Gunakan file CSV atau copy-paste dari Excel.</li>
                    <li>Format kolom: <strong>NISN, Nama Lengkap, Jenis Kelamin (L/P), Kelas, Tahun Ajaran</strong></li>
                    <li>Pisahkan kolom dengan koma (,).</li>
                    <li>Pastikan nama kelas sesuai dengan daftar kelas di pengaturan.</li>
                  </ul>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Data CSV / Excel (Paste disini)</label>
                  <textarea 
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm font-mono"
                    rows={8}
                    placeholder="Contoh:&#10;1234567890, Budi Santoso, L, Kelas 1, 2024/2025&#10;0987654321, Siti Aminah, P, Kelas 2, 2024/2025"
                  ></textarea>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
                <button 
                  onClick={() => setShowImportModal(false)} 
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={processImport} 
                  disabled={!importText.trim()}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FileSpreadsheet size={18} />
                  Proses Import
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && selectedStudentHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryModal(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl relative z-10 w-full max-w-lg overflow-hidden border border-gray-100"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Riwayat Kehadiran</h3>
                  <p className="text-sm text-gray-500">{selectedStudentHistory.name} - {selectedStudentHistory.class_name || selectedStudentHistory.class}</p>
                </div>
                <button 
                  onClick={() => setShowHistoryModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                  {mockHistory.length > 0 ? mockHistory.map((log) => (
                    <div key={log.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {new Date(log.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          Jam Masuk: <span className="font-bold text-gray-700">{log.timeIn}</span>
                        </p>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          log.status === 'Hadir' ? 'bg-green-100 text-green-700' : 
                          log.status === 'Terlambat' ? 'bg-orange-100 text-orange-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">Belum ada riwayat kehadiran</div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
