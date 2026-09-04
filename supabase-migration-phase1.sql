-- ============================================================================
-- PHASE 1 MIGRATION - run in Supabase SQL Editor (idempotent)
-- 1) Original price + discount percentage for in-person and online pricing
-- 2) registration_requests.student_name
-- 3) orders table
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
-- 3) orders table (schema support; payment routes come in a later phase)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_request_id UUID REFERENCES public.registration_requests(id) ON DELETE SET NULL,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    phone_number TEXT NOT NULL CHECK (phone_number ~ '^(\+98|09)9[0-9]{8}$'),
    student_name TEXT NOT NULL DEFAULT '',
    registration_type TEXT NOT NULL CHECK (registration_type IN ('in_person', 'online')),
    payment_mode TEXT NOT NULL CHECK (payment_mode IN ('cash', 'installment')),
    base_amount BIGINT NOT NULL CHECK (base_amount >= 0),
    original_amount BIGINT CHECK (original_amount IS NULL OR original_amount >= 0),
    discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    interest_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (interest_percent >= 0),
    total_amount BIGINT NOT NULL CHECK (total_amount >= 0),
    installments_count INTEGER NOT NULL DEFAULT 1 CHECK (installments_count >= 1),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_course_id ON public.orders (course_id);
CREATE INDEX IF NOT EXISTS idx_orders_phone_number ON public.orders (phone_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4) Relax phone_number CHECK on registration_requests to accept +98 and 09
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'registration_requests_phone_number_check'
          AND conrelid = 'public.registration_requests'::regclass
    ) THEN
        ALTER TABLE public.registration_requests
            DROP CONSTRAINT registration_requests_phone_number_check;
    END IF;
END $$;

ALTER TABLE public.registration_requests
    ADD CONSTRAINT registration_requests_phone_number_check
    CHECK (phone_number ~ '^(\+98|09)9[0-9]{8}$');

-- ---------------------------------------------------------------------------
-- RLS for orders
-- ---------------------------------------------------------------------------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No public read orders" ON public.orders;
CREATE POLICY "No public read orders"
ON public.orders
FOR SELECT
USING (false);

-- ---------------------------------------------------------------------------
-- Verification
-- ---------------------------------------------------------------------------
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema='public' AND table_name='courses'
  AND column_name IN ('original_price_in_person','discount_percent_in_person','original_price_online','discount_percent_online');

SELECT column_name FROM information_schema.columns
WHERE table_schema='public' AND table_name='registration_requests' AND column_name='student_name';

SELECT table_name FROM information_schema.tables
WHERE table_schema='public' AND table_name='orders';
