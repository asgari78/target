import { z } from 'zod';

/** Accepts 09xxxxxxxxx and +989xxxxxxxxx (Iranian mobile formats). */
export const iranianMobileRegex = /^(?:\+98|09)9\d{8}$/;

/** Normalizes +98xxxxxxxxxx to 09xxxxxxxxxx. */
export function normalizeMobile(value: string): string {
  const trimmed = value.replace(/[\s-]/g, '');
  if (/^\+989\d{8}$/.test(trimmed)) return '0' + trimmed.slice(3);
  return trimmed;
}

/** Schema for the simplified registration form (name + phone only). */
export const registrationSchema = z.object({
  studentName: z
    .string()
    .trim()
    .min(2, { message: 'نام کامل حداقل ۲ کاراکتر است.' })
    .max(120, { message: 'نام کامل حداکثر ۱۲۰ کاراکتر است.' }),

  phoneNumber: z
    .string()
    .trim()
    .min(1, { message: 'وارد کردن شماره موبایل الزامی است.' })
    .regex(iranianMobileRegex, {
      message: 'شماره موبایل معتبر نیست (مثال: 09123456789 یا +989123456789).',
    })
    .transform(normalizeMobile),

  paymentMode: z.enum(['cash', 'installment']).optional(),
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;

/** Schema for order creation API (includes paymentMode as required). */
export const createOrderSchema = registrationSchema.extend({
  courseId: z.string().uuid({ message: 'شناسه دوره نامعتبر است.' }),
  registrationType: z.enum(['in_person', 'online'], {
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
  registrationType: z.enum(['in_person', 'online'], {
    required_error: 'لطفاً نوع برگزاری را انتخاب کنید.',
    invalid_type_error: 'نوع برگزاری نامعتبر است.',
  }),
});

export type CreateReservationValues = z.infer<typeof createReservationSchema>;