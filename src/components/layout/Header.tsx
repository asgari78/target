'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Info, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/src/lib/utils';

const navItems = [{ href: '#about', label: 'درباره ما' }];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
<header
  className={cn(
    'fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 bg-white',
    isScrolled
      ? 'backdrop-blur-2xl bg-white/60 shadow-[0_8px_30px_rgba(15,23,42,0.08)]'
      : 'bg-white'
  )}
>  
<nav className="mx-auto w-full max-w-300" aria-label="منوی اصلی">
    <div className="flex items-center justify-between px-4 py-2 sm:px-5 sm:py- ...
 transition-all duration-300">
          <Link
            href="/"
            className="flex items-center gap-3 text-slate-900"
            aria-label="صفحه اصلی تارگت"
          >
            <span className="flex flex-col items-center leading-none">
              <span
              id='logoTxt'
                className={cn(`text-[1.3rem] md:text-[1.45rem] font-normal tracking-normal mb-0.5 `,
                  `text-slate-950`
                )}
              >
                تارگت
              </span>
              <span className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.7em] text-slate-500">
                target
              </span>
              <span className="-mt-0.75 text-[0.5rem] font-medium uppercase tracking-[0.6em] text-slate-500">
                academy
              </span>
            </span>
          </Link>

          <div className="hidden md:flex ms-auto me-5 md:items-center md:gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium  transition-colors hover:bg-white/60 bg-white/30`,
                `text-slate-900`
                )}
              >
                <Info className="h-4 w-4 text-slate-900" />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex md:items-center md:gap-3">
            <a
              href="tel:+982537741234"
              className="inline-flex items-center gap-3 rounded-full bg-emerald-50 px-4 py-1 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200/80 transition-colors hover:bg-emerald-100"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600/10">
                <Phone className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>۰۲۵-۳۷۷۴۱۲۳۴</span>
            </a>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 p-3 text-white transition-colors hover:bg-slate-800 md:hidden"
            aria-label="باز کردن منو"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px] md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: '100%', opacity: 0.95 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-sm border-l border-slate-200/70 bg-white/92 backdrop-blur-xl md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="منوی موبایل"
          >
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center justify-between px-4">
                <Link
                  href="/"
                  className="flex items-center gap-3 text-slate-900"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex flex-col leading-none">
                    <span
                      className="text-[1.3rem] font-normal tracking-normal text-slate-950"
                      style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
                    >
                      تارگت
                    </span>
                    <span className="-mt-0.5 text-[0.58rem] font-medium uppercase tracking-[0.24em] text-slate-500">
                      target academy
                    </span>
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900/5 p-2.5 text-slate-700 transition-colors hover:bg-slate-900/10"
                  aria-label="بستن منو"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="منوی موبایل">
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-4 text-base font-medium text-slate-800 transition-colors hover:bg-slate-100"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/10 text-slate-600">
                        <Info className="h-4 w-4" aria-hidden="true" />
                      </span>
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-emerald-200/70 bg-emerald-50/80 px-4 py-4">
                  <a
                    href="tel:+982537741234"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-base font-medium text-emerald-800"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700">
                      <Phone className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>۰۲۵-۳۷۷۴۱۲۳۴</span>
                  </a>
                </div>
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </header>
  );
}
