// src/components/ui/Input.tsx

import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    // تولید یک ID یکتا در صورتی که ID پاس داده نشده باشد
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-slate-700">
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "flex h-12 w-full rounded-xl border bg-white px-4 py-2 text-sm text-slate-900 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-red-500 focus-visible:ring-red-500/20"
                : "border-slate-200 focus-visible:border-blue-500 focus-visible:ring-blue-500/20",
              className
            )}
            {...props}
          />
          
          {/* آیکون خطا در داخل اینپوت */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500"
              >
                <AlertCircle className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* پیام خطا با انیمیشن لرزش (Shake) */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10, x: 0 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                x: [-10, 10, -10, 10, 0], // افکت لرزش
              }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-sm font-medium text-red-500 mt-1"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';
