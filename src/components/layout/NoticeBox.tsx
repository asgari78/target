'use client';

import React, { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NoticeBox() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50, transition: { duration: 0.2 } }}
          className="relative z-40 bg-amber-50 border-b border-amber-200"
          dir="rtl"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between flex-wrap">
              <div className="w-0 flex-1 flex items-center">
                <span className="flex p-2 rounded-lg bg-amber-100">
                  <MapPin className="h-5 w-5 text-amber-600" aria-hidden="true" />
                </span>
                <p className="mr-3 font-medium text-amber-800 text-sm sm:text-base">
                  <span className="md:hidden">برگزاری دوره‌ها مختص شهر قم</span>
                  <span className="hidden md:inline">
                    توجه: تمامی دوره‌های آموزشی موسسه تارگت در حال حاضر به صورت <strong>حضوری</strong> و منحصراً در <strong>استان قم</strong> برگزار می‌شوند.
                  </span>
                </p>
              </div>
              <div className="order-2 flex-shrink-0 sm:order-3 sm:mr-3">
                <button
                  type="button"
                  onClick={() => setIsVisible(false)}
                  className="-mr-1 flex p-2 rounded-md hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                >
                  <span className="sr-only">بستن</span>
                  <X className="h-5 w-5 text-amber-600" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
