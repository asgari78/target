'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, BookOpen, RotateCcw, AlertTriangle } from 'lucide-react';

type StatItem = {
  id: 'acceptance' | 'students' | 'courses';
  label: string;
  target: number;
  prefix?: string;
  icon: React.ComponentType<{ className?: string }>;
};

const FALLBACK_STATS: StatItem[] = [
  {
    id: 'acceptance',
    label: 'قبولی‌های تیزهوشان',
    target: 25,
    prefix: '+',
    icon: GraduationCap,
  },
  {
    id: 'students',
    label: 'تارگتی‌ها',
    target: 700,
    prefix: '+',
    icon: Users,
  },
  {
    id: 'courses',
    label: 'تعداد دوره‌ها',
    target: 5,
    prefix: '+',
    icon: BookOpen,
  },
];

/**
 * اگر بعداً API واقعی داشتی، فقط این تابع را با fetch واقعی جایگزین کن.
 * فعلاً با تأخیر کوتاه شبیه‌سازی شده تا loading/error/retry ساختار داشته باشد.
 */
async function getStatsData(signal?: AbortSignal): Promise<StatItem[]> {
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, 700);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });

  // اگر خواستی تست خطا کنی، موقتاً این خط را uncomment کن:
  // throw new Error('دریافت آمار با خطا مواجه شد.');

  return FALLBACK_STATS;
}

function toPersianDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}

function useCountUp(target: number, duration = 1300, start = false) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;

    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);

      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(target * eased);
      setCount(next);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
    };
  }, [target, duration, start]);

  return count;
}

type CounterProps = {
  target: number;
  prefix?: string;
  start: boolean;
};

function Counter({ target, prefix = '', start }: CounterProps) {
  const value = useCountUp(target, 1300, start);
  return <>{`${prefix}${toPersianDigits(value)}`}</>;
}

export default function StatsSection() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startCount, setStartCount] = useState(false);

  const loadStats = useCallback(async () => {
    const controller = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const data = await getStatsData(controller.signal);
      setStats(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'خطای نامشخص در دریافت آمار');
      setStats([]);
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStats();
  }, [loadStats]);

  // شروع کانتر بعد از پایان loading و نبود error
  useEffect(() => {
    if (!loading && !error && stats.length > 0) {
      const t = setTimeout(() => setStartCount(true), 150);
      return () => clearTimeout(t);
    }
    // Use timeout to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => setStartCount(false), 0);
    return () => clearTimeout(timeoutId);
  }, [loading, error, stats.length]);

  const skeletons = useMemo(() => Array.from({ length: 3 }), []);

  return (
    <section
      id="stats"
      dir="rtl"
      aria-labelledby="stats-heading"
      className="relative z-10 py-12 md:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg backdrop-blur-sm md:p-8"
        >
          {/* شعار */}
          <h3
            id="stats-heading"
            style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
            className="text-center text-3xl leading-tight text-slate-800 md:text-5xl"
          >
            <span className="bg-linear-to-l from-indigo-600 via-fuchsia-500 to-amber-400 bg-clip-text text-transparent">
              تارگت
            </span>{' '}
            <span className="text-slate-800">تا قله با تو</span>
          </h3>

          <p className="mt-3 text-center text-sm font-semibold text-slate-600 md:text-base">
            رشد واقعی با تلاش مستمر، آموزش اصولی و مسیر هدفمند
          </p>

          <span className="mx-auto mt-5 block h-1.5 w-44 rounded-full bg-linear-to-l from-indigo-600 via-fuchsia-500 to-amber-400 md:w-72" />

          {/* Error State */}
          {error && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
              <div className="mb-2 flex items-center justify-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <p className="font-bold">خطا در دریافت آمار</p>
              </div>
              <p className="text-sm text-red-600">{error}</p>

              <button
                type="button"
                onClick={loadStats}
                className="mx-auto mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700"
              >
                <RotateCcw className="h-4 w-4" />
                تلاش مجدد
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && !error && (
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {skeletons.map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm"
                >
                  <div className="mx-auto mb-3 h-12 w-12 animate-pulse rounded-xl bg-slate-100" />
                  <div className="mx-auto h-9 w-20 animate-pulse rounded-xl bg-slate-100" />
                  <div className="mx-auto mt-2 h-5 w-28 animate-pulse rounded-xl bg-slate-100" />
                </div>
              ))}
            </div>
          )}

          {/* Success State */}
          {!loading && !error && (
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {stats.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: index * 0.08 }}
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm"
                  >
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                      <Icon className="h-6 w-6 text-indigo-700" />
                    </div>

                    <p className="text-3xl font-extrabold text-indigo-700 md:text-4xl" aria-live="polite">
                      <Counter target={item.target} prefix={item.prefix} start={startCount} />
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700 md:text-base">
                      {item.label}
                    </p>
                  </motion.article>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
