import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { requestPayment, getPaymentUrl } from '@/src/lib/server/zarinpal';
import { calculateOrderPricing, OrderPricingInput } from '@/src/lib/pricing';

export const runtime = 'nodejs';

interface CreateOrderRequest {
  courseId: string;
  studentName: string;
  phoneNumber: string;
  registrationType: 'in_person' | 'online';
  paymentMode: 'cash' | 'installment';
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json();

    // Validate required fields
    if (!body.courseId || !body.studentName || !body.phoneNumber || !body.registrationType || !body.paymentMode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch course details
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', body.courseId)
      .eq('is_active', true)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check mode availability
    const modeAvailable = body.registrationType === 'in_person' 
      ? course.in_person_available 
      : course.online_available;

    if (!modeAvailable) {
      return NextResponse.json({ error: 'This mode is not available for this course' }, { status: 400 });
    }

    // Calculate pricing server-side
    const pricingInput: OrderPricingInput = {
      basePrice: body.registrationType === 'in_person' ? Number(course.price_in_person) : Number(course.price_online),
      originalPrice: body.registrationType === 'in_person' 
        ? (course.original_price_in_person ? Number(course.original_price_in_person) : null)
        : (course.original_price_online ? Number(course.original_price_online) : null),
      discountPercent: body.registrationType === 'in_person' 
        ? Number(course.discount_percent_in_person ?? 0)
        : Number(course.discount_percent_online ?? 0),
      installmentsCount: course.installments_count,
      paymentMode: body.paymentMode,
    };

    const pricing = calculateOrderPricing(pricingInput);

    // Create pending order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        course_id: body.courseId,
        phone_number: body.phoneNumber,
        student_name: body.studentName,
        registration_type: body.registrationType,
        payment_mode: body.paymentMode,
        base_amount: pricing.baseAmount,
        original_amount: pricing.originalAmount,
        discount_percent: pricing.discountPercent,
        interest_percent: 0, // Interest-free
        total_amount: pricing.totalAmount,
        installments_count: body.paymentMode === 'installment' ? course.installments_count : 1,
        installment_index: 1,
        status: 'pending',
        is_reservation: false,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Request payment from Zarinpal
    const description = `ثبت‌نام در ${course.title} (${body.registrationType === 'in_person' ? 'حضوری' : 'آنلاین'})`;
    const callbackUrl = `/api/payments/zarinpal/callback?orderId=${order.id}`;

    const paymentResponse = await requestPayment({
      amount: pricing.totalAmount / 10, // Zarinpal expects amount in Rials (1 Toman = 10 Rials)
      description,
      callbackUrl,
      metadata: {
        mobile: body.phoneNumber,
        orderId: order.id,
        courseId: body.courseId,
        registrationType: body.registrationType,
        paymentMode: body.paymentMode,
      },
    });

    if (paymentResponse.errors) {
      // Update order status to failed
      await supabaseAdmin
        .from('orders')
        .update({ status: 'failed', callback_payload: paymentResponse })
        .eq('id', order.id);

      console.error('Zarinpal request error:', paymentResponse.errors);
      return NextResponse.json({ error: 'Payment initiation failed' }, { status: 500 });
    }

    // Update order with authority
    await supabaseAdmin
      .from('orders')
      .update({ authority: paymentResponse.data?.authority })
      .eq('id', order.id);

    // Log payment initiation
    await supabaseAdmin.from('payment_logs').insert({
      order_id: order.id,
      event: 'payment_requested',
      payload: paymentResponse,
    });

    const payUrl = getPaymentUrl(paymentResponse.data!.authority);

    return NextResponse.json({
      orderId: order.id,
      authority: paymentResponse.data?.authority,
      payUrl,
      amount: pricing.totalAmount,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}