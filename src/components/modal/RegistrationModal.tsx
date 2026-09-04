'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  RotateCcw,
  MapPinned,
  Monitor,
} from 'lucide-react';

import CourseDetailView from './CourseDetailView';
import RegistrationForm from './RegistrationForm';
import { cn, getAvailableModes, getModeLabel } from '@/src/lib/utils';
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

type FormVariant = 'payment' | 'reservation' | null;

function ModalContent({ course, registrationType, onClose }: RegistrationModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const availableModes = useMemo(() => getAvailableModes(course!), [course]);

  const [selectedMode, setSelectedMode] = useState<RegistrationType>(registrationType);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [paymentState, setPaymentState] = useState<ModalPaymentState>({ mode: 'idle' });
  const [formVariant, setFormVariant] = useState<FormVariant>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  const theme =
    selectedMode === 'in_person'
      ? {
          accent: 'indigo',
          tab: 'bg-indigo-600 text-white shadow-indigo-200',
          tabInactive: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
          headerBg: 'bg-gradient-to-r from-indigo-50 to-white',
          badge: 'bg-indigo-100 text-indigo-700',
          primary: 'from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800',
        }
      : {
          accent: 'emerald',
          tab: 'bg-emerald-600 text-white shadow-emerald-200',
          tabInactive: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
          headerBg: 'bg-gradient-to-r from-emerald-50 to-white',
          badge: 'bg-emerald-100 text-emerald-700',
          primary: 'from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800',
        };

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
      setPaymentState({
        mode: 'result',
        result: paymentResult,
      });
    }, 0);

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('payment_result');
    newUrl.searchParams.delete('orderId');
    newUrl.searchParams.delete('error');

    router.replace(newUrl.toString(), { scroll: false });
  }, [searchParams, router]);

  useEffect(() => {
    if (!course) return;

    const modes = getAvailableModes(course);
    if (modes.length > 0 && !modes.includes(selectedMode)) {
      setSelectedMode(modes[0]);
    }

    setFormError(null);
    setPaymentState({ mode: 'idle' });
    setFormOpen(false);
    setFormVariant(null);
  }, [course, selectedMode]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

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

  const handleReservation = useCallback(
    async (data: {
      studentName: string;
      phoneNumber: string;
      courseId: string;
      registrationType: RegistrationType;
    }) => {
      setIsFormLoading(true);
      setFormError(null);

      try {
        const response = await fetch('/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'خطا در رزرو رایگان');
        }

        setPaymentState({
          mode: 'result',
          result: { status: 'success', orderId: result.orderId },
        });
        setFormOpen(false);
        setFormVariant(null);
      } catch (error) {
        console.error('Reservation error:', error);
        setFormError(error instanceof Error ? error.message : 'خطا در ثبت رزرو رایگان');
        setIsFormLoading(false);
      }
    },
    [],
  );

  const handleClose = useCallback(() => {
    if (paymentState.mode === 'redirecting' || formOpen) return;
    onClose();
  }, [formOpen, onClose, paymentState.mode]);

  const handleRetry = useCallback(() => {
    setPaymentState({ mode: 'idle' });
    setFormError(null);
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    onClose();
  }, [onClose]);

  const openPaymentForm = () => {
    setFormVariant('payment');
    setFormOpen(true);
  };

  const openReservationForm = () => {
    setFormVariant('reservation');
    setFormOpen(true);
  };

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
            dir="rtl"
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className={cn(
              'relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl',
              theme.headerBg,
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
                        {result.orderId ? 'پرداخت با موفقیت انجام شد' : 'رزرو رایگان با موفقیت ثبت شد'}
                      </h3>
                      <p className="text-slate-600">
                        {result.orderId
                          ? 'شماره پیگیری: ' + result.orderId.slice(0, 8).toUpperCase()
                          : 'پشتیبانی موسسه در سریع‌ترین وقت با شما تماس خواهد گرفت.'}
                      </p>
                      <button
                        onClick={handlePaymentSuccess}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-indigo-800"
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
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-indigo-800"
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

            {/* Top bar / tabs */}
            <div className={cn('border-b border-slate-200/80 px-5 py-4', theme.headerBg)}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {hasTabs && (
                    <div className="mb-3 inline-flex rounded-2xl bg-slate-100 p-1 shadow-inner">
                      {availableModes.map((mode) => {
                        const active = selectedMode === mode;
                        return (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setSelectedMode(mode)}
                            className={cn(
                              'relative rounded-xl px-4 py-2 text-sm font-bold transition-all',
                              active ? theme.tab : theme.tabInactive,
                            )}
                          >
                            <span className="inline-flex items-center gap-2">
                              {mode === 'in_person' ? (
                                <MapPinned className="h-4 w-4" />
                              ) : (
                                <Monitor className="h-4 w-4" />
                              )}
                              {mode === 'in_person' ? 'حضوری' : 'آنلاین'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    {getModeLabel(selectedMode)}
                  </p>
                </div>

                <button
                  onClick={handleClose}
                  disabled={paymentState.mode === 'redirecting'}
                  aria-label="بستن مودال"
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4 sm:px-6">
              <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                {/* Cover + pricing summary */}
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-xs font-semibold text-slate-500">نام دوره</p>
                        <h2
                          id="modal-title"
                          className="font-digilalezarplus text-3xl leading-tight text-slate-900 sm:text-4xl"
                        >
                          {course.title}
                        </h2>
                      </div>

                      <span
                        className={cn(
                          'inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-bold',
                          theme.badge,
                        )}
                      >
                        {selectedMode === 'in_person' ? 'حضوری' : 'آنلاین'}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-sm text-slate-500">قیمت قبل از تخفیف</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            <span className="decoration-2 decoration-red-500 line-through">
                              {/* اینجا اگر CourseDetailView قیمت را دقیق‌تر می‌خواهد، از آن استفاده شود */}
                              {selectedMode === 'in_person'
                                ? course.originalPriceInPerson ?? course.priceInPerson
                                : course.originalPriceOnline ?? course.priceOnline}
                            </span>{' '}
                            تومان
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-500">قیمت نهایی</p>
                          <p className="text-2xl font-extrabold text-slate-900">
                            {selectedMode === 'in_person' ? course.priceInPerson : course.priceOnline}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                        <span className="text-sm text-slate-600">تعداد جلسات</span>
                        <span className="font-bold text-slate-900">{course.sessionsCount} جلسه</span>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                        <span className="text-sm text-slate-600">مدت هر جلسه</span>
                        <span className="font-bold text-slate-900">{course.sessionHours} ساعت</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="min-w-0 space-y-4">
                  <CourseDetailView
                    course={course}
                    selectedMode={selectedMode}
                    onModeChange={setSelectedMode}
                    paymentMode={paymentMode}
                    onPaymentModeChange={setPaymentMode}
                  />
                </div>
              </div>
            </div>

            {/* Sticky footer */}
            {!showResult && (
              <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-sm sm:px-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={openPaymentForm}
                    disabled={paymentState.mode === 'initiating' || paymentState.mode === 'redirecting'}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-semibold text-white transition active:scale-[0.98]',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                      'bg-gradient-to-r shadow-lg shadow-emerald-200/40',
                      theme.primary,
                    )}
                  >
                    {paymentState.mode === 'initiating' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <CreditCard className="h-5 w-5" />
                    )}
                    ثبت‌نام (پرداخت قسط اول)
                  </button>

                  <button
                    onClick={openReservationForm}
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
                    رزرو دوره (رایگان)
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
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Separate registration form modal */}
      <RegistrationForm
        open={formOpen}
        variant={formVariant ?? 'payment'}
        course={course}
        registrationType={selectedMode}
        paymentMode={paymentMode}
        onPaymentModeChange={setPaymentMode}
        onPaymentInitiate={handlePaymentInitiate}
        onReservation={handleReservation}
        isLoading={isFormLoading || paymentState.mode === 'initiating' || paymentState.mode === 'redirecting'}
        error={formError}
        onClose={() => {
          if (paymentState.mode === 'redirecting') return;
          setFormOpen(false);
          setFormVariant(null);
        }}
      />
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
