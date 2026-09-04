-- ============================================================================
-- PHASE 2 MIGRATION - run in Supabase SQL Editor (idempotent)
-- 1) orders table enhancements (authority, ref_id, paid_at, installment metadata)
-- 2) payment_logs table for audit trail
-- 3) course extensions: in_person_available, online_available, instructor_bio, audience
-- 4) RLS policies for secure server-side access
-- ============================================================================

-- Enable UUID extension (if not already)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1) ORDERS TABLE ENHANCEMENTS
-- ============================================================================
-- Add Zarinpal-specific fields and installment tracking to orders
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS authority TEXT,
    ADD COLUMN IF NOT EXISTS ref_id BIGINT,
    ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS installment_index INTEGER DEFAULT 1 CHECK (installment_index >= 1),
    ADD COLUMN IF NOT EXISTS installment_due_date DATE,
    ADD COLUMN IF NOT EXISTS is_reservation BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS callback_payload JSONB;

-- Indexes for payment lookup
CREATE INDEX IF NOT EXISTS idx_orders_authority ON public.orders (authority);
CREATE INDEX IF NOT EXISTS idx_orders_ref_id ON public.orders (ref_id);
CREATE INDEX IF NOT EXISTS idx_orders_is_reservation ON public.orders (is_reservation);

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
    ADD COLUMN IF NOT EXISTS map_embed_url TEXT;

-- Backfill existing courses
UPDATE public.courses
SET in_person_available = TRUE,
    online_available = TRUE
WHERE in_person_available IS NULL OR online_available IS NULL;

-- ============================================================================
-- 4) ORDERS RLS - SERVICE ROLE ONLY FOR WRITES
-- ============================================================================
-- Ensure orders can only be read/written by service role (server-side)
-- Public can only insert via API routes that use service role
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

-- ============================================================================
-- 5) HELPER FUNCTION FOR ORDER CREATION (service role usage)
-- ============================================================================
-- This function can be called via Supabase RPC if needed, but we'll use
-- direct service role client in API routes instead.

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Verify tables and columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orders'
ORDER BY ordinal_position;

SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'payment_logs';

SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'courses'
AND column_name IN ('in_person_available', 'online_available', 'instructor_bio', 'audience', 'curriculum', 'requirements', 'venue_details', 'map_embed_url');

-- Verify RLS
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('orders', 'payment_logs');

-- Verify policies
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('orders', 'payment_logs');