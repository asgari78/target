'use client';

import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import CourseRow from './CourseRow';
import { Course } from '@/src/types';

interface CourseListProps {
  courses: Course[];
  isLoading: boolean;
  onRegisterClick: (course: Course, type: 'in_person' | 'online') => void;
}

export default function CourseList({ courses, isLoading, onRegisterClick }: CourseListProps) {
  if (isLoading) {
    return (
      <section className="relative z-10 mt-4 py-4 md:mt-6 md:py-8" id="courses" aria-labelledby="courses-heading">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
          <header className="mb-4 md:mb-6">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/85 px-3 py-2 shadow-sm backdrop-blur">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 text-white">
                <GraduationCap className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-slate-700">در حال بارگذاری دوره‌ها...</span>
            </div>
          </header>

          <ul
            role="list"
            aria-label="دوره‌های آموزشی (در حال بارگذاری)"
            className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.03, ease: 'easeOut' }}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 shadow-sm"
              >
                <div className="aspect-[1/1] w-full animate-pulse bg-slate-100" />
                <div className="space-y-2 p-2.5 sm:p-3">
                  <div className="h-4 w-3/4 animate-pulse rounded-lg bg-slate-100" />
                  <div className="h-5 w-24 animate-pulse rounded-full bg-amber-100/80" />
                  <div className="h-8 w-full animate-pulse rounded-xl bg-slate-100" />
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  if (courses.length === 0) {
    return (
      <section className="relative z-10 mt-4 py-6 md:mt-6 md:py-10" id="courses" aria-labelledby="courses-heading">
        <div className="mx-auto w-full max-w-7xl px-3 text-center sm:px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="mx-auto max-w-md rounded-3xl border border-slate-200/80 bg-white/90 px-4 py-8 shadow-sm backdrop-blur"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <GraduationCap className="h-6 w-6 text-slate-500" />
            </div>
            <h3 className="mb-1 text-lg font-bold text-slate-900">دوره‌ای یافت نشد</h3>
            <p className="text-sm text-slate-600">در حال حاضر دوره فعالی برای نمایش وجود ندارد.</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-10 mt-4 py-4 md:mt-6 md:py-8" id="courses" aria-labelledby="courses-heading">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="mb-4 md:mb-6"
        >
          <h2 id="courses-heading" className="flex flex-col items-start gap-1 text-right">
            <span
              style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
              className="inline-flex items-center gap-2 text-xl leading-tight text-slate-900 sm:text-2xl md:text-4xl"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-amber-300 shadow-sm md:h-10 md:w-10">
                <GraduationCap className="h-4 w-4 md:h-5 md:w-5" />
              </span>
              دوره‌های آکادمی تارگت
            </span>

            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 sm:text-xs md:text-sm">
              مسیر یادگیری حرفه‌ای را از همین‌جا شروع کنید
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
            </span>
          </h2>

          <span className="mt-2 block h-1 w-28 rounded-full bg-gradient-to-l from-slate-900 via-amber-500 to-violet-500 sm:w-36 md:w-52" />
        </motion.header>

        <ul
          role="list"
          aria-label="دوره‌های آموزشی"
          className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4"
        >
          {courses.map((course, index) => (
            <CourseRow key={course.id} course={course} index={index} onRegisterClick={onRegisterClick} />
          ))}
        </ul>
      </div>
    </section>
  );
}
