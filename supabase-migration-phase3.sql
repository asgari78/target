-- ============================================================================
-- PHASE 3 MIGRATION - run in Supabase SQL Editor (idempotent)
-- 1) course_offerings table: independent pricing per course per attendance mode
-- 2) installments table: per-installment pricing (before/after discount) per offering
-- 3) Backfill from existing courses data
-- 4) RLS policies
-- ============================================================================

-- Enable UUID extension (if not already)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1) COURSE_OFFERINGS TABLE
-- ============================================================================
-- Each course can have up to two offerings: in_person and online
-- Pricing is stored per offering, not on the course directly
CREATE TABLE IF NOT EXISTS public.course_offerings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    attendance_mode TEXT NOT NULL CHECK (attendance_mode IN ('in_person', 'online')),
    -- Cash pricing
    cash_price_before_discount BIGINT NOT NULL CHECK (cash_price_before_discount >= 0),
    cash_price_after_discount BIGINT NOT NULL CHECK (cash_price_after_discount >= 0),
    -- Installment plan metadata
    installments_count INTEGER NOT NULL DEFAULT 4 CHECK (installments_count >= 1 AND installments_count <= 24),
    installment_interest_pct NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (installment_interest_pct >= 0),
    -- Availability
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    -- Display
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Ensure one offering per course per attendance mode
    UNIQUE (course_id, attendance_mode)
);

CREATE INDEX IF NOT EXISTS idx_course_offerings_course_id
    ON public.course_offerings (course_id);

CREATE INDEX IF NOT EXISTS idx_course_offerings_attendance_mode
    ON public.course_offerings (attendance_mode);

CREATE INDEX IF NOT EXISTS idx_course_offerings_is_available
    ON public.course_offerings (is_available);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_course_offerings_updated_at ON public.course_offerings;
CREATE TRIGGER trg_course_offerings_updated_at
    BEFORE UPDATE ON public.course_offerings
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 2) INSTALLMENTS TABLE
-- ============================================================================
-- Each installment row stores before-discount and after-discount amounts
-- For a 4-installment plan, there are 4 rows with 8 stored price values total
CREATE TABLE IF NOT EXISTS public.installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offering_id UUID NOT NULL REFERENCES public.course_offerings(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL CHECK (sequence_number >= 1),
    label TEXT NOT NULL,
    amount_before_discount BIGINT NOT NULL CHECK (amount_before_discount >= 0),
    amount_after_discount BIGINT NOT NULL CHECK (amount_after_discount >= 0),
    -- Optional: relative scheduling (e.g., months after registration)
    due_month_offset INTEGER NOT NULL DEFAULT 0 CHECK (due_month_offset >= 0),
    is_down_payment BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Ensure unique sequence per offering
    UNIQUE (offering_id, sequence_number)
);

CREATE INDEX IF NOT EXISTS idx_installments_offering_id
    ON public.installments (offering_id);

CREATE INDEX IF NOT EXISTS idx_installments_sequence
    ON public.installments (offering_id, sequence_number);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_installments_updated_at ON public.installments;
CREATE TRIGGER trg_installments_updated_at
    BEFORE UPDATE ON public.installments
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 3) BACKFILL FROM EXISTING COURSES DATA
-- ============================================================================
-- For each existing course, create up to two offerings (in_person, online)
-- using the current course columns. Then generate installments using the
-- 20% uplift rule on both before-discount and after-discount cash prices.

-- Insert course offerings from existing courses data
INSERT INTO public.course_offerings (
    course_id,
    attendance_mode,
    cash_price_before_discount,
    cash_price_after_discount,
    installments_count,
    installment_interest_pct,
    is_available,
    sort_order
)
SELECT
    c.id,
    'in_person'::TEXT,
    COALESCE(c.original_price_in_person, c.price_in_person),
    c.price_in_person,
    c.installments_count,
    c.installment_interest_pct,
    c.in_person_available,
    1
FROM public.courses c
WHERE c.in_person_available = TRUE
ON CONFLICT (course_id, attendance_mode) DO UPDATE SET
    cash_price_before_discount = EXCLUDED.cash_price_before_discount,
    cash_price_after_discount = EXCLUDED.cash_price_after_discount,
    installments_count = EXCLUDED.installments_count,
    installment_interest_pct = EXCLUDED.installment_interest_pct,
    is_available = EXCLUDED.is_available;

INSERT INTO public.course_offerings (
    course_id,
    attendance_mode,
    cash_price_before_discount,
    cash_price_after_discount,
    installments_count,
    installment_interest_pct,
    is_available,
    sort_order
)
SELECT
    c.id,
    'online'::TEXT,
    COALESCE(c.original_price_online, c.price_online),
    c.price_online,
    c.installments_count,
    c.installment_interest_pct,
    c.online_available,
    2
FROM public.courses c
WHERE c.online_available = TRUE
ON CONFLICT (course_id, attendance_mode) DO UPDATE SET
    cash_price_before_discount = EXCLUDED.cash_price_before_discount,
    cash_price_after_discount = EXCLUDED.cash_price_after_discount,
    installments_count = EXCLUDED.installments_count,
    installment_interest_pct = EXCLUDED.installment_interest_pct,
    is_available = EXCLUDED.is_available;

-- ============================================================================
-- 4) GENERATE INSTALLMENTS WITH 20% UPLIFT RULE
-- ============================================================================
-- For each offering, create N installment rows where N = installments_count
-- Each installment gets 1/1.2 of the uplifted amount distributed evenly
-- Uplift: cash_price * 1.20 (20% increase for installment plan)
-- Remainder is added to the last installment

DO $$
DECLARE
    off RECORD;
    i INTEGER;
    n INTEGER;
    before_uplifted BIGINT;
    after_uplifted BIGINT;
    per_before BIGINT;
    per_after BIGINT;
    rem_before BIGINT;
    rem_after BIGINT;
    lbl TEXT;
BEGIN
    FOR off IN
        SELECT id, installments_count, cash_price_before_discount, cash_price_after_discount
        FROM public.course_offerings
    LOOP
        n := off.installments_count;
        
        -- Apply 20% uplift independently to before-discount and after-discount
        -- Example: 14,000,000 * 1.20 = 16,800,000
        -- Example: 10,000,000 * 1.20 = 12,000,000
        before_uplifted := (off.cash_price_before_discount * 120) / 100;
        after_uplifted := (off.cash_price_after_discount * 120) / 100;
        
        -- Divide evenly, put remainder on last installment
        per_before := before_uplifted / n;
        rem_before := before_uplifted % n;
        per_after := after_uplifted / n;
        rem_after := after_uplifted % n;
        
        FOR i IN 1..n LOOP
            lbl := CASE i
                WHEN 1 THEN 'پیش‌پرداخت'
                WHEN 2 THEN 'یک ماه بعد از ثبت‌نام'
                WHEN 3 THEN 'دو ماه بعد از ثبت‌نام'
                WHEN 4 THEN 'سه ماه بعد از ثبت‌نام'
                WHEN 5 THEN 'چهار ماه بعد از ثبت‌نام'
                WHEN 6 THEN 'پنج ماه بعد از ثبت‌نام'
                WHEN 7 THEN 'شش ماه بعد از ثبت‌نام'
                WHEN 8 THEN 'هفت ماه بعد از ثبت‌نام'
                WHEN 9 THEN 'هشت ماه بعد از ثبت‌نام'
                WHEN 10 THEN 'نه ماه بعد از ثبت‌نام'
                WHEN 11 THEN 'ده ماه بعد از ثبت‌نام'
                WHEN 12 THEN 'یازده ماه بعد از ثبت‌نام'
                ELSE i || ' ماه بعد از ثبت‌نام'
            END;
            
            INSERT INTO public.installments (
                offering_id,
                sequence_number,
                label,
                amount_before_discount,
                amount_after_discount,
                due_month_offset,
                is_down_payment
            ) VALUES (
                off.id,
                i,
                lbl,
                per_before + CASE WHEN i = n THEN rem_before ELSE 0 END,
                per_after + CASE WHEN i = n THEN rem_after ELSE 0 END,
                CASE WHEN i = 1 THEN 0 ELSE i - 1 END,
                i = 1
            )
            ON CONFLICT (offering_id, sequence_number) DO UPDATE SET
                label = EXCLUDED.label,
                amount_before_discount = EXCLUDED.amount_before_discount,
                amount_after_discount = EXCLUDED.amount_after_discount,
                due_month_offset = EXCLUDED.due_month_offset,
                is_down_payment = EXCLUDED.is_down_payment;
        END LOOP;
    END LOOP;
END $$;

-- ============================================================================
-- 5) ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- course_offerings: public read for catalog
ALTER TABLE public.course_offerings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read course_offerings" ON public.course_offerings;
CREATE POLICY "Public read course_offerings"
ON public.course_offerings
FOR SELECT
USING (is_available = true);

-- installments: public read for catalog
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read installments" ON public.installments;
CREATE POLICY "Public read installments"
ON public.installments
FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.course_offerings co
    WHERE co.id = installments.offering_id
    AND co.is_available = true
));

-- ============================================================================
-- 6) VERIFICATION QUERIES
-- ============================================================================

-- Verify tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('course_offerings', 'installments');

-- Verify columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'course_offerings'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'installments'
ORDER BY ordinal_position;

-- Verify RLS
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('course_offerings', 'installments');

-- Verify policies
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('course_offerings', 'installments');

-- Check backfilled data
SELECT 
    c.title,
    co.attendance_mode,
    co.cash_price_before_discount,
    co.cash_price_after_discount,
    co.installments_count,
    co.is_available
FROM public.course_offerings co
JOIN public.courses c ON c.id = co.course_id
ORDER BY c.sort_order, co.sort_order;

-- Check installments for a sample course
SELECT 
    c.title,
    co.attendance_mode,
    i.sequence_number,
    i.label,
    i.amount_before_discount,
    i.amount_after_discount,
    i.due_month_offset,
    i.is_down_payment
FROM public.installments i
JOIN public.course_offerings co ON co.id = i.offering_id
JOIN public.courses c ON c.id = co.course_id
WHERE c.slug = 'tizhoshan-6th-comprehensive'
ORDER BY co.attendance_mode, i.sequence_number;

-- Verify installment sums match uplifted totals
SELECT 
    c.title,
    co.attendance_mode,
    co.cash_price_before_discount,
    (co.cash_price_before_discount * 120) / 100 AS expected_before_total,
    SUM(i.amount_before_discount) AS actual_before_total,
    co.cash_price_after_discount,
    (co.cash_price_after_discount * 120) / 100 AS expected_after_total,
    SUM(i.amount_after_discount) AS actual_after_total
FROM public.installments i
JOIN public.course_offerings co ON co.id = i.offering_id
JOIN public.courses c ON c.id = co.course_id
GROUP BY c.title, co.attendance_mode, co.cash_price_before_discount, co.cash_price_after_discount
ORDER BY c.title, co.attendance_mode;

-- ============================================================================
-- 7) HOW TO EDIT PRICES IN SUPABASE
-- ============================================================================
-- 
-- To change cash prices for an offering:
-- UPDATE public.course_offerings
-- SET cash_price_before_discount = 16000000,
--     cash_price_after_discount = 12000000
-- WHERE course_id = '...' AND attendance_mode = 'in_person';
--
-- To change individual installment amounts (after manual admin edit):
-- UPDATE public.installments
-- SET amount_before_discount = 4500000,
--     amount_after_discount = 3200000
-- WHERE offering_id = '...' AND sequence_number = 1;
--
-- To change installment count (add/remove rows):
-- -- First update the offering's installments_count
-- UPDATE public.course_offerings SET installments_count = 6 WHERE ...;
-- -- Then insert/delete installments rows to match the new count
-- -- New rows should follow the 20% uplift rule or be set manually
--
-- Note: Changing cash prices does NOT automatically regenerate installments.
-- Installments are independent rows that admins can edit freely.
-- This prevents accidental overwrites of manual adjustments.