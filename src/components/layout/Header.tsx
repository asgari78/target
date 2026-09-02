'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Info, Menu, Phone, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const navItems = [
  {
    href: '#about',
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
    if (!isMobileMenuOpen) {
      return;
    }

    const body = document.body;
    const html = document.documentElement;

    const previousBodyOverflow = body.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;
    const previousHtmlOverflow = html.style.overflow;

    const calculatedScrollbarWidth = Math.max(
      0,
      window.innerWidth - html.clientWidth
    );

    const currentBodyPaddingRight =
      Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;

    setScrollbarWidth(calculatedScrollbarWidth);

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    if (calculatedScrollbarWidth > 0) {
      body.style.paddingRight = `${
        currentBodyPaddingRight + calculatedScrollbarWidth
      }px`;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
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
      if (event.matches) {
        setIsMobileMenuOpen(false);
      }
    };

    mediaQuery.addEventListener('change', handleViewportChange);

    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange);
    };
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const mobileMenu = (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div
            key="mobile-menu-overlay"
            className="fixed inset-0 z-20 bg-slate-950/40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          <motion.aside
            key="mobile-menu-panel"
            id="mobile-navigation"
            className="fixed inset-y-0 right-0 z-20 h-screen h-dvh w-full max-w-sm overflow-hidden border-l border-slate-200 bg-white shadow-2xl md:hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 340,
              mass: 0.8,
            }}
            role="dialog"
            aria-modal="true"
            aria-label="منوی موبایل"
          >
            <div className="flex h-full min-h-0 flex-col pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4">
                <Link
                  href="/"
                  className="flex min-w-0 items-center gap-3 text-slate-900"
                  onClick={closeMobileMenu}
                  aria-label="صفحه اصلی تارگت"
                >
                  <span className="flex flex-col items-center leading-none">
                    <span
                      className="text-[1.3rem] font-normal tracking-normal text-slate-950"
                      style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
                    >
                      تارگت
                    </span>

                    <span className="mt-1 text-[0.58rem] font-medium uppercase tracking-[0.24em] text-slate-500">
                      target academy
                    </span>
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
                  aria-label="بستن منو"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <nav
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4"
                aria-label="منوی موبایل"
              >
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-base font-medium text-slate-800 transition-colors hover:bg-slate-100"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                        <Info className="h-4 w-4" aria-hidden="true" />
                      </span>

                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>

                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4">
                  <a
                    href="tel:+982537741234"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 text-base font-medium text-emerald-800"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Phone className="h-5 w-5" aria-hidden="true" />
                    </span>

                    <span dir="ltr">۰۲۵-۳۷۷۴۱۲۳۴</span>
                  </a>
                </div>
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
  className="fixed inset-x-0 top-0 z-20 box-border w-full bg-white pt-[env(safe-area-inset-top)] shadow-[0_8px_24px_rgba(15,23,42,0.22)]"
  style={{
    paddingRight: isMobileMenuOpen ? scrollbarWidth : 0,
  }}
>

        <nav
          className="mx-auto box-border flex h-16 w-full max-w-[1200px] items-center px-4 sm:px-5"
          aria-label="منوی اصلی"
        >
          <div className="flex min-w-0 flex-1 items-center justify-between">
            <Link
              href="/"
              className="flex min-w-0 shrink-0 items-center gap-3 text-slate-900"
              aria-label="صفحه اصلی تارگت"
            >
              <span className="flex flex-col items-center leading-none">
                <span
                  id="logoTxt"
                  className="mb-0.5 text-[1.4rem] font-normal tracking-normal text-slate-950 md:text-[1.45rem]"
                >
                  تارگت
                </span>

                <span className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.4em] text-slate-500">
                  target
                </span>

                <span className="-mt-0 text-[0.5rem] font-medium uppercase tracking-[0.3em] text-slate-500">
                  academy
                </span>
              </span>
            </Link>

            <div className="ms-auto me-5 hidden items-center gap-3 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
                >
                  <Info className="h-4 w-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="hidden shrink-0 items-center gap-3 md:flex">
              <a
                href="tel:+982537741234"
                className="inline-flex items-center gap-3 rounded-full bg-emerald-50 px-4 py-1 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200 transition-colors hover:bg-emerald-100"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                </span>

                <span dir="ltr">۰۲۵-۳۷۷۴۱۲۳۴</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition-colors hover:bg-slate-800 md:hidden"
              aria-label="باز کردن منو"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </nav>
      </header>

      {/* فضای لازم برای جلوگیری از قرار گرفتن محتوای صفحه زیر هدر ثابت */}
      <div
        className="h-[calc(4rem+env(safe-area-inset-top))]"
        aria-hidden="true"
      />

      {isMounted ? createPortal(mobileMenu, document.body) : null}
    </>
  );
}
