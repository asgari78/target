'use client';

import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Globe, GraduationCap, Send, MessageSquare, Link2, ChevronRight } from 'lucide-react';

const instituteInfo = {
  name: 'موسسه آموزشی تارگت',
  tagline: 'مرجع آموزش ریاضیات در قم',
  address: 'قم، خیابان امام، بلوار زینبیه، آموزشگاه تارگت',
  phone: '۰۲۵-۳۷۷۴۱۲۳۴',
  mobile: '۰۹۱۲-۳۴۵۶۷۸۹',
  email: 'info@target-academy.ir',
  hours: 'شنبه تا چهارشنبه: ۸ صبح تا ۱۰ شب\nپنج‌شنبه: ۸ صبح تا ۴ عصر\nجمعه: تعطیل',
  coordinates: { lat: 34.6416, lng: 50.8746 },
};

const quickLinks = [
  { href: '/', label: 'صفحه اصلی' },
  { href: '#about', label: 'درباره ما' },
  { href: '#courses', label: 'دوره‌های آموزشی' },
  { href: '#contact', label: 'تماس با ما' },
  { href: '/faq', label: 'سوالات متداول' },
  { href: '/rules', label: 'قوانین و مقررات' },
];

const coursesList = [
  { href: '#course-tizhoshan-6', label: 'دوره جامع تیزهوشان ششم' },
  { href: '#course-tizhoshan-advanced', label: 'ریاضی پیشرفته تیزهوشان' },
  { href: '#course-math-6', label: 'ریاضی جامع ششم' },
  { href: '#course-math-5', label: 'ریاضی جامع پنجم' },
  { href: '#course-math-4', label: 'ریاضی جامع چهارم' },
];

const socialLinks = [
  { href: 'https://telegram.me/targetacademy', icon: MessageSquare, label: 'تلگرام', ariaLabel: 'کانال تلگرام موسسه تارگت' },
  { href: 'https://instagram.com/targetacademy', icon: GraduationCap, label: 'اینستاگرام', ariaLabel: 'صفحه اینستاگرام موسسه تارگت' },
  { href: 'https://twitter.com/targetacademy', icon: Send, label: 'توییتر', ariaLabel: 'صفحه توییتر موسسه تارگت' },
  { href: 'https://linkedin.com/company/targetacademy', icon: Link2, label: 'لینکدین', ariaLabel: 'صفحه لینکدین موسسه تارگت' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="relative bg-navy-950 text-navy-100" role="contentinfo">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-navy-900/50 via-navy-950 to-navy-950" aria-hidden="true" />
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-8 w-8 text-gold-400" aria-hidden="true" />
              <span className="text-xl font-bold text-white">موسسه تارگت</span>
            </div>
            <p className="text-navy-300 text-sm leading-relaxed mb-6">
              {instituteInfo.tagline} با سابقه درخشان در تدریس ریاضیات پایه‌های چهارم تا ششم، تدریس حضوری در قم و آنلاین در سراسر ایران.
            </p>
            <div className="space-y-3 text-sm text-navy-300">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold-400 shrink-0 mt-0.5" aria-hidden="true" />
                <address className="not-italic leading-relaxed">{instituteInfo.address}</address>
              </div>
              <a
                href={`tel:${instituteInfo.phone}`}
                className="flex items-center gap-3 hover:text-gold-400 transition-colors"
              >
                <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{instituteInfo.phone}</span>
              </a>
              <a
                href={`tel:${instituteInfo.mobile}`}
                className="flex items-center gap-3 hover:text-gold-400 transition-colors"
              >
                <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{instituteInfo.mobile}</span>
              </a>
              <a
                href={`mailto:${instituteInfo.email}`}
                className="flex items-center gap-3 hover:text-gold-400 transition-colors"
              >
                <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{instituteInfo.email}</span>
              </a>
            </div>

            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.ariaLabel}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-800/50 text-navy-300 hover:bg-gold-500/20 hover:text-gold-400 transition-all"
                >
                  <social.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <h3 className="text-lg font-bold text-white mb-4">لینک‌های سریع</h3>
            <nav aria-label="لینک‌های سریع">
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="flex items-center gap-2 text-sm text-navy-300 hover:text-gold-400 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <h3 className="text-lg font-bold text-white mb-4">دوره‌های آموزشی</h3>
            <nav aria-label="دوره‌های آموزشی">
              <ul className="space-y-3">
                {coursesList.map((course) => (
                  <li key={course.href}>
                    <a
                      href={course.href}
                      className="flex items-center gap-2 text-sm text-navy-300 hover:text-gold-400 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {course.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <h3 className="text-lg font-bold text-white mb-4">اطلاعات تماس و مکان</h3>
            <div className="space-y-4">
              <div className="rounded-xl bg-navy-900/50 p-4 border border-navy-800">
                <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gold-400" aria-hidden="true" />
                  ساعات کاری
                </h4>
                <pre className="text-sm text-navy-300 whitespace-pre-wrap leading-relaxed">{instituteInfo.hours}</pre>
              </div>

              <div className="rounded-xl bg-navy-900/50 p-4 border border-navy-800">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gold-400" aria-hidden="true" />
                  مکان در نقشه
                </h4>
                <div className="relative h-40 rounded-lg overflow-hidden border border-navy-800">
                  <iframe
                    title="موقعیت موسسه تارگت در نقشه"
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3398.123!2d${instituteInfo.coordinates.lng}!3d${instituteInfo.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM4JzI5LjciTiA1MMKwNTInMjkuNiJF!5e0!3m2!1sfa!2sir!4v1234567890`}
                    style={{ border: 0 }}
                    className="h-full w-full"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    aria-label="موقعیت موسسه تارگت در قم"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-navy-800"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-navy-400 text-center md:text-right">
              © {currentYear} موسسه آموزشی تارگت. کلیه حقوق محفوظ است.
            </p>
            <div className="flex items-center gap-4 text-sm text-navy-400">
              <a href="/privacy" className="hover:text-gold-400 transition-colors">حریم خصوصی</a>
              <span className="text-navy-700">|</span>
              <a href="/terms" className="hover:text-gold-400 transition-colors">قوانین استفاده</a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}