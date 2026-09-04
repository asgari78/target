-- ============================================================================
-- TARGET ACADEMY - SUPABASE DATABASE SCHEMA
-- Run this in the Supabase SQL Editor
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: courses (Static data - managed by admin)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    grade TEXT NOT NULL CHECK (grade IN ('چهارم', 'پنجم', 'ششم')),
    instructor_name TEXT NOT NULL,
    instructor_image_url TEXT,
    cover_image_url TEXT,
    sessions_count INTEGER NOT NULL CHECK (sessions_count > 0),
    session_hours NUMERIC(4,2) NOT NULL DEFAULT 1.50 CHECK (session_hours > 0),
    schedule_text TEXT NOT NULL DEFAULT '',
    start_date DATE,
    location_in_person TEXT NOT NULL DEFAULT 'قم خیابان امام، بلوار زینبیه، آموزشگاه تارگت',
    location_online TEXT NOT NULL DEFAULT 'Google Meet',
    price_in_person BIGINT NOT NULL CHECK (price_in_person >= 0),
    price_online BIGINT NOT NULL CHECK (price_online >= 0),
    original_price_in_person BIGINT CHECK (original_price_in_person IS NULL OR original_price_in_person >= 0),
    discount_percent_in_person NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent_in_person >= 0 AND discount_percent_in_person <= 100),
    original_price_online BIGINT CHECK (original_price_online IS NULL OR original_price_online >= 0),
    discount_percent_online NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent_online >= 0 AND discount_percent_online <= 100),
    installments_count INTEGER NOT NULL DEFAULT 4 CHECK (installments_count >= 2 AND installments_count <= 12),
    installment_interest_pct NUMERIC(5,2) NOT NULL DEFAULT 20.00 CHECK (installment_interest_pct >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_is_active_sort_order
    ON public.courses (is_active, sort_order, created_at);

CREATE INDEX IF NOT EXISTS idx_courses_grade
    ON public.courses (grade);

-- Keep updated_at fresh
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_courses_updated_at ON public.courses;
CREATE TRIGGER trg_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- TABLE: registration_requests (Dynamic data - user submissions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.registration_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL CHECK (phone_number ~ '^(\+98|09)9[0-9]{8}$'),
    student_name TEXT NOT NULL DEFAULT '' CHECK (char_length(student_name) <= 120),
    registration_type TEXT NOT NULL CHECK (registration_type IN ('in_person', 'online')),
    payment_mode TEXT NOT NULL DEFAULT 'cash' CHECK (payment_mode IN ('cash', 'installment')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'done', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent duplicate requests for the same course and phone number
CREATE UNIQUE INDEX IF NOT EXISTS uq_registration_course_phone
    ON public.registration_requests (course_id, phone_number);

CREATE INDEX IF NOT EXISTS idx_registration_requests_course_id
    ON public.registration_requests (course_id);

CREATE INDEX IF NOT EXISTS idx_registration_requests_phone_number
    ON public.registration_requests (phone_number);

CREATE INDEX IF NOT EXISTS idx_registration_requests_status
    ON public.registration_requests (status);

-- ============================================================================
-- TABLE: orders (Phase 1 schema support - see supabase-migration-phase1.sql)
-- ============================================================================
-- 4) Mobile validation accepting +98 and 09 formats
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) courses: original prices and discount percentages
--    price_in_person / price_online remain the CURRENT (discounted) selling price.
--    original_* hold the pre-discount price; NULL = no discount data.
-- ---------------------------------------------------------------------------
ALTER TABLE public.courses
    ADD COLUMN IF NOT EXISTS original_price_in_person BIGINT CHECK (original_price_in_person IS NULL OR original_price_in_person >= 0);
ALTER TABLE public.courses
    ADD COLUMN IF NOT EXISTS discount_percent_in_person NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent_in_person >= 0 AND discount_percent_in_person <= 100);
ALTER TABLE public.courses
    ADD COLUMN IF NOT EXISTS original_price_online BIGINT CHECK (original_price_online IS NULL OR original_price_online >= 0);
ALTER TABLE public.courses
    ADD COLUMN IF NOT EXISTS discount_percent_online NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent_online >= 0 AND discount_percent_online <= 100);

-- Backfill: existing rows get original = current price, discount 0
UPDATE public.courses
SET original_price_in_person = COALESCE(original_price_in_person, price_in_person),
    original_price_online   = COALESCE(original_price_online, price_online);

-- ---------------------------------------------------------------------------
-- 2) registration_requests: student_name
-- ---------------------------------------------------------------------------
ALTER TABLE public.registration_requests
    ADD COLUMN IF NOT EXISTS student_name TEXT NOT NULL DEFAULT '' CHECK (char_length(student_name) <= 120);

-- ---------------------------------------------------------------------------

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Courses are publicly readable
DROP POLICY IF EXISTS "Public read courses" ON public.courses;
CREATE POLICY "Public read courses"
ON public.courses
FOR SELECT
USING (true);

-- Registration requests can be inserted publicly from the frontend
DROP POLICY IF EXISTS "Public insert registration requests" ON public.registration_requests;
CREATE POLICY "Public insert registration requests"
ON public.registration_requests
FOR INSERT
WITH CHECK (true);

-- No public read for registration requests
DROP POLICY IF EXISTS "No public read registration requests" ON public.registration_requests;
CREATE POLICY "No public read registration requests"
ON public.registration_requests
FOR SELECT
USING (false);

-- ============================================================================
-- STORAGE BUCKET FOR ASSETS
-- ============================================================================

-- Public bucket for course covers, instructor images, and related landing assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('target-academy-assets', 'target-academy-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access to bucket objects
DROP POLICY IF EXISTS "Public read target academy assets" ON storage.objects;
CREATE POLICY "Public read target academy assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'target-academy-assets');

-- ============================================================================
-- SAMPLE DATA INSERTION - 5 REQUIRED COURSES
-- ============================================================================

-- Course 1: دوره جامع تیزهوشان ششم
INSERT INTO public.courses (
    slug, title, description, grade, instructor_name, instructor_image_url, cover_image_url,
    sessions_count, session_hours, schedule_text, start_date,
    location_in_person, location_online,
    price_in_person, price_online,
    installments_count, installment_interest_pct,
    is_active, sort_order
) VALUES (
    'tizhoshan-6th-comprehensive',
    'دوره جامع تیزهوشان ششم',
    'آمادگی کامل برای آزمون ورودی مدارس تیزهوشان پایه ششم با پوشش تمام مباحث ریاضی، آمار و احتمال، هندسه و جبر پیشرفته. این دوره شامل حل تست‌های چالشی، تکنیک‌های حل سریع و روش‌های استراتژیک آزمون است.',
    'ششم',
    'حامد شهبازی',
    NULL,
    NULL,
    36,
    2.50,
    'یک جلسه در هفته، طول هر جلسه ۲:۳۰ ساعت',
    '2025-10-01',
    'قم خیابان امام، بلوار زینبیه، آموزشگاه تارگت',
    'Google Meet',
    15000000,
    8000000,
    4,
    20.00,
    true,
    1
);

-- Course 2: ریاضی پیشرفته تیزهوشان
INSERT INTO public.courses (
    slug, title, description, grade, instructor_name, instructor_image_url, cover_image_url,
    sessions_count, session_hours, schedule_text, start_date,
    location_in_person, location_online,
    price_in_person, price_online,
    installments_count, installment_interest_pct,
    is_active, sort_order
) VALUES (
    'tizhoshan-advanced-math',
    'ریاضی پیشرفته تیزهوشان',
    'دوره تخصصی ریاضی پیشرفته برای آزمون‌های تیزهوشان با تمرکز بر مباحث جبر، هندسه تحلیلی، توابع و محاسبات پیشرفته. مناسب برای دانش‌آموزانی که پایه قوی ریاضی دارند و به دنبال چالش‌های بالاتر هستند.',
    'ششم',
    'حامد شهبازی',
    NULL,
    NULL,
    16,
    1.75,
    'یک جلسه در هفته، طول هر جلسه ۱:۴۵ ساعت',
    '2025-10-01',
    'قم خیابان امام، بلوار زینبیه، آموزشگاه تارگت',
    'Google Meet',
    5000000,
    3500000,
    4,
    20.00,
    true,
    2
);

-- Course 3: ریاضی جامع ششم
INSERT INTO public.courses (
    slug, title, description, grade, instructor_name, instructor_image_url, cover_image_url,
    sessions_count, session_hours, schedule_text, start_date,
    location_in_person, location_online,
    price_in_person, price_online,
    installments_count, installment_interest_pct,
    is_active, sort_order
) VALUES (
    'math-6th-comprehensive',
    'ریاضی جامع ششم',
    'مرور کامل و عمیق تمام مباحث ریاضیات پایه ششمตาม برنامه درسی وزارت آموزش و پرورش شامل: اعداد و عملیات، جبر، هندسه، آمار و احتمال. تدریس در دو ترم با رویکرد مفهومی و حل تمرینات متنوع.',
    'ششم',
    'حامد شهبازی',
    NULL,
    NULL,
    28,
    1.50,
    'یک جلسه در هفته، طول هر جلسه ۱:۳۰ ساعت، در ۲ ترم',
    '2025-10-01',
    'قم خیابان امام، بلوار زینبیه، آموزشگاه تارگت',
    'Google Meet',
    5000000,
    3500000,
    6,
    20.00,
    true,
    3
);

-- Course 4: ریاضی جامع پنجم
INSERT INTO public.courses (
    slug, title, description, grade, instructor_name, instructor_image_url, cover_image_url,
    sessions_count, session_hours, schedule_text, start_date,
    location_in_person, location_online,
    price_in_person, price_online,
    installments_count, installment_interest_pct,
    is_active, sort_order
) VALUES (
    'math-5th-comprehensive',
    'ریاضی جامع پنجم',
    'تقویت پایه‌های ریاضی پایه پنجم شامل: اعداد و عملیات، کسرها، اعشار، هندسه مقدماتی، آمار و احتمال. روش‌های تدریس نوین با مثال‌های چالشی برای ایجاد درک عمیق مفاهیم ریاضی.',
    'پنجم',
    'علی نصیری',
    NULL,
    NULL,
    28,
    1.50,
    'یک جلسه در هفته، طول هر جلسه ۱:۳۰ ساعت، در ۲ ترم',
    '2025-10-01',
    'قم خیابان امام، بلوار زینبیه، آموزشگاه تارگت',
    'Google Meet',
    5000000,
    3500000,
    6,
    20.00,
    true,
    4
);

-- Course 5: ریاضی جامع چهارم
INSERT INTO public.courses (
    slug, title, description, grade, instructor_name, instructor_image_url, cover_image_url,
    sessions_count, session_hours, schedule_text, start_date,
    location_in_person, location_online,
    price_in_person, price_online,
    installments_count, installment_interest_pct,
    is_active, sort_order
) VALUES (
    'math-4th-comprehensive',
    'ریاضی جامع چهارم',
    'آموزش جذاب و داستان‌محور ریاضیات پایه چهارم شامل: اعداد و عملیات، ضرب و تقسیم، کسرها، هندسه مقدماتی، الگوهای ریاضی. هدف ایجاد عشق به ریاضی و تقویت تفکر منطقی در دانش‌آموزان.',
    'چهارم',
    'محمدجواد عسگری',
    NULL,
    NULL,
    28,
    1.50,
    'یک جلسه در هفته، طول هر جلسه ۱:۳۰ ساعت، در ۲ ترم',
    '2025-10-01',
    'قم خیابان امام، بلوار زینبیه، آموزشگاه تارگت',
    'Google Meet',
    5000000,
    3500000,
    6,
    20.00,
    true,
    5
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('courses', 'registration_requests');

-- Verify RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('courses', 'registration_requests');

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('courses', 'registration_requests');

-- Verify storage bucket
SELECT * FROM storage.buckets WHERE id = 'target-academy-assets';

-- Test query courses
SELECT id, slug, title, instructor_name, price_in_person, price_online, installments_count, installment_interest_pct, is_active
FROM public.courses
WHERE is_active = true
ORDER BY sort_order;