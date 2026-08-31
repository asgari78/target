export type PaymentMode = 'cash' | 'installment';
export type RegistrationType = 'in_person' | 'online';

export interface Instructor {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  grade: 'چهارم' | 'پنجم' | 'ششم';
  instructor: Instructor;
  sessionsCount: number;
  sessionHours: number;
  schedule: string;
  startDate: string | null;
  priceInPerson: number;
  priceOnline: number;
  installmentsCount: 4 | 6;
  installmentInterestPct: number;
  coverImage: string;
}

export interface Installment {
  label: string;   // «پیش‌پرداخت» | «یک ماه بعد از ثبت‌نام» | ...
  amount: number;
}

export interface InstallmentPlan {
  total: number;
  perInstallment: number;
  items: Installment[];
}

/** payload ثبت‌نام — snake_case مطابق دیتابیس */
export interface RegistrationRequestInsert {
  course_id: string;
  phone_number: string;
  registration_type: RegistrationType;
  payment_mode: PaymentMode;
}
