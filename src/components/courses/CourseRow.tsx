'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, Users, Sparkles, MapPin, Monitor, CreditCard } from 'lucide-react';
import { Course } from '@/src/types';
import { formatPrice, formatDuration, calculateInstallment, getBasePrice } from '@/src/lib/utils';

interface CourseRowProps {
  course: Course;
  index: number;
  onRegisterClick: (course: Course, type: 'in_person' | 'online') => void;
}

export default function CourseRow({ course, index, onRegisterClick }: CourseRowProps) {
  const inPersonPrice = getBasePrice(course, 'in_person');
  const installmentMonths = course.installmentsCount;
  const interestPct = course.installmentInterestPct;

  const inPersonPlan = calculateInstallment(inPersonPrice, installmentMonths, interestPct);

  return (
    <motion.li
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
      className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-white rounded-2xl border border-navy-100 shadow-sm hover:shadow-lg hover:border-navy-200 transition-all duration-300"
    >
      <div className="relative flex-shrink-0 w-full sm:w-[140px] h-[100px] sm:h-[110px] rounded-xl overflow-hidden bg-navy-50">
        {course.coverImageUrl ? (
          <Image
            src={course.coverImageUrl}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
            sizes="(max-width: 640px) 100vw, 140px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy-100 to-navy-200">
            <Sparkles className="h-10 w-10 text-navy-300" aria-hidden="true" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm text-navy-700 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-gold-500" aria-hidden="true" />
          <span>{course.sessionsCount} جلسه</span>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-navy-900 truncate" title={course.title}>
            {course.title}
          </h3>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-navy-600">
            <div className="flex items-center gap-1.5 bg-navy-50 px-3 py-1.5 rounded-xl">
              <Users className="h-4 w-4 text-navy-500" aria-hidden="true" />
              <span className="font-medium">استاد: {course.instructorName}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-navy-50 px-3 py-1.5 rounded-xl">
              <Clock className="h-4 w-4 text-navy-500" aria-hidden="true" />
              <span>{formatDuration(course.sessionHours)} در جلسه</span>
            </div>
            <div className="flex items-center gap-1.5 bg-navy-50 px-3 py-1.5 rounded-xl">
              <MapPin className="h-4 w-4 text-navy-500" aria-hidden="true" />
              <span className="truncate max-w-[200px]">{course.locationInPerson}</span>
            </div>
            {course.startDate && (
              <div className="flex items-center gap-1.5 bg-navy-50 px-3 py-1.5 rounded-xl">
                <Clock className="h-4 w-4 text-navy-500" aria-hidden="true" />
                <span>شروع: {new Date(course.startDate).toLocaleDateString('fa-IR')}</span>
              </div>
            )}
          </div>

          {course.description && (
            <p className="text-sm text-navy-500 line-clamp-2 sm:line-clamp-3 hidden md:block">
              {course.description}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <div className="flex items-center justify-between w-full sm:w-auto px-4 py-2.5 rounded-xl bg-navy-50 border border-navy-100">
              <span className="text-sm font-medium text-navy-600">نقدی (حضوری):</span>
              <span className="text-lg font-bold text-navy-900 fa-nums">{formatPrice(inPersonPrice)}</span>
            </div>
            <div className="flex items-center justify-between w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gold-50/50 border border-gold-100/50">
              <div className="flex items-center gap-1.5 text-sm text-gold-700 font-medium">
                <CreditCard className="h-4 w-4" aria-hidden="true" />
                <span>اقساط ({installmentMonths} مرحله):</span>
              </div>
              <span className="text-gold-700 font-bold fa-nums">
                {formatPrice(inPersonPlan.perInstallment)} <span className="text-[11px] font-normal opacity-80">/ قسط</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onRegisterClick(course, 'in_person')}
              className="flex-1 flex items-center justify-center gap-2 bg-navy-600 hover:bg-navy-700 text-white py-3 px-4 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-navy-200/50"
            >
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>حضوری</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onRegisterClick(course, 'online')}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-200/50"
            >
              <Monitor className="h-4 w-4" aria-hidden="true" />
              <span>آنلاین</span>
            </motion.button>
          </div>
        </div>
      </div>

      {course.instructorImageUrl && (
        <div className="flex-shrink-0 w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] ml-auto">
          <div className="relative w-full h-full rounded-full overflow-hidden ring-2 ring-navy-100 bg-navy-50">
            <Image
              src={course.instructorImageUrl}
              alt={course.instructorName}
              fill
              className="object-cover"
              sizes="70px"
            />
          </div>
        </div>
      )}
    </motion.li>
  );
}