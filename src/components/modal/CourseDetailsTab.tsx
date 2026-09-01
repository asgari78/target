'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Users, CalendarClock, CreditCard, MapPin, Monitor, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Course } from '@/src/types';
import { formatPrice, formatDuration, calculateInstallment, getBasePrice, cn } from '@/src/lib/utils';
import type { PaymentMode } from '@/src/types';

interface CourseDetailsTabProps {
  course: Course;
  registrationType: 'in_person' | 'online';
  paymentMode: PaymentMode;
  onPaymentModeChange: (mode: PaymentMode) => void;
}

export default function CourseDetailsTab({
  course,
  registrationType,
  paymentMode,
  onPaymentModeChange,
}: CourseDetailsTabProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const basePrice = getBasePrice(course, registrationType);
  const plan = calculateInstallment(basePrice, course.installmentsCount, course.installmentInterestPct);
  const attendanceLabel = registrationType === 'in_person' ? 'حضوری' : 'آنلاین';
  const AttendanceIcon = registrationType === 'in_person' ? MapPin : Monitor;
  const attendanceLocation = registrationType === 'in_person' ? course.locationInPerson : course.locationOnline;

  return (
    <div className="space-y-5" dir="rtl">
      {course.coverImageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-48 w-full rounded-2xl overflow-hidden"
        >
          <Image
            src={course.coverImageUrl}
            alt={course.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 rounded-2xl bg-navy-50 p-4"
      >
        {course.instructorImageUrl && (
          <div className="relative flex-shrink-0 h-16 w-16 rounded-full overflow-hidden ring-2 ring-navy-100">
            <Image
              src={course.instructorImageUrl}
              alt={course.instructorName}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-navy-800">
            استاد {course.instructorName}
          </p>
          <p className="flex items-center gap-1 text-sm text-navy-500 mt-0.5">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            {course.sessionsCount} جلسه × {formatDuration(course.sessionHours)}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-3 text-sm text-navy-600 flex-wrap"
      >
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-navy-100">
          <AttendanceIcon className="h-4 w-4 text-navy-500" aria-hidden="true" />
          <span>نوع برگزاری: <span className="font-medium">{attendanceLabel}</span></span>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-navy-100">
          <MapPin className="h-4 w-4 text-navy-500" aria-hidden="true" />
          <span>{attendanceLocation}</span>
        </div>
      </motion.div>

      {course.description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-navy-50 p-4"
        >
          <h4 className="font-semibold text-navy-800 mb-2 flex items-center gap-2">
            <Info className="h-5 w-5 text-navy-500" aria-hidden="true" />
            توضیحات دوره
          </h4>
          <div className={cn('text-sm leading-7 text-navy-600', !isDescriptionExpanded && 'line-clamp-4')}>
            {course.description}
          </div>
          {course.description.length > 200 && (
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="mt-3 flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:text-navy-800 transition-colors"
              aria-expanded={isDescriptionExpanded}
            >
              {isDescriptionExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  نمایش کمتر
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  نمایش بیشتر
                </>
              )}
            </button>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-navy-100 p-4"
      >
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-navy-800">
            نحوه پرداخت
          </label>
          <div className="relative flex w-full max-w-sm rounded-2xl bg-navy-50 p-1.5 shadow-inner" dir="rtl">
            {[
              { id: 'cash' as PaymentMode, label: 'نقدی', icon: CreditCard },
              { id: 'installment' as PaymentMode, label: `اقساط (${course.installmentsCount} مرحله)`, icon: CreditCard },
            ].map((option) => {
              const isSelected = paymentMode === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onPaymentModeChange(option.id)}
                  className={cn(
                    'relative z-10 flex flex-1 items-center justify-center rounded-xl py-3 text-sm font-bold transition-colors duration-200',
                    isSelected
                      ? 'text-navy-700'
                      : 'text-navy-500 hover:text-navy-700',
                  )}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="toggle-background"
                      className="absolute inset-0 -z-10 rounded-xl bg-white shadow-sm ring-1 ring-navy-900/5"
                      initial={false}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-20 flex items-center gap-1.5">
                    <option.icon className="h-4 w-4" aria-hidden="true" />
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {paymentMode === 'cash' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <p className="text-3xl font-extrabold text-emerald-600 fa-nums">
              {formatPrice(basePrice)}
            </p>
            <p className="mt-1 text-sm text-navy-500">تومان (پرداخت نقدی)</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="rounded-xl bg-gold-50/50 p-3 border border-gold-100/50">
              <p className="text-sm font-medium text-gold-800 text-center">
                مجموع با <span className="font-bold">{course.installmentInterestPct}٪</span> سود اقساطی:
                <span className="font-extrabold fa-nums ml-2">{formatPrice(plan.total)} تومان</span>
              </p>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {plan.items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm',
                    i === 0
                      ? 'bg-navy-50 text-navy-800 font-bold ring-1 ring-navy-200'
                      : 'bg-white text-navy-700 border border-navy-100',
                  )}
                >
                  <div className="flex items-center gap-2">
                    {i === 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-navy-100 text-[10px] font-bold text-navy-600">
                        {i + 1}
                      </span>
                    )}
                    <span className={cn('font-medium', i === 0 && 'font-bold')}>
                      {item.label}
                    </span>
                  </div>
                  <span className="font-bold tabular-nums fa-nums">
                    {formatPrice(item.amount)}
                    <span className="ml-1 text-[10px] font-normal text-navy-500">تومان</span>
                  </span>
                </motion.div>
              ))}
            </div>
            <p className="pt-2 text-center text-xs text-navy-500">
              * برنامه اقساطی تنها برای نمایش است و پرداخت واقعی در سایت انجام نمی‌شود.
            </p>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-navy-50 p-4"
      >
        <h4 className="font-semibold text-navy-800 mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-navy-500" aria-hidden="true" />
          اطلاعات کلی دوره
        </h4>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 text-sm">
          <div>
            <dt className="text-navy-500">مدرک</dt>
            <dd className="font-medium text-navy-900">{course.grade}</dd>
          </div>
          <div>
            <dt className="text-navy-500">تعداد جلسات</dt>
            <dd className="font-medium text-navy-900 fa-nums">{course.sessionsCount}</dd>
          </div>
          <div>
            <dt className="text-navy-500">مدت هر جلسه</dt>
            <dd className="font-medium text-navy-900">{formatDuration(course.sessionHours)}</dd>
          </div>
          <div>
            <dt className="text-navy-500">شروع کلاس</dt>
            <dd className="font-medium text-navy-900">
              {course.startDate
                ? new Date(course.startDate).toLocaleDateString('fa-IR')
                : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-navy-500">موقعیت حضوری</dt>
            <dd className="font-medium text-navy-900 truncate max-w-[150px]">{course.locationInPerson}</dd>
          </div>
          <div>
            <dt className="text-navy-500">موقعیت آنلاین</dt>
            <dd className="font-medium text-navy-900">{course.locationOnline}</dd>
          </div>
          <div>
            <dt className="text-navy-500">قیمت حضوری</dt>
            <dd className="font-medium text-navy-900 fa-nums">{formatPrice(course.priceInPerson)}</dd>
          </div>
          <div>
            <dt className="text-navy-500">قیمت آنلاین</dt>
            <dd className="font-medium text-navy-900 fa-nums">{formatPrice(course.priceOnline)}</dd>
          </div>
        </dl>
      </motion.div>
    </div>
  );
}