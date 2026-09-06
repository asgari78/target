import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Course, CourseOffering, RegistrationType, OrderPricingResult, AttendanceMode } from '@/src/types';
import { calculateOrderPricing, calculateOrderPricingFromOffering, formatPrice as formatPriceUtil, formatJalaliDate } from '@/src/lib/pricing';

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

/** @deprecated Use getOfferingForMode instead */
export function getBasePrice(course: Course, type: RegistrationType): number {
  return type === 'in_person' ? course.priceInPerson : course.priceOnline;
}

/** @deprecated Use getOfferingForMode instead */
export function getOriginalPrice(course: Course, type: RegistrationType): number {
  const original = type === 'in_person' ? course.originalPriceInPerson : course.originalPriceOnline;
  return original ?? getBasePrice(course, type);
}

/** @deprecated Use getOfferingForMode instead */
export function getDiscountPercent(course: Course, type: RegistrationType): number {
  return type === 'in_person' ? course.discountPercentInPerson : course.discountPercentOnline;
}

/** @deprecated Use getOfferingForMode instead */
export function getInstallmentMonths(course: Course): number {
  return course.installmentsCount;
}

/** @deprecated Use calculatePricingFromOffering instead */
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

/** New schema: Get offering for a specific attendance mode */
export function getOfferingForMode(course: Course, mode: AttendanceMode): CourseOffering | null {
  if (!course.courseOfferings) return null;
  return course.courseOfferings.find(o => o.attendanceMode === mode && o.isAvailable) ?? null;
}

/** New schema: Check if an offering is available */
export function isOfferingAvailable(offering: CourseOffering | null): boolean {
  return offering?.isAvailable ?? false;
}

/** New schema: Calculate pricing from offering and its installments */
export function calculatePricingFromOffering(
  offering: CourseOffering,
  paymentMode: 'cash' | 'installment'
): OrderPricingResult {
  return calculateOrderPricingFromOffering(offering, offering.installments ?? [], paymentMode);
}

/** New schema: Get first installment amount for display */
export function getFirstInstallmentAmount(offering: CourseOffering): number {
  if (!offering.installments || offering.installments.length === 0) return 0;
  const firstInstallment = offering.installments.find(i => i.isDownPayment) 
    ?? offering.installments[0];
  return firstInstallment.amountAfterDiscount;
}

/** New schema: Get installment items for display */
export function getInstallmentItemsForDisplay(offering: CourseOffering): Array<{
  index: number;
  label: string;
  amountBeforeDiscount: number;
  amountAfterDiscount: number;
  isDownPayment: boolean;
}> {
  if (!offering.installments) return [];
  return [...offering.installments]
    .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
    .map(inst => ({
      index: inst.sequenceNumber,
      label: inst.label,
      amountBeforeDiscount: inst.amountBeforeDiscount,
      amountAfterDiscount: inst.amountAfterDiscount,
      isDownPayment: inst.isDownPayment,
    }));
}

export { formatJalaliDate };

/** Normalize Persian/Arabic digits to English digits */
export function normalizeDigits(value: string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let result = value;
  persianDigits.forEach((d, i) => { result = result.replace(new RegExp(d, 'g'), String(i)); });
  arabicDigits.forEach((d, i) => { result = result.replace(new RegExp(d, 'g'), String(i)); });
  return result;
}

/** Calculate discount percentage for display badge */
export function calculateDiscountBadge(originalPrice: number, discountedPrice: number): number {
  if (originalPrice <= 0 || discountedPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}