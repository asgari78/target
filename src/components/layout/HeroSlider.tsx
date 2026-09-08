'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface Slide {
  id: number;
  image: string;
  alt: string;
  link?: string;
  overlayClassName?: string;
}

const defaultSlides: Slide[] = [
  {
    id: 1,
    image: 'https://gutcdmaqciskdrecukkj.supabase.co/storage/v1/object/public/slider/course1PosterWider2.webp',
    alt: 'موسسه آموزشی تارگت - کلاس‌های حضوری',
    overlayClassName: 'from-black/10 via-transparent to-black/10',
  },
  {
    id: 2,
    image: '/images/slider/2.png',
    alt: 'دوره جامع تیزهوشان ششم',
    overlayClassName: 'from-black/10 via-transparent to-black/10',
  },
  {
    id: 3,
    image: '/images/slider/3.png',
    alt: 'موسسه آموزشی تارگت - محیط آموزشی',
    overlayClassName: 'from-black/10 via-transparent to-black/10',
  },
];

interface HeroSliderProps {
  slides?: Slide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
  heightClassName?: string;
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
        active ? 'opacity-100 z-10' : 'opacity-0 z-0'
      )}
      aria-hidden={!active}
    >
      <img
        src={slide.image}
        alt={slide.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        draggable={false}
        className="h-full w-full select-none object-cover object-center transform:translateZ(0)"
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-b',
          slide.overlayClassName ?? 'from-black/5 via-transparent to-black/15'
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
  heightClassName = 'h-[26vh] sm:h-[28vh] md:h-[32vh] lg:h-[40vh] min-h-[28vh] max-h-[40vh]',
}: HeroSliderProps) {
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
      if (diff > 0) {
        goNext();
      } else {
        goPrev();
      }
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

  return (
    <section
      dir="rtl"
      className={cn('relative mt-0 w-full select-none overflow-hidden bg-slate-900', className)}
      aria-label="اسلایدر اصلی"
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
      <div className={cn('relative mx-auto w-full', heightClassName)}>
        {/* اسلایدها */}
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
      </div>

      {/* دکمه اسلاید قبلی (چپ) */}
      <button
        type="button"
        onClick={goPrev}
        disabled={safeSlides.length <= 1}
        className={cn(
          'absolute top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full',
          'bg-[#2d2d2d]/50 backdrop-blur-md text-[#f8ecc2] border border-[#d8a834]/40 transition-all duration-200',
          'hover:bg-[#1a1a1a]/80 hover:border-[#f1cd57] hover:scale-105 active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-[#f1cd57]/50 disabled:pointer-events-none disabled:opacity-20',
          'left-3 md:left-[calc(50%-min(560px,42vw))] md:h-9 md:w-9'
        )}
        aria-label="اسلاید قبلی"
      >
        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
      </button>

      {/* دکمه اسلاید بعدی (راست) */}
      <button
        type="button"
        onClick={goNext}
        disabled={safeSlides.length <= 1}
        className={cn(
          'absolute top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full',
          'bg-[#2d2d2d]/50 backdrop-blur-md text-[#f8ecc2] border border-[#d8a834]/40 transition-all duration-200',
          'hover:bg-[#1a1a1a]/80 hover:border-[#f1cd57] hover:scale-105 active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-[#f1cd57]/50 disabled:pointer-events-none disabled:opacity-20',
          'right-3 md:right-[calc(50%-min(560px,42vw))] md:h-9 md:w-9'
        )}
        aria-label="اسلاید بعدی"
      >
        <ChevronRight className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
      </button>

      {/* نقطه‌های راهنما (Dots) */}
      {safeSlides.length > 1 && (
        <div
          className="absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 gap-1.5 md:bottom-2.5"
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
                'h-1.5 rounded-full transition-all duration-300 focus:outline-none',
                i === safeIndex
                  ? 'w-5 bg-[#f1cd57] shadow-[0_0_8px_rgba(241,205,87,0.7)] md:w-6'
                  : 'w-1.5 bg-white/40 hover:bg-white/70'
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
