'use client';

import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Loader2,
  MapPinned,
  MessageCircle,
  Monitor,
  RotateCcw,
  X,
} from 'lucide-react';

import {
  calculatePricingFromOffering,
  cn,
  formatPrice,
  getFirstInstallmentAmount,
  getInstallmentItemsForDisplay,
  getOfferingForMode,
  isOfferingAvailable,
} from '@/src/lib/utils';

import type {
  Course,
  ModalPaymentState,
  PaymentMode,
  PaymentResult,
  RegistrationType,
} from '@/src/types';

const RegistrationForm = dynamic(() => import('./RegistrationForm'), {
  loading: () => (
    <div
      className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-500"
      role="status"
    >
      <Loader2
        className="size-5 animate-spin motion-reduce:animate-none"
        aria-hidden="true"
      />
      در حال آماده‌سازی فرم…
    </div>
  ),
});

const CourseDescription = dynamic(
  async () => {
    const [{ default: ReactMarkdown }, { default: remarkGfm }] =
      await Promise.all([import('react-markdown'), import('remark-gfm')]);

    function Description({ children }: { children: string }) {
      return (
        <article
          className={cn(
            'prose prose-sm prose-slate max-w-none break-words text-right',
            'prose-headings:font-bold prose-headings:text-slate-900',
            'prose-p:leading-8 prose-li:leading-7',
            'prose-a:text-indigo-600 prose-img:rounded-xl',
            '[&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto',
          )}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
        </article>
      );
    }

    return Description;
  },
  {
    loading: () => (
      <p className="py-3 text-sm text-slate-500" role="status">
        در حال نمایش توضیحات…
      </p>
    ),
  },
);

interface RegistrationModalProps {
  course: Course | null;
  registrationType: RegistrationType;
  onClose: () => void;
}

interface ModalContentProps extends Omit<RegistrationModalProps, 'course'> {
  course: Course;
}

type FormVariant = 'payment' | 'consultation';
type ModalStep = 'detail' | 'form-payment' | 'form-consultation' | 'result';

type ConsultationPayload = {
  studentName: string;
  phoneNumber: string;
  courseId: string;
  registrationType: RegistrationType;
};

type PaymentPayload = ConsultationPayload & {
  paymentMode: PaymentMode;
};

type ApiResponse = {
  error?: string;
  orderId?: string;
  consultationId?: string;
  payUrl?: string;
  mockMode?: boolean;
  isTest?: boolean;
};

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2';

const primaryButton = cn(
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl',
  'bg-indigo-600 px-4 py-3 text-sm font-semibold text-white',
  'transition-colors hover:bg-indigo-700',
  'disabled:cursor-not-allowed disabled:opacity-45',
  focusRing,
);

const secondaryButton = cn(
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl',
  'border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700',
  'transition-colors hover:bg-slate-50',
  'disabled:cursor-not-allowed disabled:opacity-45',
  focusRing,
);

function getAvailableModes(course: Course): RegistrationType[] {
  if (course.courseOfferings?.length) {
    const active = course.courseOfferings.filter((item) => item.isAvailable);
    const source = active.length ? active : course.courseOfferings;

    return Array.from(
      new Set(source.map((item) => item.attendanceMode as RegistrationType)),
    );
  }

  const legacy = course as unknown as Record<string, unknown>;
  const modes: RegistrationType[] = [];

  if ((course as any).inPersonAvailable ?? legacy.in_person_available ?? false) {
    modes.push('in_person');
  }

  if ((course as any).onlineAvailable ?? legacy.online_available ?? false) {
    modes.push('online');
  }

  if ((course as any).oflineAvailable ?? legacy.ofline_available ?? false) {
    modes.push('ofline');
  }

  return modes.length ? modes : ['online'];
}


function getModeLabel(mode: RegistrationType): string {
  const labels: Record<RegistrationType, string> = {
    in_person: 'حضوری',
    online: 'آنلاین',
    ofline: 'آفلاین (ضبط‌شده)',
  };

  return labels[mode] ?? 'نامشخص';
}


function parseModalHash() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const courseId = params.get('modal');
  if (!courseId) return null;

  const value = params.get('step');
  const step: ModalStep =
    value === 'form-payment' ||
    value === 'form-consultation' ||
    value === 'result'
      ? value
      : 'detail';

  return { courseId, step };
}

function getPaymentCallback(): PaymentResult | null {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('payment_result');

  if (status !== 'success' && status !== 'failed' && status !== 'cancelled') {
    return null;
  }

  return {
    status,
    orderId: params.get('orderId') || undefined,
    error: params.get('error') || undefined,
  };
}

async function postJson(
  url: string,
  data: ConsultationPayload | PaymentPayload,
  signal: AbortSignal,
): Promise<ApiResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    signal,
  });

  const body: unknown = await response.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('پاسخ سرور معتبر نیست. لطفاً دوباره تلاش کنید.');
  }

  const result = body as ApiResponse;

  if (!response.ok) {
    throw new Error(
      typeof result.error === 'string'
        ? result.error
        : 'ثبت درخواست انجام نشد. لطفاً دوباره تلاش کنید.',
    );
  }

  return result;
}

const CoursePoster = memo(function CoursePoster({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
        تصویر دوره در دسترس نیست.
      </div>
    );
  }

  return (
    <div className="relative mx-auto aspect-square w-full max-w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <Image
        src={src}
        alt={`پوستر ${title}`}
        fill
        sizes="(max-width: 639px) 320px, (max-width: 767px) 44vw, 352px"
        className="object-contain"
        loading="eager"
        onError={() => setFailed(true)}
      />
    </div>
  );
});

function ModalContent({ course, registrationType, onClose }: ModalContentProps) {
  const reducedMotion = useReducedMotion();
  const titleId = useId();
  const attendanceName = useId();
  const paymentName = useId();

  const modalRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const busyRef = useRef(false);
  const closingRef = useRef(false);
  const requestRef = useRef<AbortController | null>(null);
  const originalHashRef = useRef('');
  const onCloseRef = useRef(onClose);

  onCloseRef.current = onClose;

  const availableModes = useMemo(() => getAvailableModes(course), [course]);

const [selectedMode, setSelectedMode] = useState<RegistrationType>(() => {
  // ۱. اگر مقدار درخواستی در مودهای معتبر دوره بود
  if (availableModes.includes(registrationType)) {
    return registrationType;
  }

  // ۲. اولویت‌بندی برای انتخاب پیش‌فرض: حضوری، سپس آنلاین، سپس آفلاین
  const preferredOrder: RegistrationType[] = ['in_person', 'online', 'ofline'];
  const defaultMode = preferredOrder.find((mode) => availableModes.includes(mode));

  return defaultMode ?? availableModes[0] ?? 'online';
});


  const [callbackResult] = useState(getPaymentCallback);

  const [step, setStep] = useState<ModalStep>(() => {
    if (callbackResult) return 'result';
    const hash = parseModalHash();

    if (hash?.courseId === String(course.id) && hash.step !== 'result') {
      return hash.step;
    }
    return 'detail';
  });

  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [paymentState, setPaymentState] = useState<ModalPaymentState>(() =>
    callbackResult ? { mode: 'result', result: callbackResult } : { mode: 'idle' },
  );
  const [lastSubmittedVariant, setLastSubmittedVariant] =
    useState<FormVariant>('payment');
  const [formError, setFormError] = useState<string | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);

  const currentOffering = useMemo(
    () => getOfferingForMode(course, selectedMode),
    [course, selectedMode],
  );

  const offeringAvailable = !!currentOffering && isOfferingAvailable(currentOffering);
  const supportsInstallments =
    !!currentOffering && Number(currentOffering.installmentsCount || 0) > 0;

  const pricing = useMemo(
    () =>
      currentOffering
        ? calculatePricingFromOffering(currentOffering, paymentMode)
        : null,
    [currentOffering, paymentMode],
  );

  const firstInstallmentAmount = useMemo(
    () =>
      currentOffering && paymentMode === 'installment'
        ? getFirstInstallmentAmount(currentOffering)
        : null,
    [currentOffering, paymentMode],
  );

  const installmentItems = useMemo(
    () =>
      currentOffering && paymentMode === 'installment'
        ? getInstallmentItemsForDisplay(currentOffering)
        : [],
    [currentOffering, paymentMode],
  );

  const result = paymentState.mode === 'result' ? paymentState.result : null;
  const isResult = step === 'result' && !!result;
  const isForm = step === 'form-payment' || step === 'form-consultation';
  const formVariant: FormVariant =
    step === 'form-consultation' ? 'consultation' : 'payment';

  const isBusy =
    isFormLoading ||
    paymentState.mode === 'initiating' ||
    paymentState.mode === 'redirecting';

  const amountDue =
    paymentMode === 'installment'
      ? firstInstallmentAmount
      : pricing?.baseAmount ?? null;

  const canPay =
    offeringAvailable &&
    !!pricing &&
    amountDue !== null &&
    Number.isFinite(amountDue) &&
    amountDue >= 0 &&
    (paymentMode !== 'installment' || pricing.installments.length > 0);

  const clearOwnHash = useCallback(() => {
    if (parseModalHash()?.courseId !== String(course.id)) return;

    const url = new URL(window.location.href);
    url.hash = originalHashRef.current;
    window.history.replaceState(window.history.state, '', url);
  }, [course.id]);

  const writeStep = useCallback(
    (nextStep: ModalStep, replace = false) => {
      const url = new URL(window.location.href);
      url.hash = new URLSearchParams({
        modal: String(course.id),
        step: nextStep,
      }).toString();

      if (url.href === window.location.href) return;

      if (replace) {
        window.history.replaceState(window.history.state, '', url);
      } else {
        window.history.pushState(window.history.state, '', url);
      }
    },
    [course.id],
  );

  const navigate = useCallback(
    (nextStep: ModalStep, replace = false) => {
      if (busyRef.current || closingRef.current) return;
      setFormError(null);
      setStep(nextStep);
      writeStep(nextStep, replace);
    },
    [writeStep],
  );

  const handleClose = useCallback(() => {
    if (busyRef.current || closingRef.current) return;
    closingRef.current = true;
    clearOwnHash();
    onCloseRef.current();
  }, [clearOwnHash]);

  const handleBack = useCallback(() => {
    if (busyRef.current) return;
    if (result) {
      navigate('detail', true);
      return;
    }
    navigate('detail');
  }, [navigate, result]);

  const changePaymentMode = useCallback(
    (mode: PaymentMode) => {
      if (busyRef.current) return;
      if (mode === 'installment' && !supportsInstallments) return;

      setPaymentMode(mode);
      setFormError(null);
    },
    [supportsInstallments],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestRef.current?.abort();
    };
  }, []);

  const stepRef = useRef(step);
  const resultRef = useRef(result);
  stepRef.current = step;
  resultRef.current = result;

  useEffect(() => {
    const previousHash = window.location.hash;
    const parsed = parseModalHash();
    originalHashRef.current = parsed ? '' : previousHash;

    if (callbackResult) {
      const url = new URL(window.location.href);
      url.searchParams.delete('payment_result');
      url.searchParams.delete('orderId');
      url.searchParams.delete('error');
      window.history.replaceState(window.history.state, '', url);
    }

    writeStep(stepRef.current, !!parsed || !!callbackResult);

    const handleHistoryChange = () => {
      if (closingRef.current) return;

      if (busyRef.current) {
        writeStep(stepRef.current, true);
        return;
      }

      const next = parseModalHash();

      if (!next || next.courseId !== String(course.id)) {
        closingRef.current = true;
        onCloseRef.current();
        return;
      }

      const nextStep =
        resultRef.current && next.step === 'result' ? 'result' : next.step;

      setFormError(null);
      setStep(nextStep);

      if (nextStep !== next.step) writeStep(nextStep, true);
    };

    window.addEventListener('popstate', handleHistoryChange);
    window.addEventListener('hashchange', handleHistoryChange);

    return () => {
      window.removeEventListener('popstate', handleHistoryChange);
      window.removeEventListener('hashchange', handleHistoryChange);
      clearOwnHash();
    };
  }, [callbackResult, clearOwnHash, course.id, writeStep]);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const body = document.body;
    const root = document.documentElement;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - root.clientWidth;

    const previousStyles = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    };

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${
        parseFloat(window.getComputedStyle(body).paddingRight || '0') +
        scrollbarWidth
      }px`;
    }

    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = `-${scrollX}px`;
    body.style.width = '100%';

    const overlay = modal.parentElement;
    const siblings = Array.from(body.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement &&
        element !== overlay &&
        !(overlay && element.contains(overlay)),
    );

    const inertStates = siblings.map((element) => ({
      element,
      inert: (element as any).inert ?? false,
    }));

    inertStates.forEach(({ element }) => {
      (element as any).inert = true;
    });

    modal.focus({ preventScroll: true });

    return () => {
      Object.assign(body.style, previousStyles);

      inertStates.forEach(({ element, inert }) => {
        (element as any).inert = inert;
      });

      const previousBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(scrollX, scrollY);
      root.style.scrollBehavior = previousBehavior;

      if (previousFocus?.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    modalRef.current?.focus({ preventScroll: true });
  }, [step]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const modal = modalRef.current;
      if (!modal) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();

        if (busyRef.current) return;

        if (stepRef.current === 'form-payment' || stepRef.current === 'form-consultation') {
          handleBack();
        } else {
          handleClose();
        }
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(
        (element) =>
          element.tabIndex >= 0 &&
          element.getClientRects().length > 0 &&
          !element.closest('[inert]') &&
          window.getComputedStyle(element).visibility !== 'hidden',
      );

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!first || !last) {
        event.preventDefault();
        modal.focus();
        return;
      }

      if (
        event.shiftKey &&
        (active === first || active === modal || !modal.contains(active))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (active === last || active === modal || !modal.contains(active))
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [handleBack, handleClose]);

  const showSuccess = useCallback(
    (paymentResult: PaymentResult, variant: FormVariant) => {
      setLastSubmittedVariant(variant);
      setPaymentState({ mode: 'result', result: paymentResult });
      setStep('result');
      writeStep('result', true);
      busyRef.current = false;
      setIsFormLoading(false);
    },
    [writeStep],
  );

  const handlePaymentInitiate = useCallback(
    async (data: PaymentPayload) => {
      if (busyRef.current || closingRef.current) return;

      if (!canPay) {
        setFormError('این روش پرداخت در حال حاضر در دسترس نیست.');
        return;
      }

      busyRef.current = true;
      setIsFormLoading(true);
      setFormError(null);
      setPaymentState({ mode: 'initiating' });
      setLastSubmittedVariant('payment');

      const controller = new AbortController();
      requestRef.current = controller;
      let redirecting = false;

      try {
        const response = await postJson(
          '/api/orders',
          {
            ...data,
            courseId: String(course.id),
            registrationType: selectedMode,
            paymentMode,
          },
          controller.signal,
        );

        if (!mountedRef.current) return;

        if (response.mockMode || response.isTest) {
          showSuccess({ status: 'success', orderId: response.orderId }, 'payment');
          return;
        }

        if (typeof response.payUrl !== 'string' || !response.payUrl.trim()) {
          throw new Error('آدرس درگاه پرداخت دریافت نشد. دوباره تلاش کنید.');
        }

        const paymentUrl = new URL(response.payUrl, window.location.origin);

        if (
          paymentUrl.protocol !== 'https:' &&
          !(paymentUrl.protocol === 'http:' && paymentUrl.origin === window.location.origin)
        ) {
          throw new Error('آدرس درگاه پرداخت معتبر نیست.');
        }

        setPaymentState({ mode: 'redirecting', paymentUrl: paymentUrl.href });
        window.location.assign(paymentUrl.href);
        redirecting = true;
      } catch (error) {
        if (!mountedRef.current || controller.signal.aborted) return;

        setPaymentState({ mode: 'idle' });
        setFormError(
          error instanceof Error ? error.message : 'ارتباط با درگاه پرداخت برقرار نشد.',
        );
      } finally {
        if (!redirecting) {
          busyRef.current = false;
          if (mountedRef.current) setIsFormLoading(false);
        }

        if (requestRef.current === controller) {
          requestRef.current = null;
        }
      }
    },
    [canPay, course.id, paymentMode, selectedMode, showSuccess],
  );

  const handleConsultation = useCallback(
    async (data: ConsultationPayload) => {
      if (busyRef.current || closingRef.current) return;

      busyRef.current = true;
      setIsFormLoading(true);
      setFormError(null);
      setLastSubmittedVariant('consultation');

      const controller = new AbortController();
      requestRef.current = controller;

      try {
        const response = await postJson(
          '/api/consultations',
          {
            ...data,
            courseId: String(course.id),
            registrationType: selectedMode,
          },
          controller.signal,
        );

        if (!mountedRef.current) return;

        showSuccess(
          { status: 'success', orderId: response.consultationId },
          'consultation',
        );
      } catch (error) {
        if (!mountedRef.current || controller.signal.aborted) return;

        setFormError(
          error instanceof Error
            ? error.message
            : 'درخواست مشاوره ثبت نشد. لطفاً دوباره تلاش کنید.',
        );
      } finally {
        busyRef.current = false;
        if (mountedRef.current) setIsFormLoading(false);

        if (requestRef.current === controller) {
          requestRef.current = null;
        }
      }
    },
    [course.id, selectedMode, showSuccess],
  );

  const handleRetry = useCallback(() => {
    if (busyRef.current) return;
    setPaymentState({ mode: 'idle' });
    navigate('detail', true);
  }, [navigate]);

  const heading = isResult
    ? 'نتیجه درخواست'
    : isForm
      ? formVariant === 'payment'
        ? 'تکمیل ثبت‌نام'
        : 'درخواست مشاوره'
      : course.title;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.16 }}
    >
      <div
        className="absolute inset-0 bg-slate-950/50"
        aria-hidden="true"
        onClick={handleClose}
      />

      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={isBusy}
        tabIndex={-1}
        dir="rtl"
        initial={{ y: reducedMotion ? 0 : 20 }}
        animate={{ y: 0 }}
        exit={{ y: reducedMotion ? 0 : 12 }}
        transition={{
          duration: reducedMotion ? 0 : 0.18,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={cn(
          'relative flex max-h-[94dvh] w-full min-w-0 flex-col overflow-hidden',
          'rounded-t-3xl bg-white shadow-xl outline-none',
          'sm:max-h-[90dvh] sm:max-w-3xl sm:rounded-2xl',
        )}
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
          {isForm && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isBusy}
              aria-label="بازگشت به جزئیات دوره"
              className={cn(
                'inline-flex size-11 shrink-0 items-center justify-center rounded-xl',
                'text-slate-600 hover:bg-slate-100 disabled:opacity-40',
                focusRing,
              )}
            >
              <ArrowRight className="size-5" aria-hidden="true" />
            </button>
          )}

          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="line-clamp-2 text-base font-bold leading-7 text-slate-900 sm:text-lg"
            >
              {heading}
            </h2>

            {isForm && (
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {course.title} · {getModeLabel(selectedMode)}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isBusy}
            aria-label="بستن پنجره"
            className={cn(
              'inline-flex size-11 shrink-0 items-center justify-center rounded-xl',
              'text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900',
              'disabled:cursor-not-allowed disabled:opacity-40',
              focusRing,
            )}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          style={{ scrollbarGutter: 'stable' }}
        >
          {step === 'detail' && (
            <div className="space-y-6 p-4 sm:p-6">
              <div
                className={cn(
                  'grid items-start gap-5 sm:gap-6',
                  course.coverImageUrl && 'sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
                )}
              >
                {course.coverImageUrl && (
                  <CoursePoster
                    key={course.coverImageUrl}
                    src={course.coverImageUrl}
                    title={course.title}
                  />
                )}

                <div className="min-w-0 space-y-5">
                  <fieldset>
                    <legend className="mb-2.5 text-xs font-medium text-slate-500">
                      نحوه برگزاری
                    </legend>

                    <div className="flex gap-2">
                      {availableModes.map((mode) => {
                        const selected = selectedMode === mode;
                        const Icon = mode === 'in_person' ? MapPinned : Monitor;

                        return (
                          <label
                            key={mode}
                            className={cn(
                              'relative flex min-h-11 min-w-0 flex-1 cursor-pointer',
                              'items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm',
                              'transition-colors focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2',
                              selected
                                ? 'border-indigo-200 bg-indigo-50 font-semibold text-indigo-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                            )}
                          >
                            <input
                              type="radio"
                              name={attendanceName}
                              value={mode}
                              checked={selected}
                              className="sr-only"
                              onChange={() => {
                                setSelectedMode(mode);
                                setPaymentMode('cash');
                                setFormError(null);
                              }}
                            />
                            <Icon className="size-4 shrink-0" aria-hidden="true" />
                            {getModeLabel(mode)}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  {currentOffering && supportsInstallments && (
                    <fieldset>
                      <legend className="mb-2.5 text-xs font-medium text-slate-500">
                        روش پرداخت
                      </legend>

                      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
                        {[
                          { value: 'cash', label: 'نقدی' },
                          { value: 'installment', label: 'اقساطی' },
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={cn(
                              'flex min-h-10 flex-1 cursor-pointer items-center justify-center',
                              'rounded-lg px-3 py-2 text-sm transition-colors',
                              'focus-within:ring-2 focus-within:ring-indigo-500',
                              paymentMode === option.value
                                ? 'bg-white font-semibold text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-800',
                            )}
                          >
                            <input
                              type="radio"
                              name={paymentName}
                              value={option.value}
                              checked={paymentMode === option.value}
                              onChange={() =>
                                changePaymentMode(option.value as PaymentMode)
                              }
                              className="sr-only"
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  {pricing && (
                    <section
                      aria-label="هزینه دوره"
                      className="rounded-2xl flex flex-col items-center justify-center border border-slate-200 p-4 sm:p-5"
                    >
                      <p className="text-xs text-slate-500">
                        {paymentMode === 'installment'
                          ? 'مجموع مبلغ اقساط'
                          : 'هزینه ثبت‌نام'}
                      </p>

                      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="fa-nums break-words text-2xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-3xl">
                          {formatPrice(
                            paymentMode === 'installment'
                              ? pricing.totalAmount
                              : pricing.baseAmount,
                          )}
                        </span>
                        <span className="text-xs text-slate-500">تومان</span>
                      </div>

                      {pricing.discountPercent > 0 &&
                        !!pricing.originalAmount &&
                        pricing.originalAmount > pricing.baseAmount && (
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                            <del className="fa-nums text-slate-400">
                              {formatPrice(pricing.originalAmount)} تومان
                            </del>
                            <span className="fa-nums rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
                              {pricing.discountPercent}٪ تخفیف
                            </span>
                          </div>
                        )}

                      {paymentMode === 'installment' &&
                        firstInstallmentAmount !== null && (
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-sm">
                            <span className="text-slate-500">پرداخت امروز</span>
                            <span className="fa-nums font-semibold text-indigo-700">
                              {formatPrice(firstInstallmentAmount)} تومان
                            </span>
                          </div>
                        )}
                    </section>
                  )}

                  {(!currentOffering || !offeringAvailable) && (
                    <div
                      role="status"
                      className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-800"
                    >
                      <AlertCircle
                        className="mt-0.5 size-4 shrink-0"
                        aria-hidden="true"
                      />
                      <p>
                        {!currentOffering
                          ? 'اطلاعات قیمت این گزینه موجود نیست. برای راهنمایی، درخواست مشاوره ثبت کنید.'
                          : 'ثبت‌نام این گزینه فعلاً فعال نیست. می‌توانید درخواست مشاوره ثبت کنید.'}
                      </p>
                    </div>
                  )}

                  {paymentMode === 'installment' &&
                    pricing &&
                    pricing.installments.length === 0 && (
                      <p className="text-sm leading-6 text-amber-700" role="status">
                        برنامه اقساط این گزینه در دسترس نیست.
                      </p>
                    )}
                </div>
              </div>

              {paymentMode === 'installment' && pricing && pricing.installments.length > 0 && (
                <section aria-label="برنامه اقساط">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">
                    برنامه پرداخت
                  </h3>

                  <ol className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
                    {pricing.installments.map((item) => (
                      <li
                        key={`${item.index}-${item.amount}`}
                        className={cn(
                          'flex items-center justify-between gap-x-4 gap-y-2 px-4 py-3',
                          item.isDownPayment ? 'bg-indigo-50/50' : 'bg-white',
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="fa-nums flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-500">
                            {item.index}
                          </span>
                          <div className="min-w-0">
                            <p className="break-words text-sm text-slate-700">{item.label}</p>
                            {item.isDownPayment && (
                              <p className="mt-0.5 text-xs text-indigo-600">پیش‌پرداخت</p>
                            )}
                          </div>
                        </div>

                        <p className="fa-nums mr-auto whitespace-nowrap text-sm font-semibold tabular-nums text-slate-900">
                          {formatPrice(item.amount)}
                          <span className="mr-1.5 text-xs font-normal text-slate-500">
                            تومان
                          </span>
                        </p>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {course.description && (
                <details
                  className="group rounded-2xl border border-slate-200"
                  onToggle={(event) => setDescriptionOpen(event.currentTarget.open)}
                >
                  <summary
                    className={cn(
                      'flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 py-3',
                      'text-sm font-semibold text-slate-800 [&::-webkit-details-marker]:hidden',
                      focusRing,
                    )}
                  >
                    توضیحات و جزئیات دوره
                    <ChevronDown
                      className="size-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </summary>

                  {descriptionOpen && (
                    <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
                      <CourseDescription>{course.description}</CourseDescription>
                    </div>
                  )}
                </details>
              )}

              <p className="text-center text-xs leading-6 text-slate-500">
                برای انتخاب دوره یا روش پرداخت نیاز به راهنمایی دارید؟
                <br className="sm:hidden" /> مشاوره رایگان در دسترس شماست.
              </p>
            </div>
          )}

          {isForm && (
            <div className="mx-auto w-full max-w-xl p-4 sm:p-6">
              <RegistrationForm
                key={formVariant}
                course={course}
                registrationType={selectedMode}
                paymentMode={paymentMode}
                onPaymentModeChange={changePaymentMode}
                onPaymentInitiate={handlePaymentInitiate}
                onConsultation={handleConsultation}
                isLoading={isBusy}
                error={formError}
                variant={formVariant}
                onClose={handleBack}
                offering={currentOffering}
                pricing={pricing}
                firstInstallmentAmount={firstInstallmentAmount}
                installmentItems={installmentItems}
              />

              {paymentState.mode === 'redirecting' && (
                <p
                  role="status"
                  className="mt-4 flex items-center justify-center gap-2 text-sm text-indigo-700"
                >
                  <Loader2
                    className="size-4 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  در حال انتقال به درگاه پرداخت…
                </p>
              )}
            </div>
          )}

          {isResult && result && (
            <div
              className="mx-auto flex min-h-80 max-w-md flex-col items-center justify-center px-5 py-10 text-center sm:py-14"
              role="status"
              aria-live="polite"
            >
              <div
                className={cn(
                  'mb-5 flex size-16 items-center justify-center rounded-full',
                  result.status === 'success'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-rose-50 text-rose-600',
                )}
              >
                {result.status === 'success' ? (
                  <CheckCircle2 className="size-8" aria-hidden="true" />
                ) : (
                  <AlertCircle className="size-8" aria-hidden="true" />
                )}
              </div>

              <h3 className="text-lg font-bold leading-8 text-slate-900 sm:text-xl">
                {result.status === 'success'
                  ? lastSubmittedVariant === 'consultation'
                    ? 'درخواست مشاوره ثبت شد'
                    : 'ثبت‌نام با موفقیت انجام شد'
                  : result.status === 'cancelled'
                    ? 'پرداخت لغو شد'
                    : 'پرداخت انجام نشد'}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                {result.status === 'success'
                  ? lastSubmittedVariant === 'consultation'
                    ? 'کارشناسان آکادمی برای راهنمایی با شما تماس می‌گیرند.'
                    : 'درخواست شما با موفقیت ثبت شد.'
                  : result.error || 'تراکنش تکمیل نشد. می‌توانید دوباره تلاش کنید.'}
              </p>

              {result.status === 'success' && result.orderId && (
                <div className="mt-5 w-full rounded-xl bg-slate-50 px-4 py-3">
                  <p className="mb-1.5 text-xs text-slate-500">شماره پیگیری</p>
                  <p
                    dir="ltr"
                    className="select-all break-all text-sm font-semibold text-slate-800"
                  >
                    {result.orderId}
                  </p>
                </div>
              )}

              <div className="mt-7 flex w-full flex-wrap justify-center gap-3">
                {result.status !== 'success' && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className={cn(primaryButton, 'flex-1')}
                  >
                    <RotateCcw className="size-4" aria-hidden="true" />
                    تلاش مجدد
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleClose}
                  className={cn(
                    result.status === 'success' ? primaryButton : secondaryButton,
                    'flex-1',
                  )}
                >
                  {result.status === 'success' ? 'متوجه شدم' : 'بستن'}
                </button>
              </div>
            </div>
          )}
        </div>

        {step === 'detail' && (
          <footer
            className="shrink-0 border-t border-slate-100 bg-white px-4 pt-3 sm:px-6 sm:pt-4"
            style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500">
                {paymentMode === 'installment' ? 'مبلغ مرحله اول' : 'مبلغ قابل پرداخت'}
              </span>

              <p className="fa-nums text-lg font-bold tabular-nums text-slate-900">
                {canPay && amountDue !== null ? (
                  amountDue === 0 ? (
                    'رایگان'
                  ) : (
                    <>
                      {formatPrice(amountDue)}
                      <span className="mr-1.5 text-xs font-normal text-slate-500">تومان</span>
                    </>
                  )
                ) : (
                  <span className="text-sm font-medium text-slate-400">ثبت‌نام غیرفعال</span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => navigate('form-payment')}
                disabled={!canPay || isBusy}
                className={primaryButton}
              >
                <CreditCard className="size-4 shrink-0" aria-hidden="true" />
                ثبت‌نام
              </button>

              <button
                type="button"
                onClick={() => navigate('form-consultation')}
                disabled={isBusy}
                className={secondaryButton}
              >
                <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
                مشاوره رایگان
              </button>
            </div>

            <p className="mt-2.5 text-center text-[11px] leading-5 text-slate-400">
              ثبت‌نام به معنی پذیرش{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'rounded text-slate-600 underline underline-offset-4 hover:text-indigo-600',
                  focusRing,
                )}
              >
                شرایط و قوانین
              </a>{' '}
              است.
            </p>
          </footer>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function RegistrationModal({
  course,
  registrationType,
  onClose,
}: RegistrationModalProps) {
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  if (!portalReady) return null;

  return createPortal(
    <AnimatePresence initial={false} mode="wait">
      {course && (
        <ModalContent
          key={course.id}
          course={course}
          registrationType={registrationType}
          onClose={onClose}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}
