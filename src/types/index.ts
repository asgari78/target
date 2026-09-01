export type PaymentMode = 'cash' | 'installment';
export type RegistrationType = 'in_person' | 'online';

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  grade: 'چهارم' | 'پنجم' | 'ششم';
  instructorName: string;
  instructorImageUrl: string | null;
  coverImageUrl: string | null;
  sessionsCount: number;
  sessionHours: number;
  scheduleText: string;
  startDate: string | null;
  locationInPerson: string;
  locationOnline: string;
  priceInPerson: number;
  priceOnline: number;
  installmentsCount: number;
  installmentInterestPct: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  grade: 'چهارم' | 'پنجم' | 'ششم';
  instructor_name: string;
  instructor_image_url: string | null;
  cover_image_url: string | null;
  sessions_count: number;
  session_hours: number;
  schedule_text: string;
  start_date: string | null;
  location_in_person: string;
  location_online: string;
  price_in_person: number;
  price_online: number;
  installments_count: number;
  installment_interest_pct: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Installment {
  label: string;
  amount: number;
}

export interface InstallmentPlan {
  total: number;
  perInstallment: number;
  items: Installment[];
}

export interface RegistrationRequestInsert {
  course_id: string;
  phone_number: string;
  registration_type: RegistrationType;
  payment_mode: PaymentMode;
}

export interface RegistrationRequestRow {
  id: string;
  course_id: string;
  phone_number: string;
  registration_type: RegistrationType;
  payment_mode: PaymentMode;
  status: 'new' | 'contacted' | 'done' | 'rejected';
  created_at: string;
}