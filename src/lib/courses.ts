import { supabase } from './supabaseClient';
import type { Course, CourseRow } from '@/src/types';

export function mapCourse(row: CourseRow): Course {
  return {
    id: row.id,
    title: row.title,
    instructorName: row.instructor_name,
    sessionsCount: row.sessions_count,
    sessionDuration: row.session_duration,
    locationInPerson: row.location_in_person,
    locationOnline: row.location_online,
    priceInPerson: Number(row.price_in_person),
    priceOnline: Number(row.price_online),
    installmentSurchargePercent: Number(row.installment_surcharge_percent),
    installmentMonths: row.installment_months as 4 | 6,
    description: row.description,
    courseImageUrl: row.course_image_url,
    instructorImageUrl: row.instructor_image_url,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
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