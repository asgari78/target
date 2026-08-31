'use client';

import { motion } from 'framer-motion';
import CourseCard from './CourseCard';
import { Course } from '@/src/types';

interface CourseListProps {
  courses: Course[];
  isLoading: boolean;
  onRegisterClick: (course: Course, type: 'in_person' | 'online') => void;
}

export default function CourseList({ courses, isLoading, onRegisterClick }: CourseListProps) {
  if (isLoading) {
    return (
      <section className="py-16 md:py-24 relative z-10" id="courses">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
                className="relative flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100"
              >
                <div className="h-52 w-full bg-slate-100 animate-pulse" />
                <div className="flex flex-col flex-1 p-5 lg:p-6 space-y-4">
                  <div className="h-6 w-3/4 bg-slate-200 animate-pulse rounded" />
                  <div className="h-4 w-full bg-slate-200 animate-pulse rounded" />
                  <div className="h-4 w-5/6 bg-slate-200 animate-pulse rounded" />
                  <div className="h-4 w-1/2 bg-slate-200 animate-pulse rounded mt-auto" />
                  <div className="h-10 bg-slate-200 animate-pulse rounded-2xl" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 relative z-10" id="courses">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {courses.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              index={index}
              onRegisterClick={onRegisterClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}