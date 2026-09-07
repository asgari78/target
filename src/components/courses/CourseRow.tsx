'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, BadgePercent, MapPin, Monitor } from 'lucide-react';
import { Course } from '@/src/types';
import { getAvailableModes } from '@/src/lib/utils';

interface CourseRowProps {
  course: Course;
  index: number;
  onRegisterClick: (course: Course, type: 'in_person' | 'online') => void;
}

export default function CourseRow({ course, index, onRegisterClick }: CourseRowProps) {
  const availableModes = getAvailableModes(course);
  const primaryMode = availableModes[0] || 'in_person';

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
  className="
    group/card flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-3xl
    border border-slate-200 bg-white text-right shadow-sm
    transition-all duration-300
    hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl
    focus:outline-none
    focus-visible:ring-2 focus-visible:ring-indigo-300
  "
>

{/* Image */}
<div className="group/poster relative isolate aspect-square w-full shrink-0 overflow-hidden bg-slate-100">
  {course.coverImageUrl ? (
    <Image
      src={course.coverImageUrl}
      alt={course.title}
      fill
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
    />
  ) : (
    <div className="flex h-full items-center justify-center bg-linear-to-br from-slate-100 to-slate-200">
      <span className="text-sm font-medium text-slate-500">
        بدون تصویر
      </span>
    </div>
  )}

  {/* تیرگی دائمی روی قسمت بالای پوستر */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-x-0 top-0 z-10 h-full bg-linear-to-b from-black/35 via-black/15 to-transparent"
  />

{/* فریم گرافیکی پوستر */}
<div
  aria-hidden="true"
  className="
    pointer-events-none absolute inset-0 z-20
    transform-gpu opacity-100
    will-change-[opacity,transform]
    transition-[opacity,transform]
    duration-700
    ease-[cubic-bezier(0.22,1,0.36,1)]
    group-hover/poster:scale-[1.015]
    group-hover/poster:opacity-0
    group-active/card:scale-[1.015]
    group-active/card:opacity-0
    motion-reduce:transition-none
  "
>

  {/* حاشیه گرادیانی؛ مرکز کاملاً شفاف است */}
  <div
    className="absolute inset-2 rounded-[1.4rem] p-[3px] sm:p-1"
    style={{
      background:
        'linear-gradient(135deg, #a5b4fc 0%, #6366f1 22%, rgba(255,255,255,0.8) 48%, #c084fc 76%, #7c3aed 100%)',
      maskImage:
        'linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)',
      maskClip: 'content-box, border-box',
      maskComposite: 'exclude',
      WebkitMaskImage:
        'linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)',
      WebkitMaskClip: 'content-box, border-box',
      WebkitMaskComposite: 'xor',
    }}
  />

  {/* لبه روشن داخلی */}
  <div
    className="
      absolute inset-[14px] rounded-[1.05rem]
      border border-white/65
      shadow-[0_0_12px_rgba(99,102,241,0.3)]
    "
  />

  {/* المان منحنی بالا ـ چپ */}
  <div
    className="
      absolute top-0 left-0

overflow-hidden
rounded-br-[85%]
      border-r-[3px] border-b-[3px] border-indigo-100/90
      bg-linear-to-br from-indigo-950 via-indigo-600 to-violet-400
      shadow-[5px_5px_20px_rgba(49,46,129,0.35)]
    "
  >
    {/* درخشش نرم */}
    <span
      className="
        absolute -top-5 -left-5
        h-[85%] w-[85%] rounded-full
        bg-violet-300/50 blur-xl
      "
    />

    {/* حلقه پهن منحنی */}
    <span
      className="
        absolute -top-[38%] -left-[38%]
        h-[125%] w-[125%]
        rounded-full border-[10px] border-white/20
        sm:border-[14px]
      "
    />

    {/* قوس روشن داخلی */}
    <span
      className="
        absolute -top-[22%] -left-[22%]
        h-[85%] w-[85%]
        rounded-full border-2 border-indigo-100/80
      "
    />

    {/* نگین روشن */}
    <span
      className="
        absolute top-[24%] left-[24%]
        h-4 w-4 rotate-45 rounded h-4 w-4 rotate-45 rounded-[5px]
        border border-white/90 bg-linear-to-br from-white to-indigo-200
        shadow-[0_0_16px_rgba(255,255,255,0.65)]
        sm:h-5 sm:w-5
      "
    />

    {/* نقطه کوچک تزئینی */}
    <span
      className="
        absolute top-[20%] left-[53%]
        h-1.5 w-1.5 rounded-full bg-white/90
      "
    />
  </div>

  {/* المان منحنی پایین ـ راست */}
{/* المان منحنی پایین ـ راست */}
<div
  className="
    absolute right-2 bottom-2
    h-[20%] w-[20%]
    overflow-hidden
    rounded-tl-[100%]
    border-t-2 border-l-2 border-fuchsia-100/65
    bg-linear-to-tl
    from-indigo-950/80
    via-violet-600/55
    to-fuchsia-400/35
    opacity-80
    shadow-[-3px_-3px_14px_rgba(88,28,135,0.24)]
  "
>
  {/* درخشش داخلی */}
  <span
    className="
      absolute -right-3 -bottom-3
      h-[80%] w-[80%]
      rounded-full
      bg-fuchsia-300/25
      blur-md
    "
  />

  {/* حلقه‌ی منحنی */}
  <span
    className="
      absolute -right-[42%] -bottom-[42%]
      h-[135%] w-[135%]
      rounded-full
      border-[5px] border-white/20
      sm:border-[7px]
    "
  />

  {/* قوس روشن داخلی */}
  <span
    className="
      absolute -right-[20%] -bottom-[20%]
      h-[82%] w-[82%]
      rounded-full
      border border-fuchsia-100/65
    "
  />

  {/* نگین تزئینی */}
  <span
    className="
      absolute right-[23%] bottom-[23%]
      h-3 w-3 rotate-45
      rounded-[4px]
      border border-white/80
      bg-linear-to-br from-white/90 to-fuchsia-200/70
      shadow-[0_0_10px_rgba(255,255,255,0.55)]
      sm:h-4 sm:w-4
    "
  />
</div>

</div>


  {/* نشان‌های نوع برگزاری */}
  <div className="absolute top-3 right-3 z-30 flex flex-wrap gap-1.5">
    {course.inPersonAvailable && (
      <span className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/95 px-2.5 py-1 text-xs font-semibold text-navy-700 shadow-md backdrop-blur-sm">
        <MapPin className="h-3 w-3" />
        حضوری
      </span>
    )}

    {course.onlineAvailable && (
      <span className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/95 px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-md backdrop-blur-sm">
        <Monitor className="h-3 w-3" />
        آنلاین
      </span>
    )}
  </div>

  {/* افکت ملایم پایین پوستر هنگام هاور */}
  <div
    aria-hidden="true"
    className="
      pointer-events-none absolute inset-0 z-10
      bg-linear-to-t from-black/20 via-transparent to-transparent
      opacity-0 transition-opacity duration-300
      group-hover:opacity-100
    "
  />
</div>



        {/* Content */}
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex flex-1 flex-col gap-4">
            <h3
              className="text-base font-bold leading-7 text-slate-900 transition-colors group-hover:text-indigo-700 sm:text-lg"
              style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
            >
              {course.title}
            </h3>

            {/* Installment + attendance badges in one row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 shadow-sm">
                <BadgePercent className="h-3.5 w-3.5" />
                <span>امکان خرید قسطی</span>
              </span>

              {course.inPersonAvailable && (
                <span className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50/60 px-2 py-1 text-[11px] font-medium text-indigo-700">
                  <MapPin className="h-3 w-3" />
                  حضوری
                </span>
              )}

              {course.onlineAvailable && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50/60 px-2 py-1 text-[11px] font-medium text-emerald-700">
                  <Monitor className="h-3 w-3" />
                  آنلاین
                </span>
              )}
            </div>
          </div>

          <div className="mt-5">
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-l from-indigo-600 to-indigo-700 px-4 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 group-hover:from-indigo-700 group-hover:to-indigo-800 group-hover:shadow-lg">
              <span>مشاهده جزئیات و ثبت‌نام</span>
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            </span>
          </div>
        </div>
      </button>
    </motion.li>
  );
}
