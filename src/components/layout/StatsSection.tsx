'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { animate, motion } from 'framer-motion';
import { AlertTriangle, BookOpen, GraduationCap, HandMetal, RotateCcw, Sparkles, Users } from 'lucide-react';

export type StatItem = {
  id: 'acceptance' | 'students' | 'courses';
  label: string;
  target: number;
  prefix?: string;
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: [string, string];
  bgColor: string;
};

// پالت رنگی منطبق بر هویت بصری تارگت:
// سبز زمردی (#009966) - طلایی (#E6A801) - سرمه‌ای/ایندیگو تیره (#111B2F)
const FALLBACK_STATS: StatItem[] = [
  {
    id: 'students',
    label: 'دانش‌آموزان تارگتی',
    target: 700,
    prefix: '+',
    icon: Users,
    color: '#009966',
    gradient: ['#283A5E', '#111B2F'],
    bgColor: 'rgba(0, 153, 102, 0.12)',
  },
  {
    id: 'acceptance',
    label: 'قبولی‌های تیزهوشان',
    target: 90,
    prefix: '+',
    suffix: '٪',
    icon: GraduationCap,
    color: '#E6A801',
    gradient: ['#F7BE22', '#E6A801'],
    bgColor: 'rgba(230, 168, 1, 0.14)',
  },
  {
    id: 'courses',
    label: 'دوره‌های تخصصی',
    target: 5,
    prefix: '+',
    icon: BookOpen,
    color: '#111B2F',
    gradient: ['#00B87A', '#009966'],
    bgColor: 'rgba(17, 27, 47, 0.1)',
  },
];

async function getStatsData(signal?: AbortSignal): Promise<StatItem[]> {
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, 550);
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

// کامپوننت اختصاصی برای شمارنده عددی روان با شتاب نرم
function AnimatedNumber({
  value,
  duration = 2,
  delay = 0,
}: {
  value: number;
  duration?: number;
  delay?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [value, duration, delay]);

  return <span className="fa-nums tabular-nums">{toPersianDigits(displayValue)}</span>;
}

interface MultiRingChartProps {
  stats: StatItem[];
  start: boolean;
  activeId: string | null;
  onSelectItem: (id: string | null) => void;
}

function MultiRingChart({ stats, start, activeId, onSelectItem }: MultiRingChartProps) {
  const filterId = useId();
  const size = 320;
  const center = size / 2;
  const strokeWidth = 14;
  const gap = 11;

  // محاسبه ابعاد و محیط حلقه‌ها
  const ringConfigs = useMemo(() => {
    return stats.map((stat, index) => {
      const radius = center - strokeWidth / 2 - index * (strokeWidth + gap) - 10;
      const circumference = 2 * Math.PI * radius;
      return {
        ...stat,
        radius,
        circumference,
        strokeDashoffset: circumference * (1 - 0.78),
      };
    });
  }, [stats, center, strokeWidth, gap]);

  const activeStat = stats.find((s) => s.id === activeId) || stats[0];

  return (
    <div className="relative flex flex-col items-center justify-center p-1 sm:p-2 select-none w-full">
      {/* سگمنت‌بار اپلیکیشنی در موبایل برای سوییچ فوق‌العاده سریع و واضح بین آمارها */}
      <div className="flex md:hidden w-full max-w-[310px] items-center justify-between rounded-2xl bg-[#111B2F]/5 p-1 mb-3 border border-[#111B2F]/10">
        {stats.map((item) => {
          const isSelected = activeStat.id === item.id;
          const Icon = item.icon;

          return (
            <button
              key={`pill-${item.id}`}
              type="button"
              onClick={() => onSelectItem(item.id)}
              className="relative flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all"
              style={{
                color: isSelected ? item.color : '#64748B',
              }}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeStatTabPill"
                  className="absolute inset-0 rounded-xl bg-white shadow-xs ring-1 ring-black/5"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1 truncate">
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[11px] truncate">{item.label.split(' ')[0]}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full transform -rotate-90">
          <defs>
            <filter id={`glow-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.22" />
            </filter>

            {ringConfigs.map((ring) => (
              <linearGradient
                key={ring.id}
                id={`grad-${filterId}-${ring.id}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={ring.gradient[0]} />
                <stop offset="100%" stopColor={ring.gradient[1]} />
              </linearGradient>
            ))}
          </defs>

          {/* پس‌زمینه مسیر حلقه‌ها */}
          {ringConfigs.map((ring) => (
            <circle
              key={`bg-${ring.id}`}
              cx={center}
              cy={center}
              r={ring.radius}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={ring.circumference}
              strokeDashoffset={ring.circumference * (1 - 0.78)}
              className="opacity-60"
            />
          ))}

          {/* حلقه‌های اصلی بصری */}
          {ringConfigs.map((ring, index) => {
            const isHovered = activeId === ring.id || (!activeId && index === 0);
            const isMuted = activeId !== null && !isHovered;

            return (
              <motion.circle
                key={`progress-${ring.id}`}
                cx={center}
                cy={center}
                r={ring.radius}
                fill="none"
                stroke={`url(#grad-${filterId}-${ring.id})`}
                strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                strokeLinecap="round"
                strokeDasharray={ring.circumference}
                style={{
                  filter: `url(#glow-${filterId})`,
                  transformOrigin: 'center',
                }}
                initial={{ strokeDashoffset: ring.circumference }}
                animate={{
                  strokeDashoffset: start ? ring.strokeDashoffset : ring.circumference,
                  opacity: isMuted ? 0.3 : 1,
                  scale: isHovered ? 1.018 : 1,
                }}
                transition={{
                  strokeDashoffset: {
                    duration: 1.6,
                    delay: 0.2 + index * 0.2,
                    ease: [0.16, 1, 0.3, 1],
                  },
                  opacity: { duration: 0.25 },
                  strokeWidth: { duration: 0.2 },
                }}
              />
            );
          })}

          {/* نوار لمسی نامرئی و فوق‌العاده عریض (۳۶ پیکسل) جهت تضمین تاچ بدون خطا روی گوشی */}
          {ringConfigs.map((ring) => (
            <circle
              key={`touch-${ring.id}`}
              cx={center}
              cy={center}
              r={ring.radius}
              fill="none"
              stroke="transparent"
              strokeWidth={36}
              strokeLinecap="round"
              strokeDasharray={ring.circumference}
              strokeDashoffset={ring.circumference * (1 - 0.78)}
              className="cursor-pointer"
              style={{ pointerEvents: 'stroke' }}
              onClick={() => onSelectItem(ring.id)}
              onTouchStart={() => onSelectItem(ring.id)}
              onMouseEnter={() => onSelectItem(ring.id)}
              onMouseLeave={() => onSelectItem(null)}
            />
          ))}
        </svg>

        {/* مرکز دایره: نمایشگر داینامیک آمار فعال */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
          <motion.div
            key={activeStat.id}
            initial={{ scale: 0.85, opacity: 0, y: 6 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center gap-1"
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl mb-1 shadow-xs transition-colors"
              style={{ backgroundColor: activeStat.bgColor, color: activeStat.color }}
            >
              <activeStat.icon className="h-5 w-5" />
            </div>

            <div className="flex items-baseline gap-1 text-[#111B2F]">
              {activeStat.prefix && (
                <span className="text-xl sm:text-2xl font-black" style={{ color: activeStat.color }}>
                  {activeStat.prefix}
                </span>
              )}
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-[#111B2F]">
                {start ? (
                  <AnimatedNumber value={activeStat.target} duration={1.6} delay={0.15} />
                ) : (
                  '۰'
                )}
              </span>
              {activeStat.suffix && (
                <span className="text-xl font-bold text-slate-700">{activeStat.suffix}</span>
              )}
            </div>

            <span className="text-xs sm:text-sm font-bold text-slate-600 max-w-[145px] leading-tight">
              {activeStat.label}
            </span>
          </motion.div>
        </div>
      </div>

      {/* راهنمای ترغیب به لمس مخصوص نسخه موبایل */}
      <div className="flex md:hidden items-center gap-1.5 mt-2.5 text-[11px] font-bold text-slate-600 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full animate-bounce">
        <HandMetal className="h-3.5 w-3.5 text-[#E6A801]" />
        <span>روی هر نوار یا دکمه لمس کنید</span>
      </div>
    </div>
  );
}

function StatCard({
  stat,
  start,
  index,
  isActive,
  onHover,
}: {
  stat: StatItem;
  start: boolean;
  index: number;
  isActive: boolean;
  onHover: (id: string | null) => void;
}) {
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.15 + index * 0.1, ease: 'easeOut' }}
      onMouseEnter={() => onHover(stat.id)}
      onMouseLeave={() => onHover(null)}
      className={`relative cursor-pointer overflow-hidden rounded-3xl border p-4.5 sm:p-5 transition-all duration-300 ${
        isActive
          ? 'border-slate-300 bg-white shadow-xl ring-2 -translate-y-1'
          : 'border-slate-100 bg-white/80 backdrop-blur-sm shadow-sm hover:border-slate-200 hover:shadow-md'
      }`}
      style={{
        outlineColor: isActive ? stat.color : 'transparent',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-xs transition-transform duration-300"
            style={{ backgroundColor: stat.bgColor, color: stat.color }}
          >
            <Icon className="h-6 w-6" />
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-500">{stat.label}</span>
            <div className="mt-1 flex items-baseline gap-1 text-[#111B2F]">
              {stat.prefix && (
                <span className="text-base font-black" style={{ color: stat.color }}>
                  {stat.prefix}
                </span>
              )}
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#111B2F]">
                {start ? (
                  <AnimatedNumber value={stat.target} duration={1.8} delay={0.25 + index * 0.15} />
                ) : (
                  '۰'
                )}
              </span>
              {stat.suffix && <span className="text-sm font-bold text-slate-600">{stat.suffix}</span>}
            </div>
          </div>
        </div>

        {/* نشانگر رنگی رینگ مربوطه */}
        <div
          className="h-2.5 w-2.5 rounded-full ring-4 shadow-sm"
          style={{
            backgroundColor: stat.color,
            boxShadow: `0 0 10px ${stat.color}`,
          }}
        />
      </div>

      {/* نوار پیشرفت زیر کارت */}
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(to right, ${stat.gradient[0]}, ${stat.gradient[1]})`,
          }}
          initial={{ width: 0 }}
          animate={{ width: start ? '100%' : '0%' }}
          transition={{ duration: 1.4, delay: 0.3 + index * 0.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.div>
  );
}

export default function StatsSection() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startAnimation, setStartAnimation] = useState(false);
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);

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
      const t = setTimeout(() => setStartAnimation(true), 150);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => setStartAnimation(false), 0);
    return () => clearTimeout(t);
  }, [loading, error, stats.length]);

  return (
    <section
      id="stats"
      dir="rtl"
      aria-labelledby="stats-heading"
      className="relative z-10 mt-4 py-4 md:mt-6 md:py-8 overflow-hidden"
    >
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
        {/* Header - کاملاً همسان‌سازی شده با تم AboutSection */}
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="mb-6 md:mb-8"
        >
          <h2 id="stats-heading" className="flex flex-col items-start gap-1 text-right">
            <span
              style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
              className="inline-flex items-center gap-2 text-xl leading-tight text-slate-900 sm:text-2xl md:text-4xl"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-amber-300 shadow-sm md:h-10 md:w-10">
                <GraduationCap className="h-4 w-4 md:h-5 md:w-5" />
              </span>
              شاخص‌های موفقیت آکادمی تارگت
            </span>

            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 sm:text-xs md:text-sm">
              رشد واقعی با آموزش تخصصی و آزمون‌های هوش و خلاقیت
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
            </span>
          </h2>

          <span className="mt-2 block h-1 w-full rounded-full bg-linear-to-l from-slate-900 via-amber-500 sm:w-36 md:w-52" />
        </motion.header>

        {/* Error View */}
        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50/90 p-6 text-center shadow-sm max-w-lg mx-auto">
            <div className="mb-2 flex items-center justify-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm font-bold md:text-base">خطا در دریافت آمار</p>
            </div>
            <p className="text-xs text-red-600 md:text-sm">{error}</p>

            <button
              type="button"
              onClick={loadStats}
              className="mx-auto mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-red-700"
            >
              <RotateCcw className="h-4 w-4" />
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl border border-slate-100 bg-white/50 p-6 sm:p-10 shadow-xs">
            <div className="lg:col-span-5 flex justify-center">
              <div className="h-64 w-64 rounded-full border-8 border-slate-100 animate-pulse" />
            </div>
            <div className="lg:col-span-7 flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-3xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {/* Dashboard Presentation: Rings + Cards */}
        {!loading && !error && stats.length > 0 && (
          <div className="relative rounded-3xl border border-slate-200/70 bg-linear-to-b from-white to-slate-50/80 backdrop-blur-md p-5 sm:p-8 md:p-10 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
              {/* بخش نمودار دایره‌ای */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <MultiRingChart
                  stats={stats}
                  start={startAnimation}
                  activeId={activeHoverId}
                  onSelectItem={setActiveHoverId}
                />
                <span className="hidden md:block text-[11px] text-slate-400 mt-2 text-center font-medium">
                  برای مشاهده جزئیات، روی حلقه‌ها یا کارت‌ها بروید
                </span>
              </div>

              {/* کارت‌های شاخص‌های سه‌گانه (نمایش فقط در سایز md به بالا مطابق خواسته) */}
              <div className="md:col-span-7 hidden md:flex flex-col gap-3.5 sm:gap-4.5 justify-center">
                {stats.map((item, index) => (
                  <StatCard
                    key={item.id}
                    stat={item}
                    start={startAnimation}
                    index={index}
                    isActive={activeHoverId === item.id}
                    onHover={setActiveHoverId}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
