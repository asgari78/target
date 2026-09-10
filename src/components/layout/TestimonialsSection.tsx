'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageSquareQuote,
  Quote,
  Sparkles,
  Star,
  User,
} from 'lucide-react';

type Testimonial = {
  id: number;
  name: string;
  gradeBadge?: string;
  text: string;
  rating: 1 | 2 | 3 | 4 | 5;
  dateFa: string;
  image?: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'آرمین رضایی',
    gradeBadge: 'پایه ششم - قبولی سمپاد',
    text: 'من برای تیزهوشان مشکل اصلی‌م مدیریت زمان بود. مخصوصاً تو دفترچه دوم همیشه کم می‌آوردم. کلاس‌های استاد شهبازی کمکم کرد اول سوال‌ها رو تیپ‌بندی کنم، بعد با زمان‌بندی برم جلو. تو آزمون آخرم دیگه سفید نذاشتم.',
    rating: 5,
    dateFa: '۱۴ مهر ۱۴۰۴',
  },
  {
    id: 2,
    name: 'یسنا محمدی',
    gradeBadge: 'پایه چهارم ابتدایی',
    text: 'من پایه چهارم تو ضرب و تقسیم‌های چندرقمی خیلی کند بودم و تو مسئله‌های کلامی قاطی می‌کردم. استاد محمدجواد عسگری با روش مرحله‌ای و تمرین کوتاه روزانه کاری کرد الان خودم اول راه‌حل رو می‌چینم بعد حل می‌کنم.',
    rating: 5,
    dateFa: '۲۶ آبان ۱۴۰۴',
  },
  {
    id: 3,
    name: 'علی‌رضا امینی',
    gradeBadge: 'پایه هفتم',
    text: 'ریاضی هفتم برام از فصل جبر به بعد سخت شد، مخصوصاً ساده‌سازی عبارت‌ها و علامت منفی‌ها. استاد محسنی‌فر دقیقاً روی همین نقطه‌ضعفم کار کرد. الان اشتباه علامت خیلی کمتر دارم و نمره‌م از ۱۳ رسید به ۱۸.',
    rating: 4,
    dateFa: '۹ دی ۱۴۰۴',
  },
  {
    id: 4,
    name: 'نگار سادات حسینی',
    gradeBadge: 'مشاوره و برنامه‌ریزی',
    text: 'قبل ثبت‌نام نمی‌دونستم کدوم کلاس به دردم می‌خوره و فقط نمی‌خواستم وقتم هدر بره. مشاوره خیلی شفاف بود و گفتن دقیقاً از کجا باید شروع کنم. پشتیبانی هم خوب بود، هر وقت تکلیف‌هامو دیر می‌فرستادم پیگیری می‌کردن.',
    rating: 4,
    dateFa: '۲۱ بهمن ۱۴۰۴',
  },
  {
    id: 5,
    name: 'محمدطاها کریمی',
    gradeBadge: 'هوش و استعداد تحلیلی',
    text: 'جمع‌بندی‌های آخر دوره استاد شهبازی واقعاً به دردم خورد. من تو سوال‌های هوش تصویری الگوها رو دیر تشخیص می‌دادم. با تمرین‌هایی که داد سرعت چشمم بهتر شد و تو آزمون اصلی خیلی کمتر گیر کردم.',
    rating: 5,
    dateFa: '۱۷ فروردین ۱۴۰۵',
  },
  {
    id: 6,
    name: 'فاطمه زارعی',
    gradeBadge: 'پایه پنجم ابتدایی',
    text: 'مشکل من این بود که فرمول رو حفظ می‌کردم ولی تو سوال جدید نمی‌تونستم استفاده کنم. تو کلاس استاد عسگری بیشتر روی فهمیدنِ چرا و چطور کار شد نه فقط جواب آخر. همین باعث شد تو امتحان مدرسه سوالات ترکیبی رو هم حل کنم.',
    rating: 5,
    dateFa: '۳۰ اردیبهشت ۱۴۰۵',
  },
  {
    id: 7,
    name: 'پارسا هاشمی',
    gradeBadge: 'پایه هشتم',
    text: 'هشتم که شروع شد از توان و رادیکال ضربه خوردم، بعدش هم معادله‌ها روی هم جمع شد. کلاس استاد محسنی‌فر چون هر جلسه مرور کوتاه داشت، نذاشت مطالب قبلی از ذهنم بره. الان دیگه از ریاضی فرار نمی‌کنم.',
    rating: 4,
    dateFa: '۱۲ تیر ۱۴۰۵',
  },
  {
    id: 8,
    name: 'رها اکبری',
    gradeBadge: 'پایه ششم تیزهوشان',
    text: 'من بیشتر از خود درس، مشکل بی‌برنامگی داشتم. یه هفته خیلی می‌خوندم یه هفته هیچی. چیزی که تو تارگت برام خوب بود این بود که مسیر مطالعه‌م ریز شد و قابل انجام شد. کم‌کم هم نمره‌هام بهتر شد هم استرسم کمتر.',
    rating: 5,
    dateFa: '۱۸ مرداد ۱۴۰۵',
  },
];

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`امتیاز ${rating} از ۵`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < rating;
        return (
          <Star
            key={i}
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
              filled ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
            }`}
          />
        );
      })}
    </div>
  );
}

export default function TestimonialsSection() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollerRef.current) return;
    const offset = direction === 'left' ? -340 : 340;
    scrollerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <section
      id="testimonials"
      dir="rtl"
      aria-labelledby="testimonials-heading"
      className="relative z-10 mt-4 py-4 md:mt-6 md:py-8"
    >
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
        {/* Header - هماهنگ با الگوی CourseList */}
        <div className="mb-4 flex items-end justify-between md:mb-6">
          <motion.header
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="flex-1"
          >
            <h2 id="testimonials-heading" className="flex flex-col items-start gap-1 text-right">
              <span
                style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
                className="inline-flex items-center gap-2 text-xl leading-tight text-slate-900 sm:text-2xl md:text-4xl"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-amber-300 shadow-sm md:h-10 md:w-10">
                  <MessageSquareQuote className="h-4 w-4 md:h-5 md:w-5" />
                </span>
                نظرات و تجربیات دانش‌آموزان تارگت
              </span>

              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 sm:text-xs md:text-sm">
                روایت واقعی دانش‌آموزان و اولیا از کیفیت آموزش و پیشرفت در دوره‌ها
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
              </span>
            </h2>

            <span className="mt-2 block h-1 w-full rounded-full bg-gradient-to-l from-slate-900 via-amber-500 sm:w-36 md:w-52" />
          </motion.header>

          {/* Controls for desktop navigation */}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scroll('right')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-700 shadow-xs backdrop-blur-sm transition-all hover:bg-slate-900 hover:text-white active:scale-95"
              aria-label="نظر قبلی"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('left')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-700 shadow-xs backdrop-blur-sm transition-all hover:bg-slate-900 hover:text-white active:scale-95"
              aria-label="نظر بعدی"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Testimonials Horizontal Carousel */}
        <div
          ref={scrollerRef}
          role="region"
          aria-label="لیست نظرات دانش‌آموزان"
          className="
            -mx-3 flex gap-3 overflow-x-auto px-3 pb-3 pt-1
            sm:-mx-4 sm:px-4 sm:gap-4
            snap-x snap-mandatory
            scrollbar-none
          "
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
          }}
        >
          {testimonials.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16, scale: 0.985 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.42,
                delay: index * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                group h-full shrink-0 snap-start
                w-[88%] xs:w-[80%] sm:w-[360px] lg:w-[380px]
              "
            >
              <article
                className="
                  relative flex h-full flex-col justify-between overflow-hidden rounded-2xl
                  border border-slate-200/90 bg-white/90 p-3.5 sm:p-4.5 text-right shadow-sm
                  backdrop-blur-[2px]
                  transition-all duration-300
                  hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-300/35 hover:border-slate-300/95
                "
              >
                {/* Radial gradient effect matching CourseRow */}
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

                {/* Decorative subtle quotation icon */}
                <Quote
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-3 z-[1] h-10 w-10 text-slate-900/[0.04]"
                />

                <div className="relative z-[2]">
                  {/* Top row: Avatar + Name + Rating */}
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 shadow-2xs">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <User className="h-5 w-5 text-slate-500" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3
                          style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
                          className="truncate text-base sm:text-lg leading-tight text-slate-900"
                        >
                          {item.name}
                        </h3>
                        {item.gradeBadge ? (
                          <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                            <Sparkles className="h-2.5 w-2.5 text-amber-500" />
                            {item.gradeBadge}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400">
                            {item.dateFa}
                          </span>
                        )}
                      </div>
                    </div>

                    <RatingStars rating={item.rating} />
                  </div>

                  {/* Body Text */}
                  <p className="text-xs sm:text-[13px] leading-5.5 sm:leading-6 text-slate-700">
                    «{item.text}»
                  </p>
                </div>

                {/* Card Footer: Date & Verified Label */}
                <div className="relative z-[2] mt-4 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[10px] sm:text-[11px] font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    دانش‌آموز تایید‌شده تارگت
                  </span>
                  <span className="text-slate-400">{item.dateFa}</span>
                </div>

                {/* Hover ring */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition-all duration-300 group-hover:ring-amber-300/70"
                />
              </article>
            </motion.div>
          ))}
        </div>

        {/* Mobile scroll indicator */}
        <div className="mt-2 flex items-center justify-center gap-1 sm:hidden">
          <span className="text-[10px] font-medium text-slate-400">
            برای مشاهده بیشتر، به چپ و راست بکشید
          </span>
        </div>
      </div>
    </section>
  );
}
