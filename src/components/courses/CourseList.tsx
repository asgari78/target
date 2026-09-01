'use client';

import { motion } from 'framer-motion';
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
      <section className="py-16 md:py-24 relative z-10" id="courses" aria-labelledby="courses-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.h2
            id="courses-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sr-only"
          >
            دوره‌های آموزشی
          </motion.h2>
          <ul className="space-y-4" role="list" aria-label="دوره‌های آموزشی (در حال بارگذاری)">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-white rounded-2xl border border-navy-100"
              >
                <div className="w-full sm:w-[140px] h-[100px] sm:h-[110px] rounded-xl bg-navy-100 animate-pulse" />
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="h-6 w-3/4 bg-navy-100 animate-pulse rounded" />
                  <div className="h-4 w-full bg-navy-100 animate-pulse rounded" />
                  <div className="h-4 w-5/6 bg-navy-100 animate-pulse rounded" />
                  <div className="h-4 w-1/2 bg-navy-100 animate-pulse rounded" />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="h-10 bg-navy-100 animate-pulse rounded-xl flex-1" />
                  <div className="h-10 bg-navy-100 animate-pulse rounded-xl flex-1" />
                </div>
                <div className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] rounded-full bg-navy-100 animate-pulse ml-auto" />
              </motion.li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  if (courses.length === 0) {
    return (
      <section className="py-16 md:py-24 relative z-10" id="courses" aria-labelledby="courses-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-12"
          >
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-navy-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-navy-900 mb-2">دوره‌ای یافت نشد</h3>
            <p className="text-navy-500">در حال حاضر دوره فعالی برای نمایش وجود ندارد.</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 relative z-10" id="courses" aria-labelledby="courses-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          id="courses-heading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sr-only"
        >
          دوره‌های آموزشی
        </motion.h2>
        <ul className="space-y-4" role="list" aria-label="دوره‌های آموزشی">
          {courses.map((course, index) => (
            <CourseRow
              key={course.id}
              course={course}
              index={index}
              onRegisterClick={onRegisterClick}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}