import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { normalizeMobile } from '@/src/lib/validations';

export const runtime = 'nodejs';

interface CreateConsultationRequest {
  courseId: string;
  studentName: string;
  phoneNumber: string;
  registrationType: 'in_person' | 'online' | 'ofline';
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateConsultationRequest = await request.json();

    // Validate required fields
    if (!body.courseId || !body.studentName || !body.phoneNumber || !body.registrationType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Normalize phone number (تبدیل به انگلیسی و حذف فاصله)
    const normalizedPhone = normalizeMobile(body.phoneNumber);

    // اعتبارسنجی ساده: فقط شروع با 09 و دقیقا ۱۱ رقم
    const iranianMobileRegex = /^09\d{9}$/;
    if (!iranianMobileRegex.test(normalizedPhone)) {
      return NextResponse.json({ error: 'شماره موبایل معتبر نیست' }, { status: 400 });
    }

    // Fetch course to check availability
    const { data: course, error: courseError } = await supabaseAdmin()
      .from('courses')
      .select('id, title, in_person_available, online_available, ofline_available')
      .eq('id', body.courseId)
      .eq('is_active', true)
      .single();

    if (courseError || !course) {
      console.error('Course fetch error:', courseError);
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check mode availability
    const setMode = () => {
      if (body.registrationType === 'in_person') {
        return course.in_person_available;
      } else if (body.registrationType === 'online') {
        return course.online_available;
      } else {
        return course.ofline_available;
      }
    };
    const modeAvailable = setMode();

    if (!modeAvailable) {
      return NextResponse.json({ error: 'This mode is not available for this course' }, { status: 400 });
    }

    // Create consultation request - use upsert to handle duplicates gracefully
    const { data: consultation, error: consultationError } = await supabaseAdmin()
      .from('registration_requests')
      .upsert(
        {
          course_id: body.courseId,
          phone_number: normalizedPhone,
          student_name: body.studentName.trim(),
          registration_type: body.registrationType,
          payment_mode: 'cash',
          status: 'new',
        },
        {
          onConflict: 'course_id,phone_number',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (consultationError) {
      console.error('Consultation creation error:', consultationError);
      if (consultationError.code === '23505') {
        return NextResponse.json(
          { error: 'This phone number already has a request for this course' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: 'Failed to create consultation request' }, { status: 500 });
    }

    // Log consultation
    const { error: logError } = await supabaseAdmin().from('payment_logs').insert({
      order_id: consultation.id,
      event: 'consultation_created',
      payload: { courseId: body.courseId, registrationType: body.registrationType },
    });
    if (logError) {
      console.error('Failed to log consultation:', logError);
    }

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
