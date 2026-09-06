import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';

export const runtime = 'nodejs';

interface CreateConsultationRequest {
  courseId: string;
  studentName: string;
  phoneNumber: string;
  registrationType: 'in_person' | 'online';
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateConsultationRequest = await request.json();

    // Validate required fields
    if (!body.courseId || !body.studentName || !body.phoneNumber || !body.registrationType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch course to check availability
    const { data: course, error: courseError } = await supabaseAdmin()
      .from('courses')
      .select('id, title, in_person_available, online_available')
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

    // Create consultation request
    const { data: consultation, error: consultationError } = await supabaseAdmin()
      .from('registration_requests')
      .insert({
        course_id: body.courseId,
        phone_number: body.phoneNumber,
        student_name: body.studentName,
        registration_type: body.registrationType,
        payment_mode: 'cash', // Consultation is free, payment mode not applicable
        status: 'new',
      })
      .select()
      .single();

    if (consultationError) {
      if (consultationError.code === '23505') {
        return NextResponse.json({ error: 'This phone number already has a consultation request for this course' }, { status: 409 });
      }
      console.error('Consultation creation error:', consultationError);
      return NextResponse.json({ error: 'Failed to create consultation request' }, { status: 500 });
    }

    // Log consultation
    await supabaseAdmin().from('payment_logs').insert({
      order_id: consultation.id,
      event: 'consultation_created',
      payload: { courseId: body.courseId, registrationType: body.registrationType },
    });

    return NextResponse.json({
      success: true,
      consultationId: consultation.id,
      message: 'درخواست مشاوره با موفقیت ثبت شد',
    });
  } catch (error) {
    console.error('Create consultation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}