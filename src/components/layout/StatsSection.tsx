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
  color: string;
  bgColor: string;
};

const FALLBACK_STATS: StatItem[] = [
  { id: 'acceptance', label: 'قبولی‌های تیزهوشان', target: 90, prefix: '+', icon: GraduationCap, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  { id: 'students', label: 'تارگتی‌ها', target: 700, prefix: '+', icon: Users, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  { id: 'courses', label: 'تعداد دوره‌ها', target: 5, prefix: '+', icon: BookOpen, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
];

async function getStatsData(signal?: AbortSignal): Promise<StatItem[]> {
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, 650);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });

  return FALLBACK_STATS;
}

function toPersianDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)] || d);
}

interface DonutChartProps {
  stat: StatItem;
  progress: number; // 0 to 1
  start: boolean;
  index: number;
}

function DonutChart({ stat, progress, start, index }: DonutChartProps) {
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const Icon = stat.icon;

  return (
    <div className="relative flex flex-col items-center gap-4" role="img" aria-label={`${stat.label}: ${toPersianDigits(Math.round(stat.target * progress))}${stat.prefix || ''}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 {size} {size}" className="transform -rotate-90" style={{ width: size, height: size }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={stat.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{
              strokeDashoffset: start ? strokeDashoffset : circumference,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
            }}
            initial={false}
            animate={{ strokeDashoffset: start ? strokeDashoffset : circumference }}
            transition={{ duration: 1.2, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.8 + index * 0.15 }}
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 fa-nums"
            aria-live="polite"
          >
            {stat.prefix || ''}{toPersianDigits(Math.round(stat.target * progress))}
          </motion.span>
          <span className="text-[10px] font-semibold text-slate-500 mt-1">{stat.label}</span>
        </div>

        {/* Icon badge */}
        <div
          className="absolute -bottom-3 -right-3"
          style={{ width: '40px', height: '40px' }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 1 + index * 0.15 }}
            className="absolute inset-0 flex items-center justify-center rounded-full shadow-lg"
            style={{ backgroundColor: stat.bgColor }}
          >
            <span style={{ color: stat.color, display: 'block' }}>
              <Icon className="h-5 w-5" />
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function StatSkeleton({ index }: { index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 14, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.38, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <article className="relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 p-4 text-center shadow-sm">
        <div className="relative w-[120px] h-[120px]">
          <div className="absolute inset-0 animate-pulse bg-slate-100 rounded-full" />
        </div>
        <div className="h-4 w-28 animate-pulse rounded-lg bg-slate-100" />
      </article>
    </motion.li>
  );
}

export default function StatsSection() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startAnimation, setStartAnimation] = useState(false);

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
    const timer = setTimeout(() => {
      loadStats();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadStats]);

  useEffect(() => {
    if (!loading && !error && stats.length > 0) {
      const t = setTimeout(() => setStartAnimation(true), 130);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => setStartAnimation(false), 0);
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
              <StatSkeleton key={i} index={i} />
            ))}
          </ul>
        )}

        {!loading && !error && (
          <ul
            role="list"
            aria-label="آمار آکادمی"
            className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3 justify-items-center"
          >
            {stats.map((item, index) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: 14, scale: 0.985 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.38, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <DonutChart
                  stat={item}
                  progress={startAnimation ? 1 : 0}
                  start={startAnimation}
                  index={index}
                />
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}