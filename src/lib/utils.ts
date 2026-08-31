import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Course, InstallmentPlan, Installment } from '@/src/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return new Intl.NumberFormat('fa-IR').format(Number(value));
}

const INSTALLMENT_LABELS = [
  'پیش‌پرداخت',
  'یک ماه بعد از ثبت‌نام',
  'دو ماه بعد از ثبت‌نام',
  'سه ماه بعد از ثبت‌نام',
  'قهر ماه بعد از ثبت‌نام',
  'پنج ماه بعد از ثبت‌نام',
];

export function calculateInstallment(
  basePrice: number,
  months: number,
  surchargePercent = 20,
): InstallmentPlan {
  const price = Number(basePrice);
  const surcharge = Number(surchargePercent);
  const total = Math.round(price * (1 + surcharge / 100));
  const per = Math.round(total / months);
  const items: Installment[] = Array.from({ length: months }, (_, i) => ({
    label: INSTALLMENT_LABELS[i] ?? `${i + 1} ماه بعد از ثبت‌نام`,
    amount: per,
  }));
  return { total, perInstallment: per, items };
}

export function getBasePrice(course: Course, type: 'in_person' | 'online'): number {
  return type === 'in_person' ? course.priceInPerson : course.priceOnline;
}

export function getInstallmentMonths(course: Course): number {
  return course.installmentMonths;
}

export function getSurchargePercent(course: Course): number {
  return course.installmentSurchargePercent;
}