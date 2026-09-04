'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface SlideMetaItem {
  label: string;
  value: string;
}

export interface Slide {
  id: number;
  image: string;
  mobileImage?: string;
  alt: string;
  title?: string;
  subtitle?: string;
  details?: SlideMetaItem[];
  titleClassName?: string;
  subtitleClassName?: string;
  detailsClassName?: string;
  overlayClassName?: string;
}

const defaultSlides: Slide[] = [
  {
    id: 1,
    image: '/images/slider/1.png',
    mobileImage: '/images/slider/mobile1.png',
    alt: 'موسسه آموزشی تارگت - کلاس‌های حضوری',
    title: 'دوره جامع تیزهوشان دهم',
    subtitle: 'دوره‌های تخصصی ریاضیات با بهترین متدها و ابزارهای تست زنی',
    details: [
      { label: 'استاد', value: 'محمدحسین محسنی فر' },
      { label: 'طول دوره', value: '۴۰ جلسه ۱:۳۰ ساعته' },
      { label: 'نحوه برگزاری', value: 'آنلاین و حضوری' },
    ],
    titleClassName: 'text-sky-900 font-digi-lalezar',
    subtitleClassName: 'text-slate-700 font-digi-shohreh',
    detailsClassName: 'text-slate-700',
    overlayClassName: 'from-white/65 via-white/20 to-white/65',
  },
  {
    id: 2,
    image: '/images/slider/2.png',
    mobileImage: '/images/slider/mobile2.png',
    alt: 'دوره جامع تیزهوشان ششم',
    title: 'دوره جامع تیزهوشان ششم',
    subtitle: 'کلاس‌های آنلاین با کیفیت عالی در گوگل میت',
    details: [
      { label: 'مخاطب', value: 'دانش‌آموزان پایه ششم' },
      { label: 'تعداد جلسات', value: '۴۰ جلسه ۲ ساعته' },
      { label: 'نحوه برگزاری', value: 'آنلاین و حضوری' },
      { label: 'استاد', value: 'حامد شهبازی (پرمخاطب‌ترین معلم استان قم)' },
    ],
    titleClassName: 'text-indigo-900 font-digi-lalezar',
    subtitleClassName: 'text-indigo-700 font-digi-shohreh',
    detailsClassName: 'text-slate-700',
    overlayClassName: 'from-white/70 via-white/20 to-white/70',
  },
  {
    id: 3,
    image: '/images/slider/3.png',
    mobileImage: '/images/slider/mobile3.png',
    alt: 'موسسه آموزشی تارگت - محیط آموزشی',
    title: 'آموزش جامع ریاضی چهارم',
    subtitle: 'آموزش صفر تا صد ریاضی چهارم ابتدایی (کتاب + نکات تکمیلی)',
    details: [
      { label: 'فضا', value: 'سالن مجهز و استاندارد' },
      { label: 'امکانات', value: 'کلاس هوشمند + محتوای تعاملی' },
      { label: 'محل برگزاری', value: 'حضوری فقط قم' },
    ],
    titleClassName: 'text-cyan-900 font-digi-lalezar',
    subtitleClassName: 'text-slate-700 font-digi-shohreh',
    detailsClassName: 'text-slate-700',
    overlayClassName: 'from-white/65 via-white/15 to-white/65',
  },
];

interface HeroSliderProps {
  slides?: Slide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
  minHeightClassName?: string;
}

const SWIPE_THRESHOLD = 45;

function SlideImage({
  slide,
  active,
  priority,
}: {
  slide: Slide;
  active: boolean;
  priority: boolean;
}) {
  return (
    <div
      className={cn(
        'absolute inset-0 transition-opacity duration-500 ease-out will-change-[opacity]',
        active ? 'opacity-100' : 'opacity-0'
      )}
      aria-hidden={!active}
    >
      <picture className="block h-full w-full">
        {slide.mobileImage ? (
          <source media="(max-width: 767px)" srcSet={slide.mobileImage} />
        ) : null}
        <img
          src={slide.image}
          alt={slide.alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          draggable={false}
          className="h-full w-full select-none object-cover object-center [transform:translateZ(0)]"
        />
      </picture>
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-b',
          slide.overlayClassName ?? 'from-white/60 via-white/15 to-white/60'
        )}
      />
    </div>
  );
}

export default function HeroSlider({
  slides = defaultSlides,
  autoPlay = true,
  autoPlayInterval = 5000,
  className,
  minHeightClassName = 'min-h-[280px] sm:min-h-[360px] md:min-h-[440px] lg:min-h-[520px]',
}: HeroSliderProps) {
  const reduceMotion = useReducedMotion();
  const safeSlides = slides ?? [];
  const hasSlides = safeSlides.length > 0;

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const pointerStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const safeIndex = useMemo(() => {
    if (!hasSlides) return 0;
    return ((index % safeSlides.length) + safeSlides.length) % safeSlides.length;
  }, [index, safeSlides.length, hasSlides]);

  const goNext = useCallback(() => {
    if (safeSlides.length <= 1) return;
    setIndex((p) => p + 1);
  }, [safeSlides.length]);

  const goPrev = useCallback(() => {
    if (safeSlides.length <= 1) return;
    setIndex((p) => p - 1);
  }, [safeSlides.length]);

  const goTo = useCallback(
    (i: number) => {
      if (i === safeIndex) return;
      setIndex(i);
    },
    [safeIndex]
  );

  useEffect(() => {
    if (!autoPlay || isPaused || safeSlides.length <= 1) return;

    const id = window.setInterval(goNext, autoPlayInterval);
    return () => window.clearInterval(id);
  }, [autoPlay, autoPlayInterval, goNext, isPaused, safeSlides.length]);

  useEffect(() => {
    const onVisibility = () => setIsPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    pointerStartX.current = e.clientX;
    isDragging.current = true;
    setIsPaused(true);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (!isDragging.current || pointerStartX.current == null) return;

    const diff = pointerStartX.current - e.clientX;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      diff > 0 ? goNext() : goPrev();
    }

    pointerStartX.current = null;
    isDragging.current = false;
    setIsPaused(false);
  };

  const onPointerCancel = () => {
    pointerStartX.current = null;
    isDragging.current = false;
    setIsPaused(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    }
  };

  if (!hasSlides) return null;
  const currentSlide = safeSlides[safeIndex];

  return (
    <section
      dir="rtl"
      className={cn('relative mt-0 w-full overflow-hidden bg-white', className)}
      aria-label="اسلایدر هیرو"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onPointerLeave={onPointerCancel}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ touchAction: 'pan-y' }}
    >
      <div className={cn('relative mx-auto w-full', minHeightClassName)}>
        {/* Image stack (no remount) */}
        <div className="absolute inset-0">
          {safeSlides.map((slide, i) => (
            <SlideImage
              key={slide.id}
              slide={slide}
              active={i === safeIndex}
              priority={i === 0 || i === safeIndex}
            />
          ))}
        </div>

        {/* Content */}
        <div className="absolute inset-0 z-[3] flex items-center justify-center">
          <div className="mx-auto w-full px-4 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-4xl text-center">
              {currentSlide.title ? (
                <motion.h1
                  key={`title-${currentSlide.id}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.28, ease: 'easeOut' }}
                  className={cn(
                    'mb-3 text-2xl font-bold leading-tight sm:text-4xl lg:text-5xl',
                    // shadow سبک‌تر برای پرفورمنس
                    '[text-shadow:0_1px_2px_rgba(0,0,0,0.20),0_0_10px_rgba(255,255,255,0.7)]',
                    currentSlide.titleClassName ?? 'text-slate-900'
                  )}
                  style={{ fontFamily: 'DigiLalezarPlus' }}
                >
                  {currentSlide.title}
                </motion.h1>
              ) : null}

              {currentSlide.subtitle ? (
                <motion.p
                  key={`subtitle-${currentSlide.id}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.24, delay: reduceMotion ? 0 : 0.04 }}
                  className={cn(
                    'mx-auto mb-3 max-w-3xl text-sm leading-7 sm:text-base lg:text-xl',
                    currentSlide.subtitleClassName ?? 'text-slate-700'
                  )}
                  style={{ fontFamily: 'Samim' }}
                >
                  {currentSlide.subtitle}
                </motion.p>
              ) : null}

              {currentSlide.details?.length ? (
                <motion.ul
                  key={`details-${currentSlide.id}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.24, delay: reduceMotion ? 0 : 0.08 }}
                  className={cn(
                    'mx-auto mt-4 grid max-w-2xl gap-2 rounded-xl bg-white/35 px-3 py-2 text-sm sm:text-lg',
                    // backdrop blur سنگین حذف شد
                    currentSlide.detailsClassName ?? 'text-slate-700'
                  )}
                >
                  {currentSlide.details.map((item, i) => (
                    <li key={`${item.label}-${i}`} className="flex items-center justify-center gap-1">
                      <span className="font-semibold">{item.label}:</span>
                      <span>{item.value}</span>
                    </li>
                  ))}
                </motion.ul>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <button
        type="button"
        onClick={goPrev}
        disabled={safeSlides.length <= 1}
        className={cn(
          'absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white transition hover:bg-black/35 focus:outline-none focus:ring-2 focus:ring-white/60 disabled:pointer-events-none disabled:opacity-40',
          'md:left-6 md:h-12 md:w-12'
        )}
        aria-label="اسلاید قبلی"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={goNext}
        disabled={safeSlides.length <= 1}
        className={cn(
          'absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white transition hover:bg-black/35 focus:outline-none focus:ring-2 focus:ring-white/60 disabled:pointer-events-none disabled:opacity-40',
          'md:right-6 md:h-12 md:w-12'
        )}
        aria-label="اسلاید بعدی"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
      </button>

      {/* Dots */}
      {safeSlides.length > 1 && (
        <div
          className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 md:bottom-6"
          role="tablist"
          aria-label="نقاط ناوبری اسلایدر"
        >
          {safeSlides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === safeIndex}
              aria-label={`برو به اسلاید ${i + 1}`}
              className={cn(
                'h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/60',
                i === safeIndex ? 'w-6 bg-white md:w-8' : 'w-2 bg-white/50 hover:bg-white/80'
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
