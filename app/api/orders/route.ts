import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { requestPayment, getPaymentUrl, getConfig } from '@/src/lib/server/zarinpal';
import { calculateOrderPricingFromOffering, formatAmountForZarinpal } from '@/src/lib/pricing';
import { normalizeMobile } from '@/src/lib/validations';

export const runtime = 'nodejs';

interface CreateOrderRequest {
  courseId: string;
  studentName: string;
  phoneNumber: string;
  registrationType: 'in_person' | 'online';
  paymentMode: 'cash' | 'installment';
}

function isMockMode(): boolean {
  const { isConfigured } = getConfig();
  return !isConfigured || process.env.PAYMENT_MODE === 'mock';
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json();

    // Validate required fields
    if (!body.courseId || !body.studentName || !body.phoneNumber || !body.registrationType || !body.paymentMode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Normalize phone number
    const normalizedPhone = normalizeMobile(body.phoneNumber);

    // Validate phone format
    const iranianMobileRegex = /^(?:09)9\d{8}$/;
    if (!iranianMobileRegex.test(normalizedPhone)) {
      return NextResponse.json({ error: 'شماره موبایل معتبر نیست' }, { status: 400 });
    }

    // Fetch course with offerings and installments
    const { data: courseData, error: courseError } = await supabaseAdmin()
      .from('courses')
      .select(`
        *,
        course_offerings!inner (
          *,
          installments (*)
        )
      `)
      .eq('id', body.courseId)
      .eq('is_active', true)
      .eq('course_offerings.attendance_mode', body.registrationType)
      .eq('course_offerings.is_available', true)
      .single();

    if (courseError || !courseData) {
      console.error('Course fetch error:', courseError);
      return NextResponse.json({ error: 'Course not found or mode not available' }, { status: 404 });
    }

    const offering = courseData.course_offerings?.[0];
    if (!offering) {
      return NextResponse.json({ error: 'This mode is not available for this course' }, { status: 400 });
    }

    // Validate payment mode availability
    if (body.paymentMode === 'installment' && (!offering.installments || offering.installments.length === 0)) {
      return NextResponse.json({ error: 'Installment plan not available for this offering' }, { status: 400 });
    }

    // Calculate pricing server-side from stored data
    const pricing = calculateOrderPricingFromOffering(
      {
        cashPriceBeforeDiscount: offering.cash_price_before_discount,
        cashPriceAfterDiscount: offering.cash_price_after_discount,
        installmentsCount: offering.installments_count,
        installmentInterestPct: offering.installment_interest_pct,
      },
      offering.installments ?? [],
      body.paymentMode
    );

    // Determine amount to charge (first installment for installment mode, full amount for cash)
    const amountToCharge = body.paymentMode === 'installment'
      ? (offering.installments?.[0]?.amount_after_discount ?? pricing.baseAmount)
      : pricing.baseAmount;

    // Create pending order
    const firstInstallmentDueDate = body.paymentMode === 'installment' && offering.installments?.[0]?.due_month_offset !== undefined
      ? new Date(Date.now() + offering.installments[0].due_month_offset * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : null;

    const { data: order, error: orderError } = await supabaseAdmin()
      .from('orders')
      .insert({
        course_id: body.courseId,
        phone_number: normalizedPhone,
        student_name: body.studentName.trim(),
        registration_type: body.registrationType,
        payment_mode: body.paymentMode,
        base_amount: pricing.baseAmount,
        original_amount: pricing.originalAmount,
        discount_percent: pricing.discountPercent,
        interest_percent: 0,
        total_amount: pricing.totalAmount,
        installments_count: body.paymentMode === 'installment' ? offering.installments_count : 1,
        installment_index: 1,
        installment_due_date: firstInstallmentDueDate,
        status: 'pending',
        is_reservation: false,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    const mockMode = isMockMode();
    let authority: string | null = null;
    let payUrl: string | null = null;

    if (mockMode) {
      // Mock mode: generate a fake authority and return success without Zarinpal
      authority = `MOCK_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      payUrl = `/test-payment?authority=${authority}&orderId=${order.id}&status=success`;

      // Update order with mock authority
      await supabaseAdmin()
        .from('orders')
        .update({ authority })
        .eq('id', order.id);

      // Log mock payment initiation
      const { error: mockLogError } = await supabaseAdmin().from('payment_logs').insert({
        order_id: order.id,
        event: 'mock_payment_initiated',
        payload: { amount: amountToCharge, authority, mockMode: true },
      });
      if (mockLogError) {
        console.error('Failed to log mock payment:', mockLogError);
      }

      return NextResponse.json({
        orderId: order.id,
        authority,
        payUrl,
        amount: amountToCharge,
        isTest: true,
        mockMode: true,
      });
    }

    // Real mode: Request payment from Zarinpal
    const description = `ثبت‌نام در ${courseData.title} (${body.registrationType === 'in_person' ? 'حضوری' : 'آنلاین'})`;
    const callbackUrl = `/api/payments/zarinpal/callback?orderId=${order.id}`;

    // Zarinpal expects amount in Rials (1 Toman = 10 Rials)
    const zarinpalAmount = formatAmountForZarinpal(amountToCharge);

    const paymentResponse = await requestPayment({
      amount: zarinpalAmount,
      description,
      callbackUrl,
      metadata: {
        mobile: normalizedPhone,
        orderId: order.id,
        courseId: body.courseId,
        registrationType: body.registrationType,
        paymentMode: body.paymentMode,
      },
    });

    if (paymentResponse.errors) {
      // Update order status to failed
      await supabaseAdmin()
        .from('orders')
        .update({ status: 'failed', callback_payload: paymentResponse })
        .eq('id', order.id);

      console.error('Zarinpal request error:', paymentResponse.errors);
      return NextResponse.json({ error: 'Payment initiation failed' }, { status: 500 });
    }

    authority = paymentResponse.data?.authority ?? null;

    // Update order with authority
    await supabaseAdmin()
      .from('orders')
      .update({ authority })
      .eq('id', order.id);

    // Log payment initiation
    const { error: paymentLogError } = await supabaseAdmin().from('payment_logs').insert({
      order_id: order.id,
      event: 'payment_requested',
      payload: paymentResponse,
    });
    if (paymentLogError) {
      console.error('Failed to log payment request:', paymentLogError);
    }

    payUrl = getPaymentUrl(authority!);
    const { isConfigured } = getConfig();

    return NextResponse.json({
      orderId: order.id,
      authority,
      payUrl,
      amount: amountToCharge,
      isTest: !isConfigured,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}