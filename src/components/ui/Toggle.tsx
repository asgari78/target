// src/components/ui/Toggle.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { PaymentMode } from '../../types'; // فرض بر این است که این تایپ در src/types/index.ts تعریف شده است
import { cn } from '../../lib/utils';

interface ToggleProps {
  value: PaymentMode;
  onChange: (value: PaymentMode) => void;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ value, onChange, className }) => {
  const options: { id: PaymentMode; label: string }[] = [
    { id: 'cash', label: 'پرداخت نقدی' },
    { id: 'installment', label: 'پرداخت اقساطی' },
  ];

  return (
    <div
      className={cn(
        "relative flex w-full max-w-sm rounded-2xl bg-slate-100 p-1.5 shadow-inner",
        className
      )}
      dir="rtl" // تضمین راست‌چین بودن
    >
      {options.map((option) => {
        const isSelected = value === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center rounded-xl py-3 text-sm font-bold transition-colors duration-200",
              isSelected ? "text-blue-700" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {/* انیمیشن بک‌گراند لغزان */}
            {isSelected && (
              <motion.div
                layoutId="toggle-background"
                className="absolute inset-0 -z-10 rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5"
                initial={false}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}
            <span className="relative z-20">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
