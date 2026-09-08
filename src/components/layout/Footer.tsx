'use client';

import { motion } from 'framer-motion';
import { Clock3, Headset, Mail, MapPin, Phone } from 'lucide-react';

const instituteInfo = {
  name: 'موسسه آموزشی تارگت',
  tagline: 'مرجع آموزش ریاضیات در قم',
  description:
    'موسسه آموزشی تارگت با تمرکز بر آموزش مفهومی ریاضی، مسیر یادگیری دانش‌آموزان را هدفمند، منظم و نتیجه‌محور پیش می‌برد.',
  address: 'قم، خیابان امام، بلوار زینبیه، آموزشگاه تارگت',
  phone: '۰۲۵-۳۷۷۴۱۲۳۴',
  email: 'info@target-academy.ir',
};

const supportInfo = {
  mobile1Fa: '۰۹۹۱۵۵۴۵۱۵۸',
  mobile1En: '+989915545158',
  mobile2Fa: '09331374210',
  mobile2En: '+989331374210',
  scheduleWeek:
    'شنبه تا چهارشنبه: ساعت ۱۰ الی ۲۰',
  scheduleWeekend:
    'پنج‌شنبه و جمعه: ساعت ۱۲ الی ۱۸',
};

const siteLogoSrc = 'https://gutcdmaqciskdrecukkj.supabase.co/storage/v1/object/sign/logo/logo-removebg.png?token=eyJraWQiOiI3MzNlMGYxMS0wNGYyLTQwZjEtYWQzYi1hZTlkYmM0NTdhOWMiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJsb2dvL2xvZ28tcmVtb3ZlYmcucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4ODg3MTQ3MiwiZXhwIjoxODIwNDA3NDcyfQ.08vjZt1Z8e9uAWO_3H1qH5cX1Srkx7CQifEQw00RzWvuhHT6CPSQmy4DxldmoEuywtWF_GwSC2ZXgHhRqKj6DA';

const socialLinks = [
  {
    label: 'اینستاگرام',
    id: '@hamed.shahbazi',
    href: 'https://instagram.com/hamed.shahbazi',
    ariaLabel: 'صفحه اینستاگرام تارگت',
    brand: 'instagram' as const,
  },
  {
    label: 'ایتا',
    id: '@Target_Academyy',
    href: 'https://eitaa.com/Target_Academyy',
    ariaLabel: 'کانال ایتا تارگت',
    brand: 'eitaa' as const,
  },
  {
    label: 'بله',
    id: '@sampadiisho',
    href: 'https://ble.ir/sampadiisho',
    ariaLabel: 'کانال بله تارگت',
    brand: 'bale' as const,
  },
];

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.93 1.35a1.17 1.17 0 1 1 0 2.34 1.17 1.17 0 0 1 0-2.34ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8Z" />
    </svg>
  );
}

function EitaaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm4.82 7.02-1.64 7.73c-.12.55-.45.69-.91.43l-2.52-1.86-1.22 1.17c-.14.14-.25.25-.51.25l.18-2.58 4.7-4.24c.2-.18-.05-.28-.31-.1l-5.81 3.66-2.5-.78c-.54-.17-.55-.54.12-.8l9.78-3.77c.46-.17.86.11.64.89Z" />
    </svg>
  );
}

function BaleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
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
    <footer id="contact" dir="rtl" className="relative py-12 md:py-16" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl md:rounded-3xl border border-white/60 bg-white/80 p-4 md:p-8 shadow-xl backdrop-blur-md"
        >
          <div className="grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-3">
            
            {/* معرفی + لوگو + شبکه‌ها */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">

              {/* لوگو مربعی */}
              <div className="w-full flex justify-center pb-5">
                  <div className="relative h-24 w-24 overflow-hidden">
                    {siteLogoSrc ? (
                      <img
                        src={siteLogoSrc}
                      alt="لوگوی موسسه تارگت"
                      className="h-full w-full object-cover"
                      loading="lazy"
                      />
                    ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-[10px] font-bold text-slate-500">
                      LOGO
                    </div>
                    )}
                  </div>
              </div>

              <h3
                className="text-[1.35rem] md:text-2xl text-center leading-tight"
                style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
              >
                <span className="bg-linear-to-l from-indigo-600 via-fuchsia-500 to-amber-400 bg-clip-text text-transparent">
                  {instituteInfo.name}
                </span>
              </h3>

              <p className="mt-2 text-sm text-center md:text-[0.95rem] leading-7 text-slate-600">
                {instituteInfo.tagline}
              </p>
              <p className="mt-1 text-sm text-center md:text-[0.95rem] leading-7 text-slate-600">
                {instituteInfo.description}
              </p>

              {/* شبکه‌های اجتماعی */}
              <div className="mt-5">
                <div className="flex flex-wrap flex-col items-center gap-2.5">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.ariaLabel}
                      className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                      <span className="text-slate-600 transition-colors group-hover:text-indigo-700">
                        <SocialIcon brand={social.brand} />
                      </span>
                      <span>{social.label}</span>
                      <span className="text-xs text-slate-500">{social.id}</span>
                    </a>
                  ))}
                </div>
              </div>
            </section>

            {/* اطلاعات تماس */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
              <h4
                className="text-[1.2rem] md:text-xl leading-tight"
                style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
              >
                <span className="bg-gradient-to-l from-indigo-600 via-fuchsia-500 to-amber-400 bg-clip-text text-transparent">
                  اطلاعات تماس
                </span>
              </h4>

              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-indigo-600" />
                  <address className="not-italic leading-7">{instituteInfo.address}</address>
                </div>

                <a
                  href="tel:02537741234"
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <Phone className="h-4.5 w-4.5 shrink-0 text-indigo-600" />
                  <span>{instituteInfo.phone}</span>
                </a>

                <a
                  href={`mailto:${instituteInfo.email}`}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <Mail className="h-4.5 w-4.5 shrink-0 text-indigo-600" />
                  <span>{instituteInfo.email}</span>
                </a>
              </div>

              <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5">
                <div className="mb-2 flex items-center gap-2 text-indigo-700">
                  <Headset className="h-4.5 w-4.5" />
                  <p className="text-sm font-extrabold">تماس با پشتیبانی</p>
                </div>

                <div className="space-y-2 text-sm">
                  <a
                    href={`tel:${supportInfo.mobile1En}`}
                    className="flex items-center gap-2 rounded-md bg-white px-2.5 py-2 text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    <Phone className="h-4 w-4 text-indigo-600" />
                    <span dir="ltr">{supportInfo.mobile1Fa}</span>
                  </a>

                  <a
                    href={`tel:${supportInfo.mobile2En}`}
                    className="flex items-center gap-2 rounded-md bg-white px-2.5 py-2 text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    <Phone className="h-4 w-4 text-indigo-600" />
                    <span dir="ltr">{supportInfo.mobile2Fa}</span>
                  </a>
                </div>

                <div className="mt-3 space-y-1.5 text-xs md:text-sm text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4 text-amber-500" />
                    {supportInfo.scheduleWeek}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4 text-amber-500" />
                    {supportInfo.scheduleWeekend}
                  </p>
                </div>
              </div>
            </section>

            {/* نقشه */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
              <h4
                className="text-[1.2rem] md:text-xl leading-tight"
                style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
              >
                <span className="bg-linear-to-l from-indigo-600 via-fuchsia-500 to-amber-400 bg-clip-text text-transparent">
                  مکان در نقشه
                </span>
              </h4>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                برای حضور در کلاس‌ها، می‌توانید موقعیت دقیق موسسه را روی نقشه مشاهده کنید.
              </p>

              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <iframe
                  title="موقعیت موسسه تارگت در نقشه"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d410.23448374979097!2d50.87615426580014!3d34.65783765924841!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f93bb006fee5357%3A0x5e64f7683b09ec49!2z2YXYtNin2YjYsdmHINmF2KfZhNuMINix2YjYtNmG2YHaqdix2KfZhg!5e0!3m2!1sfa!2s!4v1788453455896!5m2!1sfa!2s"
                  width="600"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="h-56 w-full md:h-72"
                />
              </div>
            </section>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="mt-6 border-t border-slate-200 pt-4"
          >
            <p className="text-center text-xs md:text-sm text-slate-500">
              © {currentYear} موسسه آموزشی تارگت — کلیه حقوق محفوظ است.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
