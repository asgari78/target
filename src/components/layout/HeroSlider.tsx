'use client';

import { useCallback, useEffect, useState } from 'react';
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

function SlideMedia({
  slide,
  priority,
}: {
  slide: Slide;
  priority: boolean;
}) {
  return (
    <picture className="block w-full">
      {slide.mobileImage ? (
        <source media="(max-width: 767px)" srcSet={slide.mobileImage} />
      ) : null}
      <img
        src={slide.image}
        alt={slide.alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        draggable={false}
        className="block h-auto w-full select-none"
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
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const currentSlide = slides[currentIndex];

  const nextSlide = useCallback(() => {
    if (isAnimating || slides.length <= 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    window.setTimeout(() => setIsAnimating(false), 450);
  }, [isAnimating, slides.length]);

  const prevSlide = useCallback(() => {
    if (isAnimating || slides.length <= 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    window.setTimeout(() => setIsAnimating(false), 450);
  }, [isAnimating, slides.length]);

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating || index === currentIndex) return;
      setIsAnimating(true);
      setCurrentIndex(index);
      window.setTimeout(() => setIsAnimating(false), 450);
    },
    [isAnimating, currentIndex]
  );

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    const interval = window.setInterval(nextSlide, autoPlayInterval);
    return () => window.clearInterval(interval);
  }, [autoPlay, autoPlayInterval, nextSlide, slides.length]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }

    setTouchStart(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
  };

  if (!slides.length) return null;

  return (
    <section
      className="relative w-full overflow-hidden bg-white mt-14"
      aria-label="اسلایدر هیرو"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-y' }}
    >
      <div className="relative mx-auto w-full max-w-[1584px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="relative w-full"
          >
            <SlideMedia slide={currentSlide} priority={currentIndex === 0} />
            {(currentSlide.title || currentSlide.subtitle) && (
              <div className="absolute inset-0 z-[3] flex items-center">
                <div className="mx-auto w-full max-w-[1584px] px-4 sm:px-6 lg:px-10">
                  <div className="max-w-3xl text-right">
                    {currentSlide.title && (
                      <motion.h1
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
                        className="mb-3 text-2xl font-bold leading-tight text-white drop-shadow-md sm:text-4xl lg:text-5xl"
                      >
                        {currentSlide.title}
                      </motion.h1>
                    )}

                    {currentSlide.subtitle && (
                      <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
                        className="max-w-2xl text-sm leading-7 text-white/95 drop-shadow-md sm:text-lg lg:text-xl"
                      >
                        {currentSlide.subtitle}
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <button
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
