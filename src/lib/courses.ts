import { supabase } from "./supabaseClient";
import type { Course } from '../types';

interface CourseRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  grade: 'چهارم' | 'پنجم' | 'ششم';
  instructor_name: string;
  instructor_image_url: string | null;
  sessions_count: number;
  session_hours: number;
  schedule_text: string | null;
  start_date: string | null;
  price_in_person: number;
  price_online: number;
  installments_count: number;
  installment_interest_pct: number;
  cover_image_url: string | null;
}

export function mapCourse(row: CourseRow): Course {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? '',
    grade: row.grade,
    instructor: {
      id: row.instructor_name, // نام به‌عنوان شناسه در UI کافی است
      name: row.instructor_name,
      imageUrl: row.instructor_image_url ?? '',
    },
    sessionsCount: row.sessions_count,
    sessionHours: row.session_hours,
    schedule: row.schedule_text ?? '',
    startDate: row.start_date,
    priceInPerson: row.price_in_person,
    priceOnline: row.price_online,
    installmentsCount: row.installments_count as 4 | 6,
    installmentInterestPct: row.installment_interest_pct,
    coverImage: row.cover_image_url ?? '',
  };
}

export async function fetchActiveCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw new Error('خطا در دریافت دوره‌ها: ' + error.message);
  return (data ?? []).map(mapCourse);
}