'use client';

import { motion } from 'framer-motion';
import {
  Clock3,
  Compass,
  Headset,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from 'lucide-react';

const instituteInfo = {
  name: 'موسسه آموزشی تیزهوشان تارگت',
  tagline: 'مرکز تخصصی آمادگی آزمون‌های تیزهوشان و ریاضیات',
  description:
    'موسسه آموزشی تارگت با تمرکز بر آموزش مفهومی، تحلیلی و تکنیک‌های تست‌زنی، مسیر قبولی دانش‌آموزان در مدارس سمپاد و نمونه‌دولتی را هدفمند، منظم و تضمین‌شده پیش می‌برد.',
  address: 'قم، خیابان امام، بلوار زینبیه، آموزشگاه تارگت',
  phone: '۰۲۵-۳۷۷۴۱۲۳۴',
  email: 'info@target-academy.ir',
};

const supportInfo = {
  mobile1Fa: '۰۹۹۱۵۵۴۵۱۵۸',
  mobile1En: '+989915545158',
  mobile2Fa: '۰۹۳۳۱۳۷۴۲۱۰',
  mobile2En: '+989331374210',
  scheduleWeek: 'شنبه تا چهارشنبه: ساعت ۱۰ الی ۲۰',
  scheduleWeekend: 'پنج‌شنبه و جمعه: ساعت ۱۲ الی ۱۸',
};

const siteLogoSrc =
  'https://gutcdmaqciskdrecukkj.supabase.co/storage/v1/object/sign/logo/logo-removebg.png?token=eyJraWQiOiI3MzNlMGYxMS0wNGYyLTQwZjEtYWQzYi1hZTlkYmM0NTdhOWMiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJsb2dvL2xvZ28tcmVtb3ZlYmcucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4ODg3MTQ3MiwiZXhwIjoxODIwNDA3NDcyfQ.08vjZt1Z8e9uAWO_3H1qH5cX1Srkx7CQifEQw00RzWvuhHT6CPSQmy4DxldmoEuywtWF_GwSC2ZXgHhRqKj6DA';

const socialLinks = [
  {
    label: 'اینستاگرام',
    id: '@hamed.shahbazi',
    href: 'https://instagram.com/hamed.shahbazi',
    ariaLabel: 'صفحه اینستاگرام تارگت',
    brand: 'instagram' as const,
  },
  {
    label: 'کانال ایتا',
    id: '@Target_Academyy',
    href: 'https://eitaa.com/Target_Academyy',
    ariaLabel: 'کانال ایتا تارگت',
    brand: 'eitaa' as const,
  },
  {
    label: 'کانال بله',
    id: '@sampadiisho',
    href: 'https://ble.ir/sampadiisho',
    ariaLabel: 'کانال بله تارگت',
    brand: 'bale' as const,
  },
];

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.93 1.35a1.17 1.17 0 1 1 0 2.34 1.17 1.17 0 0 1 0-2.34ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8Z" />
    </svg>
  );
}

function EitaaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm4.82 7.02-1.64 7.73c-.12.55-.45.69-.91.43l-2.52-1.86-1.22 1.17c-.14.14-.25.25-.51.25l.18-2.58 4.7-4.24c.2-.18-.05-.28-.31-.1l-5.81 3.66-2.5-.78c-.54-.17-.55-.54.12-.8l9.78-3.77c.46-.17.86.11.64.89Z" />
    </svg>
  );
}

function BaleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 2c5.5 0 10 3.94 10 8.8 0 4.85-4.5 8.79-10 8.79-.88 0-1.74-.1-2.55-.3L5 22l1.17-3.45C3.62 17.05 2 14.08 2 10.8 2 5.94 6.5 2 12 2Zm-3.6 6.05a1.2 1.2 0 1 0 0 2.4h7.2a1.2 1.2 0 1 0 0-2.4H8.4Zm0 3.75a1.2 1.2 0 1 0 0 2.4h4.6a1.2 1.2 0 1 0 0-2.4H8.4Z" />
    </svg>
  );
}

function SocialIcon({ brand }: { brand: 'instagram' | 'eitaa' | 'bale' }) {
  if (brand === 'instagram') return <InstagramIcon />;
  if (brand === 'eitaa') return <EitaaIcon />;
  return <BaleIcon />;
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" dir="rtl" className="relative z-10 py-8 md:py-12" role="contentinfo">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
        {/* کانتینر اصلی فوتر با استایل Glassmorphic هماهنگ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/75 p-4 md:p-6 lg:p-8 shadow-sm backdrop-blur-[4px]"
        >
          {/* افکت نوری پس‌زمینه کلی */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(90%_50%_at_100%_0%,rgba(250,204,21,0.12),transparent_70%),radial-gradient(85%_50%_at_0%_100%,rgba(139,92,246,0.08),transparent_70%)]"
          />

          {/* گرید بخش‌های سه‌گانه */}
          <div className="relative z-10 grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
            
            {/* کارت ۱: معرفی و شبکه‌های ارتباطی */}
            <section className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 p-4 sm:p-5 shadow-xs backdrop-blur-[2px] transition-all duration-300 hover:border-slate-300/95 hover:shadow-md hover:shadow-slate-300/25">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(70%_40%_at_100%_0%,rgba(250,204,21,0.10),transparent_60%)]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[1px] z-0 rounded-[15px] border border-white/70"
              />

              <div className="relative z-10">
                {/* لوگو و عنوان */}
                <div className="flex items-center gap-3">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50 p-1 shadow-2xs">
                    {siteLogoSrc ? (
                      <img
                        src={siteLogoSrc}
                        alt="لوگوی آکادمی تیزهوشان تارگت"
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <Sparkles className="h-6 w-6 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <h3
                      style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
                      className="text-lg leading-tight text-slate-900 sm:text-xl"
                    >
                      {instituteInfo.name}
                    </h3>
                    <p className="mt-0.5 text-[11px] font-semibold text-amber-700">
                      {instituteInfo.tagline}
                    </p>
                  </div>
                </div>

                <p className="mt-3.5 text-xs leading-6 text-slate-600 sm:text-[13px]">
                  {instituteInfo.description}
                </p>
              </div>

              {/* دکمه‌های شبکه‌های اجتماعی */}
              <div className="relative z-10 mt-4 border-t border-slate-100 pt-3.5">
                <span className="mb-2 block text-[11px] font-bold text-slate-700">
                  شبکه‌های اجتماعی و کانال‌های اطلاع‌رسانی:
                </span>
                <div className="flex flex-col gap-2">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.ariaLabel}
                      className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2 text-xs text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-white hover:text-slate-950 hover:shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 transition-colors group-hover:text-amber-600">
                          <SocialIcon brand={social.brand} />
                        </span>
                        <span className="font-medium">{social.label}</span>
                      </div>
                      <span dir="ltr" className="text-[11px] font-medium text-slate-600 group-hover:text-slate-700">
                        {social.id}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </section>

            {/* کارت ۲: اطلاعات تماس و ساعات کاری */}
            <section className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 p-4 sm:p-5 shadow-xs backdrop-blur-[2px] transition-all duration-300 hover:border-slate-300/95 hover:shadow-md hover:shadow-slate-300/25">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(70%_40%_at_0%_0%,rgba(139,92,246,0.08),transparent_60%)]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[1px] z-0 rounded-[15px] border border-white/70"
              />

              <div className="relative z-10">
                {/* هدر بخش تماس */}
                <div className="mb-3.5 flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-amber-300 shadow-2xs">
                    <Headset className="h-4 w-4" />
                  </span>
                  <h4
                    style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
                    className="text-base text-slate-900 sm:text-lg"
                  >
                    ارتباط و مشاوره تحصیلی
                  </h4>
                </div>

                {/* آدرس، تلفن ثابت و ایمیل */}
                <div className="space-y-2.5 text-xs text-slate-600 sm:text-[13px]">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <address className="not-italic leading-5">{instituteInfo.address}</address>
                  </div>

                  <a
                    href="tel:02537741234"
                    className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:text-slate-900"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-slate-500" />
                    <span>تلفن ثابت آموزشگاه: {instituteInfo.phone}</span>
                  </a>

                  <a
                    href={`mailto:${instituteInfo.email}`}
                    className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:text-slate-900"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-slate-500" />
                    <span dir="ltr">{instituteInfo.email}</span>
                  </a>
                </div>

                {/* باکس شماره‌های همراه پشتیبانی */}
                <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                  <span className="mb-2 block text-[11px] font-bold text-slate-800">
                    خطوط مستقیم ثبت‌نام و مشاوره:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${supportInfo.mobile1En}`}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-bold text-slate-800 transition hover:border-amber-400 hover:text-amber-800"
                    >
                      <Phone className="h-3 w-3 text-amber-500" />
                      <span dir="ltr">{supportInfo.mobile1Fa}</span>
                    </a>
                    <a
                      href={`tel:${supportInfo.mobile2En}`}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-bold text-slate-800 transition hover:border-amber-400 hover:text-amber-800"
                    >
                      <Phone className="h-3 w-3 text-amber-500" />
                      <span dir="ltr">{supportInfo.mobile2Fa}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* ساعات کاری */}
              <div className="relative z-10 mt-3.5 space-y-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                <p className="flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5 text-amber-500" />
                  {supportInfo.scheduleWeek}
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5 text-amber-500" />
                  {supportInfo.scheduleWeekend}
                </p>
              </div>
            </section>

            {/* کارت ۳: موقعیت مکانی و نقشه */}
            <section className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 p-4 sm:p-5 shadow-xs backdrop-blur-[2px] transition-all duration-300 hover:border-slate-300/95 hover:shadow-md hover:shadow-slate-300/25">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[1px] z-0 rounded-[15px] border border-white/70"
              />

              <div className="relative z-10">
                {/* هدر نقشه */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-amber-300 shadow-2xs">
                      <Compass className="h-4 w-4" />
                    </span>
                    <h4
                      style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
                      className="text-base text-slate-900 sm:text-lg"
                    >
                      موقعیت مکانی آموزشگاه
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    <MapPin className="h-2.5 w-2.5 text-amber-500" />
                    قم
                  </span>
                </div>

                <p className="text-xs leading-5 text-slate-600">
                  برای مراجعه حضوری و ثبت‌نام در کلاس‌ها، موقعیت دقیق موسسه را روی نقشه دنبال کنید:
                </p>
              </div>

              {/* iframe نقشه با حاشیه گرد و شیک */}
              <div className="relative z-10 mt-3 aspect-16/10 w-full overflow-hidden rounded-xl border border-slate-200/90 bg-slate-100 shadow-2xs sm:aspect-video lg:aspect-auto lg:h-44">
                <iframe
                  title="موقعیت موسسه تارگت در نقشه"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d410.23448374979097!2d50.87615426580014!3d34.65783765924841!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f93bb006fee5357%3A0x5e64f7683b09ec49!2z2YXYtNin2YjYsdmHINmF2KfZhNuMINix2YjYtNmG2YHaqdix2KfZhg!5e0!3m2!1sfa!2s!4v1788453455896!5m2!1sfa!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="h-full w-full grayscale-[0.2] contrast-[1.05] transition-all duration-300 hover:grayscale-0"
                />
              </div>

              <div className="relative z-10 mt-3 pt-2 text-center text-[10px] text-slate-400">
                امکان مسیریابی با نشان و بلد در دسترس است
              </div>
            </section>
          </div>

          {/* نوار پایانی کپی‌رایت */}
          <div className="relative z-10 mt-6 border-t border-slate-200/80 pt-4 text-center">
            <p className="text-[11px] font-medium text-slate-500 sm:text-xs">
              © {currentYear} تمامی حقوق مادی و معنوی برای{' '}
              <span className="font-bold text-slate-700">آکادمی تیزهوشان تارگت</span> محفوظ است.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
