import { supabase } from './supabaseClient';
import type { Course, CourseRow } from '@/src/types';

export function mapCourse(row: CourseRow): Course {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    grade: row.grade,
    instructorName: row.instructor_name,
    instructorImageUrl: row.instructor_image_url,
    coverImageUrl: row.cover_image_url,
    sessionsCount: row.sessions_count,
    sessionHours: row.session_hours,
    scheduleText: row.schedule_text,
    startDate: row.start_date,
    locationInPerson: row.location_in_person,
    locationOnline: row.location_online,
    priceInPerson: Number(row.price_in_person),
    priceOnline: Number(row.price_online),
    installmentsCount: row.installments_count,
    installmentInterestPct: Number(row.installment_interest_pct),
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchActiveCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw new Error('خطا در دریافت دوره‌ها: ' + error.message);
  return (data ?? []).map(mapCourse);
}

export async function fetchCourseBySlug(slug: string): Promise<Course | null> {
  const { data, error } = await supabase
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