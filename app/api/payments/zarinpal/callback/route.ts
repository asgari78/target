import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { verifyPayment } from '@/src/lib/server/zarinpal';
import { formatAmountForZarinpal } from '@/src/lib/pricing';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const authority = searchParams.get('Authority');
  const status = searchParams.get('Status');
  const orderId = searchParams.get('orderId');

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const frontendUrl = `${baseUrl}/?payment_result=`;

  if (!authority || !orderId) {
    return NextResponse.redirect(`${frontendUrl}failed&error=missing_params`);
  }

  try {
    // Fetch order to get amount and details
    const { data: order, error: orderError } = await supabaseAdmin()
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return NextResponse.redirect(`${frontendUrl}failed&error=order_not_found`);
    }

    // If status is not OK, mark as cancelled
    if (status !== 'OK') {
      await supabaseAdmin()
        .from('orders')
        .update({
          status: 'cancelled',
          authority,
          callback_payload: { status, authority },
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      await supabaseAdmin().from('payment_logs').insert({
        order_id: orderId,
        event: 'payment_cancelled',
        payload: { status, authority },
      });

      return NextResponse.redirect(`${frontendUrl}cancelled`);
    }

    // Verify payment with Zarinpal using the exact amount that was charged
    // For installment orders, this is the first installment amount (stored in base_amount for first installment)
    // For cash orders, this is the full amount (stored in base_amount)
    // The amountToCharge is always the base_amount for the first payment
    const amountToVerify = formatAmountForZarinpal(order.base_amount);

    const verifyResponse = await verifyPayment({
      amount: amountToVerify,
      authority,
    });

    if (verifyResponse.errors) {
      // Payment verification failed
      await supabaseAdmin()
        .from('orders')
        .update({
          status: 'failed',
          authority,
          callback_payload: verifyResponse,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      await supabaseAdmin().from('payment_logs').insert({
        order_id: orderId,
        event: 'verification_failed',
        payload: verifyResponse,
      });

      return NextResponse.redirect(`${frontendUrl}failed&error=verification_failed`);
    }

    // Payment successful - check if already processed to prevent duplicate processing
    if (order.status === 'paid') {
      console.log('Order already marked as paid, skipping duplicate processing:', orderId);
      return NextResponse.redirect(`${frontendUrl}success&orderId=${orderId}`);
    }

    const refId = verifyResponse.data?.ref_id;

    // Use a transaction-like approach for critical updates
    // First update order status to paid
    const { error: updateError } = await supabaseAdmin()
      .from('orders')
      .update({
        status: 'paid',
        authority,
        ref_id: refId,
        paid_at: new Date().toISOString(),
        callback_payload: verifyResponse,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to update order status:', updateError);
      // Log but don't fail - payment was verified
    }

    await supabaseAdmin().from('payment_logs').insert({
      order_id: orderId,
      event: 'payment_verified',
      payload: verifyResponse,
    });

    // Create/update registration request
    await supabaseAdmin().from('registration_requests').upsert({
      course_id: order.course_id,
      phone_number: order.phone_number,
      student_name: order.student_name,
      registration_type: order.registration_type,
      payment_mode: order.payment_mode,
      status: 'done',
    }, {
      onConflict: 'course_id,phone_number',
    });

    return NextResponse.redirect(`${frontendUrl}success&orderId=${orderId}`);
  } catch (error) {
    console.error('Callback error:', error);

    await supabaseAdmin().from('payment_logs').insert({
      order_id: orderId,
      event: 'callback_error',
      payload: { error: String(error), authority, status },
    });

    return NextResponse.redirect(`${frontendUrl}failed&error=callback_error`);
  }
}