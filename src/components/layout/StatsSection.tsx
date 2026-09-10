'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, BookOpen, GraduationCap, RotateCcw, Users } from 'lucide-react';

type StatItem = {
  id: 'acceptance' | 'students' | 'courses';
  label: string;
  target: number;
  prefix?: string;
  icon: React.ComponentType<{ className?: string }>;
};

const FALLBACK_STATS: StatItem[] = [
  { id: 'acceptance', label: 'قبولی‌های تیزهوشان', target: 90, prefix: '+', icon: GraduationCap },
  { id: 'students', label: 'تارگتی‌ها', target: 700, prefix: '+', icon: Users },
  { id: 'courses', label: 'تعداد دوره‌ها', target: 5, prefix: '+', icon: BookOpen },
];

async function getStatsData(signal?: AbortSignal): Promise<StatItem[]> {
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, 650);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });

  // throw new Error('دریافت آمار با خطا مواجه شد.');
  return FALLBACK_STATS;
}

function toPersianDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}

function useCountUp(target: number, duration = 1200, start = false) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;

    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.round(target * eased));

      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
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

function Counter({ target, prefix = '', start }: { target: number; prefix?: string; start: boolean }) {
  const value = useCountUp(target, 1200, start);
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
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (!loading && !error && stats.length > 0) {
      const t = setTimeout(() => setStartCount(true), 130);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => setStartCount(false), 0);
    return () => clearTimeout(t);
  }, [loading, error, stats.length]);

  const skeletons = useMemo(() => Array.from({ length: 3 }), []);

  return (
    <section
      id="stats"
      dir="rtl"
      aria-labelledby="stats-heading"
      className="relative z-10 mt-4 py-4 md:mt-6 md:py-8"
    >
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="mb-4 md:mb-6"
        >
          <h2 id="stats-heading" className="flex flex-col items-start gap-1 text-right">
            <span
              style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
              className="inline-flex items-center gap-2 text-xl leading-tight text-slate-900 sm:text-2xl md:text-4xl"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-amber-300 shadow-sm md:h-10 md:w-10">
                <GraduationCap className="h-4 w-4 md:h-5 md:w-5" />
              </span>
              آمار آکادمی تارگت
            </span>

            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 sm:text-xs md:text-sm">
              رشد واقعی با آموزش اصولی و مسیر هدفمند
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
            </span>
          </h2>

          <span className="mt-2 block h-1 w-full rounded-full bg-linear-to-l from-slate-900 via-amber-500 sm:w-36 md:w-52" />
        </motion.header>

        {error && (
          <div className="rounded-2xl border border-red-200/90 bg-red-50/90 p-4 text-center shadow-sm">
            <div className="mb-1.5 flex items-center justify-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm font-bold md:text-base">خطا در دریافت آمار</p>
            </div>
            <p className="text-xs text-red-600 md:text-sm">{error}</p>

            <button
              type="button"
              onClick={loadStats}
              className="mx-auto mt-3 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700 md:text-sm"
            >
              <RotateCcw className="h-4 w-4" />
              تلاش مجدد
            </button>
          </div>
        )}

        {loading && !error && (
          <ul
            role="list"
            aria-label="آمار آکادمی (در حال بارگذاری)"
            className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3"
          >
            {skeletons.map((_, i) => (
              <li
                key={i}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
                  <div className="h-4 w-28 animate-pulse rounded-lg bg-slate-100" />
                </div>
                <div className="h-8 w-24 animate-pulse rounded-xl bg-slate-100" />
              </li>
            ))}
          </ul>
        )}

        {!loading && !error && (
          <ul role="list" aria-label="آمار آکادمی" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
            {stats.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 14, scale: 0.985 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.38, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="group"
                >
                  <article
                    className="
                      relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl
                      border border-slate-200/90 bg-white/90 p-4 text-right shadow-sm
                      transition-all duration-300
                      hover:-translate-y-0.5 hover:border-slate-300/95 hover:shadow-md
                    "
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_45%_at_100%_0%,rgba(250,204,21,0.10),transparent_60%)]"
                    />

                    <div className="relative w-full flex items-center justify-center z-2 min-w-0">
                      <p className="text-xs font-semibold me-auto text-slate-600 sm:text-sm">{item.label}</p>
                      <p className="mt-1 text-2xl me-5 font-extrabold text-slate-900 sm:text-3xl" aria-live="polite">
                        <Counter target={item.target} prefix={item.prefix} start={startCount} />
                      </p>
                    </div>

                    <span className="relative z-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-amber-300 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </span>
                  </article>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
