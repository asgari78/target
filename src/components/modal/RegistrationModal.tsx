'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Users, CalendarClock, CreditCard, MapPin, User } from 'lucide-react';
import Image from 'next/image';
import RegistrationForm from './RegistrationForm';
import { calculateInstallment, formatPrice, cn } from '@/src/lib/utils';
import type { Course, PaymentMode, RegistrationType } from '@/src/types';

interface RegistrationModalProps {
  course: Course | null;
  registrationType: RegistrationType;
  onClose: () => void;
}

type Tab = 'details' | 'register';

function ModalContent({ course, registrationType, onClose }: RegistrationModalProps) {
  const [tab, setTab] = useState<Tab>('details');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const basePrice = course
    ? registrationType === 'in_person'
      ? course.priceInPerson
      : course.priceOnline
    : 0;

  const plan = course
    ? calculateInstallment(basePrice, course.installmentMonths, course.installmentSurchargePercent)
    : null;

  const attendanceLabel = registrationType === 'in_person' ? 'حضوری' : 'آنلاین';
  const attendanceLocation = registrationType === 'in_person' ? 'قم - مجتمع آموزشی تارگت' : 'Google Meet';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        dir="rtl"
        initial={{ y: 60, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">ثبت‌نام در دوره</h2>
          <button
            onClick={onClose}
            aria-label="بستن"
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-2 px-5 pt-3">
          {[
            { key: 'details' as Tab, label: 'جزئیات دوره', icon: User },
            { key: 'register' as Tab, label: 'ثبت‌نام', icon: CreditCard },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                tab === key
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === 'register' ? (
            <RegistrationForm
              course={course}
              registrationType={registrationType}
              paymentMode={paymentMode}
              onSuccess={() => {
                onClose();
                alert('درخواست ثبت‌نام شما با موفقیت ارسال شد! ✅\nپشتیبانی به‌زودی با شما تماس می‌گیرد.');
              }}
            />
          ) : (
            <div className="space-y-4">
              {course.courseImageUrl && (
                <Image
                  src={course.courseImageUrl}
                  alt={course.title}
                  width={400}
                  height={176}
                  className="h-44 w-full rounded-2xl object-cover"
                />
              )}

              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                {course.instructorImageUrl && (
                  <Image
                    src={course.instructorImageUrl}
                    alt={course.instructorName}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-indigo-100"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    استاد {course.instructorName}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {course.sessionsCount} جلسه × {course.sessionDuration} دقیقه
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="h-4 w-4 text-indigo-500" />
                <span>نوع برگزاری: {attendanceLabel}</span>
                <span className="text-slate-300">|</span>
                <MapPin className="h-4 w-4 text-indigo-500" />
                {attendanceLocation}
              </div>

              {course.description && (
                <p className="text-sm leading-7 text-slate-600">{course.description}</p>
              )}

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-3">
                  <div className="relative flex w-full max-w-sm rounded-2xl bg-slate-100 p-1.5 shadow-inner" dir="rtl">
                    {[
                      { id: 'cash' as PaymentMode, label: 'نقدی', icon: CreditCard },
                      { id: 'installment' as PaymentMode, label: `اقساط (${course.installmentMonths} مرحله)`, icon: CreditCard },
                    ].map((option) => {
                      const isSelected = paymentMode === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setPaymentMode(option.id)}
                          className={cn(
                            'relative z-10 flex flex-1 items-center justify-center rounded-xl py-3 text-sm font-bold transition-colors duration-200',
                            isSelected
                              ? 'text-indigo-700'
                              : 'text-slate-500 hover:text-slate-700',
                          )}
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="toggle-background"
                              className="absolute inset-0 -z-10 rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5"
                              initial={false}
                              transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 30,
                              }}
                            />
                          )}
                          <span className="relative z-20 flex items-center gap-1.5">
                            <option.icon className="h-4 w-4" />
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {paymentMode === 'cash' ? (
                  <p className="text-center text-lg font-extrabold text-emerald-600">
                    {formatPrice(basePrice)}
                    <span className="mr-1 text-xs font-normal text-slate-500">تومان (نقد)</span>
                  </p>
                ) : (
                  plan && (
                    <div className="space-y-2">
                      {plan.items.map((item, i) => (
                        <div
                          key={i}
                          className={cn(
                            'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm',
                            i === 0
                              ? 'bg-indigo-50 text-indigo-800 font-bold ring-1 ring-indigo-200'
                              : 'bg-slate-50 text-slate-700',
                          )}
                        >
                          <span>{item.label}</span>
                          <span className="font-bold tabular-nums">
                            {formatPrice(item.amount)}
                            <span className="mr-1 text-[10px] font-normal">تومان</span>
                          </span>
                        </div>
                      ))}
                      <p className="pt-1 text-center text-xs text-slate-500">
                        مجموع با {course.installmentSurchargePercent}٪ سود اقساطی: {formatPrice(plan.total)} تومان
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function RegistrationModal({
  course,
  registrationType,
  onClose,
}: RegistrationModalProps) {
  return (
    <AnimatePresence>
      {course && (
        <ModalContent
          key={course.id}
          course={course}
          registrationType={registrationType}
          onClose={onClose}
        />
      )}
    </AnimatePresence>
  );
}