-- ============================================================================
-- Re-backfill course_offerings and installments with updated course prices
-- ============================================================================

-- Re-insert/update course offerings from existing courses data
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

-- Regenerate installments with 20% uplift rule
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
