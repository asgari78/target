'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/src/lib/supabaseClient';
import { cn } from '@/src/lib/utils';
import type { Course, PaymentMode, RegistrationType } from '../../types';

const phoneSchema = z.object({
  phone: z
    .string()
    .regex(/^09\d{9}$/, 'شماره همراه معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹)'),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;

interface RegistrationFormProps {
  course: Course;
  registrationType: RegistrationType;
  paymentMode: PaymentMode;
  onSuccess: () => void;
}

export default function RegistrationForm({
  course,
  registrationType,
  paymentMode,
  onSuccess,
}: RegistrationFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PhoneFormValues>({ resolver: zodResolver(phoneSchema) });

  const onSubmit = async (values: PhoneFormValues) => {
    setServerError(null);
    const { error } = await supabase
      .from('registration_requests')
      .insert({
        course_id: course.id,
        phone_number: values.phone,
        registration_type: registrationType,
        payment_mode: paymentMode,
      });

    if (error) {
      if (error.code === '23505') {
        setServerError('این شماره قبلاً برای این دوره ثبت‌نام کرده است.');
      } else {
        setServerError('خطا در ثبت درخواست. لطفاً دوباره تلاش کنید.');
      }
      return;
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
      <div>
        <label
          htmlFor="phone"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          شماره همراه
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          dir="ltr"
          placeholder="09xxxxxxxxx"
          className={cn(
            'w-full rounded-xl border bg-white px-4 py-3 text-center text-lg tracking-widest text-slate-900 outline-none transition',
            'placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
            errors.phone ? 'border-red-400' : 'border-slate-300',
          )}
          {...register('phone')}
        />
        {errors.phone && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.phone.message}
          </p>
        )}
      </div>

      {serverError && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3',
          'font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]',
          'disabled:cursor-not-allowed disabled:opacity-60',
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            در حال ثبت...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            ثبت‌نام اولیه
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-500">
        پس از ثبت، پشتیبانی موسسه برای تکمیل ثبت‌نام با شما تماس می‌گیرد.
      </p>
    </form>
  );
}
