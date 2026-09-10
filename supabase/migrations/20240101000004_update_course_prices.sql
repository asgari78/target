-- ============================================================================
-- Update course prices for existing courses
-- ============================================================================

-- Update advanced-math (تیزهوشان پیشرفته)
UPDATE public.courses SET
    price_in_person = 5000000,
    price_online = 3500000,
    original_price_in_person = 5000000,
    original_price_online = 3500000,
    installments_count = 4,
    installment_interest_pct = 20.00
WHERE slug = 'advanced-math';

-- Update math-grade-4 (ریاضیات جامع پایه چهارم)
UPDATE public.courses SET
    price_in_person = 5000000,
    price_online = 3500000,
    original_price_in_person = 5000000,
    original_price_online = 3500000,
    installments_count = 6,
    installment_interest_pct = 20.00
WHERE slug = 'math-grade-4';

-- Update math-grade-5 (ریاضیات جامع پایه پنجم)
UPDATE public.courses SET
    price_in_person = 5000000,
    price_online = 3500000,
    original_price_in_person = 5000000,
    original_price_online = 3500000,
    installments_count = 6,
    installment_interest_pct = 20.00
WHERE slug = 'math-grade-5';

-- Update math-grade-6 (ریاضیات جامع پایه ششم)
UPDATE public.courses SET
    price_in_person = 5000000,
    price_online = 3500000,
    original_price_in_person = 5000000,
    original_price_online = 3500000,
    installments_count = 6,
    installment_interest_pct = 20.00
WHERE slug = 'math-grade-6';

-- Update comprehensive-tizehoushan-6 (دوره جامع تیزهوشان ششم)
UPDATE public.courses SET
    price_in_person = 15000000,
    price_online = 8000000,
    original_price_in_person = 15000000,
    original_price_online = 8000000,
    installments_count = 4,
    installment_interest_pct = 20.00
WHERE slug = 'comprehensive-tizehoushan-6';
