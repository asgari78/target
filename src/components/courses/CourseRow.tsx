'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgePercent,
  BookOpenText,
  CalendarClock,
  Clock3,
  Layers3,
  MapPin,
  Monitor,
  Sparkles,
  UserSquare2,
} from 'lucide-react';
import { Course, CourseOffering } from '@/src/types';
import { getAvailableModes } from '@/src/lib/utils';

interface CourseRowProps {
  course: Course;
  index: number;
  onRegisterClick: (course: Course, type: 'in_person' | 'online') => void;
}

function toPersianDigits(value: string | number) {
  const map: Record<string, string> = {
    '0': '۰',
    '1': '۱',
    '2': '۲',
    '3': '۳',
    '4': '۴',
    '5': '۵',
    '6': '۶',
    '7': '۷',
    '8': '۸',
    '9': '۹',
  };
  return String(value).replace(/[0-9]/g, (w) => map[w] || w);
}

function formatPrice(price: number) {
  return `${toPersianDigits(new Intl.NumberFormat('fa-IR').format(price))} تومان`;
}

function choosePrimaryMode(course: Course): 'in_person' | 'online' {
  const modes = getAvailableModes(course);
  if (modes.includes('in_person')) return 'in_person';
  if (modes.includes('online')) return 'online';
  return 'in_person';
}

function buildModeLabel(course: Course) {
  if (course.inPersonAvailable && course.onlineAvailable) return 'حضوری / آنلاین';
  if (course.inPersonAvailable) return 'حضوری';
  if (course.onlineAvailable) return 'آنلاین';
  return 'در حال تکمیل';
}

function getSessionDurationText(course: Course) {
  const possible = (course as any).sessionDuration as string | null | undefined; // چون در SQL هست ولی در Course interface نیست
  if (possible && possible.trim()) return possible.trim();
  return `${toPersianDigits(course.sessionHours)} ساعت`;
}

function getOfferingByMode(course: Course, mode: 'in_person' | 'online'): CourseOffering | null {
  if (!course.courseOfferings?.length) return null;
  return (
    course.courseOfferings
      .filter((o) => o.isAvailable)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .find((o) => o.attendanceMode === mode) ?? null
  );
}

function getBestOffering(course: Course, primaryMode: 'in_person' | 'online') {
  const primary = getOfferingByMode(course, primaryMode);
  if (primary) return primary;

  const fallback = course.courseOfferings?.filter((o) => o.isAvailable).sort((a, b) => a.sortOrder - b.sortOrder)?.[0];
  return fallback ?? null;
}

export default function CourseRow({ course, index, onRegisterClick }: CourseRowProps) {
  const primaryMode = choosePrimaryMode(course);
  const modeLabel = buildModeLabel(course);

  const sessionDurationText = getSessionDurationText(course);
  const sessionsCountText = `${toPersianDigits(course.sessionsCount)} جلسه`;
  const gradeText = `پایه ${course.grade}`;
  const scheduleText = course.scheduleText?.trim() ? course.scheduleText : 'برنامه‌ریزی منعطف';
  const instructorName = course.instructorName?.trim() ? course.instructorName : 'اساتید آکادمی';

  const bestOffering = getBestOffering(course, primaryMode);

  const hasOfferings = Boolean(bestOffering);
  const cashPriceAfter = hasOfferings ? bestOffering!.cashPriceAfterDiscount : null;
  const cashPriceBefore = hasOfferings ? bestOffering!.cashPriceBeforeDiscount : null;
  const hasDiscount = hasOfferings && !!cashPriceBefore && cashPriceBefore > cashPriceAfter!;
  const installmentsCount = hasOfferings ? bestOffering!.installmentsCount : 0;
  const installmentInterest = hasOfferings ? bestOffering!.installmentInterestPct : 0;

  return (
    <motion.li
      initial={{ opacity: 0, y: 16, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.42, delay: index * 0.045, ease: [0.22, 1, 0.36, 1] }}
      className="group h-full"
    >
      <article
        className="
          relative flex h-full flex-col overflow-hidden rounded-2xl
          border border-slate-200/90 bg-white/90 text-right shadow-sm
          backdrop-blur-[2px]
          transition-all duration-300
          hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-300/35
          hover:border-slate-300/95
        "
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-0 z-[1]
            bg-[radial-gradient(80%_45%_at_100%_0%,rgba(250,204,21,0.16),transparent_60%),
                radial-gradient(75%_45%_at_0%_100%,rgba(139,92,246,0.10),transparent_60%)]
          "
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[1px] z-[1] rounded-[15px] border border-white/70"
        />

        {/* Poster */}
        <div className="relative z-[2] aspect-[1/1] w-full overflow-hidden bg-slate-100">
          {course.coverImageUrl ? (
            <Image
              src={course.coverImageUrl}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={index < 4}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200">
              <div className="flex flex-col items-center gap-1 text-slate-500">
                <BookOpenText className="h-5 w-5" />
                <span className="text-[10px] font-semibold sm:text-xs">بدون تصویر</span>
              </div>
            </div>
          )}

          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

          {/* Desktop badges */}
          <div className="absolute right-2 top-2 z-10 hidden items-center gap-1 sm:flex">
            {course.inPersonAvailable && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/35 bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-800 shadow-sm backdrop-blur">
                <MapPin className="h-3 w-3 text-amber-500" />
                حضوری
              </span>
            )}
            {course.onlineAvailable && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/35 bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-800 shadow-sm backdrop-blur">
                <Monitor className="h-3 w-3 text-violet-600" />
                آنلاین
              </span>
            )}
          </div>

          <div className="absolute left-2 top-2 z-10 hidden sm:block">
            <span className="inline-flex max-w-[8.5rem] items-center gap-1 truncate rounded-full border border-slate-900/10 bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-700 shadow-sm backdrop-blur">
              <Sparkles className="h-3 w-3 text-amber-500" />
              {gradeText}
            </span>
          </div>

          {/* Mobile only */}
          <div className="absolute right-1.5 top-1.5 z-10 sm:hidden">
            <span className="inline-flex h-6 items-center gap-1 rounded-full border border-amber-300/70 bg-amber-50/95 px-2 text-[9px] font-extrabold text-amber-900 shadow-sm">
              <BadgePercent className="h-3 w-3" />
              قسطی
            </span>
          </div>

          <div className="absolute bottom-1.5 left-1.5 z-10 sm:hidden">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-black/45 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-[2px]">
              {course.inPersonAvailable && !course.onlineAvailable && <MapPin className="h-2.5 w-2.5 text-amber-300" />}
              {!course.inPersonAvailable && course.onlineAvailable && <Monitor className="h-2.5 w-2.5 text-violet-300" />}
              {course.inPersonAvailable && course.onlineAvailable && <Layers3 className="h-2.5 w-2.5 text-amber-300" />}
              {modeLabel}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="relative z-[2] flex flex-1 flex-col p-2 sm:p-3">
          <h3
            style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
            className="
              line-clamp-2 py-1 text-[13px] leading-5 text-slate-900
              transition-colors duration-300 group-hover:text-slate-950
              sm:min-h-[2.7rem] sm:text-[15px] sm:leading-6 md:text-base
            "
            title={course.title}
          >
            {course.title}
          </h3>


          {/* Mobile compact line */}
          <div className="py-1 flex items-center justify-between text-[10px] text-slate-600 sm:hidden">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3 w-3 text-slate-500" />
              {sessionDurationText}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-3 w-3 text-slate-500" />
              {sessionsCountText}
            </span>
          </div>


          {/* CTA */}
          <div className="-mx-2 -mb-2 mt-2 sm:-mx-3 sm:-mb-3">
            <button
              type="button"
              onClick={() => onRegisterClick(course, primaryMode)}
              className="
                group/cta inline-flex w-full items-center justify-center gap-1.5
                rounded-t-xl rounded-b-[14px] border-t border-slate-300/70
                bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900
                px-2 py-2.5 text-[11px] font-extrabold text-white
                shadow-[0_-1px_0_rgba(255,255,255,0.08)_inset]
                transition-all duration-300
                hover:from-black hover:via-slate-900 hover:to-black
                active:scale-[0.995]
                sm:py-3 sm:text-xs
              "
              aria-label={`ثبت‌نام در دوره ${course.title}`}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/90 text-black shadow-sm">
                <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:-translate-x-0.5" />
              </span>
              مشاهده جزئیات و ثبت‌نام
            </button>
          </div>
        </div>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition-all duration-300 group-hover:ring-amber-300/70"
        />
      </article>
    </motion.li>
  );
}
