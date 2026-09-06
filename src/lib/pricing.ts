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
  dueDate: string;
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
 * - Installment mode: uses stored installment amounts from database
 * - Original price is used only for display (strikethrough)
 * - Discount is applied to original price to get base price
 */
export function calculateOrderPricing(input: OrderPricingInput): OrderPricingResult {
  const { basePrice, originalPrice, discountPercent, installmentsCount, paymentMode } = input;
  
  const effectiveOriginalPrice = originalPrice ?? basePrice;
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

  // Installment mode - we should use stored installment amounts from database
  // This function is kept for backward compatibility but the new flow
  // reads installments directly from the database
  const n = Math.max(1, installmentsCount);
  const perInstallment = Math.floor(discountedPrice / n);
  const remainder = discountedPrice % n;
  
  const installments: InstallmentItem[] = [];
  const today = new Date();
  
  for (let i = 0; i < n; i++) {
    let amount = perInstallment;
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
 * Calculates order pricing from stored installment data (new schema)
 * This is the authoritative pricing function for the new flow
 */
export function calculateOrderPricingFromOffering(
  offering: {
    cashPriceBeforeDiscount: number;
    cashPriceAfterDiscount: number;
    installmentsCount: number;
    installmentInterestPct: number;
  },
  installments: Array<{
    sequenceNumber: number;
    label: string;
    amountBeforeDiscount: number;
    amountAfterDiscount: number;
    dueMonthOffset: number;
    isDownPayment: boolean;
  }>,
  paymentMode: 'cash' | 'installment'
): OrderPricingResult {
  const { cashPriceBeforeDiscount, cashPriceAfterDiscount } = offering;
  const discountPercent = cashPriceBeforeDiscount > 0
    ? Math.round(((cashPriceBeforeDiscount - cashPriceAfterDiscount) / cashPriceBeforeDiscount) * 100)
    : 0;

  if (paymentMode === 'cash') {
    return {
      baseAmount: cashPriceAfterDiscount,
      originalAmount: cashPriceBeforeDiscount,
      discountPercent,
      totalAmount: cashPriceAfterDiscount,
      installments: [
        {
          index: 1,
          label: 'پرداخت نقدی',
          amount: cashPriceAfterDiscount,
          dueDate: new Date().toISOString().split('T')[0],
          isDownPayment: true,
        },
      ],
      perInstallmentAmount: cashPriceAfterDiscount,
    };
  }

  // Installment mode - use stored after-discount amounts
  // Sort by sequence number to ensure correct order
  const sortedInstallments = [...installments].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  
  const installmentItems: InstallmentItem[] = sortedInstallments.map((inst) => ({
    index: inst.sequenceNumber,
    label: inst.label,
    amount: inst.amountAfterDiscount,
    dueDate: calculateDueDate(inst.dueMonthOffset),
    isDownPayment: inst.isDownPayment,
  }));

  const totalAmount = installmentItems.reduce((sum, inst) => sum + inst.amount, 0);
  const perInstallmentAmount = installmentItems.length > 0 ? installmentItems[0].amount : 0;

  return {
    baseAmount: cashPriceAfterDiscount,
    originalAmount: cashPriceBeforeDiscount,
    discountPercent,
    totalAmount,
    installments: installmentItems,
    perInstallmentAmount,
  };
}

function calculateDueDate(monthOffset: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + monthOffset);
  return date.toISOString().split('T')[0];
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

/**
 * Validates that a monetary amount is a valid positive integer toman
 */
export function validateMonetaryAmount(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 999999999999; // Up to 999 billion tomans
}

/**
 * Formats amount for Zarinpal (converts Tomans to Rials)
 * Zarinpal expects amounts in Rials (1 Toman = 10 Rials)
 */
export function formatAmountForZarinpal(amountInTomans: number): number {
  return Math.round(amountInTomans * 10);
}

/**
 * Formats amount from Zarinpal (converts Rials to Tomans)
 */
export function formatAmountFromZarinpal(amountInRials: number): number {
  return Math.round(amountInRials / 10);
}