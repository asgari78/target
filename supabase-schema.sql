-- ============================================================================
-- TARGET ACADEMY - SUPABASE DATABASE SCHEMA
-- Run this in the Supabase SQL Editor
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: courses (Static data - managed by admin)
-- ============================================================================
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    instructor_name TEXT NOT NULL,
    sessions_count INTEGER NOT NULL DEFAULT 0,
    session_duration INTEGER NOT NULL DEFAULT 0, -- in minutes
    location_in_person TEXT,
    location_online TEXT,
    price_in_person BIGINT NOT NULL DEFAULT 0, -- in Tomans
    price_online BIGINT NOT NULL DEFAULT 0, -- in Tomans
    installment_surcharge_percent INTEGER NOT NULL DEFAULT 20, -- percentage (e.g., 20 = 20%)
    installment_months INTEGER NOT NULL DEFAULT 4, -- 4 or 6
    description TEXT,
    course_image_url TEXT,
    instructor_image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for active courses ordering
CREATE INDEX idx_courses_active_sort ON courses(is_active, sort_order) WHERE is_active = true;

-- ============================================================================
-- TABLE: enrollment_requests (Dynamic data - user submissions)
-- ============================================================================
CREATE TABLE enrollment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number TEXT NOT NULL,
    course_name TEXT NOT NULL,
    instructor_name TEXT NOT NULL,
    attendance_type TEXT NOT NULL CHECK (attendance_type IN ('In-person', 'Online')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'Installment')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint to prevent duplicate registrations (same phone + same course)
CREATE UNIQUE INDEX idx_enrollment_unique_phone_course 
ON enrollment_requests (phone_number, course_name);

-- Index for querying by date
CREATE INDEX idx_enrollment_created_at ON enrollment_requests(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on both tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_requests ENABLE ROW LEVEL SECURITY;

-- Courses: Public read access (anyone can view active courses)
CREATE POLICY "Public read access for active courses"
ON courses FOR SELECT
USING (is_active = true);

-- Enrollment requests: Public insert access (anyone can submit registration)
CREATE POLICY "Public insert access for enrollment requests"
ON enrollment_requests FOR INSERT
WITH CHECK (true);

-- Optional: Admin policies (uncomment and configure with auth.uid() if you add admin users)
-- CREATE POLICY "Admin full access to courses" ON courses FOR ALL USING (auth.role() = 'service_role');
-- CREATE POLICY "Admin full access to enrollment_requests" ON enrollment_requests FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- STORAGE BUCKET: images (for course/instructor images)
-- ============================================================================

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'images',
    'images',
    true,  -- public bucket
    5242880,  -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for public read access
CREATE POLICY "Public read access for images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Storage policies for authenticated uploads (admins only)
-- Uncomment if you want authenticated users to upload
-- CREATE POLICY "Authenticated upload to images"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- ============================================================================
-- SAMPLE DATA INSERTION (Optional - for testing)
-- ============================================================================

-- Note: Replace image URLs with actual Supabase storage URLs after uploading images
-- Format: https://<project-ref>.supabase.co/storage/v1/object/public/images/<filename>

INSERT INTO courses (
    title,
    instructor_name,
    sessions_count,
    session_duration,
    location_in_person,
    location_online,
    price_in_person,
    price_online,
    installment_surcharge_percent,
    installment_months,
    description,
    course_image_url,
    instructor_image_url,
    sort_order
) VALUES
(
    'ریاضیات پیشرفته و تیزهوشان ششم',
    'استاد علیرضا احمدی',
    24,
    120,
    'قم - مجتمع آموزشی تارگت',
    'Google Meet',
    3500000,
    3000000,
    20,
    4,
    'آمادگی کامل برای آزمون‌های ورودی مدارس تیزهوشان و نمونه دولتی با حل تست‌های چالشی و آموزش مفهومی.',
    'https://<project-ref>.supabase.co/storage/v1/object/public/images/course-math-6.jpg',
    'https://<project-ref>.supabase.co/storage/v1/object/public/images/instructor-1.jpg',
    1
),
(
    'ریاضیات جامع ششم',
    'استاد علیرضا احمدی',
    20,
    120,
    'قم - مجتمع آموزشی تارگت',
    'Google Meet',
    2800000,
    2400000,
    20,
    6,
    'مرور کامل و عمیق مباحث ریاضیات پایه ششم با رویکرد مفهومی و حل تمرینات متنوع.',
    'https://<project-ref>.supabase.co/storage/v1/object/public/images/course-math-6-comprehensive.jpg',
    'https://<project-ref>.supabase.co/storage/v1/object/public/images/instructor-1.jpg',
    2
),
(
    'ریاضیات جامع پنجم',
    'استاد مریم رضایی',
    18,
    120,
    'قم - مجتمع آموزشی تارگت',
    'Google Meet',
    2400000,
    2000000,
    20,
    6,
    'تقویت پایه‌های ریاضی پایه پنجم با روش‌های تدریس نوین و حل مثال‌های چالشی.',
    'https://<project-ref>.supabase.co/storage/v1/object/public/images/course-math-5.jpg',
    'https://<project-ref>.supabase.co/storage/v1/object/public/images/instructor-2.jpg',
    3
),
(
    'ریاضیات جامع چهارم',
    'استاد سارا کریمی',
    16,
    120,
    'قم - مجتمع آموزشی تارگت',
    'Google Meet',
    2000000,
    1700000,
    20,
    6,
    'آموزش جذاب و داستان‌محور ریاضیات پایه چهارم برای ایجاد عشق به ریاضی.',
    'https://<project-ref>.supabase.co/storage/v1/object/public/images/course-math-4.jpg',
    'https://<project-ref>.supabase.co/storage/v1/object/public/images/instructor-3.jpg',
    4
),
(
    'ریاضیات پیشرفته و تیزهوشان پیشرفته',
    'استاد علیرضا احمدی',
    28,
    120,
    'قم - مجتمع آموزشی تارگت',
    'Google Meet',
    4000000,
    3500000,
    20,
    4,
    'دوره پیشرفته تیزهوشان برای دانش‌آموزان برتر با مباحث چالشی و تکنیک‌های حل سریع.',
    'https://<project-ref>.supabase.co/storage/v1/object/public/images/course-math-advanced.jpg',
    'https://<project-ref>.supabase.co/storage/v1/object/public/images/instructor-1.jpg',
    5
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('courses', 'enrollment_requests');

-- Verify RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('courses', 'enrollment_requests');

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('courses', 'enrollment_requests');

-- Verify storage bucket
SELECT * FROM storage.buckets WHERE id = 'images';

-- Test query courses
SELECT id, title, instructor_name, price_in_person, price_online, installment_months, installment_surcharge_percent, is_active
FROM courses
WHERE is_active = true
ORDER BY sort_order;