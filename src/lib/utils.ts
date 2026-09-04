import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Course, InstallmentPlan, Installment, RegistrationType, InstallmentItem, OrderPricingResult } from '@/src/types';
import { calculateOrderPricing, formatPrice as formatPriceUtil, formatJalaliDate } from '@/src/lib/pricing';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number | null | undefined): string {
  return formatPriceUtil(value);
}

export function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m} دقیقه`;
  if (m === 0) return `${h} ساعت`;
  return `${h}:${m.toString().padStart(2, '0')} ساعت`;
}

export function getBasePrice(course: Course, type: RegistrationType): number {
  return type === 'in_person' ? course.priceInPerson : course.priceOnline;
}

export function getOriginalPrice(course: Course, type: RegistrationType): number {
  const original = type === 'in_person' ? course.originalPriceInPerson : course.originalPriceOnline;
  return original ?? getBasePrice(course, type);
}

export function getDiscountPercent(course: Course, type: RegistrationType): number {
  return type === 'in_person' ? course.discountPercentInPerson : course.discountPercentOnline;
}

export function getInstallmentMonths(course: Course): number {
  return course.installmentsCount;
}

export function calculateInstallmentPlan(
  course: Course,
  type: RegistrationType,
  paymentMode: 'cash' | 'installment' = 'cash',
): OrderPricingResult {
  return calculateOrderPricing({
    basePrice: getBasePrice(course, type),
    originalPrice: getOriginalPrice(course, type),
    discountPercent: getDiscountPercent(course, type),
    installmentsCount: course.installmentsCount,
    paymentMode,
  });
}

export function isModeAvailable(course: Course, type: RegistrationType): boolean {
  return type === 'in_person' ? course.inPersonAvailable : course.onlineAvailable;
}

export function getAvailableModes(course: Course): RegistrationType[] {
  const modes: RegistrationType[] = [];
  if (course.inPersonAvailable) modes.push('in_person');
  if (course.onlineAvailable) modes.push('online');
  return modes;
}

export function getModeLabel(type: RegistrationType): string {
  return type === 'in_person' ? 'حضوری' : 'آنلاین';
}

export function getModeIcon(type: RegistrationType): 'map-pin' | 'monitor' {
  return type === 'in_person' ? 'map-pin' : 'monitor';
}

export { formatJalaliDate };