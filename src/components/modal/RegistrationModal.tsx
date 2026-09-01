'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CreditCard, User } from 'lucide-react';
import RegistrationForm from './RegistrationForm';
import CourseDetailsTab from './CourseDetailsTab';
import { cn } from '@/src/lib/utils';
import type { Course, PaymentMode, RegistrationType } from '@/src/types';

interface RegistrationModalProps {
  course: Course | null;
  registrationType: RegistrationType;
  onClose: () => void;
}

type Tab = 'details' | 'register';

function ModalContent({ course, registrationType, onClose }: RegistrationModalProps) {
  const [tab, setTab] = useState<Tab>('details');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        dir="rtl"
        initial={{ y: 60, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
          <h2 id="modal-title" className="text-lg font-bold text-navy-900">
            {tab === 'register' ? 'ثبت‌نام در دوره' : 'جزئیات دوره'}
          </h2>
          <button
            onClick={onClose}
            aria-label="بستن مُدال"
            className="rounded-full p-1.5 text-navy-400 transition hover:bg-navy-100 hover:text-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex gap-2 px-5 pt-3 pb-2 border-b border-navy-100">
          {[
            { key: 'details' as Tab, label: 'جزئیات دوره', icon: User },
            { key: 'register' as Tab, label: 'ثبت‌نام', icon: CreditCard },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                tab === key
                  ? 'bg-navy-600 text-white shadow-md shadow-navy-200'
                  : 'bg-navy-50 text-navy-600 hover:bg-navy-100',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === 'register' ? (
            <RegistrationForm
              course={course!}
              registrationType={registrationType}
              paymentMode={paymentMode}
              onPaymentModeChange={setPaymentMode}
              onSuccess={() => {
                onClose();
              }}
            />
          ) : (
            <CourseDetailsTab
              course={course!}
              registrationType={registrationType}
              paymentMode={paymentMode}
              onPaymentModeChange={setPaymentMode}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function RegistrationModal({
  course,
  registrationType,
  onClose,
}: RegistrationModalProps) {
  return (
    <AnimatePresence>
      {course && (
        <ModalContent
          key={course.id}
          course={course}
          registrationType={registrationType}
          onClose={onClose}
        />
      )}
    </AnimatePresence>
  );
}