'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, User, Phone, CreditCard, ArrowLeft } from 'lucide-react';
import { cn, formatPrice, getModeLabel } from '@/src/lib/utils';
import { registrationSchema, type RegistrationFormValues } from '@/src/lib/validations';
import type { Course, PaymentMode, RegistrationType, CourseOffering, OrderPricingResult } from '@/src/types';

interface RegistrationFormProps {
  course: Course;
  registrationType: RegistrationType;
  paymentMode: PaymentMode;
  onPaymentModeChange: (mode: PaymentMode) => void;
  onPaymentInitiate: (data: RegistrationFormValues & { courseId: string; registrationType: RegistrationType; paymentMode: PaymentMode }) => Promise<void>;
  onConsultation: (data: RegistrationFormValues & { courseId: string; registrationType: RegistrationType }) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  variant: 'payment' | 'consultation';
  onClose: () => void;
  offering: CourseOffering | null;
  pricing: OrderPricingResult | null;
  firstInstallmentAmount: number | null;
  installmentItems: Array<{
    index: number;
    label: string;
    amountBeforeDiscount: number;
    amountAfterDiscount: number;
    isDownPayment: boolean;
  }>;
}

export default function RegistrationForm({
  course,
  registrationType,
  paymentMode,
  onPaymentModeChange,
  onPaymentInitiate,
  onConsultation,
  isLoading,
  error,
  variant,
  onClose,
  offering,
  pricing,
  firstInstallmentAmount,
  installmentItems,
}: RegistrationFormProps) {
  const [submitType, setSubmitType] = useState<'payment' | 'consultation' | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid, isDirty },
    setValue,
    trigger,
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      studentName: '',
      phoneNumber: '',
      paymentMode: paymentMode,
    },
  });

  const watchedPaymentMode = watch('paymentMode');
  const watchedPhoneNumber = watch('phoneNumber');
  const watchedStudentName = watch('studentName');

  useEffect(() => {
    if (watchedPaymentMode && watchedPaymentMode !== paymentMode) {
      onPaymentModeChange(watchedPaymentMode);
    }
  }, [watchedPaymentMode, onPaymentModeChange, paymentMode]);

  useEffect(() => {
    if (paymentMode !== watchedPaymentMode) {
      setValue('paymentMode', paymentMode, { shouldValidate: false, shouldDirty: false });
    }
  }, [paymentMode, watchedPaymentMode, setValue]);

  const modeLabel = getModeLabel(registrationType);
  const isInstallment = paymentMode === 'installment';
  const payableAmount = isInstallment ? (firstInstallmentAmount ?? pricing?.installments[0]?.amount ?? 0) : (pricing?.baseAmount ?? 0);

  const isFormValid = isValid && isDirty && !!watchedStudentName?.trim() && !!watchedPhoneNumber?.trim();

  const onSubmitPayment = async (values: RegistrationFormValues) => {
    setSubmitType('payment');
    try {
      await onPaymentInitiate({
        ...values,
        courseId: course.id,
        registrationType,
        paymentMode,
      });
    } catch (err) {
      console.error('Payment initiation error:', err);
    }
  };

  const onSubmitConsultation = async (values: RegistrationFormValues) => {
    setSubmitType('consultation');
    try {
      await onConsultation({
        ...values,
        courseId: course.id,
        registrationType,
      });
    } catch (err) {
      console.error('Consultation error:', err);
    }
  };

  if (submitType) {
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
        <h3 className="text-xl font-bold text-slate-900">
          {submitType === 'consultation' ? 'درخواست مشاوره با موفقیت ثبت شد' : 'درخواست پرداخت ارسال شد'}
        </h3>
        <p className="text-slate-600">
          {submitType === 'consultation'
            ? `شما برای دوره «${course.title}» (${modeLabel}) درخواست مشاوره دادید.`
            : `برای تکمیل ثبت‌نام به درگاه پرداخت هدایت می‌شوید.`}
        </p>
        <p className="text-sm text-slate-500 mt-2">
          {submitType === 'consultation'
            ? 'پشتیبانی موسسه در سریع‌ترین وقت با شما تماس خواهد گرفت.'
            : 'در صورت عدم انتقال خودکار، روی دکمه زیر کلیک کنید.'}
        </p>
        {submitType === 'payment' && (
          <button
            onClick={onClose}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            بستن و بازگشت
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(variant === 'payment' ? onSubmitPayment : onSubmitConsultation)} className="space-y-4" dir="rtl" noValidate>
      {/* Payment Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 border border-slate-200 bg-linear-to-br from-slate-50 to-white"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-600 truncate">
              {course.title} ({modeLabel})
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {isInstallment
                ? `پیش‌پرداخت: ${formatPrice(payableAmount)} تومان (از ${offering?.installmentsCount ?? 0} قسط)`
                : `مبلغ قابل پرداخت: ${formatPrice(payableAmount)} تومان`}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {pricing && pricing.discountPercent > 0 && pricing.originalAmount && pricing.originalAmount > pricing.baseAmount && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                {pricing.discountPercent}٪ تخفیف
              </span>
            )}
            <span className="text-xl font-extrabold text-slate-900 fa-nums">
              {formatPrice(payableAmount)}
            </span>
            <span className="text-xs text-slate-500">تومان</span>
          </div>
        </div>
      </motion.div>

      {/* Name Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
          نام کامل <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <input
            id="name"
            type="text"
            placeholder="مثال: علی احمدی"
            className={cn(
              'w-full rounded-xl border bg-white px-4 py-3.5 text-lg text-slate-900 outline-none transition',
              'placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100',
              errors.studentName ? 'border-red-400' : 'border-slate-200',
            )}
            {...register('studentName')}
            aria-invalid={errors.studentName ? 'true' : 'false'}
            aria-describedby={errors.studentName ? 'name-error' : undefined}
            autoComplete="name"
            disabled={isSubmitting || isLoading}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <User className="h-5 w-5" aria-hidden="true" />
          </div>
          <AnimatePresence>
            {errors.studentName && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500"
              >
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {errors.studentName && (
          <motion.p
            id="name-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 flex items-center gap-1 text-xs text-red-600"
            role="alert"
          >
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {errors.studentName.message}
          </motion.p>
        )}
      </motion.div>

      {/* Phone Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700">
          شماره موبایل <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            dir="ltr"
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            className={cn(
              'w-full rounded-xl border bg-white px-4 py-3.5 pl-12 text-center text-lg tracking-widest text-slate-900 outline-none transition',
              'placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100',
              errors.phoneNumber ? 'border-red-400' : 'border-slate-200',
            )}
            {...register('phoneNumber')}
            aria-invalid={errors.phoneNumber ? 'true' : 'false'}
            aria-describedby={errors.phoneNumber ? 'phone-error' : undefined}
            autoComplete="tel"
            disabled={isSubmitting || isLoading}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Phone className="h-5 w-5" aria-hidden="true" />
          </div>
          <AnimatePresence>
            {errors.phoneNumber && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500"
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
      </motion.div>

      {/* Installment Preview (when installment mode selected) */}
      {variant === 'payment' && isInstallment && installmentItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-3 border border-amber-200 bg-amber-50/50"
        >
          <p className="text-sm font-medium text-amber-800 text-center mb-2">
            پیش‌پرداخت: <span className="font-extrabold fa-nums">{formatPrice(firstInstallmentAmount ?? 0)}</span> تومان
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {installmentItems.map((item, i) => (
              <div
                key={item.index}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3 py-2 text-sm',
                  i === 0
                    ? 'bg-amber-100 text-amber-900 font-bold'
                    : 'bg-white text-slate-700 border border-slate-100',
                )}
              >
                <div className="flex items-center gap-2">
                  {i === 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-200 text-[10px] font-bold text-amber-700">
                      {i + 1}
                    </span>
                  )}
                  <span className={cn('font-medium', i === 0 && 'font-bold')}>
                    {item.label}
                  </span>
                </div>
                <span className="font-bold tabular-nums fa-nums">
                  {formatPrice(item.amountAfterDiscount)}
                  <span className="ml-1 text-[10px] font-normal text-slate-500">تومان</span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        {/* Primary Action */}
        <button
          type="submit"
          disabled={isSubmitting || isLoading || !isFormValid}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5',
            'font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            isFormValid && !isSubmitting && !isLoading
              ? 'bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-200/50'
              : 'bg-slate-300 cursor-not-allowed',
          )}
          style={{ minHeight: '52px' }}
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              {isSubmitting ? 'در حال ارسال...' : 'در حال اتصال به درگاه...'}
            </>
          ) : variant === 'payment' ? (
            <>
              <CreditCard className="h-5 w-5" aria-hidden="true" />
              {isInstallment
                ? `پرداخت پیش‌پرداخت (${formatPrice(firstInstallmentAmount ?? 0)} تومان)`
                : `پرداخت نقدی (${formatPrice(pricing?.baseAmount ?? 0)} تومان)`}
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              ثبت درخواست مشاوره
            </>
          )}
        </button>

        {/* Secondary Action - only for payment variant */}
        {variant === 'payment' && (
          <button
            type="button"
            onClick={() => {
              const name = watchedStudentName?.trim() ?? '';
              const phone = watchedPhoneNumber?.trim() ?? '';
              if (name && phone) {
                onSubmitConsultation({
                  studentName: name,
                  phoneNumber: phone,
                });
              }
            }}
            disabled={isSubmitting || isLoading || !watchedStudentName?.trim() || !watchedPhoneNumber?.trim()}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3.5',
              'font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
            style={{ minHeight: '52px' }}
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <span className="text-[10px] font-bold">!</span>
              </span>
              درخواست مشاوره (رایگان)
            </span>
          </button>
        )}
      </div>

      <p className="text-center text-xs text-slate-500">
        {variant === 'payment'
          ? (isInstallment
              ? 'با پرداخت پیش‌پرداخت، ثبت‌نام شما نهایی شده و بقیه اقساط طبق برنامه تحصیلی قابل پرداخت است.'
              : 'پس از پرداخت، ثبت‌نام شما نهایی شده و پشتیبانی موسسه با شما تماس خواهد گرفت.')
          : 'پس از ثبت درخواست، کارشناسان ما در سریع‌ترین وقت با شما تماس خواهند گرفت.'}
      </p>
    </form>
  );
}