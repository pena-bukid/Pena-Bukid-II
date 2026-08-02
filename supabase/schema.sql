-- ==========================================
-- SCRIPT LENGKAP DATABASE SUPABASE E-ABSENSI
-- ==========================================

-- 1. Hapus tabel lama (Hati-hati: ini akan menghapus semua data sebelumnya jika ada)
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.holidays CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.teachers CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.academic_years CASCADE;

-- 2. Buat tabel Tahun Ajaran
CREATE TABLE public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Buat tabel Kelas
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Buat tabel Guru
CREATE TABLE public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    nip TEXT NOT NULL UNIQUE,
    homeroom TEXT DEFAULT '-',
    status TEXT DEFAULT 'Aktif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Buat tabel Murid
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nisn TEXT,
    nis TEXT,
    name TEXT NOT NULL,
    gender TEXT,
    class_name TEXT,
    academic_year UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'Aktif',
    parent_name TEXT,
    parent_phone TEXT,
    address TEXT,
    token TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Buat tabel Absensi
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_in TIME,
    time_out TIME,
    status TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Buat tabel Hari Libur
CREATE TABLE public.holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Aktifkan Row Level Security (RLS)
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

-- 9. Buat Policy Akses Publik (PENTING AGAR APLIKASI BISA BACA/TULIS DATA)
CREATE POLICY "Allow public all access on academic_years" ON public.academic_years FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on classes" ON public.classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on teachers" ON public.teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on holidays" ON public.holidays FOR ALL USING (true) WITH CHECK (true);

-- 10. Masukkan Data Kelas Bawaan
INSERT INTO public.classes (name) VALUES 
('Kelas 1'), ('Kelas 2'), ('Kelas 3'), ('Kelas 4'), ('Kelas 5'), ('Kelas 6')
ON CONFLICT (name) DO NOTHING;
