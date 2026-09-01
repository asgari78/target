'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, CreditCard } from 'lucide-react';
import { supabase } from '@/src/lib/supabaseClient';
import { cn } from '@/src/lib/utils';
import { registrationSchema, type RegistrationFormValues } from '@/src/lib/validations';
import type { Course, PaymentMode, RegistrationType } from '@/src/types';

interface RegistrationFormProps {
  course: Course;
  registrationType: RegistrationType;
  paymentMode: PaymentMode;
  onPaymentModeChange: (mode: PaymentMode) => void;
  onSuccess: () => void;
}

export default function RegistrationForm({
  course,
  registrationType,
  paymentMode,
  onPaymentModeChange,
  onSuccess,
}: RegistrationFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: {
      phoneNumber: '',
      paymentMode,
    },
  });

  const watchedPaymentMode = watch('paymentMode');
  const watchedPhoneNumber = watch('phoneNumber');

  useEffect(() => {
    onPaymentModeChange(watchedPaymentMode);
  }, [watchedPaymentMode, onPaymentModeChange]);

  const attendanceType = registrationType === 'in_person' ? 'In-person' : 'Online';

  const onSubmit = async (values: RegistrationFormValues) => {
    setServerError(null);
    try {
      const { error } = await supabase
        .from('registration_requests')
        .insert({
          course_id: course.id,
          phone_number: values.phoneNumber,
          registration_type: attendanceType.toLowerCase().replace('-', '_') as 'in_person' | 'online',
          payment_mode: values.paymentMode,
        });

      if (error) {
        if (error.code === '23505') {
          setServerError('این شماره موبایل قبلاً برای این دوره ثبت‌نام کرده است.');
        } else {
          console.error('Registration error:', error);
          setServerError('خطا در ثبت درخواست. لطفاً دوباره تلاش کنید.');
        }
        return;
      }
      setIsSubmitted(true);
      onSuccess();
    } catch (err) {
      console.error('Unexpected error:', err);
      setServerError('خطای غیرمنتظره‌ای رخ داد. لطفاً بعداً تلاش کنید.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-4 text-center py-8" dir="rtl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"
        >
          <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden="true" />
        </motion.div>
        <h3 className="text-xl font-bold text-navy-900">ثبت‌نام با موفقیت انجام شد</h3>
        <p className="text-navy-600">
          درخواست ثبت‌نام شما برای دوره «{course.title}» ({registrationType === 'in_person' ? 'حضوری' : 'آنلاین'}) دریافت شد.
        </p>
        <p className="text-sm text-navy-500 mt-2">
          پشتیبانی موسسه در سریع‌ترین وقت با شما تماس خواهد گرفت.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl" noValidate>
      <div>
        <label
          htmlFor="phone"
          className="mb-1.5 block text-sm font-medium text-navy-700"
        >
          شماره همراه <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            dir="ltr"
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            className={cn(
              'w-full rounded-xl border bg-white px-4 py-3.5 text-center text-lg tracking-widest text-navy-900 outline-none transition',
              'placeholder:text-navy-400 focus:border-navy-500 focus:ring-2 focus:ring-navy-100',
              errors.phoneNumber ? 'border-red-400' : 'border-navy-200',
            )}
            {...register('phoneNumber')}
            aria-invalid={errors.phoneNumber ? 'true' : 'false'}
            aria-describedby={errors.phoneNumber ? 'phone-error' : undefined}
            autoComplete="tel"
          />
          <AnimatePresence>
            {errors.phoneNumber && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500"
              >
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {errors.phoneNumber && (
          <motion.p
            id="phone-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 flex items-center gap-1 text-xs text-red-600"
            role="alert"
          >
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {errors.phoneNumber.message}
          </motion.p>
        )}
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-2 block text-sm font-medium text-navy-700">
          نحوه پرداخت <span className="text-red-500" aria-hidden="true">*</span>
        </legend>
        <div className="relative flex w-full max-w-sm rounded-2xl bg-navy-50 p-1.5 shadow-inner" dir="rtl">
          {[
            { id: 'cash' as PaymentMode, label: 'نقدی', icon: CreditCard },
            { id: 'installment' as PaymentMode, label: `اقساط (${course.installmentsCount} مرحله)`, icon: CreditCard },
          ].map((option) => {
            const isSelected = watchedPaymentMode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {}}
                className={cn(
                  'relative z-10 flex flex-1 items-center justify-center rounded-xl py-3 text-sm font-bold transition-colors duration-200',
                  isSelected
                    ? 'text-navy-700'
                    : 'text-navy-500 hover:text-navy-700',
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="toggle-background"
                    className="absolute inset-0 -z-10 rounded-xl bg-white shadow-sm ring-1 ring-navy-900/5"
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative z-20 flex items-center gap-1.5">
                  <option.icon className="h-4 w-4" aria-hidden="true" />
                  {option.label}
                </span>
                <input
                  type="radio"
                  checked={isSelected}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  {...register('paymentMode')}
                />
              </button>
            );
          })}
        </div>
      </fieldset>

      {serverError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {serverError}
        </motion.div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !isValid || !watchedPhoneNumber}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5',
          'font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isValid && watchedPhoneNumber
            ? 'bg-navy-600 hover:bg-navy-700 shadow-lg shadow-navy-200/50'
            : 'bg-navy-300 cursor-not-allowed',
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            در حال ثبت...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            ارسال درخواست ثبت‌نام
          </>
        )}
      </button>

      <p className="text-center text-xs text-navy-500">
        پس از ثبت، پشتیبانی موسسه برای تکمیل ثبت‌نام با شما تماس می‌گیرد.
      </p>
    </form>
  );
}