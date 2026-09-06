import { supabaseClient } from './supabaseClient';
import type { Course, CourseRow, CourseOffering, CourseOfferingRow, Installment, InstallmentRow } from '@/src/types';

export function mapCourse(row: CourseRow): Course {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    grade: row.grade,
    instructorName: row.instructor_name,
    instructorImageUrl: row.instructor_image_url,
    instructorBio: row.instructor_bio,
    audience: row.audience,
    curriculum: row.curriculum,
    requirements: row.requirements,
    venueDetails: row.venue_details,
    mapEmbedUrl: row.map_embed_url,
    coverImageUrl: row.cover_image_url,
    sessionsCount: row.sessions_count,
    sessionHours: row.session_hours,
    scheduleText: row.schedule_text,
    startDate: row.start_date,
    locationInPerson: row.location_in_person,
    locationOnline: row.location_online,
    priceInPerson: 0, // ✅ جدید: از courseOfferings استفاده کنید
    priceOnline: 0,
    originalPriceInPerson: null,
    discountPercentInPerson: 0,
    originalPriceOnline: null,
    discountPercentOnline: 0,
    installmentsCount: row.installments_count,
    installmentInterestPct: row.installment_interest_pct,
    inPersonAvailable: row.in_person_available,
    onlineAvailable: row.online_available,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    courseOfferings: [], // ✅ همیشه پر می‌شود
  };
}

export function mapCourseOffering(row: CourseOfferingRow): CourseOffering {
  return {
    id: row.id,
    courseId: row.course_id,
    attendanceMode: row.attendance_mode,
    cashPriceBeforeDiscount: Number(row.cash_price_before_discount),
    cashPriceAfterDiscount: Number(row.cash_price_after_discount),
    installmentsCount: row.installments_count,
    installmentInterestPct: Number(row.installment_interest_pct),
    isAvailable: row.is_available,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapInstallment(row: InstallmentRow): Installment {
  return {
    id: row.id,
    offeringId: row.offering_id,
    sequenceNumber: row.sequence_number,
    label: row.label,
    amountBeforeDiscount: Number(row.amount_before_discount),
    amountAfterDiscount: Number(row.amount_after_discount),
    dueMonthOffset: row.due_month_offset,
    isDownPayment: row.is_down_payment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchActiveCourses(): Promise<Course[]> {
  const { data, error } = await supabaseClient
    .from('courses')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw new Error('خطا در دریافت دوره‌ها: ' + error.message);
  return (data ?? []).map(mapCourse);
}

export async function fetchCourseBySlug(slug: string): Promise<Course | null> {
  const { data, error } = await supabaseClient
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error('خطا در دریافت دوره: ' + error.message);
  }
  return data ? mapCourse(data) : null;
}

export async function fetchCourseById(id: string): Promise<Course | null> {
  const { data, error } = await supabaseClient
    .from('courses')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error('خطا در دریافت دوره: ' + error.message);
  }
  return data ? mapCourse(data) : null;
}

export async function fetchCourseWithOfferings(courseId: string): Promise<Course | null> {
  const { data: courseData, error: courseError } = await supabaseClient
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .eq('is_active', true)
    .single();

  if (courseError) {
    if (courseError.code === 'PGRST116') return null;
    throw new Error('خطا در دریافت دوره: ' + courseError.message);
  }

  if (!courseData) return null;
  const course = mapCourse(courseData);

  const { data: offeringsData, error: offeringsError } = await supabaseClient
    .from('course_offerings')
    .select('*')
    .eq('course_id', courseId)
    .eq('is_available', true)
    .order('sort_order', { ascending: true });

  if (offeringsError) {
    throw new Error('خطا در دریافت پیشنهادات دوره: ' + offeringsError.message);
  }

  const offerings: CourseOffering[] = [];
  for (const offeringRow of offeringsData ?? []) {
    const offering = mapCourseOffering(offeringRow);
    const { data: installmentsData } = await supabaseClient
      .from('installments')
      .select('*')
      .eq('offering_id', offering.id)
      .order('sequence_number', { ascending: true });

    offering.installments = (installmentsData ?? []).map(mapInstallment);
    offerings.push(offering);
  }

  course.courseOfferings = offerings;
  return course;
}

export async function fetchCourseBySlugWithOfferings(slug: string): Promise<Course | null> {
  const { data: courseData } = await supabaseClient
    .from('courses')
    .select('id')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!courseData) return null;
  return fetchCourseWithOfferings(courseData.id);
}
