'use client';

import { motion } from 'framer-motion';
import {
  Award,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  Headset,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

type WhyItem = {
  id: number;
  title: string;
  description: string;
  badge: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconBgClass: string;
  iconColorClass: string;
};

const whyItems: WhyItem[] = [
  {
    id: 1,
    title: 'اساتید توانمند برای هر پایه و درس',
    description:
      'از پایه‌های ابتدایی تا آمادگی آزمون‌های تیزهوشان، با مدرس‌های رسمی و با‌تجربه‌ای همراه می‌شوید که به تمام زوایای مفهومی و تستی مسلط هستند.',
    badge: 'کادر رسمی و مجرب',
    icon: Award,
    iconBgClass: 'bg-amber-500/10 border-amber-500/25',
    iconColorClass: 'text-amber-500',
  },
  {
    id: 2,
    title: 'کارنامه‌ قابل اتکا و نتایج متمایز',
    description:
      'تمرکز روی درک عمیق مفاهیم باعث شده دانش‌آموزان هم در آزمون‌های ورودی سمپاد و نمونه‌دولتی بدرخشند و هم در مدرسه بالاترین نمرات را کسب کنند.',
    badge: 'قبولی‌های درخشان',
    icon: BarChart3,
    iconBgClass: 'bg-violet-500/10 border-violet-500/25',
    iconColorClass: 'text-violet-600',
  },
  {
    id: 3,
    title: 'همراهی مستمر و مشاوره تحصیلی',
    description:
      'تعیین سطح دقیق، انتخاب دوره متناسب با نیاز دانش‌آموز و پشتیبانی آموزشی پیوسته تا روز آزمون جهت حفظ آمادگی و آرامش ذهنی.',
    badge: 'پشتیبانی اختصاصی',
    icon: Headset,
    iconBgClass: 'bg-emerald-500/10 border-emerald-500/25',
    iconColorClass: 'text-emerald-600',
  },
  {
    id: 4,
    title: 'دوره‌های جامع و متناسب با نیاز',
    description:
      'فرقی نمی‌کند در ابتدای مسیر پایه‌سازی باشید یا در دوران جمع‌بندی؛ دوره‌ها با محتوای به‌روز، جزوات تخصصی و تحلیل تست طراحی شده‌اند.',
    badge: 'تست و تشریحی',
    icon: BookOpenCheck,
    iconBgClass: 'bg-rose-500/10 border-rose-500/25',
    iconColorClass: 'text-rose-600',
  },
];

export default function WhyTargetSection() {
  return (
    <section
      id="why-target"
      dir="rtl"
      aria-labelledby="why-target-heading"
      className="relative z-10 py-6 md:py-10"
    >
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
        {/* Header - کاملاً هماهنگ با استانداردهای CourseList */}
        <div className="mb-5 md:mb-8">
          <motion.header
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="flex flex-col items-start gap-1 text-right"
          >
            <h2 id="why-target-heading">
              <span
                style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
                className="inline-flex items-center gap-2 text-xl leading-tight text-slate-900 sm:text-2xl md:text-4xl"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-amber-300 shadow-sm md:h-10 md:w-10">
                  <HelpCircle className="h-4 w-4 md:h-5 md:w-5" />
                </span>
                چرا آکادمی تیزهوشان تارگت؟
              </span>
            </h2>

            <p className="mt-0.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 sm:text-xs md:text-sm">
              مزیت‌ها و ویژگی‌هایی که مسیر موفقیت شما را هموار می‌کنند
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
            </p>

            <span className="mt-2 block h-1 w-28 rounded-full bg-gradient-to-l from-slate-900 via-amber-500 sm:w-36 md:w-48" />
          </motion.header>
        </div>

        {/* 
          Feature Cards Container:
          - Mobile: اسکرول افقی با تاچ (snap-x snap-mandatory) بدون نمایش اسکرول‌بار پیش‌فرض
          - Tablet & Desktop: گرید مرتب ۲ و ۴ ستونه
        */}
        <ul
          role="list"
          aria-label="ویژگی‌ها و مزایای آکادمی تارگت"
          className="
            -mx-3 flex gap-3 overflow-x-auto px-3 pb-4 pt-1
            snap-x snap-mandatory [scrollbar-width:none] [-webkit-overflow-scrolling:touch]
            sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:p-0
            lg:grid-cols-4 lg:gap-5
          "
        >
          {whyItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: 16, scale: 0.985 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.42,
                  delay: index * 0.045,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="
                  group h-full shrink-0 snap-start list-none
                  w-[82%] xs:w-[74%] sm:w-auto
                "
              >
                <article
                  className="
                    relative flex h-50 flex-col justify-between overflow-hidden rounded-2xl
                    border border-slate-200/90 bg-white/90 p-3.5 sm:p-4 text-right shadow-sm
                    backdrop-blur-[2px]
                    transition-all duration-300
                    hover:-translate-y-0.5 hover:border-slate-300/95 hover:shadow-lg hover:shadow-slate-300/35
                  "
                >
                  {/* افکت گرادیان شعاعی پس‌زمینه کارت مطابق CourseRow */}
                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none absolute inset-0 z-[1]
                      bg-[radial-gradient(80%_45%_at_100%_0%,rgba(250,204,21,0.14),transparent_60%),
                          radial-gradient(75%_45%_at_0%_100%,rgba(139,92,246,0.08),transparent_60%)]
                    "
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-[1px] z-[1] rounded-[15px] border border-white/70"
                  />

                  {/* بدنه کارت */}
                  <div className="relative z-[2]">
                    {/* سطر بالا: آیکون و نشانگر ویژگی */}
                    <div className="mb-3 flex items-center justify-between">
                      <div
                        className={`inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border ${item.iconBgClass} shadow-2xs transition-transform duration-300 group-hover:scale-105`}
                      >
                        <Icon className={`h-4.5 w-4.5 sm:h-5 sm:w-5 ${item.iconColorClass}`} />
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-900/10 bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-700 shadow-2xs backdrop-blur-xs">
                        <Sparkles className="h-2.5 w-2.5 text-amber-500" />
                        {item.badge}
                      </span>
                    </div>

                    {/* عنوان */}
                    <h3
                      style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
                      className="
                        text-[15px] sm:text-base md:text-lg leading-snug text-slate-900
                        transition-colors duration-300 group-hover:text-slate-950
                      "
                    >
                      {item.title}
                    </h3>

                    {/* توضیحات */}
                    <p className="mt-1.5 text-[11px] sm:text-xs leading-5 sm:leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </div>

                  {/* فوتر کوچک تأیید کیفیت */}
                  <div className="relative z-[2] mt-3.5 pt-2.5 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      تضمین کیفیت آموزشی تارگت
                    </span>
                  </div>

                  {/* هاله فوکوس و هاور */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition-all duration-300 group-hover:ring-amber-300/70"
                  />
                </article>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
