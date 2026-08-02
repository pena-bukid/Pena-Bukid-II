-- 1. Create academic_years table if not exists
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create classes table if not exists
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Add academic_year column to students table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='academic_year') THEN
        ALTER TABLE public.students ADD COLUMN academic_year UUID REFERENCES public.academic_years(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Enable RLS and add public access policies for academic_years
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all access on academic_years" ON public.academic_years;
CREATE POLICY "Allow public all access on academic_years" ON public.academic_years FOR ALL USING (true) WITH CHECK (true);

-- 5. Enable RLS and add public access policies for classes
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all access on classes" ON public.classes;
CREATE POLICY "Allow public all access on classes" ON public.classes FOR ALL USING (true) WITH CHECK (true);
