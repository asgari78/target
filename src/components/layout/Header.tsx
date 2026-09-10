'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Info, Phone, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const navItems = [
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

    // Set scrollbar width in a timeout to avoid synchronous setState in effect
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
          {/* Overlay */}
          <motion.div
            key="mobile-menu-overlay"
            className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px] sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.aside
            key="mobile-menu-panel"
            id="mobile-navigation"
            className="fixed inset-y-0 right-0 z-50 h-dvh w-[86%] max-w-sm overflow-hidden border-l border-slate-200/80 bg-white/95 shadow-[0_20px_60px_rgba(2,6,23,0.28)] backdrop-blur-xl md:hidden"
            initial={{ x: '100%', opacity: 0.7 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.7 }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 280,
              mass: 0.9,
            }}
            role="dialog"
            aria-modal="true"
            aria-label="منوی موبایل"
          >
            <div className="flex h-full min-h-0 flex-col pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
              {/* Top */}
              <div className="flex items-center justify-between px-4 pt-3">
                <div className="h-11 w-11 overflow-hidden rounded-full ring-1 ring-slate-200">
                  <img
                    src="https://gutcdmaqciskdrecukkj.supabase.co/storage/v1/object/sign/logo/logo-removebg.png?token=eyJraWQiOiI3MzNlMGYxMS0wNGYyLTQwZjEtYWQzYi1hZTlkYmM0NTdhOWMiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJsb2dvL2xvZ28tcmVtb3ZlYmcucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4ODg3MTQwMiwiZXhwIjoxODIwNDA3NDAyfQ.EchVhKDxJ0fqlOM7tpF7t-THUcUDUb0alGi9DEAzjab0OosLQSKxu3LjNkstHsUE_60wcITc_SRtAWVDJB-ZaQ"
                    alt="لوگوی تارگت آکادمی"
                    className="h-full w-full object-cover"
                  />
                </div>

                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  aria-label="بستن منو"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* Divider */}
              <div className="mx-4 mt-3 border-b border-slate-200/80" />

              {/* Nav */}
              <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-4" aria-label="منوی موبایل">
                <div className="space-y-2">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 + index * 0.04, duration: 0.25 }}
                    >
                      <Link
                        href={item.href}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium text-slate-800 transition-colors hover:bg-slate-100"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                          <Info className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="mt-5 rounded-xl border border-emerald-200/70 bg-emerald-50/80 p-3"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.3 }}
                >
                  <a
                    href="tel:+982537741234"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-sm font-medium text-emerald-800"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Phone className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span dir="ltr">۰۲۵-۳۷۷۴۱۲۳۴</span>
                  </a>
                </motion.div>
              </nav>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-30 w-full border-b border-slate-200/70 bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur-md"
        style={{ paddingRight: isMobileMenuOpen ? scrollbarWidth : 0 }}
      >
        <nav
          className="mx-auto flex h-12 sm:h-14 w-full max-w-300 items-center px-2 sm:px-5"
          aria-label="منوی اصلی"
        >
          <div className="flex min-w-0 flex-1 h-full items-center justify-between">
            {/* Logo image جایگزین متن */}
            <Link
              href="/"
              className="flex items-center h-full"
              aria-label="صفحه اصلی تارگت آکادمی"
            >
              <div className="h-12 w-12 sm:h-14 sm:w-14 overflow-hidden">
                <img
                  src="https://gutcdmaqciskdrecukkj.supabase.co/storage/v1/object/sign/logo/logo-removebg.png?token=eyJraWQiOiI3MzNlMGYxMS0wNGYyLTQwZjEtYWQzYi1hZTlkYmM0NTdhOWMiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJsb2dvL2xvZ28tcmVtb3ZlYmcucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4ODg3MTQwMiwiZXhwIjoxODIwNDA3NDAyfQ.EchVhKDxJ0fqlOM7tpF7t-THUcUDUb0alGi9DEAzjab0OosLQSKxu3LjNkstHsUE_60wcITc_SRtAWVDJB-ZaQ"
                  alt="لوگوی تارگت آکادمی"
                  className="h-full w-full object-cover"
                />
              </div>
            </Link>

            <div className="ms-auto me-4 hidden items-center gap-2 sm:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100"
                >
                  <Info className="h-4 w-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="hidden shrink-0 items-center sm:flex">
              <a
                href="tel:+982537741234"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200 transition-colors hover:bg-emerald-100"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                </span>
                <span dir="ltr">۰۲۵-۳۷۷۴۱۲۳۴</span>
              </a>
            </div>

            {/* Hamburger تمیز، بدون پس‌زمینه + انیمیشن */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="group flex h-12 w-12 items-center justify-center sm:hidden"
              aria-label="باز کردن منو"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <span className="relative h-6 w-6 gap-1 flex flex-col justify-center items-center">
                <motion.span
                  animate={isMobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="h-0.5 w-5 rounded bg-slate-800"
                />
                <motion.span
                  animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.18 }}
                  className="h-0.5 w-5 rounded bg-slate-800"
                />
                <motion.span
                  animate={isMobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="h-0.5 w-5 rounded bg-slate-800"
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Spacer با ارتفاع کمتر */}
      <div className="h-12 sm:h-14" aria-hidden="true" />

      {isMounted ? createPortal(mobileMenu, document.body) : null}
    </>
  );
}
