import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { verifyPayment } from '@/src/lib/server/zarinpal';

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
    // Fetch order to get amount
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return NextResponse.redirect(`${frontendUrl}failed&error=order_not_found`);
    }

    // If status is not OK, mark as failed
    if (status !== 'OK') {
      await supabaseAdmin
        .from('orders')
        .update({ 
          status: 'failed', 
          authority,
          callback_payload: { status, authority },
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      await supabaseAdmin.from('payment_logs').insert({
        order_id: orderId,
        event: 'payment_cancelled',
        payload: { status, authority },
      });

      return NextResponse.redirect(`${frontendUrl}cancelled`);
    }

    // Verify payment with Zarinpal
    // Note: Zarinpal expects amount in Rials (1 Toman = 10 Rials)
    const verifyResponse = await verifyPayment({
      amount: order.total_amount / 10,
      authority,
    });

    if (verifyResponse.errors) {
      // Payment verification failed
      await supabaseAdmin
        .from('orders')
        .update({ 
          status: 'failed', 
          authority,
          callback_payload: verifyResponse,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      await supabaseAdmin.from('payment_logs').insert({
        order_id: orderId,
        event: 'verification_failed',
        payload: verifyResponse,
      });

      return NextResponse.redirect(`${frontendUrl}failed&error=verification_failed`);
    }

    // Payment successful
    const refId = verifyResponse.data?.ref_id;

    await supabaseAdmin
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

    await supabaseAdmin.from('payment_logs').insert({
      order_id: orderId,
      event: 'payment_verified',
      payload: verifyResponse,
    });

    // Also create/update registration_request if needed
    await supabaseAdmin.from('registration_requests').upsert({
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
    
    await supabaseAdmin.from('payment_logs').insert({
      order_id: orderId,
      event: 'callback_error',
      payload: { error: String(error), authority, status },
    }).catch(() => {});

    return NextResponse.redirect(`${frontendUrl}failed&error=callback_error`);
  }
}