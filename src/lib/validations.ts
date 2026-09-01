import { z } from 'zod';

const iranianPhoneRegex = /^09\d{9}$/;

export const registrationSchema = z.object({
  courseId: z
    .string()
    .min(1, { message: 'انتخاب دوره الزامی است.' }),

  phoneNumber: z
    .string()
    .min(1, { message: 'وارد کردن شماره موبایل الزامی است.' })
    .regex(iranianPhoneRegex, { message: 'شماره موبایل باید معتبر و ۱۱ رقمی باشد (مثال: 09123456789).' }),

  registrationType: z
    .enum(['in_person', 'online'], {
      required_error: 'لطفاً نوع برگزاری را انتخاب کنید.',
      invalid_type_error: 'نوع برگزاری نامعتبر است.',
    }),

  paymentMode: z
    .enum(['cash', 'installment'], {
      required_error: 'لطفاً نحوه پرداخت (نقدی یا اقساطی) را انتخاب کنید.',
      invalid_type_error: 'نحوه پرداخت نامعتبر است.',
    }),
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;