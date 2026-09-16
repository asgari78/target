'use client';

import ReactMarkdown from 'react-markdown';
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
  Sparkles,
  Layers,
  HelpCircle,
  Tag,
} from 'lucide-react';

import RegistrationForm from './RegistrationForm';
import {
  cn,
  formatPrice,
  getModeIcon,
  getOfferingForMode,
  isOfferingAvailable,
  calculatePricingFromOffering,
  getFirstInstallmentAmount,
  getInstallmentItemsForDisplay,
} from '@/src/lib/utils';
import type {
  Course,
  PaymentMode,
  RegistrationType,
  PaymentResult,
  ModalPaymentState,
} from '@/src/types';
import remarkGfm from 'remark-gfm';

interface RegistrationModalProps {
  course: Course | null;
  registrationType: RegistrationType;
  onClose: () => void;
}

type FormVariant = 'payment' | 'consultation' | null;
type ViewState = 'detail' | 'form' | 'result';
type ModalStep = 'detail' | 'form-payment' | 'form-consultation' | 'result';

export default function RegistrationModal({ course, onClose }: RegistrationModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const isMountedRef = useRef(false);

  // Hash-based history management for modal
  const getModalHash = useCallback((step: ModalStep, courseId: string) => {
    return `#modal=${courseId}&step=${step}`;
  }, []);

  const parseModalHash = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash;
    if (!hash.startsWith('#modal=')) return null;
    const params = new URLSearchParams(hash.slice(1).replace('modal=', ''));
    return {
      courseId: params.get('modal')?.split('&')[0] || params.get('courseId') || '',
      step: (params.get('step') as ModalStep) || 'detail',
    };
  }, []);

  const updateHash = useCallback(
    (step: ModalStep) => {
      if (!course || typeof window === 'undefined') return;
      const hash = getModalHash(step, course.id);
      if (window.location.hash !== hash) {
        history.pushState(null, '', hash);
      }
    },
    [course, getModalHash],
  );

  const clearHash = useCallback(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#modal=')) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  const availableModes = useMemo(() => {
    if (!course) return [] as RegistrationType[];

    if (course.courseOfferings && course.courseOfferings.length > 0) {
      const activeOfferings = course.courseOfferings
        .filter((o) => o.isAvailable)
        .map((o) => o.attendanceMode) as RegistrationType[];

      if (activeOfferings.length > 0) {
        return Array.from(new Set(activeOfferings));
      }
    }

    const isOnline =
      course.onlineAvailable ??
      (course as unknown as Record<string, unknown>).online_available ??
      false;

    const isInPerson =
      course.inPersonAvailable ??
      (course as unknown as Record<string, unknown>).in_person_available ??
      false;

    const modes: RegistrationType[] = [];
    if (isOnline) modes.push('online');
    if (isInPerson) modes.push('in_person');

    return modes.length > 0 ? modes : (['online'] as RegistrationType[]);
  }, [course]);

  const [selectedMode, setSelectedMode] = useState<RegistrationType>(() => {
    return availableModes[0] || 'online';
  });

  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [paymentState, setPaymentState] = useState<ModalPaymentState>({ mode: 'idle' });
  const [formVariant, setFormVariant] = useState<FormVariant>(null);
  const [lastSubmittedVariant, setLastSubmittedVariant] = useState<FormVariant>(null);
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
          tabActive: 'bg-indigo-600 text-white shadow-indigo-200/50 shadow-md',
          tabInactive: 'text-slate-600 hover:text-indigo-900 hover:bg-indigo-50/50',
          badge: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
          primaryGradient: 'from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800',
          primaryShadow: 'shadow-lg shadow-indigo-600/25',
          pricingBg: 'from-indigo-900 via-slate-900 to-indigo-950 text-white',
          highlightRing: 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/30',
          activeToggle: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30',
        }
      : {
          accent: 'emerald',
          tabActive: 'bg-emerald-600 text-white shadow-emerald-200/50 shadow-md',
          tabInactive: 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50/50',
          badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
          primaryGradient: 'from-emerald-600 via-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800',
          primaryShadow: 'shadow-lg shadow-emerald-600/25',
          pricingBg: 'from-emerald-900 via-slate-900 to-emerald-950 text-white',
          highlightRing: 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/30',
          activeToggle: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30',
        };
  }, [selectedMode]);

  // Handle URL redirect result params from payment gateway
  useEffect(() => {
    const paymentResultParam = searchParams.get('payment_result');
    const orderIdParam = searchParams.get('orderId');
    const errorParam = searchParams.get('error');

    if (!paymentResultParam) return;

    const isSuccess = paymentResultParam === 'success';
    const isCancelled = paymentResultParam === 'cancelled';

    const paymentResult: PaymentResult = {
      status: isSuccess ? 'success' : isCancelled ? 'cancelled' : 'failed',
      orderId: orderIdParam || undefined,
      error: errorParam || undefined,
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

    const initialMode = availableModes[0] || 'online';

    const timer = setTimeout(() => {
      setSelectedMode(initialMode);
      setPaymentMode('cash');
      setFormError(null);
      setPaymentState({ mode: 'idle' });
      setViewState('detail');
      setFormVariant(null);
      setLastSubmittedVariant(null);
      previousActiveElement.current = document.activeElement as HTMLElement;
    }, 0);

    return () => clearTimeout(timer);
  }, [course, availableModes]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    return () => {
      const scrollYPos = Math.abs(parseInt(document.body.style.top || '0', 10));
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollYPos);
    };
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, []);

  const handleClose = useCallback(() => {
    if (paymentState.mode === 'redirecting') return;
    clearHash();
    restoreFocus();
    onClose();
  }, [onClose, paymentState.mode, restoreFocus, clearHash]);

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
    clearHash();
    restoreFocus();
    onClose();
  }, [onClose, restoreFocus, clearHash]);

  const openPaymentForm = useCallback(() => {
    setFormVariant('payment');
    setViewState('form');
  }, []);

  const openConsultationForm = useCallback(() => {
    setFormVariant('consultation');
    setViewState('form');
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseModalHash();
      if (!parsed || parsed.courseId !== course?.id) {
        if (isMountedRef.current) {
          handleClose();
        }
        return;
      }
      switch (parsed.step) {
        case 'detail':
          handleBackToDetail();
          break;
        case 'form-payment':
          if (viewState !== 'form' || formVariant !== 'payment') {
            openPaymentForm();
          }
          break;
        case 'form-consultation':
          if (viewState !== 'form' || formVariant !== 'consultation') {
            openConsultationForm();
          }
          break;
        case 'result':
          break;
      }
    };

    const handlePopState = () => {
      handleHashChange();
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [course?.id, viewState, formVariant, handleBackToDetail, openPaymentForm, openConsultationForm, handleClose, parseModalHash]);

  // Update hash when internal state changes
  useEffect(() => {
    if (!course || !isMountedRef.current) return;
    if (viewState === 'detail') {
      updateHash('detail');
    } else if (viewState === 'form' && formVariant === 'payment') {
      updateHash('form-payment');
    } else if (viewState === 'form' && formVariant === 'consultation') {
      updateHash('form-consultation');
    } else if (paymentState.mode === 'result' || viewState === 'result') {
      updateHash('result');
    }
  }, [viewState, formVariant, paymentState.mode, course, updateHash]);

  // Initialize hash on mount, clear on unmount
  useEffect(() => {
    isMountedRef.current = true;
    if (course) {
      const parsed = parseModalHash();
      if (!parsed || parsed.courseId !== course.id) {
        updateHash('detail');
      }
    }
    return () => {
      isMountedRef.current = false;
      clearHash();
    };
  }, [course, parseModalHash, updateHash, clearHash]);

  // Accessibility focus trap & shortcuts
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

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
      setLastSubmittedVariant('payment');

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

        if (result.paymentUrl) {
          setPaymentState({ mode: 'redirecting', paymentUrl: result.paymentUrl });
          window.location.href = result.paymentUrl;
        } else {
          setPaymentState({
            mode: 'result',
            result: { status: 'success', orderId: result.orderId },
          });
          setViewState('result');
        }
      } catch (error) {
        setPaymentState({
          mode: 'result',
          result: {
            status: 'failed',
            error: error instanceof Error ? error.message : 'خطا در برقراری ارتباط با درگاه پرداخت',
          },
        });
        setFormError(error instanceof Error ? error.message : 'خطا در پردازش پرداخت');
        setViewState('result');
      } finally {
        setIsFormLoading(false);
      }
    },
    [],
  );

  const handleConsultation = useCallback(
    async (data: { studentName: string; phoneNumber: string; courseId: string }) => {
      setIsFormLoading(true);
      setFormError(null);
      setLastSubmittedVariant('consultation');

      try {
        const response = await fetch('/api/consultations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_name: data.studentName,
            phone_number: data.phoneNumber,
            course_id: data.courseId,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'خطا در ثبت درخواست مشاوره');
        }

        setPaymentState({
          mode: 'result',
          result: { status: 'success' },
        });
        setViewState('result');
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'خطا در ثبت درخواست مشاوره');
      } finally {
        setIsFormLoading(false);
      }
    },
    [],
  );

  if (!course) return null;

  const showResult = (viewState === 'result' || paymentState.mode === 'result') && !!paymentState.result;
  const result = paymentState.result;
  const hasTabs = availableModes.length > 1;

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
          className="absolute inset-0 bg-slate-950/65 backdrop-blur-md transition-opacity"
          onClick={handleClose}
          aria-hidden="true"
        />

        <motion.div
          ref={modalRef}
          dir="rtl"
          initial={{ y: 40, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0, scale: 0.98 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className={cn(
            'relative flex h-full max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl border border-slate-100',
          )}
        >
          {/* Header Bar */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-3.5 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Sparkles className="h-4 w-4 text-amber-500" />
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800">ثبت‌نام و رزرو دوره</span>
            </div>

            <button
              onClick={handleClose}
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800"
              aria-label="بستن مودال"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Result State View */}
          {showResult && (
            <div className="flex-1 flex flex-col items-center justify-center bg-white p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {result?.status === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    className="max-w-md space-y-4 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                      className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 shadow-inner"
                    >
                      <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                    </motion.div>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      {lastSubmittedVariant === 'consultation'
                        ? 'درخواست مشاوره با موفقیت ثبت شد'
                        : result?.orderId
                          ? 'پرداخت با موفقیت انجام شد'
                          : 'رزرو دوره با موفقیت انجام شد'}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {lastSubmittedVariant === 'consultation'
                        ? 'پشتیبانی آکادمی تارگت در سریع‌ترین زمان ممکن برای مشاوره تخصصی با شما تماس خواهد گرفت.'
                        : result?.orderId
                          ? 'شماره پیگیری سفارش شما: ' + result.orderId.slice(0, 8).toUpperCase()
                          : 'پشتیبانی آکادمی در سریع‌ترین زمان با شما تماس خواهد گرفت.'}
                    </p>
                    <button
                      onClick={handlePaymentSuccess}
                      className={cn(
                        'mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-xl transition-all',
                        theme.primaryGradient,
                        theme.primaryShadow,
                      )}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      متوجه شدم و بستن
                    </button>
                  </motion.div>
                )}

                {(result?.status === 'failed' || result?.status === 'cancelled') && (
                  <motion.div
                    key="failed"
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    className="max-w-md space-y-4 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                      className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 shadow-inner"
                    >
                      <AlertCircle className="h-10 w-10 text-rose-600" />
                    </motion.div>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      {result.status === 'cancelled' ? 'پرداخت لغو شد' : 'عملیات ناموفق بود'}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {result.error || formError || 'تراکنش توسط کاربر لغو شد یا مشکلی در درگاه پرداخت رخ داده است.'}
                    </p>

                    <div className="flex justify-center gap-3 pt-2">
                      <button
                        onClick={handleRetry}
                        className={cn(
                          'inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all',
                          theme.primaryGradient,
                        )}
                      >
                        <RotateCcw className="h-4 w-4" />
                        تلاش مجدد
                      </button>
                      <button
                        onClick={handleClose}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
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
          {!showResult && viewState === 'detail' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Top Mode Selector Tabs */}
              {hasTabs && (
                <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
                  <div className="w-full inline-flex rounded-2xl bg-slate-200/60 p-1 backdrop-blur-sm" role="tablist">
                    {availableModes.map((mode) => {
                      const active = selectedMode === mode;
                      const Icon = getModeIcon(mode) === 'map-pin' ? MapPinned : Monitor;
                      return (
                        <button
                          key={mode}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => {
                            setSelectedMode(mode);
                            setPaymentMode('cash');
                          }}
                          className={cn(
                            'relative rounded-xl px-3 py-2 text-xs sm:text-sm font-bold w-1/2 transition-all duration-200',
                            active ? theme.tabActive : theme.tabInactive,
                          )}
                        >
                          <span className="inline-flex items-center justify-center gap-1.5">
                            <Icon className="h-4 w-4" />
                            {mode === 'in_person' ? 'حضوری' : 'آنلاین (تعاملی)'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Scrollable Main Content */}
              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 space-y-6">
                
                {/* 1. Minimal 1:1 Poster & Title Section */}
                <div className="flex flex-col items-center text-center space-y-3">
                  {course.coverImageUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative aspect-square w-full max-w-[240px] sm:max-w-[280px] rounded-3xl overflow-hidden shadow-xl shadow-slate-200 border border-slate-100 bg-slate-100 group"
                    >
                      <Image
                        src={course.coverImageUrl}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 240px, 280px"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60" />
                      
                      <span className={cn(
                        "absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold shadow-md backdrop-blur-md",
                        selectedMode === 'in_person' ? 'bg-indigo-600/90 text-white' : 'bg-emerald-600/90 text-white'
                      )}>
                        {selectedMode === 'in_person' ? <MapPinned className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                        {selectedMode === 'in_person' ? 'دوره حضوری' : 'دوره آنلاین'}
                      </span>
                    </motion.div>
                  )}

                  {/* Course Title rendered strictly under photo */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-xl space-y-1"
                  >
                    <h2 id="modal-title" className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                      {course.title}
                    </h2>
                    {course.instructor_name && (
                      <p className="text-xs sm:text-sm font-semibold text-slate-500">
                        مدرس: <span className="text-slate-700">{course.instructor_name}</span>
                      </p>
                    )}
                  </motion.div>
                </div>

                {/* 2. Super Prominent Cash/Installment Box */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-3xl p-3.5 sm:p-4 bg-gradient-to-b from-slate-50 to-white border-2 border-slate-200/90 shadow-md shadow-slate-100"
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-indigo-600" />
                      انتخاب روش پرداخت:
                    </span>
                    {currentOffering?.installmentsCount && currentOffering.installmentsCount > 0 ? (
                      <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                        امکان پرداخت اقساطی ({currentOffering.installmentsCount} مرحله)
                      </span>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: 'cash' as PaymentMode, label: 'پرداخت نقدی', subLabel: 'تخفیف بیشتر و تسویه یکجا', icon: CreditCard },
                      {
                        id: 'installment' as PaymentMode,
                        label: 'پرداخت اقساطی',
                        subLabel: currentOffering ? `در ${currentOffering.installmentsCount} مرحله آسان` : 'تقسیط شهریه',
                        icon: Layers,
                      },
                    ].map((option) => {
                      const isSelected = paymentMode === option.id;
                      const isDisabled = option.id === 'installment' && (!currentOffering || currentOffering.installmentsCount <= 0);

                      return (
                        <button
                          key={option.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          disabled={isDisabled}
                          onClick={() => !isDisabled && setPaymentMode(option.id)}
                          className={cn(
                            'relative flex flex-col items-center justify-center rounded-2xl p-3 sm:p-4 text-center transition-all duration-200 border-2',
                            isSelected
                              ? theme.activeToggle + ' border-transparent shadow-lg scale-[1.02]'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50',
                            isDisabled && 'opacity-40 cursor-not-allowed hover:bg-white hover:border-slate-200',
                          )}
                        >
                          <option.icon className={cn("h-5 w-5 mb-1.5", isSelected ? "text-white" : "text-slate-500")} />
                          <span className="text-xs sm:text-sm font-black">{option.label}</span>
                          <span className={cn("text-[10px] sm:text-[11px] mt-0.5 font-medium line-clamp-1", isSelected ? "text-white/80" : "text-slate-400")}>
                            {option.subLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {paymentMode === 'installment' && !currentOffering?.installmentsCount && (
                    <p className="mt-2 text-xs text-amber-700 text-center font-semibold">
                      پرداخت اقساطی برای این شیوه برگزاری تعریف نشده است.
                    </p>
                  )}
                </motion.div>

                {/* 3. Pricing Display (Original vs Final Price) */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  {pricing && (
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm space-y-4">
                      {paymentMode === 'cash' && (
                        <div className="flex flex-col items-center justify-center text-center space-y-1 py-1">
                          {/* Discount Badge + Original Price (Small & Strikethrough) */}
                          {pricing.originalAmount && pricing.originalAmount > pricing.baseAmount ? (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs sm:text-sm text-slate-400 font-medium line-through fa-nums">
                                {formatPrice(pricing.originalAmount)} تومان
                              </span>
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] font-extrabold text-rose-600">
                                <Tag className="h-3 w-3" />
                                {pricing.discountPercent}٪ تخفیف
                              </span>
                            </div>
                          ) : null}

                          {/* Final Main Price (Large & Bold) */}
                          <div className="flex items-baseline justify-center gap-1.5">
                            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight fa-nums">
                              {formatPrice(pricing.baseAmount)}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-600">تومان</span>
                          </div>

                          <p className="text-[11px] text-slate-500 font-medium pt-0.5">
                            شهریه نهایی جهت ثبت‌نام و تسویه حساب کامل
                          </p>
                        </div>
                      )}

                      {paymentMode === 'installment' && pricing.installments.length > 0 && (
                        <div className="space-y-3">
                          {/* Installment Header Total */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3 px-1">
                            <div>
                              <span className="text-xs font-semibold text-slate-500 block">مجموع کل اقساط</span>
                              <span className="text-xl sm:text-2xl font-black text-slate-900 fa-nums">
                                {formatPrice(pricing.totalAmount)} <span className="text-xs font-bold text-slate-600">تومان</span>
                              </span>
                            </div>

                            {pricing.originalAmount && pricing.originalAmount > pricing.baseAmount ? (
                              <div className="text-left">
                                <span className="text-xs text-slate-400 line-through fa-nums block">
                                  {formatPrice(pricing.originalAmount)} تومان
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                  {pricing.discountPercent}٪ تخفیف ویژه
                                </span>
                              </div>
                            ) : null}
                          </div>

                          {/* Breakdown list */}
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {pricing.installments.map((item) => (
                              <div
                                key={item.index}
                                className={cn(
                                  'flex items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-sm border transition-colors',
                                  item.isDownPayment
                                    ? 'bg-amber-50/80 border-amber-200 text-amber-950 font-bold'
                                    : 'bg-slate-50/80 border-slate-100 text-slate-700',
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                                    item.isDownPayment ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-600"
                                  )}>
                                    {item.index}
                                  </span>
                                  <span>{item.label}</span>
                                </div>
                                <span className="font-extrabold fa-nums">
                                  {formatPrice(item.amount)} تومان
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!offeringAvailable && (
                    <div className="rounded-2xl p-4 text-center border border-rose-200 bg-rose-50/80">
                      <AlertCircle className="mx-auto mb-1.5 h-6 w-6 text-rose-500" />
                      <p className="text-xs sm:text-sm font-bold text-rose-700">این ظرفیت برگزاری در حال حاضر تکمیل یا غیرفعال است</p>
                    </div>
                  )}
                </motion.div>

                {/* 4. Course Description (Markdown RTL) */}
                {course.description && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-3xl p-4 sm:p-5 border border-slate-200/80 bg-slate-50/50"
                  >
                    <h3 className="text-xs font-bold text-slate-500 mb-2 border-b border-slate-200/60 pb-2">
                      توضیحات و مشخصات دوره:
                    </h3>
                    <div className="prose prose-slate prose-sm max-w-none text-slate-700 text-right leading-relaxed 
                                    prose-headings:font-extrabold prose-headings:text-slate-900 
                                    prose-h2:text-base prose-h2:mt-4 prose-h2:mb-2 
                                    prose-ul:list-disc prose-ul:pr-4 prose-li:my-1 
                                    prose-hr:my-3 prose-strong:text-slate-900">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {course.description}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 5. Minimal Sticky Footer */}
              <div className="sticky bottom-0 z-20 border-t border-slate-100 bg-white/95 px-4 py-3.5 sm:px-6 backdrop-blur-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto">
                  {/* دکمه اصلی ثبت نام / پرداخت - همواره تم سبز برجسته */}
                  <button
                    onClick={openPaymentForm}
                    disabled={paymentState.mode === 'initiating' || paymentState.mode === 'redirecting' || !offeringAvailable || !pricing}
                    className={cn(
                      'relative flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-extrabold text-white transition-all duration-200 active:scale-[0.98]',
                      'bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800',
                      'shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 border border-emerald-500/20',
                      'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none'
                    )}
                  >
                    {paymentState.mode === 'initiating' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    <span>
                      {paymentMode === 'installment' && firstInstallmentAmount
                        ? `پرداخت پیش‌پرداخت (${formatPrice(firstInstallmentAmount)} تومان)`
                        : `تکمیل ثبت‌نام (${formatPrice(pricing?.baseAmount ?? 0)} تومان)`}
                    </span>
                  </button>

                  {/* دکمه ثانویه - درخواست مشاوره */}
                  <button
                    onClick={openConsultationForm}
                    disabled={paymentState.mode === 'initiating' || paymentState.mode === 'redirecting'}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-100/80 px-4 py-3.5',
                      'text-sm font-bold text-slate-700 transition-all duration-200 hover:bg-slate-200/70 hover:border-slate-300 hover:text-slate-900 active:scale-[0.98]',
                      'disabled:cursor-not-allowed disabled:opacity-50'
                    )}
                  >
                    <HelpCircle className="h-4 w-4 text-amber-600" />
                    درخواست مشاوره رایگان
                  </button>
                </div>

                <p className="mt-2.5 text-center text-[10px] text-slate-400 font-medium">
                  ثبت‌نام به منزله پذیرش{' '}
                  <a href="/terms" className="underline hover:text-emerald-600 transition-colors" target="_blank" rel="noopener">
                    قوانین و مقررات آکادمی
                  </a>{' '}
                  می‌باشد.
                </p>
              </div>

            </div>
          )}

          {/* Form View */}
          {!showResult && viewState === 'form' && formVariant && (
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              <div className="border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
                <button
                  onClick={handleBackToDetail}
                  type="button"
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  بازگشت
                </button>
                <h3 className="text-sm font-black text-slate-800">
                  {formVariant === 'payment' ? 'اطلاعات ثبت‌نام و پرداخت' : 'فرم درخواست مشاوره رایگان'}
                </h3>
                <div className="w-16" />
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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
  );
}
