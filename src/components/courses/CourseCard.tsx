'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, User, Sparkles, CreditCard } from 'lucide-react';
import { Course } from '@/src/types';
import { formatPrice, calculateInstallment, getBasePrice } from '@/src/lib/utils';

interface CourseCardProps {
  course: Course;
  index: number;
  onRegisterClick: (course: Course, type: 'in_person' | 'online') => void;
}

export default function CourseCard({ course, index, onRegisterClick }: CourseCardProps) {
  const inPersonPrice = getBasePrice(course, 'in_person');
  const installmentMonths = course.installmentMonths;
  const surchargePercent = course.installmentSurchargePercent;

  const inPersonPlan = calculateInstallment(inPersonPrice, installmentMonths, surchargePercent);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      className="group relative flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100"
    >
      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
        <Image
          src={course.courseImageUrl || '/images/course-placeholder.jpg'}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-indigo-700 px-3.5 py-1.5 rounded-2xl text-xs font-bold shadow-sm flex items-center gap-1.5 z-10">
          <Sparkles className="w-4 h-4" />
          {course.sessionsCount} جلسه
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5 lg:p-6">
        <h3 className="text-xl font-extrabold text-slate-800 mb-2 line-clamp-1" title={course.title}>
          {course.title}
        </h3>

        <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-loose">
          {course.description || 'توضیحات در دسترس نیست'}
        </p>

        <div className="space-y-3.5 mb-6 mt-auto">
          <div className="flex items-center text-slate-600 text-sm">
            <div className="bg-indigo-50 p-1.5 rounded-lg ml-3">
              <User className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="font-medium">مدرس: {course.instructorName}</span>
          </div>

          <div className="flex items-center text-slate-600 text-sm">
            <div className="bg-rose-50 p-1.5 rounded-lg ml-3">
              <Clock className="w-4 h-4 text-rose-500" />
            </div>
            <span>{course.sessionDuration} دقیقه در جلسه</span>
          </div>
        </div>

        <div className="pt-5 border-t border-slate-100 space-y-5">
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm font-medium">نقدی (حضوری):</span>
              <span className="text-lg font-bold text-slate-800">
                {formatPrice(inPersonPrice)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50">
              <div className="flex items-center text-emerald-700 font-medium">
                <CreditCard className="w-4 h-4 ml-1.5" />
                اقساط ({installmentMonths} مرحله):
              </div>
              <span className="text-emerald-700 font-bold">
                {formatPrice(inPersonPlan.perInstallment)} <span className="text-[11px] font-normal opacity-80">/ قسط</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onRegisterClick(course, 'in_person')}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl font-bold transition-colors shadow-lg shadow-indigo-200"
            >
              <span>حضور در کلاس</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onRegisterClick(course, 'online')}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-bold transition-colors shadow-lg shadow-emerald-200"
            >
              <span>آنلاین</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}