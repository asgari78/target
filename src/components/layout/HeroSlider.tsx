'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/src/lib/utils';

interface Slide {
  id: number;
  image: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

const defaultSlides: Slide[] = [
  {
    id: 1,
    image: '/images/slider/1.png',
    alt: 'موسسه آموزشی تارگت - کلاس‌های حضوری',
    title: 'آمادگی کامل برای آینده',
    subtitle: 'دوره‌های تخصصی ریاضیات با بهترین اساتید',
  },
  {
    id: 2,
    image: '/images/slider/2.png',
    alt: 'موسسه آموزشی تارگت - کلاس‌های آنلاین',
    title: 'یادگیری بدون مرز',
    subtitle: 'کلاس‌های آنلاین با کیفیت عالی در گوگل میت',
  },
  {
    id: 3,
    image: '/images/slider/3.png',
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

export default function HeroSlider({
  slides = defaultSlides,
  autoPlay = true,
  autoPlayInterval = 5000,
}: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, slides.length]);

  const prevSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, slides.length]);

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating || index === currentIndex) return;
      setIsAnimating(true);
      setCurrentIndex(index);
      setTimeout(() => setIsAnimating(false), 500);
    },
    [isAnimating, currentIndex]
  );

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }

    setTouchStart(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-navy-50"
      aria-label="اسلایدر هیرو"
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="absolute inset-0 bg-linear-to-b from-navy-900/60 via-navy-800/40 to-navy-900/70"
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="relative h-[50vh] min-h-[350px] max-h-[600px] w-full"
        >
          <Image
            src={slides[currentIndex].image}
            alt={slides[currentIndex].alt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />

          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="mx-auto max-w-4xl text-center">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                className="mb-4 text-balance text-4xl font-bold text-white sm:text-5xl lg:text-6xl"
              >
                {slides[currentIndex].title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                className="mx-auto max-w-2xl text-balance text-lg text-white/90 sm:text-xl lg:text-2xl"
              >
                {slides[currentIndex].subtitle}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={nextSlide}
        disabled={isAnimating}
        className={cn(
          'absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:pointer-events-none disabled:opacity-50',
          'md:left-6 md:h-14 md:w-14'
        )}
        aria-label="اسلاید قبلی"
        aria-disabled={isAnimating}
      >
        <ChevronLeft className="h-6 w-6" aria-hidden="true" />
      </button>

      <button
        onClick={prevSlide}
        disabled={isAnimating}
        className={cn(
          'absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:pointer-events-none disabled:opacity-50',
          'md:right-6 md:h-14 md:w-14'
        )}
        aria-label="اسلاید بعدی"
        aria-disabled={isAnimating}
      >
        <ChevronRight className="h-6 w-6" aria-hidden="true" />
      </button>

      <div
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2"
        role="tablist"
        aria-label="نقاط ناوبری اسلایدر"
      >
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            disabled={isAnimating}
            role="tab"
            aria-selected={index === currentIndex}
            aria-label={`برو به اسلاید ${index + 1}`}
            className={cn(
              'h-2 w-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50',
              index === currentIndex ? 'w-8 bg-white' : 'bg-white/50 hover:bg-white/75'
            )}
          />
        ))}
      </div>
    </section>
  );
}
