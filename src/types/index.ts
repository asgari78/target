export type PaymentMode = 'cash' | 'installment';
export type RegistrationType = 'in_person' | 'online';
export type AttendanceType = 'In-person' | 'Online';
export type PaymentMethod = 'Cash' | 'Installment';

export interface Instructor {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Course {
  id: string;
  title: string;
  instructorName: string;
  sessionsCount: number;
  sessionDuration: number;
  locationInPerson: string | null;
  locationOnline: string | null;
  priceInPerson: number;
  priceOnline: number;
  installmentSurchargePercent: number;
  installmentMonths: 4 | 6;
  description: string | null;
  courseImageUrl: string | null;
  instructorImageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface CourseRow {
  id: string;
  title: string;
  instructor_name: string;
  sessions_count: number;
  session_duration: number;
  location_in_person: string | null;
  location_online: string | null;
  price_in_person: number;
  price_online: number;
  installment_surcharge_percent: number;
  installment_months: number;
  description: string | null;
  course_image_url: string | null;
  instructor_image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
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

export interface EnrollmentRequestInsert {
  phone_number: string;
  course_name: string;
  instructor_name: string;
  attendance_type: AttendanceType;
  payment_method: PaymentMethod;
}

export interface EnrollmentRequestRow {
  id: string;
  phone_number: string;
  course_name: string;
  instructor_name: string;
  attendance_type: AttendanceType;
  payment_method: PaymentMethod;
  created_at: string;
}