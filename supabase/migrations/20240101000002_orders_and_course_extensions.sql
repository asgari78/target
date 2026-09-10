-- ============================================================================
-- PHASE 2 - Orders table, payment_logs, course extensions
-- ============================================================================

-- Enable UUID extension (if not already)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1) ORDERS TABLE
-- ============================================================================
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
    installment_index INTEGER DEFAULT 1 CHECK (installment_index >= 1),
    installment_due_date DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'failed')),
    authority TEXT,
    ref_id BIGINT,
    paid_at TIMESTAMPTZ,
    is_reservation BOOLEAN NOT NULL DEFAULT FALSE,
    callback_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_course_id ON public.orders (course_id);
CREATE INDEX IF NOT EXISTS idx_orders_phone_number ON public.orders (phone_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_authority ON public.orders (authority);
CREATE INDEX IF NOT EXISTS idx_orders_ref_id ON public.orders (ref_id);
CREATE INDEX IF NOT EXISTS idx_orders_is_reservation ON public.orders (is_reservation);

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 2) PAYMENT_LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    event TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_order_id ON public.payment_logs (order_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_event ON public.payment_logs (event);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON public.payment_logs (created_at);

-- RLS for payment_logs (server-side only)
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No public access payment_logs" ON public.payment_logs;
CREATE POLICY "No public access payment_logs"
ON public.payment_logs
FOR ALL
USING (false);

-- ============================================================================
-- 3) COURSE EXTENSIONS
-- ============================================================================
-- Add mode availability flags and rich metadata to courses
ALTER TABLE public.courses
    ADD COLUMN IF NOT EXISTS in_person_available BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS online_available BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS instructor_bio TEXT,
    ADD COLUMN IF NOT EXISTS audience TEXT,
    ADD COLUMN IF NOT EXISTS curriculum TEXT,
    ADD COLUMN IF NOT EXISTS requirements TEXT,
    ADD COLUMN IF NOT EXISTS venue_details TEXT,
    ADD COLUMN IF NOT EXISTS map_embed_url TEXT,
    ADD COLUMN IF NOT EXISTS session_duration TEXT;

-- Backfill existing courses
UPDATE public.courses
SET in_person_available = TRUE,
    online_available = TRUE
WHERE in_person_available IS NULL OR online_available IS NULL;

-- ============================================================================
-- 4) ORDERS RLS - SERVICE ROLE ONLY FOR WRITES
-- ============================================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No public read orders" ON public.orders;
CREATE POLICY "No public read orders"
ON public.orders
FOR SELECT
USING (false);

DROP POLICY IF EXISTS "No public insert orders" ON public.orders;
CREATE POLICY "No public insert orders"
ON public.orders
FOR INSERT
WITH CHECK (false);

DROP POLICY IF EXISTS "No public update orders" ON public.orders;
CREATE POLICY "No public update orders"
ON public.orders
FOR UPDATE
USING (false);
