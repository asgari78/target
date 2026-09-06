'use client';

import { motion } from 'framer-motion';
import {
  Award,
  BarChart3,
  BookOpenCheck,
  Headset,
} from 'lucide-react';

type WhyItem = {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconWrapClass: string;
  iconClass: string;
};

const whyItems: WhyItem[] = [
  {
    id: 1,
    title: 'اساتید توانمند برای هر پایه و هر درس',
    description:
      'از پایه‌های ابتدایی تا آمادگی آزمون‌های تیزهوشان، با مدرس‌هایی همراه می‌شوی که هم تجربه‌ی آموزشی بالا دارند و هم با نیاز هر مقطع کاملاً آشنا هستند.',
    icon: Award,
    iconWrapClass:
      'bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 border-amber-200/70',
    iconClass: 'text-amber-600',
  },
  {
    id: 2,
    title: 'کارنامه‌ قابل اتکا و نتایج متمایز',
    description:
      'تمرکز ما روی یادگیری عمیق باعث شده دانش‌آموزها هم در آزمون‌های سمپاد عملکرد قوی‌تری داشته باشند و هم در مسیر تحصیلی مدرسه پیشرفت پایدارتری تجربه کنند.',
    icon: BarChart3,
    iconWrapClass:
      'bg-gradient-to-br from-indigo-100 via-blue-50 to-cyan-100 border-indigo-200/70',
    iconClass: 'text-indigo-600',
  },
  {
    id: 3,
    title: 'همراهی آموزشی و مشاوره دقیق',
    description:
      'برای انتخاب کلاس مناسب، متناسب با سطح فعلی و هدف تحصیلی‌ات راهنمایی می‌گیری؛ و در طول مسیر هم تیم پشتیبانی کنار تو می‌ماند تا با اطمینان جلو بروی.',
    icon: Headset,
    iconWrapClass:
      'bg-gradient-to-br from-fuchsia-100 via-pink-50 to-rose-100 border-fuchsia-200/70',
    iconClass: 'text-fuchsia-600',
  },
  {
    id: 4,
    title: 'دوره‌های متنوع بر اساس نیاز واقعی دانش‌آموز',
    description:
      'فرقی نمی‌کند در شروع مسیر باشی یا نزدیک آزمون؛ دوره‌ها طوری طراحی شده‌اند که برای هر سطح و هر هدف، انتخاب مناسب و کاربردی در دسترس داشته باشی.',
    icon: BookOpenCheck,
    iconWrapClass:
      'bg-gradient-to-br from-emerald-100 via-teal-50 to-green-100 border-emerald-200/70',
    iconClass: 'text-emerald-600',
  },
];

export default function WhyTargetSection() {
  return (
    <section
      id="why-target"
      dir="rtl"
      aria-labelledby="why-target-heading"
      className="py-10 md:py-14"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl md:rounded-3xl border border-slate-200/80 bg-white/80 p-4 md:p-8 shadow-lg backdrop-blur-sm"
        >
          <div className="mb-5 md:mb-8 text-center">
            <h3
              id="why-target-heading"
              style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
              className="text-[1.55rem] leading-tight md:text-4xl"
            >
              <span className="bg-linear-to-l from-indigo-600 via-fuchsia-500 to-amber-400 bg-clip-text text-transparent">
                چرا تارگت؟
              </span>
            </h3>
          </div>

          {/* Mobile: 1 col | Desktop: 2 cols (unchanged) */}
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-5">
            {whyItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.06,
                  }}
                  className="rounded-xl md:rounded-2xl border border-slate-200 bg-white p-2 md:p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start gap-2 md:gap-3">
                    <div
                      className={`inline-flex h-7 w-7 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-lg md:rounded-xl border ${item.iconWrapClass}`}
                    >
                      <Icon className={`h-3.5 w-3.5 md:h-5 md:w-5 ${item.iconClass}`} />
                    </div>

                    <div className="min-w-0">
                      <h4
                        style={{ fontFamily: 'Samim, sans-serif' }}
                        className="text-[0.95rem] font-extrabold leading-5 md:text-[1.3rem] md:leading-8 text-slate-900"
                      >
                        {item.title}
                      </h4>

                      <p
                        style={{ fontFamily: 'Samim, sans-serif' }}
                        className="mt-0.5 md:mt-2 text-[0.7rem] leading-4.5 md:text-[0.98rem] md:leading-8 text-slate-600 line-clamp-2 md:line-clamp-none"
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
