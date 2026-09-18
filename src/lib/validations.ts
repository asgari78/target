import { z } from 'zod';

/**
 * تبدیل ارقام فارسی و عربی به انگلیسی
 */
export function toEnglishDigits(str: string): string {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728))
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1584));
}

/** پاکسازی فاصله‌ها، خط تیره‌ها و تبدیل به ارقام انگلیسی */
export function normalizeMobile(value: string): string {
  if (!value) return '';
  return toEnglishDigits(value).replace(/[\s-]/g, '').trim();
}

/** Schema for the simplified registration form (name + phone only). */
export const registrationSchema = z.object({
  studentName: z
    .string({ required_error: 'وارد کردن نام الزامی است.' })
    .trim()
    .min(2, { message: 'نام کامل حداقل ۲ کاراکتر است.' })
    .max(120, { message: 'نام کامل حداکثر ۱۲۰ کاراکتر است.' }),

  phoneNumber: z
    .string({ required_error: 'وارد کردن شماره موبایل الزامی است.' })
    .trim()
    .min(1, { message: 'وارد کردن شماره موبایل الزامی است.' })
    .refine(
      (val) => {
        const cleaned = normalizeMobile(val);
        // فقط دو شرط: با 09 شروع شود و دقیقا ۱۱ رقم باشد
        return /^09\d{9}$/.test(cleaned);
      },
      {
        message: 'شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.',
      }
    ),

  paymentMode: z.enum(['cash', 'installment']).optional(),
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;

/** Schema for order creation API (includes paymentMode as required). */
export const createOrderSchema = registrationSchema.extend({
  courseId: z.string().uuid({ message: 'شناسه دوره نامعتبر است.' }),
  registrationType: z.enum(['in_person', 'online', 'ofline'], {
    required_error: 'لطفاً نوع برگزاری را انتخاب کنید.',
    invalid_type_error: 'نوع برگزاری نامعتبر است.',
  }),
  paymentMode: z.enum(['cash', 'installment'], {
    required_error: 'لطفاً نحوه پرداخت را انتخاب کنید.',
    invalid_type_error: 'نحوه پرداخت نامعتبر است.',
  }),
});

export type CreateOrderValues = z.infer<typeof createOrderSchema>;

/** Schema for reservation API. */
export const createReservationSchema = registrationSchema.extend({
  courseId: z.string().uuid({ message: 'شناسه دوره نامعتبر است.' }),
  registrationType: z.enum(['in_person', 'online', 'ofline'], {
    required_error: 'لطفاً نوع برگزاری را انتخاب کنید.',
    invalid_type_error: 'نوع برگزاری نامعتبر است.',
  }),
});

export type CreateReservationValues = z.infer<typeof createReservationSchema>;
