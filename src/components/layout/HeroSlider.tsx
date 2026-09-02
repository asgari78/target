'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, TouchEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

  // توضیح دوم (لیستی)
  details?: SlideMetaItem[];

  // استایل مخصوص هر اسلاید
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
    // کلاس‌های اختصاصی هر اسلاید
    titleClassName: 'text-sky-900 [text-shadow:0_3px_18px_rgba(255,255,255,.65)] font-digi-lalezar',
    subtitleClassName: 'text-slate-700 font-digi-shohreh',
    detailsClassName: 'text-slate-600',
    overlayClassName: 'from-white/70 via-white/25 to-white/70',
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
      { label: 'تعدا جلسات', value: '۴۰ جلسه ۲ ساعته' },
      { label: 'نحوه برگزاری', value: 'آنلاین و حضوری' },
      { label: 'استاد', value: 'حامد شهبازی(پرمخاطب ترین معلم استان قم)' },
    ],
    titleClassName: 'text-indigo-900 font-digi-lalezar',
    subtitleClassName: 'text-indigo-700 font-digi-shohreh',
    detailsClassName: 'text-slate-700',
    overlayClassName: 'from-white/75 via-white/20 to-white/75',
  },
  {
    id: 3,
    image: '/images/slider/3.png',
    mobileImage: '/images/slider/mobile3.png',
    alt: 'موسسه آموزشی تارگت - محیط آموزشی',
    title: 'آموزش جامع ریاضی چهارم',
    subtitle: 'آموزش صفر تا صد ریاضی چهارم ابتدایی(کتاب + نکات تکمیلی)',
    details: [
      { label: 'فضا', value: 'سالن مجهز و استاندارد' },
      { label: 'امکانات', value: 'کلاس هوشمند + محتوای تعاملی' },
      { label: 'محل برگزاری', value: 'حضوری فقط قم' },
    ],
    titleClassName: 'text-cyan-900 font-digi-lalezar',
    subtitleClassName: 'text-slate-700 font-digi-shohreh',
    detailsClassName: 'text-slate-600',
    overlayClassName: 'from-white/70 via-white/15 to-white/70',
  },
];

interface HeroSliderProps {
  slides?: Slide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
  minHeightClassName?: string;
}

const SLIDE_ANIMATION_DURATION = 450;
const SWIPE_THRESHOLD = 50;

function SlideMedia({
  slide,
  priority,
}: {
  slide: Slide;
  priority: boolean;
}) {
  return (
    <picture className="absolute inset-0 block h-full w-full">
      {slide.mobileImage ? (
        <source media="(max-width: 767px)" srcSet={slide.mobileImage} />
      ) : null}
      <img
        src={slide.image}
        alt={slide.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        className={cn(
          // مهم: برای حذف مشکل crop/فضای سفید
          'h-full w-full select-none object-cover object-center',
          // کاهش لرزش رندر در برخی مرورگرها
          '[transform:translateZ(0)]'
        )}
      />
    </picture>
  );
}

export default function HeroSlider({
  slides = defaultSlides,
  autoPlay = true,
  autoPlayInterval = 5000,
  className,
  minHeightClassName = 'min-h-[280px] sm:min-h-[360px] md:min-h-[440px] lg:min-h-[520px]',
}: HeroSliderProps) {
  const safeSlides = slides ?? [];
  const hasSlides = safeSlides.length > 0;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const animationTimeoutRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);

  // ✅ حذف setState داخل useEffect
  const safeIndex = useMemo(() => {
    if (!hasSlides) return 0;
    return ((currentIndex % safeSlides.length) + safeSlides.length) % safeSlides.length;
  }, [currentIndex, safeSlides.length, hasSlides]);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current !== null) {
        window.clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const triggerTransition = useCallback(
    (updater: () => void) => {
      if (isAnimatingRef.current || safeSlides.length <= 1) return;

      isAnimatingRef.current = true;
      setIsAnimating(true);
      updater();

      if (animationTimeoutRef.current !== null) {
        window.clearTimeout(animationTimeoutRef.current);
      }

      animationTimeoutRef.current = window.setTimeout(() => {
        isAnimatingRef.current = false;
        setIsAnimating(false);
      }, SLIDE_ANIMATION_DURATION);
    },
    [safeSlides.length]
  );

  const nextSlide = useCallback(() => {
    triggerTransition(() => {
      setCurrentIndex((prev) => prev + 1);
    });
  }, [triggerTransition]);

  const prevSlide = useCallback(() => {
    triggerTransition(() => {
      setCurrentIndex((prev) => prev - 1);
    });
  }, [triggerTransition]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index === safeIndex) return;
      triggerTransition(() => {
        setCurrentIndex(index);
      });
    },
    [safeIndex, triggerTransition]
  );

  useEffect(() => {
    if (!autoPlay || safeSlides.length <= 1) return;
    const interval = window.setInterval(nextSlide, autoPlayInterval);
    return () => window.clearInterval(interval);
  }, [autoPlay, autoPlayInterval, nextSlide, safeSlides.length]);

  const handleTouchStart = (e: TouchEvent<HTMLElement>) => {
    setTouchStartX(e.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (e: TouchEvent<HTMLElement>) => {
    if (touchStartX === null) return;

    const touchEndX = e.changedTouches[0]?.clientX ?? touchStartX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }

    setTouchStartX(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    }
  };

  if (!hasSlides) return null;
  const currentSlide = safeSlides[safeIndex];

  return (
    <section
      className={cn('relative mt-0 w-full overflow-hidden bg-white', className)}
      aria-label="اسلایدر هیرو"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-y' }}
    >
      <div className={cn('relative mx-auto w-full', minHeightClassName)}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0.0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <div className="relative h-full w-full">
              <SlideMedia slide={currentSlide} priority={safeIndex === 0} />

              {/* لایه تقویتی خوانایی متن */}
              {/* <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/15" /> */}


              {(currentSlide.title || currentSlide.subtitle || currentSlide.details?.length) && (
                <div className="absolute inset-0 z-[3] flex items-center justify-center">
                  <div className="mx-auto w-full px-4 sm:px-6 lg:px-10">
                    <div className="mx-auto max-w-4xl text-center">
                      {currentSlide.title ? (
                        <motion.h1
                          initial={{ opacity: 0, y: 18, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
className={cn(
  'mb-3 text-2xl font-bold leading-tight sm:text-4xl lg:text-5xl',
  '[text-shadow:0_0_6px_rgba(255,255,255,1),0_0_14px_rgba(255,255,255,1),0_0_28px_rgba(255,255,255,0.98),0_0_48px_rgba(255,255,255,0.95),0_2px_2px_rgba(0,0,0,0.25)]',
  currentSlide.titleClassName ?? 'text-slate-900'
)}
style={{ fontFamily: 'DigiLalezarPlus' }}

                        >
                          {currentSlide.title}
                        </motion.h1>
                      ) : null}

                      {currentSlide.subtitle ? (
                        <motion.p
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.45, delay: 0.16, ease: 'easeOut' }}
                          className={cn(
                            'mx-auto mb-3 max-w-3xl text-sm leading-7 sm:text-base lg:text-xl shadow-white',
                            currentSlide.subtitleClassName ?? 'text-slate-700'
                          )}
                          style={{fontFamily:"Samim"}}
                        >
                          {currentSlide.subtitle}
                        </motion.p>
                      ) : null}

                      {currentSlide.details?.length ? (
                        <motion.ul
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.24, ease: 'easeOut' }}
                          className={cn(
                            'mx-auto mt-5 grid max-w-2xl gap-2 rounded-xl bg-white/45 px-3 py-2 text-sm backdrop-blur-[2px] sm:text-lg',
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
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={prevSlide}
        disabled={isAnimating || safeSlides.length <= 1}
        className={cn(
          'absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-black/35 focus:outline-none focus:ring-2 focus:ring-white/60 disabled:pointer-events-none disabled:opacity-40',
          'md:left-6 md:h-12 md:w-12'
        )}
        aria-label="اسلاید قبلی"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        disabled={isAnimating || safeSlides.length <= 1}
        className={cn(
          'absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-black/35 focus:outline-none focus:ring-2 focus:ring-white/60 disabled:pointer-events-none disabled:opacity-40',
          'md:right-6 md:h-12 md:w-12'
        )}
        aria-label="اسلاید بعدی"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
      </button>

      {safeSlides.length > 1 && (
        <div
          className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 md:bottom-6"
          role="tablist"
          aria-label="نقاط ناوبری اسلایدر"
        >
          {safeSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goToSlide(index)}
              disabled={isAnimating}
              role="tab"
              aria-selected={index === safeIndex}
              aria-label={`برو به اسلاید ${index + 1}`}
              className={cn(
                'h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/60 disabled:opacity-50',
                index === safeIndex ? 'w-6 bg-white md:w-8' : 'w-2 bg-white/50 hover:bg-white/80'
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
