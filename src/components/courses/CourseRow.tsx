'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, BadgePercent, MapPin, Monitor } from 'lucide-react';
import { Course } from '@/src/types';
import { formatPrice, getBasePrice, getAvailableModes, getModeLabel, getModeIcon } from '@/src/lib/utils';
import { calculateInstallmentPlan } from '@/src/lib/utils';

interface CourseRowProps {
  course: Course;
  index: number;
  onRegisterClick: (course: Course, type: 'in_person' | 'online') => void;
}

export default function CourseRow({ course, index, onRegisterClick }: CourseRowProps) {
  const availableModes = getAvailableModes(course);
  const primaryMode = availableModes[0] || 'in_person';
  const basePrice = getBasePrice(course, primaryMode);
  const installmentPlan = calculateInstallmentPlan(course, primaryMode, 'installment');

  return (
    <motion.li
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' }}
      className="group h-full"
    >
      <button
        type="button"
        onClick={() => onRegisterClick(course, primaryMode)}
        className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-right shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        {/* Image */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
          {course.coverImageUrl ? (
            <Image
              src={course.coverImageUrl}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <span className="text-sm font-medium text-slate-500">بدون تصویر</span>
            </div>
          )}

          {/* Mode badges */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            {course.inPersonAvailable && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-navy-700 shadow-sm backdrop-blur">
                <MapPin className="h-3 w-3" />
                حضوری
              </span>
            )}
            {course.onlineAvailable && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur">
                <Monitor className="h-3 w-3" />
                آنلاین
              </span>
            )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex flex-1 flex-col gap-4">
            <h3 className="text-base font-bold leading-7 text-slate-900 transition-colors group-hover:text-indigo-700 sm:text-lg" style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}>
              {course.title}
            </h3>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 shadow-sm">
              <BadgePercent className="h-3.5 w-3.5" />
              <span>امکان خرید قسطی</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">قیمت اقساطی (بدون سود):</span>
                <span className="text-sm font-bold text-slate-900 fa-nums">
                  {formatPrice(installmentPlan.totalAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">قیمت نقدی با تخفیف:</span>
                <span className="text-sm font-bold text-slate-900 fa-nums">
                  {formatPrice(basePrice)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-indigo-600 to-indigo-700 px-4 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 group-hover:from-indigo-700 group-hover:to-indigo-800 group-hover:shadow-lg">
              <span>مشاهده جزئیات و ثبت‌نام</span>
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            </span>
          </div>
        </div>
      </button>
    </motion.li>
  );
}