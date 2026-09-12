'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function TestPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('در حال پردازش پرداخت تستی...');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const authority = searchParams.get('authority');
    const statusParam = searchParams.get('status');

    // Simulate a brief delay for test payment
    const timer = setTimeout(() => {
      if (statusParam === 'success' && authority) {
        // Extract orderId from authority if possible (TEST_<timestamp>_<random>)
        const match = authority.match(/TEST_\d+_/);
        setStatus('success');
        setMessage('پرداخت تستی با موفقیت انجام شد (حالت توسعه)');
        // Try to get orderId from the authority or use a default
        setOrderId(authority.replace('TEST_', '').split('_')[0] || 'test-order');
      } else {
        setStatus('failed');
        setMessage('پرداخت تستی لغو یا ناموفق بود');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100"
          >
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">درگاه پرداخت تستی</h2>
          <p className="text-slate-600">{message}</p>
          <p className="text-xs text-slate-400 mt-4">این صفحه فقط در حالت توسعه (بدون تنظیمات زرین‌پال) نمایش داده می‌شود</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center"
      >
        {status === 'success' ? (
          <>
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
            >
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">پرداخت تستی موفق</h2>
            <p className="text-slate-600 mb-2">{message}</p>
            {orderId && (
              <p className="text-sm text-slate-500 mb-6 font-mono bg-slate-100 px-3 py-2 rounded-xl">
                شناسه سفارش: {orderId}
              </p>
            )}
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl mb-6">
              ⚠️ این یک تراکنش تستی است. هیچ پرداختی واقعی انجام نشده است.
            </p>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100"
            >
              <AlertCircle className="h-10 w-10 text-red-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">پرداخت ناموفق</h2>
            <p className="text-slate-600 mb-6">{message}</p>
          </>
        )}

        <div className="flex gap-3">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            بازگشت به صفحه اصلی
          </Link>
          <button
            onClick={() => router.back()}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            برگشت
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function TestPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">درگاه پرداخت تستی</h2>
          <p className="text-slate-600">در حال بارگذاری...</p>
        </div>
      </div>
    }>
      <TestPaymentContent />
    </Suspense>
  );
}