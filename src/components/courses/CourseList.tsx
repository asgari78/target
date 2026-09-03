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
      <section className="relative z-10 py-8 md:py-15" id="courses" aria-labelledby="courses-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ul role="list" aria-label="دوره‌های آموزشی (در حال بارگذاری)" className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: 'easeOut' }}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="aspect-[16/10] w-full animate-pulse bg-slate-100" />
                <div className="space-y-3 p-4 sm:p-5">
                  <div className="h-5 w-3/4 rounded-xl bg-slate-100 animate-pulse" />
                  <div className="h-6 w-36 rounded-full bg-amber-100 animate-pulse" />
                  <div className="h-10 rounded-2xl bg-slate-100 animate-pulse" />
                  <div className="h-10 rounded-2xl bg-slate-100 animate-pulse" />
                  <div className="h-11 rounded-2xl bg-slate-100 animate-pulse" />
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
      <section className="relative z-10 py-8 md:py-15" id="courses" aria-labelledby="courses-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <GraduationCap className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">دوره‌ای یافت نشد</h3>
            <p className="text-slate-500">در حال حاضر دوره فعالی برای نمایش وجود ندارد.</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-10 py-8 md:py-15" id="courses" aria-labelledby="courses-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-8 md:mb-12 flex flex-col items-start text-right"
        >
          <motion.h2
            id="courses-heading"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="flex flex-col items-start gap-1"
          >
            <span
              style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
              className="flex items-center justify-start gap-2 bg-gradient-to-l from-indigo-700 via-violet-700 to-fuchsia-700 bg-clip-text text-3xl leading-tight text-transparent md:text-5xl"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </span>
              دوره‌های آکادمی تارگت
            </span>
            <span className="flex flex-row-reverse items-center justify-start gap-2 text-sm font-semibold text-slate-600 md:text-base">
              مسیر یادگیری حرفه‌ای خود را همین‌جا شروع کنید
              <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-l from-fuchsia-500 to-amber-500" />
            </span>
          </motion.h2>

          <span className="mt-4 block h-1.5 w-40 rounded-full bg-gradient-to-l from-indigo-600 via-fuchsia-500 to-amber-400 md:w-64 xl:w-80" />
        </motion.header>

        <ul role="list" aria-label="دوره‌های آموزشی" className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course, index) => (
            <CourseRow key={course.id} course={course} index={index} onRegisterClick={onRegisterClick} />
          ))}
        </ul>
      </div>
    </section>
  );
}