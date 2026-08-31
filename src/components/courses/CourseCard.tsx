'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, User, Sparkles, CreditCard, ChevronLeft } from 'lucide-react';
import { Course } from '@/src/types';
import { formatPrice, calculateInstallment } from '@/src/lib/utils';

interface CourseCardProps {
  course: Course;
  index: number; // اضافه کردن index برای حل مشکل انیمیشن
  onRegisterClick: (course: Course) => void; // اصلاح ورودی تا کل دوره ارسال شود
}

export default function CourseCard({ course, index, onRegisterClick }: CourseCardProps) {
  // محاسبه مبلغ هر قسط با استفاده از تابع از پیش نوشته شده در utils
  const { perStep } = calculateInstallment(course.basePrice, course.installmentsCount);

  return (
    <motion.div
      // انیمیشن ورود (استفاده از index برای اعمال افکت Staggered هنگام رندر لیست)
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      className="group relative flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100"
    >
      {/* بخش تصویر کاور و نشان‌واره پایه تحصیلی */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
        <Image
          src={course.coverImage}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-indigo-700 px-3.5 py-1.5 rounded-2xl text-xs font-bold shadow-sm flex items-center gap-1.5 z-10">
          <Sparkles className="w-4 h-4" />
          پایه {course.grade}
        </div>
      </div>

      {/* بخش محتوای متنی */}
      <div className="flex flex-col flex-1 p-5 lg:p-6">
        <h3 className="text-xl font-extrabold text-slate-800 mb-2 line-clamp-1" title={course.title}>
          {course.title}
        </h3>
        
        <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-loose">
          {course.description}
        </p>

        {/* ویژگی‌ها و مشخصات دوره */}
        <div className="space-y-3.5 mb-6 mt-auto">
          <div className="flex items-center text-slate-600 text-sm">
            <div className="bg-indigo-50 p-1.5 rounded-lg ml-3">
              <User className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="font-medium">مدرس: {course.instructor.name}</span>
          </div>
          
          <div className="flex items-center text-slate-600 text-sm">
            <div className="bg-rose-50 p-1.5 rounded-lg ml-3">
              <Clock className="w-4 h-4 text-rose-500" />
            </div>
            <span>{course.schedule}</span>
          </div>
        </div>

        {/* بخش قیمت‌گذاری و دکمه اکشن */}
        <div className="pt-5 border-t border-slate-100 space-y-5">
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm font-medium">نقدی:</span>
              <span className="text-lg font-bold text-slate-800">
                {formatPrice(course.basePrice)}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50">
              <div className="flex items-center text-emerald-700 font-medium">
                <CreditCard className="w-4 h-4 ml-1.5" />
                اقساط ({course.installmentsCount} مرحله):
              </div>
              <span className="text-emerald-700 font-bold">
                {formatPrice(perStep)} <span className="text-[11px] font-normal opacity-80">/ قسط</span>
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onRegisterClick(course)}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-bold transition-colors shadow-lg shadow-indigo-200"
          >
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
