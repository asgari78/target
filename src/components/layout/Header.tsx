'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  GraduationCap,
  Info,
  PhoneCall,
  Sparkles,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const LOGO_SRC =
  'https://gutcdmaqciskdrecukkj.supabase.co/storage/v1/object/sign/logo/logo-removebg.png?token=eyJraWQiOiI3MzNlMGYxMS0wNGYyLTQwZjEtYWQzYi1hZTlkYmM0NTdhOWMiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJsb2dvL2xvZ28tcmVtb3ZlYmcucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4ODg3MTQwMiwiZXhwIjoxODIwNDA3NDAyfQ.EchVhKDxJ0fqlOM7tpF7t-THUcUDUb0alGi9DEAzjab0OosLQSKxu3LjNkstHsUE_60wcITc_SRtAWVDJB-ZaQ';

const navItems = [
  {
    href: '#about',
    label: 'اساتید برتر',
  },
  {
    href: '#contact',
    label: 'درباره ما',
  },
];

export default function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const body = document.body;
    const html = document.documentElement;

    const previousBodyOverflow = body.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;
    const previousHtmlOverflow = html.style.overflow;

    const calculatedScrollbarWidth = Math.max(0, window.innerWidth - html.clientWidth);
    const currentBodyPaddingRight =
      Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;

    const timeoutId = setTimeout(() => {
      setScrollbarWidth(calculatedScrollbarWidth);
    }, 0);

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    if (calculatedScrollbarWidth > 0) {
      body.style.paddingRight = `${currentBodyPaddingRight + calculatedScrollbarWidth}px`;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('keydown', handleKeyDown);
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.paddingRight = previousBodyPaddingRight;
      setScrollbarWidth(0);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) setIsMobileMenuOpen(false);
    };

    mediaQuery.addEventListener('change', handleViewportChange);
    return () => mediaQuery.removeEventListener('change', handleViewportChange);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const mobileMenu = (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            key="mobile-menu-overlay"
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          {/* Drawer Menu */}
          <motion.aside
            key="mobile-menu-panel"
            id="mobile-navigation"
            className="fixed inset-y-0 right-0 z-50 h-dvh w-[84%] max-w-xs overflow-hidden border-l border-amber-100 bg-white/95 shadow-2xl backdrop-blur-xl md:hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 280,
            }}
            role="dialog"
            aria-modal="true"
            aria-label="منوی دسترسی موبایل"
          >
            <div className="flex h-full min-h-0 flex-col pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
              {/* Drawer Top */}
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-amber-300/40 bg-amber-50/40 p-1 shadow-xs">
                    <img
                      src={LOGO_SRC}
                      alt="لوگوی تارگت"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="text-right">
                    <span
                      style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
                      className="block text-base leading-tight text-slate-900"
                    >
                      موسسه آموزشی تارگت
                    </span>
                    <span className="text-[10px] font-bold text-amber-700">
                      مرکز تخصصی تیزهوشان
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100/80 text-slate-600 transition-colors hover:bg-slate-200"
                  aria-label="بستن منو"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-4" aria-label="منوی موبایل">
                <div className="space-y-1.5">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + index * 0.05, duration: 0.2 }}
                    >
                      <Link
                        href={item.href}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-amber-50/80 hover:text-amber-900"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100/60 text-amber-800 shadow-xs">
                          {index === 0 ? (
                            <GraduationCap className="h-4 w-4" />
                          ) : (
                            <Info className="h-4 w-4" />
                          )}
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Call Box in Drawer */}
                <motion.div
                  className="mt-6 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 to-teal-50/70 p-3.5 shadow-xs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16, duration: 0.25 }}
                >
                  <span className="mb-1 block text-[11px] font-bold text-emerald-800">
                    مشاوره مستقیم و ثبت‌نام:
                  </span>
                  <a
                    href="tel:+982537741234"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs font-bold text-emerald-900 shadow-xs ring-1 ring-emerald-100"
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-xs">
                        <PhoneCall className="h-3.5 w-3.5" />
                      </span>
                      <span>تماس تلفنی</span>
                    </span>
                    <span dir="ltr" className="tracking-wide">۰۲۵-۳۷۷۴۱۲۳۴</span>
                  </a>
                </motion.div>
              </nav>

              {/* Drawer Footer */}
              <div className="border-t border-slate-100 p-3 text-center text-[10px] font-medium text-slate-400">
                همراه برتر دانش‌آموزان در مسیر تیزهوشان
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-30 w-full border-b border-slate-200/80 bg-white/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] pt-[env(safe-area-inset-top)] backdrop-blur-xl transition-all"
        style={{ paddingRight: isMobileMenuOpen ? scrollbarWidth : 0 }}
      >
        <nav
          className="mx-auto flex h-14 sm:h-16 w-full max-w-6xl items-center justify-between px-3 sm:px-6"
          aria-label="منوی اصلی تارگت"
        >
          {/* سمت راست: لوگو + نام موسسه در دسکتاپ */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group flex items-center gap-2.5 transition-transform active:scale-95"
              aria-label="صفحه اصلی موسسه تارگت"
            >
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 shrink-0 overflow-hidden rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-50/60 to-white p-1 shadow-xs transition-shadow group-hover:shadow-md">
                <img
                  src={LOGO_SRC}
                  alt="لوگوی تارگت آکادمی"
                  className="h-full w-full object-contain"
                />
              </div>

              {/* عنوان موسسه در دسکتاپ (مخفی در موبایل برای حفظ سنتر بودن عنوان اصلی) */}
              <div className="hidden flex-col sm:flex text-right">
                <div className="flex items-center gap-1.5">
                  <span
                    style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
                    className="text-lg sm:text-xl font-normal leading-none tracking-tight text-slate-900"
                  >
                    موسسه آموزشی تارگت
                  </span>
                  <span className="flex h-4 items-center rounded-md bg-amber-100 px-1.5 text-[10px] font-black text-amber-800">
                    قم
                  </span>
                </div>
                <span className="mt-0.5 text-[10px] font-bold text-slate-500">
                  مرکز تخصصی تیزهوشان و خلاقیت
                </span>
              </div>
            </Link>
          </div>

          {/* ================= مرکز هدر: نام سنترال موسسه مخصوص نسخه موبایل ================= */}
          <div className="pointer-events-none absolute inset-x-0 flex flex-col items-center justify-center text-center sm:hidden">
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
              <h1
                style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
                className="text-base xs:text-lg font-normal leading-tight tracking-tight bg-gradient-to-r from-slate-950 via-slate-900 to-amber-700 bg-clip-text text-transparent"
              >
                موسسه آموزشی تارگت
              </h1>
            </div>
            <span className="text-[9px] font-black tracking-wide text-amber-700/90 -mt-0.5">
              آکادمی تیزهوشان
            </span>
          </div>

          {/* سمت چپ در دسکتاپ: آیتم‌های منو + دکمه تماس */}
          <div className="hidden items-center gap-6 sm:flex">
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3.5 py-2 text-xs md:text-sm font-bold text-slate-700 transition-all hover:bg-amber-50 hover:text-amber-900"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* دکمه شماره تماس با انیمیشن پالس فعال */}
            <a
              href="tel:+982537741234"
              className="group relative inline-flex items-center gap-2.5 rounded-full border border-emerald-200/90 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-xs transition-all hover:border-emerald-300 hover:shadow-md hover:brightness-102"
              aria-label="تماس با موسسه تارگت"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs transition-transform group-hover:rotate-12">
                <PhoneCall className="h-3 w-3" />
              </span>
              <span dir="ltr" className="tracking-wide">۰۲۵-۳۷۷۴۱۲۳۴</span>
            </a>
          </div>

          {/* دکمه باز کردن منو در موبایل */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/70 text-slate-800 transition-colors active:bg-slate-200"
              aria-label="باز کردن منو"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <span className="relative flex h-4 w-4 flex-col items-center justify-between">
                <motion.span
                  animate={isMobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-0.5 w-4 rounded-full bg-slate-800 origin-center"
                />
                <motion.span
                  animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="h-0.5 w-4 rounded-full bg-slate-800"
                />
                <motion.span
                  animate={isMobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-0.5 w-4 rounded-full bg-slate-800 origin-center"
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Spacer جهت هماهنگی با ارتفاع هدر (h-14 موبایل / h-16 دسکتاپ) */}
      <div className="h-14 sm:h-16" aria-hidden="true" />

      {isMounted ? createPortal(mobileMenu, document.body) : null}
    </>
  );
}
