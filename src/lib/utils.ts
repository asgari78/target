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
  'چهار ماه بعد از ثبت‌نام',
  'پنج ماه بعد از ثبت‌نام',
  'شش ماه بعد از ثبت‌نام',
  'هفت ماه بعد از ثبت‌نام',
  'هشت ماه بعد از ثبت‌نام',
  'نه ماه بعد از ثبت‌نام',
  'ده ماه بعد از ثبت‌نام',
  'یازده ماه بعد از ثبت‌نام',
];

export function calculateInstallment(
  basePrice: number,
  months: number,
  interestPct = 20,
): InstallmentPlan {
  const price = Number(basePrice);
  const interest = Number(interestPct);
  const total = Math.round(price * (1 + interest / 100));
  const per = Math.round(total / months);
  const items: Installment[] = Array.from({ length: months }, (_, i) => ({
    label: INSTALLMENT_LABELS[i] ?? `${i + 1} ماه بعد از ثبت‌نام`,
    amount: per,
  }));
  // Adjust last installment to account for rounding
  const sum = items.reduce((acc, item) => acc + item.amount, 0);
  if (sum !== total) {
    items[items.length - 1].amount += total - sum;
  }
  return { total, perInstallment: per, items };
}

export function getBasePrice(course: Course, type: 'in_person' | 'online'): number {
  return type === 'in_person' ? course.priceInPerson : course.priceOnline;
}

export function getInstallmentMonths(course: Course): number {
  return course.installmentsCount;
}

export function getInterestPercent(course: Course): number {
  return course.installmentInterestPct;
}

export function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m} دقیقه`;
  if (m === 0) return `${h} ساعت`;
  return `${h}:${m.toString().padStart(2, '0')} ساعت`;
}