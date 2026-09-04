export interface OrderPricingInput {
  basePrice: number;
  originalPrice: number | null;
  discountPercent: number;
  installmentsCount: number;
  paymentMode: 'cash' | 'installment';
}

export interface InstallmentItem {
  index: number;
  label: string;
  amount: number;
  dueDate: string; // ISO date string
  isDownPayment: boolean;
}

export interface OrderPricingResult {
  baseAmount: number;
  originalAmount: number | null;
  discountPercent: number;
  totalAmount: number;
  installments: InstallmentItem[];
  perInstallmentAmount: number;
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

/**
 * Calculates order pricing with interest-free installments.
 * - Cash mode: returns discounted price
 * - Installment mode: divides discounted price equally across installments (no interest)
 * - Original price is used only for display (strikethrough)
 * - Discount is applied to original price to get base price
 */
export function calculateOrderPricing(input: OrderPricingInput): OrderPricingResult {
  const { basePrice, originalPrice, discountPercent, installmentsCount, paymentMode } = input;
  
  // Determine the effective original price (for display)
  const effectiveOriginalPrice = originalPrice ?? basePrice;
  
  // The base price is already the discounted price (what customer pays)
  const discountedPrice = basePrice;
  
  if (paymentMode === 'cash') {
    return {
      baseAmount: discountedPrice,
      originalAmount: effectiveOriginalPrice,
      discountPercent,
      totalAmount: discountedPrice,
      installments: [
        {
          index: 1,
          label: 'پرداخت نقدی',
          amount: discountedPrice,
          dueDate: new Date().toISOString().split('T')[0],
          isDownPayment: true,
        },
      ],
      perInstallmentAmount: discountedPrice,
    };
  }

  // Installment mode - interest-free
  const n = Math.max(1, installmentsCount);
  const perInstallment = Math.floor(discountedPrice / n);
  const remainder = discountedPrice % n;
  
  const installments: InstallmentItem[] = [];
  const today = new Date();
  
  for (let i = 0; i < n; i++) {
    let amount = perInstallment;
    // Add remainder to the last installment
    if (i === n - 1) {
      amount += remainder;
    }
    
    const dueDate = new Date(today);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    installments.push({
      index: i + 1,
      label: INSTALLMENT_LABELS[i] ?? `${i + 1} ماه بعد از ثبت‌نام`,
      amount,
      dueDate: dueDate.toISOString().split('T')[0],
      isDownPayment: i === 0,
    });
  }

  const totalAmount = installments.reduce((sum, inst) => sum + inst.amount, 0);

  return {
    baseAmount: discountedPrice,
    originalAmount: effectiveOriginalPrice,
    discountPercent,
    totalAmount,
    installments,
    perInstallmentAmount: perInstallment,
  };
}

/**
 * Formats price in Tomans with Persian numerals
 */
export function formatPrice(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return new Intl.NumberFormat('fa-IR').format(Number(value));
}

/**
 * Formats a date in Jalali (Persian) calendar
 * This is a simplified implementation - for production use a proper library like 'jalaali-js'
 */
export function formatJalaliDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    // Simple Gregorian to Jalali conversion approximation
    // For accurate conversion, use 'jalaali-js' package
    const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return formatter.format(date);
  } catch {
    return isoDate;
  }
}

/**
 * Calculates discount percentage from original and discounted price
 */
export function calculateDiscountPercent(original: number, discounted: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - discounted) / original) * 100);
}