'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

type Testimonial = {
  id: number;
  name: string;
  text: string;
  rating: 1 | 2 | 3 | 4 | 5;
  dateFa: string;
  image: string; // intentionally empty, you will fill with your own URL
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'آرمین رضایی',
    text: 'من برای تیزهوشان مشکل اصلی‌م مدیریت زمان بود. مخصوصاً تو دفترچه دوم همیشه کم می‌آوردم. کلاس‌های استاد شهبازی کمکم کرد اول سوال‌ها رو تیپ‌بندی کنم، بعد با زمان‌بندی برم جلو. تو آزمون آخرم دیگه سفید نذاشتم.',
    rating: 5,
    dateFa: '۱۴ مهر ۱۴۰۴',
    image: '',
  },
  {
    id: 2,
    name: 'یسنا محمدی',
    text: 'من پایه چهارم تو ضرب و تقسیم‌های چندرقمی خیلی کند بودم و تو مسئله‌های کلامی قاطی می‌کردم. استاد محمدجواد عسگری با روش مرحله‌ای و تمرین کوتاه روزانه کاری کرد الان خودم اول راه‌حل رو می‌چینم بعد حل می‌کنم.',
    rating: 5,
    dateFa: '۲۶ آبان ۱۴۰۴',
    image: '',
  },
  {
    id: 3,
    name: 'علی‌رضا امینی',
    text: 'ریاضی هفتم برام از فصل جبر به بعد سخت شد، مخصوصاً ساده‌سازی عبارت‌ها و علامت منفی‌ها. استاد محسنی‌فر دقیقاً روی همین نقطه‌ضعفم کار کرد. الان اشتباه علامت خیلی کمتر دارم و نمره‌م از ۱۳ رسید به ۱۸.',
    rating: 4,
    dateFa: '۹ دی ۱۴۰۴',
    image: '',
  },
  {
    id: 4,
    name: 'نگار سادات حسینی',
    text: 'قبل ثبت‌نام نمی‌دونستم کدوم کلاس به دردم می‌خوره و فقط نمی‌خواستم وقتم هدر بره. مشاوره خیلی شفاف بود و گفتن دقیقاً از کجا باید شروع کنم. پشتیبانی هم خوب بود، هر وقت تکلیف‌هامو دیر می‌فرستادم پیگیری می‌کردن.',
    rating: 4,
    dateFa: '۲۱ بهمن ۱۴۰۴',
    image: '',
  },
  {
    id: 5,
    name: 'محمدطاها کریمی',
    text: 'جمع‌بندی‌های آخر دوره استاد شهبازی واقعاً به دردم خورد. من تو سوال‌های هوش تصویری الگوها رو دیر تشخیص می‌دادم. با تمرین‌هایی که داد سرعت چشمم بهتر شد و تو آزمون اصلی خیلی کمتر گیر کردم.',
    rating: 5,
    dateFa: '۱۷ فروردین ۱۴۰۵',
    image: '',
  },
  {
    id: 6,
    name: 'فاطمه زارعی',
    text: 'مشکل من این بود که فرمول رو حفظ می‌کردم ولی تو سوال جدید نمی‌تونستم استفاده کنم. تو کلاس استاد عسگری بیشتر روی فهمیدنِ چرا و چطور کار شد نه فقط جواب آخر. همین باعث شد تو امتحان مدرسه سوالات ترکیبی رو هم حل کنم.',
    rating: 5,
    dateFa: '۳۰ اردیبهشت ۱۴۰۵',
    image: '',
  },
  {
    id: 7,
    name: 'پارسا هاشمی',
    text: 'هشتم که شروع شد از توان و رادیکال ضربه خوردم، بعدش هم معادله‌ها روی هم جمع شد. کلاس استاد محسنی‌فر چون هر جلسه مرور کوتاه داشت، نذاشت مطالب قبلی از ذهنم بره. الان دیگه از ریاضی فرار نمی‌کنم.',
    rating: 4,
    dateFa: '۱۲ تیر ۱۴۰۵',
    image: '',
  },
  {
    id: 8,
    name: 'رها اکبری',
    text: 'من بیشتر از خود درس، مشکل بی‌برنامگی داشتم. یه هفته خیلی می‌خوندم یه هفته هیچی. چیزی که تو تارگت برام خوب بود این بود که مسیر مطالعه‌م ریز شد و قابل انجام شد. کم‌کم هم نمره‌هام بهتر شد هم استرسم کمتر.',
    rating: 5,
    dateFa: '۱۸ مرداد ۱۴۰۵',
    image: '',
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
            className={`h-4 w-4 ${filled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
          />
        );
      })}
    </div>
  );
}

export default function TestimonialsSection() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  return (
    <section
      id="testimonials"
      dir="rtl"
      aria-labelledby="testimonials-heading"
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
              id="testimonials-heading"
              style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
              className="text-[1.55rem] leading-tight md:text-4xl"
            >
              <span className="bg-linear-to-l from-indigo-600 via-fuchsia-500 to-amber-400 bg-clip-text text-transparent">
                نظرات دانش‌آموزان تارگت
              </span>
            </h3>

            <p
              style={{ fontFamily: 'Samim, sans-serif' }}
              className="mx-auto mt-2 max-w-3xl text-sm md:text-base leading-7 text-slate-600"
            >
              تجربه واقعی دانش‌آموزان از دوره‌ها، اساتید و کیفیت آموزشی مؤسسه تارگت
            </p>
          </div>

          {/* Horizontal scroller */}
          <div
            ref={scrollerRef}
            className="
              flex gap-3 md:gap-4 overflow-x-auto pb-2 md:pb-3
              snap-x snap-mandatory
              scrollbar-gutter:stable
              md:scrollbar-width:auto scrollbar-width:none
            "
            style={{
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {testimonials.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="
                  snap-start shrink-0
                  w-[86%] xs:w-[78%] sm:w-[60%] md:w-95
                  rounded-xl md:rounded-2xl border border-slate-200 bg-white
                  p-3 md:p-4 shadow-sm
                "
              >
                <div className="mb-3 flex items-center gap-2.5">
        <div className="h-11 w-11 md:h-12 md:w-12 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-500">
              پروفایل
            </div>
          )}
        </div>

                  <div className="min-w-0">
                    <p
                      style={{ fontFamily: 'Samim, sans-serif' }}
                      className="truncate text-sm md:text-base font-extrabold text-slate-900"
                    >
                      {item.name}
                    </p>
                    <p
                      style={{ fontFamily: 'Samim, sans-serif' }}
                      className="text-xs md:text-sm text-slate-500"
                    >
                      {item.dateFa}
                    </p>
                  </div>
                </div>

                <div className="mb-2">
                  <RatingStars rating={item.rating} />
                </div>

                <p
                  style={{ fontFamily: 'Samim, sans-serif' }}
                  className="text-[0.82rem] md:text-[0.95rem] leading-7 text-slate-700"
                >
                  {item.text}
                </p>
              </motion.article>
            ))}
          </div>

          {/* Desktop scrollbar hint */}
          <p
            style={{ fontFamily: 'Samim, sans-serif' }}
            className="mt-3 hidden md:block text-xs text-slate-500"
          >
            برای مشاهده همه نظرات، از اسکرول افقی پایین استفاده کنید.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
