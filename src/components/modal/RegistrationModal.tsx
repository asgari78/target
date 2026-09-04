'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Loader2, CreditCard, RotateCcw } from 'lucide-react';
import CourseDetailView from './CourseDetailView';
import RegistrationForm from './RegistrationForm';
import { cn } from '@/src/lib/utils';
import type { Course, PaymentMode, RegistrationType, PaymentResult, ModalPaymentState } from '@/src/types';

interface RegistrationModalProps {
  course: Course | null;
  registrationType: RegistrationType;
  onClose: () => void;
}

function ModalContent({ course, registrationType, onClose }: RegistrationModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedMode, setSelectedMode] = useState<RegistrationType>(registrationType);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [paymentState, setPaymentState] = useState<ModalPaymentState>({ mode: 'idle' });
  const [formError, setFormError] = useState<string | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Handle payment result from URL params
  useEffect(() => {
    const result = searchParams.get('payment_result');
    const orderId = searchParams.get('orderId');
    
    if (result) {
      const paymentResult: PaymentResult = {
        status: result as PaymentResult['status'],
        orderId: orderId || undefined,
        error: searchParams.get('error') || undefined,
      };
      
      // Use setTimeout to avoid synchronous state update in effect
      setTimeout(() => {
        setPaymentState({ mode: 'result', result: paymentResult });
      }, 0);
      
      // Clean up URL without reload
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('payment_result');
      newUrl.searchParams.delete('orderId');
      newUrl.searchParams.delete('error');
      router.replace(newUrl.toString(), { scroll: false });
    }
  }, [searchParams, router]);

  // Reset payment state when modal closes or course changes
  useEffect(() => {
    if (!course) {
      setTimeout(() => {
        setPaymentState({ mode: 'idle' });
        setFormError(null);
      }, 0);
    }
  }, [course]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Adjust selectedMode if it's not available
  useEffect(() => {
    if (!course) return;
    
    const modes: RegistrationType[] = [];
    if (course.inPersonAvailable) modes.push('in_person');
    if (course.onlineAvailable) modes.push('online');
    
    if (modes.length > 0 && !modes.includes(selectedMode)) {
      setTimeout(() => {
        setSelectedMode(modes[0]);
      }, 0);
    }
  }, [course, selectedMode]);

  const handlePaymentInitiate = useCallback(async (
    data: { studentName: string; phoneNumber: string; courseId: string; registrationType: RegistrationType; paymentMode: PaymentMode }
  ) => {
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
      
      // Redirect to Zarinpal
      window.location.href = result.payUrl;
    } catch (error) {
      console.error('Payment initiation error:', error);
      setFormError(error instanceof Error ? error.message : 'خطا در برقراری ارتباط با درگاه پرداخت');
      setPaymentState({ mode: 'idle' });
      setIsFormLoading(false);
    }
  }, []);

  const handleReservation = useCallback(async (
    data: { studentName: string; phoneNumber: string; courseId: string; registrationType: RegistrationType }
  ) => {
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
        result: { status: 'success', orderId: result.orderId } 
      });
    } catch (error) {
      console.error('Reservation error:', error);
      setFormError(error instanceof Error ? error.message : 'خطا در ثبت رزرو رایگان');
      setIsFormLoading(false);
    }
  }, []);

  const handleClose = useCallback(() => {
    if (paymentState.mode === 'redirecting') return;
    onClose();
  }, [onClose, paymentState.mode]);

  const handleRetry = useCallback(() => {
    setPaymentState({ mode: 'idle' });
    setFormError(null);
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!course) return null;

  const showResult = paymentState.mode === 'result' && paymentState.result;
  const result = paymentState.result;

  return (
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
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          onClick={handleClose}
          aria-hidden="true"
        />

        <motion.div
          dir="rtl"
          initial={{ y: 60, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          {/* Modal Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {/* Result State Overlay */}
            {showResult && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-white/95 backdrop-blur-sm">
                <AnimatePresence mode="wait">
                  {result?.status === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="space-y-4 text-center max-w-md"
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
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-indigo-700 hover:to-indigo-800 transition-all"
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
                      className="space-y-4 text-center max-w-md"
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
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={handleRetry}
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-indigo-700 hover:to-indigo-800 transition-all"
                        >
                          <RotateCcw className="h-4 w-4" />
                          تلاش مجدد
                        </button>
                        <button
                          onClick={handleClose}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
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

            {/* Course Detail View */}
            {!showResult && (
              <CourseDetailView
                course={course}
                selectedMode={selectedMode}
                onModeChange={setSelectedMode}
                paymentMode={paymentMode}
                onPaymentModeChange={setPaymentMode}
              />
            )}

            {/* Registration Form */}
            {!showResult && (
              <RegistrationForm
                course={course}
                registrationType={selectedMode}
                paymentMode={paymentMode}
                onPaymentModeChange={setPaymentMode}
                onPaymentInitiate={handlePaymentInitiate}
                onReservation={handleReservation}
                isLoading={isFormLoading || paymentState.mode === 'initiating' || paymentState.mode === 'redirecting'}
                error={formError}
                onClose={handleClose}
              />
            )}
          </div>

          {/* Sticky Footer - Only shown when not in result state */}
          {!showResult && (
            <div className="border-t border-slate-200 bg-white/95 backdrop-blur-sm px-5 py-4 sticky bottom-0 z-10">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Primary Action: Pay/Register */}
                <button
                  onClick={() => document.getElementById('payment-form-submit')?.click()}
                  disabled={paymentState.mode === 'initiating' || paymentState.mode === 'redirecting'}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3.5',
                    'font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98]',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    paymentMode === 'installment'
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-lg shadow-amber-200/50'
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-200/50',
                  )}
                  id="footer-pay-btn"
                >
                  {paymentState.mode === 'initiating' && <Loader2 className="h-5 w-5 animate-spin" />}
                  <CreditCard className="h-5 w-5" aria-hidden="true" />
                  {paymentMode === 'installment'
                    ? 'پرداخت پیش‌پرداخت'
                    : 'پرداخت و ثبت‌نام'}
                </button>

                {/* Secondary Action: Free Reservation */}
                <button
                  onClick={() => document.getElementById('reservation-form-submit')?.click()}
                  disabled={paymentState.mode === 'initiating' || paymentState.mode === 'redirecting'}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3.5',
                    'font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                  id="footer-reserve-btn"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                      <span className="text-[10px] font-bold">!</span>
                    </span>
                    رزرو رایگان
                  </span>
                </button>
              </div>
              <p className="mt-3 text-center text-xs text-slate-500">
                با ثبت‌نام، شما با <a href="/terms" className="underline hover:text-indigo-600" target="_blank" rel="noopener">شرایط و قوانین</a> موافقت می‌کنید.
              </p>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={handleClose}
            disabled={paymentState.mode === 'redirecting'}
            aria-label="بستن مُدال"
            className="absolute top-4 left-4 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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