'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, TouchEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface Slide {
  id: number;
  image: string;
  mobileImage?: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

const defaultSlides: Slide[] = [
  {
    id: 1,
    image: '/images/slider/1.png',
    mobileImage: '/images/slider/mobile1.png',
    alt: 'موسسه آموزشی تارگت - کلاس‌های حضوری',
    title: 'آمادگی کامل برای آینده',
    subtitle: 'دوره‌های تخصصی ریاضیات با بهترین اساتید',
  },
  {
    id: 2,
    image: '/images/slider/2.png',
    mobileImage: '/images/slider/mobile2.png',
    alt: 'دوره جامع تیزهوشان ششم',
    title: 'دوره جامع تیزهوشان ششم',
    subtitle: 'کلاس‌های آنلاین با کیفیت عالی در گوگل میت',
  },
  {
    id: 3,
    image: '/images/slider/3.png',
    mobileImage: '/images/slider/mobile3.png',
    alt: 'موسسه آموزشی تارگت - محیط آموزشی',
    title: 'محیط آموزشی مدرن',
    subtitle: 'تجهیزات پیشرفته و فضای شاد برای یادگیری',
  },
];

interface HeroSliderProps {
  slides?: Slide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const SLIDE_ANIMATION_DURATION = 450;

function SlideMedia({
  slide,
  priority,
}: {
  slide: Slide;
  priority: boolean;
}) {
  return (
    <picture className="flex h-full w-full items-center justify-center">
      {slide.mobileImage ? (
        <source media="(max-width: 767px)" srcSet={slide.mobileImage} />
      ) : null}

      <img
        src={slide.image}
        alt={slide.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        className="block h-full w-full select-none object-contain"
      />
    </picture>
  );
}

export default function HeroSlider({
  slides = defaultSlides,
  autoPlay = true,
  autoPlayInterval = 5000,
}: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const animationTimeoutRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);


  useEffect(() => {
    if (slides.length === 0) return;

    setCurrentIndex((prev) => prev % slides.length);
  }, [slides.length]);
useEffect(() => {
  return () => {
    if (animationTimeoutRef.current !== null) {
      window.clearTimeout(animationTimeoutRef.current);
    }
  };
}, []);

  const triggerTransition = useCallback(
    (updater: () => void) => {
      if (isAnimatingRef.current || slides.length <= 1) return;

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
    [slides.length]
  );

  const nextSlide = useCallback(() => {
    triggerTransition(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    });
  }, [slides.length, triggerTransition]);

  const prevSlide = useCallback(() => {
    triggerTransition(() => {
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    });
  }, [slides.length, triggerTransition]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index === currentIndex) return;

      triggerTransition(() => {
        setCurrentIndex(index);
      });
    },
    [currentIndex, triggerTransition]
  );

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const interval = window.setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => window.clearInterval(interval);
  }, [autoPlay, autoPlayInterval, nextSlide, slides.length]);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;

    const touchEndX = e.changedTouches[0]?.clientX ?? touchStartX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
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

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <section
      className="relative mt-14 w-full overflow-hidden bg-white"
      aria-label="اسلایدر هیرو"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-y' }}
    >
      <div className="relative mx-auto h-100 w-full">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <div className="relative flex h-full w-full items-center justify-center">
              <SlideMedia
                slide={currentSlide}
                priority={currentIndex === 0}
              />

              {(currentSlide.title || currentSlide.subtitle) && (
                <>

                  <div className="absolute inset-0 z-[3] justify-center flex items-center">
                    <div className="mx-auto w-full px-4 sm:px-6 lg:px-10">
                      <div className="w-full text-center">
                        {currentSlide.title ? (
                          <motion.h1
                            initial={{ opacity: 0, y: 18,x:0 }}
                            animate={{ opacity: 1, y: 0,x:120 }}
                            transition={{
                              duration: 0.45,
                              delay: 0.1,
                              ease: 'easeOut',
                            }}
                            className="mb-3 text-lg text-center font-bold leading-tight text-slate-800 drop-shadow-md sm:text-3xl lg:text-4xl"
                          >
                            {currentSlide.title}
                          </motion.h1>
                        ) : null}

                        {currentSlide.subtitle ? (
                          <motion.p
                            initial={{ opacity: 0, y: 10,x:20 }}
                            animate={{ opacity: 1, y: 0,x:120 }}
                            transition={{
                              duration: 0.45,
                              delay: 0.2,
                              ease: 'easeOut',
                            }}
                            className="w-full text-center text-sm leading-7 text-slate-600 drop-shadow-md sm:text-sm lg:text-xl"
                          >
                            {currentSlide.subtitle}
                          </motion.p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={prevSlide}
        disabled={isAnimating || slides.length <= 1}
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
        disabled={isAnimating || slides.length <= 1}
        className={cn(
          'absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-black/35 focus:outline-none focus:ring-2 focus:ring-white/60 disabled:pointer-events-none disabled:opacity-40',
          'md:right-6 md:h-12 md:w-12'
        )}
        aria-label="اسلاید بعدی"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
      </button>

      {slides.length > 1 && (
        <div
          className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 md:bottom-6"
          role="tablist"
          aria-label="نقاط ناوبری اسلایدر"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goToSlide(index)}
              disabled={isAnimating}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`برو به اسلاید ${index + 1}`}
              className={cn(
                'h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/60 disabled:opacity-50',
                index === currentIndex
                  ? 'w-6 bg-white md:w-8'
                  : 'w-2 bg-white/50 hover:bg-white/80'
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
