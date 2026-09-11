'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  RotateCcw,
  MapPinned,
  Monitor,
  ArrowLeft,
} from 'lucide-react';

import RegistrationForm from './RegistrationForm';
import { cn, formatPrice, getModeIcon, getOfferingForMode, isOfferingAvailable, calculatePricingFromOffering, getFirstInstallmentAmount, getInstallmentItemsForDisplay } from '@/src/lib/utils';
import type {
  Course,
  PaymentMode,
  RegistrationType,
  PaymentResult,
  ModalPaymentState,
} from '@/src/types';

interface RegistrationModalProps {
  course: Course | null;
  registrationType: RegistrationType;
  onClose: () => void;
}

type FormVariant = 'payment' | 'consultation' | null;
type ViewState = 'detail' | 'form' | 'result';

function ModalContent({ course, onClose }: RegistrationModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const availableModes = useMemo(() => {
    if (!course?.courseOfferings) return ['online', 'in_person'] as RegistrationType[];
    return course.courseOfferings
      .filter(o => o.isAvailable)
      .map(o => o.attendanceMode) as RegistrationType[];
  }, [course]);

  const [selectedMode, setSelectedMode] = useState<RegistrationType>(() => {
    if (!course) return 'online';
    const onlineAvailable = course.onlineAvailable ?? true;
    return onlineAvailable ? 'online' : 'in_person';
  });
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [paymentState, setPaymentState] = useState<ModalPaymentState>({ mode: 'idle' });
  const [formVariant, setFormVariant] = useState<FormVariant>(null);
  const [viewState, setViewState] = useState<ViewState>('detail');
  const [formError, setFormError] = useState<string | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  const currentOffering = useMemo(() => {
    if (!course) return null;
    return getOfferingForMode(course, selectedMode);
  }, [course, selectedMode]);

  const offeringAvailable = isOfferingAvailable(currentOffering);

  const pricing = useMemo(() => {
    if (!currentOffering) return null;
    return calculatePricingFromOffering(currentOffering, paymentMode);
  }, [currentOffering, paymentMode]);

  const firstInstallmentAmount = useMemo(() => {
    if (!currentOffering || paymentMode !== 'installment') return null;
    return getFirstInstallmentAmount(currentOffering);
  }, [currentOffering, paymentMode]);

  const installmentItems = useMemo(() => {
    if (!currentOffering || paymentMode !== 'installment') return [];
    return getInstallmentItemsForDisplay(currentOffering);
  }, [currentOffering, paymentMode]);

  const theme = useMemo(() => {
    const isInPerson = selectedMode === 'in_person';
    return isInPerson
      ? {
          accent: 'indigo',
          tabActive: 'bg-indigo-600 text-white shadow-indigo-200',
          tabInactive: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
          badge: 'bg-indigo-100 text-indigo-700',
          primaryGradient: 'from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800',
          primaryShadow: 'shadow-indigo-200/40',
          pricingGradient: 'from-indigo-600 via-indigo-700 to-indigo-800',
        }
      : {
          accent: 'emerald',
          tabActive: 'bg-emerald-600 text-white shadow-emerald-200',
          tabInactive: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
          badge: 'bg-emerald-100 text-emerald-700',
          primaryGradient: 'from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800',
          primaryShadow: 'shadow-emerald-200/40',
          pricingGradient: 'from-emerald-600 via-emerald-700 to-emerald-800',
        };
  }, [selectedMode]);

  // Handle payment result from URL params
  useEffect(() => {
    const result = searchParams.get('payment_result');
    if (!result) return;

    const orderId = searchParams.get('orderId');
    const paymentResult: PaymentResult = {
      status: result as PaymentResult['status'],
      orderId: orderId || undefined,
      error: searchParams.get('error') || undefined,
    };

    setTimeout(() => {
      setPaymentState({ mode: 'result', result: paymentResult });
      setViewState('result');
    }, 0);

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('payment_result');
    newUrl.searchParams.delete('orderId');
    newUrl.searchParams.delete('error');
    router.replace(newUrl.toString(), { scroll: false });
  }, [searchParams, router]);

  // Reset state when course changes
  useEffect(() => {
    if (!course) return;

    // استفاده از فال‌بک آرایه خالی ?? [] برای جلوگیری از undefined شدن modes
    const modes = (course.courseOfferings?.filter(o => o.isAvailable).map(o => o.attendanceMode) ?? []) as RegistrationType[];
    const onlineMode = modes.find(m => m === 'online');
    
    // اگر modes خالی بود، از فیلدهای آنلاین/حضوری خود دوره فال‌بک می‌گیریم
    const fallbackMode = (course.onlineAvailable ?? true) ? 'online' : 'in_person';
    const initialMode = onlineMode ?? modes[0] ?? fallbackMode;

    // Defer state updates to avoid cascading renders warning
    const timer = setTimeout(() => {
      setSelectedMode(initialMode);
      setPaymentMode('cash');
      setFormError(null);
      setPaymentState({ mode: 'idle' });
      setViewState('detail');
      setFormVariant(null);
      previousActiveElement.current = document.activeElement as HTMLElement;
    }, 0);

    return () => clearTimeout(timer);
  }, [course]);


  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Restore focus on close
  const restoreFocus = useCallback(() => {
    if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, []);

  // Define handlers before useEffect that uses them
  const handleClose = useCallback(() => {
    if (paymentState.mode === 'redirecting') return;
    restoreFocus();
    onClose();
  }, [onClose, paymentState.mode, restoreFocus]);

  const handleBackToDetail = useCallback(() => {
    setViewState('detail');
    setFormVariant(null);
    setFormError(null);
  }, []);

  const handleRetry = useCallback(() => {
    setPaymentState({ mode: 'idle' });
    setFormError(null);
    setViewState('detail');
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    restoreFocus();
    onClose();
  }, [onClose, restoreFocus]);

  // Focus management for accessibility - must be after handler definitions
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    // Trap focus within modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewState === 'form' || paymentState.mode === 'initiating') {
          e.preventDefault();
          handleBackToDetail();
        } else if (paymentState.mode !== 'redirecting') {
          e.preventDefault();
          handleClose();
        }
      }

      if (e.key === 'Tab') {
        const focusableElements = modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleKeyDown);
    // Focus first interactive element
    setTimeout(() => {
      const firstFocusable = modal.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }, 100);

    return () => modal.removeEventListener('keydown', handleKeyDown);
  }, [viewState, paymentState.mode, handleBackToDetail, handleClose]);

  const handlePaymentInitiate = useCallback(
    async (data: {
      studentName: string;
      phoneNumber: string;
      courseId: string;
      registrationType: RegistrationType;
      paymentMode: PaymentMode;
    }) => {
      setIsFormLoading(true);
      setFormError(null);
      setPaymentState({ mode: 'initiating' });

      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'خطا در ایجاد سفارش');
        }

        setPaymentState({ mode: 'redirecting' });
        window.location.href = result.payUrl;
      } catch (error) {
        console.error('Payment initiation error:', error);
        setFormError(error instanceof Error ? error.message : 'خطا در برقراری ارتباط با درگاه پرداخت');
        setPaymentState({ mode: 'idle' });
        setIsFormLoading(false);
      }
    },
    [],
  );

  const handleConsultation = useCallback(
    async (data: {
      studentName: string;
      phoneNumber: string;
      courseId: string;
      registrationType: RegistrationType;
    }) => {
      setIsFormLoading(true);
      setFormError(null);

      try {
        const response = await fetch('/api/consultations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'خطا در ثبت درخواست مشاوره');
        }

        setPaymentState({
          mode: 'result',
          result: { status: 'success', orderId: result.consultationId },
        });
        setViewState('result');
        setFormVariant(null);
      } catch (error) {
        console.error('Consultation error:', error);
        setFormError(error instanceof Error ? error.message : 'خطا در ثبت درخواست مشاوره');
        setIsFormLoading(false);
      }
    },
    [],
  );

  const openPaymentForm = useCallback(() => {
    setFormVariant('payment');
    setViewState('form');
  }, []);

  const openConsultationForm = useCallback(() => {
    setFormVariant('consultation');
    setViewState('form');
  }, []);

  if (!course) return null;

  const showResult = paymentState.mode === 'result' && paymentState.result;
  const result = paymentState.result;
  const hasTabs = availableModes.length > 1;

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          <motion.div
            ref={modalRef}
            dir="rtl"
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className={cn(
              'relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl',
            )}
          >
            {/* Result State Overlay */}
            {showResult && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/95 p-6 backdrop-blur-sm">
                <AnimatePresence mode="wait">
                  {result?.status === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="max-w-md space-y-4 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                        className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
                      >
                        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                      </motion.div>

                      <h3 className="text-2xl font-bold text-slate-900">
                        {result.orderId
                          ? formVariant === 'consultation'
                            ? 'درخواست مشاوره با موفقیت ثبت شد'
                            : 'پرداخت با موفقیت انجام شد'
                          : 'رزرو رایگان با موفقیت ثبت شد'}
                      </h3>
                      <p className="text-slate-600">
                        {result.orderId
                          ? formVariant === 'consultation'
                            ? 'پشتیبانی موسسه در سریع‌ترین وقت با شما تماس خواهد گرفت.'
                            : 'شماره پیگیری: ' + result.orderId.slice(0, 8).toUpperCase()
                          : 'پشتیبانی موسسه در سریع‌ترین وقت با شما تماس خواهد گرفت.'}
                      </p>
                      <button
                        onClick={handlePaymentSuccess}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-indigo-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-indigo-800"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        ادامه و بستن
                      </button>
                    </motion.div>
                  )}

                  {(result?.status === 'failed' || result?.status === 'cancelled') && (
                    <motion.div
                      key="failed"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="max-w-md space-y-4 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                        className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100"
                      >
                        <AlertCircle className="h-10 w-10 text-red-600" />
                      </motion.div>

                      <h3 className="text-2xl font-bold text-slate-900">
                        {result.status === 'cancelled' ? 'پرداخت لغو شد' : 'پرداخت ناموفق بود'}
                      </h3>

                      <p className="text-slate-600">
                        {result.error
                          ? `کد خطا: ${result.error}`
                          : 'تراکنش توسط کاربر لغو شد یا با خطا مواجه گردید.'}
                      </p>

                      <div className="flex justify-center gap-3">
                        <button
                          onClick={handleRetry}
                          className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-indigo-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-indigo-800"
                        >
                          <RotateCcw className="h-4 w-4" />
                          تلاش مجدد
                        </button>
                        <button
                          onClick={handleClose}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <X className="h-4 w-4" />
                          بستن
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Detail View */}
            {viewState === 'detail' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar - Attendance Tabs */}
                <div className="border-b border-slate-200/80 px-5 py-4 bg-white">
                      {hasTabs && (
                        <div className="mb-3 w-full inline-flex rounded-2xl bg-slate-100 p-1 shadow-inner" role="tablist" aria-label="نوع برگزاری">
                          {availableModes.map((mode) => {
                            const active = selectedMode === mode;
                            const Icon = getModeIcon(mode) === 'map-pin' ? MapPinned : Monitor;
                            return (
                              <button
                                key={mode}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                aria-controls={`panel-${mode}`}
                                id={`tab-${mode}`}
                                onClick={() => {
                                  setSelectedMode(mode);
                                  setPaymentMode('cash'); // Reset to cash default on mode change
                                }}
                                className={cn(
                                  'relative rounded-xl px-4 py-2 text-sm font-bold w-1/2 transition-all',
                                  active ? theme.tabActive : theme.tabInactive,
                                )}
                              >
                                <span className="inline-flex items-center gap-2">
                                  <Icon className="h-4 w-4" aria-hidden="true" />
                                  {mode === 'in_person' ? 'حضوری' : 'آنلاین'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                </div>

                {/* Scrollable content - Single column layout */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4 sm:px-6">
                  <div className="space-y-6 max-w-3xl mx-auto">
                    {/* Course Poster */}
                    {course.coverImageUrl && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-100"
                      >
                        <Image
                          src={course.coverImageUrl}
                          alt={course.title}
                          fill
                          className="object-cover"
                          sizes="100vw"
                          priority
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                            {selectedMode === 'in_person' ? (
                              <>
                                <MapPinned className="h-3 w-3" />
                                حضوری
                              </>
                            ) : (
                              <>
                                <Monitor className="h-3 w-3" />
                                آنلاین
                              </>
                            )}
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {/* Cash/Installment Selector */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="rounded-2xl p-4 border border-slate-200 bg-white shadow-sm"
                    >
                      <label className="mb-3 block text-sm font-semibold text-slate-700">نحوه پرداخت</label>
                      <div className="relative flex w-full rounded-2xl bg-slate-100 p-1.5 shadow-inner" dir="rtl">
                        {[
                          { id: 'cash' as PaymentMode, label: 'نقدی', icon: CreditCard },
                          { id: 'installment' as PaymentMode, label: currentOffering ? `اقساط (${currentOffering.installmentsCount} مرحله)` : 'اقساط', icon: CreditCard },
                        ].map((option) => {
                          const isSelected = paymentMode === option.id;
                          const isDisabled = option.id === 'installment' && (!currentOffering || currentOffering.installmentsCount <= 0);
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => !isDisabled && setPaymentMode(option.id)}
                              disabled={isDisabled}
                              className={cn(
                                'relative z-10 flex flex-1 items-center justify-center rounded-xl py-3 text-sm font-bold transition-colors duration-200',
                                isSelected ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700',
                                isDisabled && 'opacity-50 cursor-not-allowed',
                              )}
                            >
                              {isSelected && (
                                <motion.div
                                  layoutId="payment-toggle-bg"
                                  className="absolute inset-0 -z-10 rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5"
                                  initial={false}
                                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                              )}
                              <span className="relative z-20 flex items-center gap-1.5">
                                <option.icon className="h-4 w-4" aria-hidden="true" />
                                {option.label}
                              </span>
<input
  type="radio"
  name="payment-mode"
  checked={isSelected}
  disabled={isDisabled}
  readOnly
  className="absolute inset-0 opacity-0 cursor-pointer"
/>

                            </button>
                          );
                        })}
                      </div>
                      {paymentMode === 'installment' && !currentOffering?.installmentsCount && (
                        <p className="mt-2 text-sm text-amber-700 text-center">برنامه اقساطی برای این گزینه موجود نیست</p>
                      )}
                    </motion.div>

                    {/* Pricing Presentation */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="space-y-4"
                    >
                      {pricing && (
                        <>
                          {paymentMode === 'cash' && (
                            <div className="rounded-2xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${theme.pricingGradient})` }}>
                              {pricing.discountPercent > 0 && pricing.originalAmount && pricing.originalAmount > pricing.baseAmount && (
                                <p className="mb-2 text-sm text-white/80 line-through">
                                  قیمت اصلی: <span className="fa-nums">{formatPrice(pricing.originalAmount)}</span> تومان
                                </p>
                              )}
                              <p className="text-4xl font-extrabold text-slate-800 fa-nums">
                                {formatPrice(pricing.baseAmount)}
                              </p>
                              <p className="mt-1 text-slate-800/90">تومان (پرداخت یک‌جا)</p>
                              {pricing.discountPercent > 0 && (
                                <motion.span
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-bold text-white"
                                >
                                  <span className="h-3.5 w-3.5" />
                                  {pricing.discountPercent}٪ تخفیف
                                </motion.span>
                              )}
                            </div>
                          )}

                          {paymentMode === 'installment' && pricing.installments.length > 0 && (
                            <div className="space-y-3">
                              {/* Summary Card */}
                              <div className="rounded-2xl p-4 border border-slate-200 bg-slate-50">
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-medium text-slate-600">مجموع اقساط (بدون سود)</p>
                                    <p className="text-2xl font-extrabold fa-nums text-slate-900">
                                      {formatPrice(pricing.totalAmount)} تومان
                                    </p>
                                  </div>
                                  {pricing.discountPercent > 0 && pricing.originalAmount && pricing.originalAmount > pricing.baseAmount && (
                                    <div className="text-right">
                                      <p className="text-sm text-slate-500 line-through fa-nums">
                                        {formatPrice(pricing.originalAmount)} تومان
                                      </p>
                                      <motion.span
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white"
                                        style={{ background: `linear-gradient(135deg, ${theme.pricingGradient})` }}
                                      >
                                        <span className="h-3 w-3" />
                                        {pricing.discountPercent}٪ تخفیف
                                      </motion.span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Installment Breakdown - List style without table headers */}
                              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                                <div className="space-y-0">
                                  {pricing.installments.map((item, i) => (
                                    <motion.div
                                      key={item.index}
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: i * 0.04 }}
                                      className={cn(
                                        'flex flex-col sm:flex-row sm:justify-between gap-3 px-4 py-3 items-start sm:items-center border-b border-slate-100 last:border-b-0 transition-colors',
                                        i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50',
                                        item.isDownPayment ? 'bg-linear-to-r from-amber-50 to-white' : ''
                                      )}
                                    >
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className={cn(
                                          'shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                                          item.isDownPayment ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                                        )}>
                                          {item.index}
                                        </span>
                                        <div className="flex items-center gap-2 min-w-0">
                                          {item.isDownPayment && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 shrink-0">
                                              پیش‌پرداخت
                                            </span>
                                          )}
                                          <span className={cn('font-medium text-slate-700 truncate', item.isDownPayment && 'font-bold')}>
                                            {item.label}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className="font-bold tabular-nums fa-nums text-slate-900 text-left">
                                          {formatPrice(item.amount)}
                                        </span>
                                        <span className="text-[10px] font-normal text-slate-500 shrink-0">تومان</span>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>

                              <p className="text-center text-xs text-slate-500">
                                * اقساط بدون سود و کارمزد محاسبه شده‌اند. مبالغ تقریبی هستند و در فاکتور نهایی قابل تغییر می‌باشند.
                              </p>
                            </div>
                          )}

                          {paymentMode === 'installment' && pricing.installments.length === 0 && (
                            <div className="rounded-2xl p-6 text-center border border-slate-200 bg-slate-50">
                              <CreditCard className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                              <p className="text-slate-600">برنامه اقساطی برای این گزینه موجود نیست</p>
                            </div>
                          )}
                        </>
                      )}

                      {!offeringAvailable && (
                        <div className="rounded-2xl p-6 text-center border border-red-200 bg-red-50">
                          <AlertCircle className="mx-auto mb-3 h-12 w-12 text-red-500" />
                          <p className="text-red-700 font-medium">این گزینه در حال حاضر در دسترس نیست</p>
                          <p className="mt-1 text-sm text-red-600">لطفاً گزینه دیگر را انتخاب کنید</p>
                        </div>
                      )}

                      {!currentOffering && (
                        <div className="rounded-2xl p-6 text-center border border-slate-200 bg-slate-50">
                          <AlertCircle className="mx-auto mb-3 h-12 w-12 text-slate-400" />
                          <p className="text-slate-600">اطلاعات قیمت برای این گزینه موجود نیست</p>
                        </div>
                      )}
                    </motion.div>

                    {/* Course Description - Full width */}
                    {course.description && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-2xl p-6 border border-slate-200 bg-white"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <span className="h-5 w-5 text-slate-500" />
                          <h4 className="font-semibold text-slate-900">توضیحات دوره</h4>
                        </div>
                        <div className="prose prose-fa max-w-none text-slate-600 leading-7">
                          {course.description.split('\n').map((paragraph, i) => (
                            <p key={i} className="mb-4">{paragraph}</p>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Consultation Info */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="rounded-2xl p-4 border border-amber-200 bg-amber-50/50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="h-3 w-3 bg-amber-600 rounded-2xl" />
                        <h4 className="font-semibold text-amber-900">درخواست مشاوره رایگان</h4>
                      </div>
                      <p className="text-sm text-amber-800">
                        اگر در انتخاب دوره یا نحوه برگزاری مشکلی دارید، درخواست مشاوره رایگان ثبت کنید.
                        کارشناسان ما در سریع‌ترین وقت با شما تماس گرفته و راهنمایی خواهند کرد.
                      </p>
                    </motion.div>
                  </div>
                </div>

                {/* Sticky Footer */}
                <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-sm sm:px-6">
                  <div className="grid gap-3 sm:grid-cols-2 max-w-3xl mx-auto">
                    <button
                      onClick={openPaymentForm}
                      disabled={paymentState.mode === 'initiating' || paymentState.mode === 'redirecting' || !offeringAvailable || !pricing}
                      className={cn(
                        'flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-semibold text-white transition active:scale-[0.98]',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        'bg-linear-to-r shadow-lg',
                        theme.primaryGradient,
                        theme.primaryShadow,
                      )}
                    >
                      {paymentState.mode === 'initiating' ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <CreditCard className="h-5 w-5" />
                      )}
                      {paymentMode === 'installment' && firstInstallmentAmount
                        ? `پرداخت پیش‌پرداخت (${formatPrice(firstInstallmentAmount)} تومان)`
                        : `پرداخت نقدی (${formatPrice(pricing?.baseAmount ?? 0)} تومان)`}
                    </button>

                    <button
                      onClick={openConsultationForm}
                      disabled={paymentState.mode === 'initiating' || paymentState.mode === 'redirecting'}
                      className={cn(
                        'flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3.5',
                        'font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                      )}
                    >
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                        <span className="text-[10px] font-bold">!</span>
                      </span>
                      درخواست مشاوره (رایگان)
                    </button>
                  </div>

                  <p className="mt-3 text-center text-xs text-slate-500">
                    با ثبت‌نام، شما با{' '}
                    <a
                      href="/terms"
                      className="underline hover:text-indigo-600"
                      target="_blank"
                      rel="noopener"
                    >
                      شرایط و قوانین
                    </a>{' '}
                    موافقت می‌کنید.
                  </p>
                </div>
              </div>
            )}

            {/* Form View */}
            {viewState === 'form' && formVariant && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="border-b border-slate-200 px-5 py-4 bg-white flex items-center justify-between">
                  <button
                    onClick={handleBackToDetail}
                    type="button"
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                    aria-label="بازگشت به جزئیات دوره"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    بازگشت
                  </button>
                  <h2 className="text-lg font-bold text-slate-900 flex-1 text-center">
                    {formVariant === 'payment' ? 'اطلاعات پرداخت' : 'فرم درخواست مشاوره'}
                  </h2>
                  <div className="w-24" />
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4 sm:px-6">
                  <RegistrationForm
                    course={course}
                    registrationType={selectedMode}
                    paymentMode={paymentMode}
                    onPaymentModeChange={setPaymentMode}
                    onPaymentInitiate={handlePaymentInitiate}
                    onConsultation={handleConsultation}
                    isLoading={isFormLoading || paymentState.mode === 'initiating' || paymentState.mode === 'redirecting'}
                    error={formError}
                    variant={formVariant}
                    onClose={handleBackToDetail}
                    offering={currentOffering}
                    pricing={pricing}
                    firstInstallmentAmount={firstInstallmentAmount}
                    installmentItems={installmentItems}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default function RegistrationModal({
  course,
  registrationType,
  onClose,
}: RegistrationModalProps) {
  return (
    <AnimatePresence>
      {course && (
        <ModalContent
          key={course.id}
          course={course}
          registrationType={registrationType}
          onClose={onClose}
        />
      )}
    </AnimatePresence>
  );
}