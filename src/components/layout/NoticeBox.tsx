'use client';

import { useState } from 'react';
import { X, Megaphone, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface NoticeBoxProps {
  message?: string;
  shortMessage?: string;
  highlight?: string;
  className?: string;
}

export default function NoticeBox({
  message = 'توجه: تمامی دوره‌های حضوری موسسه تارگت منحصراً در',
  shortMessage = 'دوره‌های حضوری فقط در',
  highlight = 'قـم',
  className = '',
}: NoticeBoxProps) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="status"
          aria-live="polite"
          dir="rtl"
          initial={{ opacity: 0, y: -80, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -80, scale: 0.96, transition: { duration: 0.22, ease: 'easeIn' } }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className={`fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 ${className}`}
        >
          <div className="mx-auto max-w-2xl rounded-2xl bg-white/85 shadow-lg shadow-slate-900/10 backdrop-blur-md">
            <div className="flex items-center gap-3 py-1.5 px-3.5 md:px-3.5 md:py-2.5 sm:items-center sm:gap-4 sm:px-5 sm:py-4">
              {/* آیکن */}
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 ring-1 ring-amber-200">
                <Megaphone className="h-5 w-5" aria-hidden="true" />
              </span>

              {/* متن — ساختار ریسپانسیو */}
              <p className="min-w-0 flex-1 items-center text-sm leading-6 text-slate-700 sm:text-base">
                <span className="hidden sm:flex items-center">
                  {message}{' '}
                  <strong className="mx-2 inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 font-bold text-amber-800 ring-1 ring-amber-200">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {highlight}
                  </strong>{' '}
                  برگزار می‌شوند.
                </span>
                <span className="sm:hidden">
                  {shortMessage}{' '}
                  <strong className="font-bold text-amber-700">{highlight}</strong>{' '}
                  برگزار می‌شود.
                </span>
              </p>

              {/* دکمه بستن */}
              <button
                type="button"
                onClick={() => setIsVisible(false)}
                aria-label="بستن اطلاعیه"
                className="-m-1 shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
