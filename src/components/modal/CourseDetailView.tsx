'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Monitor, CalendarClock, Users, Info, CreditCard, Tag, GraduationCap, BookOpen, Target, Shield, Clock } from 'lucide-react';
import { Course } from '@/src/types';
import { formatPrice, formatDuration, formatJalaliDate, calculateInstallmentPlan, getAvailableModes } from '@/src/lib/utils';
import { cn } from '@/src/lib/utils';
import type { PaymentMode } from '@/src/types';

interface CourseDetailViewProps {
  course: Course;
  selectedMode: 'in_person' | 'online';
  onModeChange: (mode: 'in_person' | 'online') => void;
  paymentMode: PaymentMode;
  onPaymentModeChange: (mode: PaymentMode) => void;
}

const modeConfigs = {
  in_person: {
    label: 'حضوری',
    icon: MapPin,
    color: 'navy',
    bgColor: 'bg-navy-50',
    borderColor: 'border-navy-200',
    textColor: 'text-navy-700',
    hoverBg: 'hover:bg-navy-100',
    activeBg: 'bg-navy-600',
    activeText: 'text-white',
    gradient: 'from-navy-600 to-navy-700',
  },
  online: {
    label: 'آنلاین',
    icon: Monitor,
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    hoverBg: 'hover:bg-emerald-100',
    activeBg: 'bg-emerald-600',
    activeText: 'text-white',
    gradient: 'from-emerald-600 to-emerald-700',
  },
} as const;

function PricingBlock({ course, mode, paymentMode, onPaymentModeChange }: { course: Course; mode: 'in_person' | 'online'; paymentMode: PaymentMode; onPaymentModeChange: (mode: PaymentMode) => void }) {
  const config = modeConfigs[mode];
  const plan = calculateInstallmentPlan(course, mode, paymentMode);
  const originalPrice = plan.originalAmount;
  const discountedPrice = plan.baseAmount;
  const discountPercent = plan.discountPercent;
  const hasDiscount = originalPrice && originalPrice > discountedPrice && discountPercent > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Payment Mode Toggle */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">نحوه پرداخت</label>
        <div className="relative flex w-full max-w-sm rounded-2xl bg-slate-100 p-1.5 shadow-inner" dir="rtl">
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
                  isSelected ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700',
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="payment-toggle-bg"
                    className="absolute inset-0 -z-10 rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
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

      <AnimatePresence mode="wait">
        {paymentMode === 'cash' ? (
          <motion.div
            key="cash"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl p-6 text-center"
            style={{ background: `linear-gradient(135deg, ${config.gradient})` }}
          >
            {hasDiscount && originalPrice && (
              <p className="mb-2 text-sm text-white/80 line-through">
                قیمت اصلی: <span className="fa-nums">{formatPrice(originalPrice)}</span> تومان
              </p>
            )}
            <p className="text-4xl font-extrabold text-white fa-nums">
              {formatPrice(discountedPrice)}
            </p>
            <p className="mt-1 text-white/90">تومان (پرداخت یک‌جا)</p>
            {hasDiscount && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-bold text-white"
              >
                <Tag className="h-3.5 w-3.5" />
                {discountPercent}٪ تخفیف
              </motion.span>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="installment"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {/* Summary Card */}
            <div className="rounded-2xl p-4 border" style={{ borderColor: config.borderColor, backgroundColor: config.bgColor }}>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex flex-col">
                  <p className="text-sm font-medium" style={{ color: config.textColor }}>
                    مجموع اقساط (بدون سود)
                  </p>
                  <p className="text-2xl font-extrabold fa-nums" style={{ color: config.textColor }}>
                    {formatPrice(plan.totalAmount)} تومان
                  </p>
                </div>
                {hasDiscount && originalPrice && (
                  <div className="text-right">
                    <p className="text-sm text-slate-500 line-through fa-nums">
                      {formatPrice(originalPrice)} تومان
                    </p>
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${config.gradient})` }}
                    >
                      <Tag className="h-3 w-3" />
                      {discountPercent}٪ تخفیف
                    </motion.span>
                  </div>
                )}
              </div>
            </div>

            {/* Installment Breakdown */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_auto] px-4 py-3 text-xs font-medium text-slate-500 bg-slate-50 border-b border-slate-200">
                <span>#</span>
                <span className="text-right pr-4">مرحله</span>
                <span className="text-left">مبلغ (تومان)</span>
              </div>
              <AnimatePresence>
                {plan.installments.map((item, i) => (
                  <motion.div
                    key={item.index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.04 }}
                    className={cn(
                      'grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-3 items-center border-b border-slate-100 last:border-b-0 transition-colors',
                      i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50',
                      item.isDownPayment ? 'bg-linear-to-r from-amber-50 to-white font-semibold' : ''
                    )}
                  >
                    <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold', item.isDownPayment ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500')}>
                      {item.index}
                    </span>
                    <div className="flex items-center gap-2 pr-4 text-right">
                      {item.isDownPayment && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          پیش‌پرداخت
                        </span>
                      )}
                      <span className="font-medium text-slate-700">{item.label}</span>
                      <span className="text-[10px] text-slate-400 fa-nums hidden sm:inline">({formatJalaliDate(item.dueDate)})</span>
                    </div>
                    <span className="font-bold tabular-nums fa-nums text-slate-900">{formatPrice(item.amount)}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <p className="text-center text-xs text-slate-500">
              * اقساط بدون سود و کارمزد محاسبه شده‌اند. مبالغ تقریبی هستند و در فاکتور نهایی قابل تغییر می‌باشند.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InfoSection({ course, mode }: { course: Course; mode: 'in_person' | 'online' }) {
  const config = modeConfigs[mode];
  const location = mode === 'in_person' ? course.locationInPerson : course.locationOnline;
  const schedule = course.scheduleText;
  const sessions = course.sessionsCount;
  const sessionHours = course.sessionHours;
  const startDate = course.startDate;
  const grade = course.grade;
  const instructor = course.instructorName;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      {/* Course Meta Grid */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 p-4">
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50">
            <GraduationCap className="h-5 w-5" style={{ color: config.textColor }} />
            <span className="text-xs text-slate-500">مدرک</span>
            <span className="font-bold text-slate-900">{grade}</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50">
            <BookOpen className="h-5 w-5" style={{ color: config.textColor }} />
            <span className="text-xs text-slate-500">تعداد جلسات</span>
            <span className="font-bold text-slate-900 fa-nums">{sessions}</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50">
            <Clock className="h-5 w-5" style={{ color: config.textColor }} />
            <span className="text-xs text-slate-500">مدت هر جلسه</span>
            <span className="font-bold text-slate-900">{formatDuration(sessionHours)}</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50">
            <CalendarClock className="h-5 w-5" style={{ color: config.textColor }} />
            <span className="text-xs text-slate-500">شروع کلاس</span>
            <span className="font-bold text-slate-900 text-sm">
              {startDate ? formatJalaliDate(startDate) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Location & Schedule */}
      <div className="rounded-2xl p-4" style={{ backgroundColor: config.bgColor, borderColor: config.borderColor }}>
        <div className="flex items-center gap-2 mb-3">
          {(() => {
            const IconComponent = modeConfigs[mode].icon;
            return <IconComponent className="h-5 w-5" style={{ color: config.textColor }} />;
          })()}
          <h4 className="font-semibold text-slate-900">مکان و زمان‌بندی</h4>
        </div>
        <div className="space-y-3 text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 shrink-0 mt-0.5" style={{ color: config.textColor }} />
            <span><strong>مکان:</strong> {location}</span>
          </div>
          <div className="flex items-start gap-3">
            <CalendarClock className="h-5 w-5 shrink-0 mt-0.5" style={{ color: config.textColor }} />
            <span><strong>برنامه:</strong> {schedule}</span>
          </div>
        </div>
      </div>

      {/* Instructor */}
      {course.instructorImageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl p-4 border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <Users className="h-5 w-5 text-slate-500" />
            <h4 className="font-semibold text-slate-900">استاد درس</h4>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0 h-16 w-16 rounded-full overflow-hidden ring-2 ring-slate-200">
              <Image src={course.instructorImageUrl} alt={instructor} fill className="object-cover" sizes="64px" />
            </div>
            <div>
              <p className="font-bold text-slate-900">{instructor}</p>
              {course.instructorBio && (
                <p className="mt-1 text-sm text-slate-600 line-clamp-2">{course.instructorBio}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Audience & Curriculum */}
      {(course.audience || course.curriculum || course.requirements) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {course.audience && (
            <div className="rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-slate-500" />
                <h4 className="font-semibold text-slate-900">مخاطبان هدف</h4>
              </div>
              <p className="text-sm text-slate-600 leading-7">{course.audience}</p>
            </div>
          )}
          {course.curriculum && (
            <div className="rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-slate-500" />
                <h4 className="font-semibold text-slate-900">مطالب دوره</h4>
              </div>
              <p className="text-sm text-slate-600 leading-7">{course.curriculum}</p>
            </div>
          )}
          {course.requirements && (
            <div className="rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-slate-500" />
                <h4 className="font-semibold text-slate-900">پیش‌نیازها</h4>
              </div>
              <p className="text-sm text-slate-600 leading-7">{course.requirements}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Description */}
      {course.description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl p-4 border border-slate-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-5 w-5 text-slate-500" />
            <h4 className="font-semibold text-slate-900">توضیحات دوره</h4>
          </div>
          <p className="text-sm text-slate-600 leading-7">{course.description}</p>
        </motion.div>
      )}

      {/* Venue Details & Map */}
      {(course.venueDetails || course.mapEmbedUrl) && mode === 'in_person' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {course.venueDetails && (
            <div className="rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-slate-500" />
                <h4 className="font-semibold text-slate-900">جزئیات محل برگزاری</h4>
              </div>
              <p className="text-sm text-slate-600 leading-7">{course.venueDetails}</p>
            </div>
          )}
          {course.mapEmbedUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-200">
              <div className="aspect-video w-full">
                <iframe
                  src={course.mapEmbedUrl}
                  title="موقعیت مکانی آموزشگاه"
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function CourseDetailView({
  course,
  selectedMode,
  onModeChange,
  paymentMode,
  onPaymentModeChange,
}: CourseDetailViewProps) {
  const availableModes = getAvailableModes(course);
  const showTabs = availableModes.length > 1;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Hero Banner */}
      {course.coverImageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-100"
        >
          <Image
            src={course.coverImageUrl}
            alt={course.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur">
              {selectedMode === 'in_person' ? (
                <>
                  <MapPin className="h-3 w-3" />
                  حضوری
                </>
              ) : (
                <>
                  <Monitor className="h-3 w-3" />
                  آنلاین
                </>
              )}
            </span>
          </div>
        </motion.div>
      )}

      {/* Course Title & Grade */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight" style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}>
          {course.title}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800">
            <GraduationCap className="h-4 w-4" />
            پایه {course.grade}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            <BookOpen className="h-4 w-4" />
            {course.sessionsCount} جلسه × {formatDuration(course.sessionHours)}
          </span>
          {course.instructorName && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              <Users className="h-4 w-4" />
              استاد {course.instructorName}
            </span>
          )}
        </div>
      </motion.div>

      {/* Mode Tabs */}
      {showTabs && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative flex gap-2 rounded-2xl bg-slate-100 p-1.5"
          dir="rtl"
        >
          {availableModes.map((mode) => {
            const config = modeConfigs[mode];
            const isSelected = selectedMode === mode;
            return (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                className={cn(
                  'relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300',
                  isSelected
                    ? `${config.activeText} shadow-lg`
                    : `${config.textColor} ${config.hoverBg}`,
                  isSelected && `bg-linear-to-br ${config.gradient}`,
                )}
              >
                <config.icon className="h-4 w-4" aria-hidden="true" />
                {config.label}
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Content for Selected Mode */}
      <div className="space-y-5">
        <PricingBlock
          course={course}
          mode={selectedMode}
          paymentMode={paymentMode}
          onPaymentModeChange={onPaymentModeChange}
        />
        <InfoSection course={course} mode={selectedMode} />
      </div>
    </div>
  );
}