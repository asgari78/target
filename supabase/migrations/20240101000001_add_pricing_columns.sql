-- ============================================================================
-- PHASE 1 - Add pricing columns to courses table
-- ============================================================================

-- Add original prices and discount percentages
ALTER TABLE public.courses
    ADD COLUMN IF NOT EXISTS price_in_person BIGINT NOT NULL DEFAULT 0 CHECK (price_in_person >= 0),
    ADD COLUMN IF NOT EXISTS price_online BIGINT NOT NULL DEFAULT 0 CHECK (price_online >= 0),
    ADD COLUMN IF NOT EXISTS original_price_in_person BIGINT CHECK (original_price_in_person IS NULL OR original_price_in_person >= 0),
    ADD COLUMN IF NOT EXISTS discount_percent_in_person NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent_in_person >= 0 AND discount_percent_in_person <= 100),
    ADD COLUMN IF NOT EXISTS original_price_online BIGINT CHECK (original_price_online IS NULL OR original_price_online >= 0),
    ADD COLUMN IF NOT EXISTS discount_percent_online NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent_online >= 0 AND discount_percent_online <= 100),
    ADD COLUMN IF NOT EXISTS installments_count INTEGER NOT NULL DEFAULT 4 CHECK (installments_count >= 2 AND installments_count <= 12),
    ADD COLUMN IF NOT EXISTS installment_interest_pct NUMERIC(5,2) NOT NULL DEFAULT 20.00 CHECK (installment_interest_pct >= 0);

-- Backfill with default values for existing courses
UPDATE public.courses
SET 
    price_in_person = COALESCE(price_in_person, 5000000),
    price_online = COALESCE(price_online, 3500000),
    original_price_in_person = COALESCE(original_price_in_person, price_in_person),
    original_price_online = COALESCE(original_price_online, price_online),
    installments_count = COALESCE(installments_count, 4),
    installment_interest_pct = COALESCE(installment_interest_pct, 20.00);

-- Set specific prices for known courses
UPDATE public.courses SET
    price_in_person = 15000000,
    price_online = 8000000,
    original_price_in_person = 15000000,
    original_price_online = 8000000,
    installments_count = 4,
    installment_interest_pct = 20.00
WHERE slug = 'tizhoshan-6th-comprehensive';

UPDATE public.courses SET
    price_in_person = 5000000,
    price_online = 3500000,
    original_price_in_person = 5000000,
    original_price_online = 3500000,
    installments_count = 4,
    installment_interest_pct = 20.00
WHERE slug = 'tizhoshan-advanced-math';

UPDATE public.courses SET
    price_in_person = 5000000,
    price_online = 3500000,
    original_price_in_person = 5000000,
    original_price_online = 3500000,
    installments_count = 6,
    installment_interest_pct = 20.00
WHERE slug = 'math-6th-comprehensive';

UPDATE public.courses SET
    price_in_person = 5000000,
    price_online = 3500000,
    original_price_in_person = 5000000,
    original_price_online = 3500000,
    installments_count = 6,
    installment_interest_pct = 20.00
WHERE slug = 'math-5th-comprehensive';

UPDATE public.courses SET
    price_in_person = 5000000,
    price_online = 3500000,
    original_price_in_person = 5000000,
    original_price_online = 3500000,
    installments_count = 6,
    installment_interest_pct = 20.00
WHERE slug = 'math-4th-comprehensive';

-- Add student_name to registration_requests
ALTER TABLE public.registration_requests
    ADD COLUMN IF NOT EXISTS student_name TEXT NOT NULL DEFAULT '' CHECK (char_length(student_name) <= 120);

-- Relax phone_number CHECK on registration_requests to accept +98 and 09
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
