import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';

export const runtime = 'nodejs';

interface CreateReservationRequest {
  courseId: string;
  studentName: string;
  phoneNumber: string;
  registrationType: 'in_person' | 'online';
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateReservationRequest = await request.json();

    // Validate required fields
    if (!body.courseId || !body.studentName || !body.phoneNumber || !body.registrationType) {
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

    // Create reservation order (free, no payment)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        course_id: body.courseId,
        phone_number: body.phoneNumber,
        student_name: body.studentName,
        registration_type: body.registrationType,
        payment_mode: 'cash',
        base_amount: 0,
        original_amount: null,
        discount_percent: 0,
        interest_percent: 0,
        total_amount: 0,
        installments_count: 1,
        installment_index: 1,
        status: 'paid', // Reservation is considered "paid" (free)
        is_reservation: true,
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      if (orderError.code === '23505') {
        return NextResponse.json({ error: 'This phone number already has a reservation for this course' }, { status: 409 });
      }
      console.error('Reservation creation error:', orderError);
      return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
    }

    // Log reservation
    await supabaseAdmin.from('payment_logs').insert({
      order_id: order.id,
      event: 'reservation_created',
      payload: { courseId: body.courseId, registrationType: body.registrationType },
    });

    // Also create registration request
    await supabaseAdmin.from('registration_requests').upsert({
      course_id: body.courseId,
      phone_number: body.phoneNumber,
      student_name: body.studentName,
      registration_type: body.registrationType,
      payment_mode: 'cash',
      status: 'new',
    }, {
      onConflict: 'course_id,phone_number',
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: 'رزرو رایگان با موفقیت ثبت شد',
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}