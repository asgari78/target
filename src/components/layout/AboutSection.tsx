'use client';

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  GraduationCap,
  Heart,
  Medal,
  PenSquare,
  School,
  Sparkles,
  Star,
} from 'lucide-react';

type Instructor = {
  id: string;
  name: string;
  role: string;
  image: string;
  quote: string;
  experience: string[];
  education: string[];
  publications: string[];
  topRanks?: string[];
  teachingStyle?: string[];
};

type InstructorCardProps = {
  teacher: Instructor;
  open: boolean;
  canHover: boolean;
  onToggle: () => void;
  onHoverOpen: () => void;
  onHoverClose: () => void;
};

type ResumeListProps = {
  title: string;
  items?: string[];
  icon: ReactNode;
};

type AutoScrollResumeProps = {
  active: boolean;
  children: ReactNode;
};

const instructors: Instructor[] = [
  {
    id: 'hamed-shahbazi',
    name: 'استاد حامد شهبازی',
    role: 'استاد تیزهوشان تارگت؛ تدریس مفهومی',
    image: 'https://gutcdmaqciskdrecukkj.supabase.co/storage/v1/object/sign/teacher_photos/teacher1.png?token=eyJraWQiOiI3MzNlMGYxMS0wNGYyLTQwZjEtYWQzYi1hZTlkYmM0NTdhOWMiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJ0ZWFjaGVyX3Bob3Rvcy90ZWFjaGVyMS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg4NDQxODE0LCJleHAiOjE3OTYyMTc4MTR9.X3ueljn03hLC7CfGg4GzXnRWbd4-trW5_Nf28ms9JVOymwDDg-hUhyzB9lrrT8i4xo1BBNkTib2tugQOkq-pgQ',
    quote:
      'من با قلبم تدریس می‌کنم نه با عقل؛ برای همین تو کلاس زمان رو حس نمی‌کنم و دانش‌آموزان به درس علاقه‌مند میشن. دانش‌آموزان فرمانده بودن رو یاد می‌گیرن نه سرباز بودن! یعنی حتی جای طراح فکر می‌کنن و با تدریس تستی و تشریحی صفر تا صدی، اهداف‌شون رو تیک می‌زنن.',
    experience: ['۱۱ سال تدریس حضوری', '۸ سال تدریس آنلاین'],
    education: [
      'ابتدایی دانشگاه قم',
      'علوم تربیتی دانشگاه فرهنگیان',
      'کارشناسی ارشد آموزش ابتدایی دانشگاه قم',
    ],
    publications: [
      'جزوات تیزهوشان جامع',
      'جزوات نکته و تست',
      'جزوه مافیای تیزهوشان',
    ],
    topRanks: [
      'هدایت و همراهی بالغ بر ۲۳ رتبه برتر و قبولی تیزهوشان ورودی هفتم',
    ],
  },
  {
    id: 'mohammadjavad-asgari',
    name: 'استاد محمدجواد عسگری',
    role: 'استاد چهارم و ششم تارگت؛ تدریس عملی و نوین',
    image: 'https://gutcdmaqciskdrecukkj.supabase.co/storage/v1/object/sign/teacher_photos/teacher2.jpg?token=eyJraWQiOiI3MzNlMGYxMS0wNGYyLTQwZjEtYWQzYi1hZTlkYmM0NTdhOWMiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJ0ZWFjaGVyX3Bob3Rvcy90ZWFjaGVyMi5qcGciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg4NDQyMTMwLCJleHAiOjE3OTYyMTgxMzB9.fyWbTyGBFoXmKiQCnAkBEABZqWyW9DVBRhBpd0a7kQWdze28v7PtGjkaTafgv0MPlV39BRc6BUtWx5K_aHBswg',
    quote:
      'در آموزش ریاضی، مهم است که دانش‌آموز فقط حفظ نکند؛ بلکه مفهوم را بفهمد. وقتی پایه درست شکل بگیرد، حل مسئله هم آسان‌تر می‌شود. رویکرد کلاس‌های ایشان بر آموزش اصولی مفاهیم و سپس تمرین‌های متنوع است تا دانش‌آموز هم یاد بگیرد و هم بتواند از آموخته‌های خود در حل مسئله استفاده کند.',
    experience: ['۷ سال تدریس حضوری', '۷ سال تدریس آنلاین'],
    education: [
      'کارشناسی علوم تربیتی دانشگاه فرهنگیان',
      'کارشناسی ارشد روانشناسی تربیتی دانشگاه قم',
    ],
    publications: [
      'جزوات جامع ریاضی چهارم و ششم',
      'جزوات نکته و تست چهارم',
      'طراحی سایت آکادمی تارگت',
    ],
  },
  {
    id: 'mohammadhossein-mohsenifar',
    name: 'استاد محمدحسین محسنی‌فر',
    role: 'استاد ریاضی متوسطه اول و تیزهوشان ورودی دهم',
    image: 'https://gutcdmaqciskdrecukkj.supabase.co/storage/v1/object/sign/teacher_photos/teacher3.jpg?token=eyJraWQiOiI3MzNlMGYxMS0wNGYyLTQwZjEtYWQzYi1hZTlkYmM0NTdhOWMiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJ0ZWFjaGVyX3Bob3Rvcy90ZWFjaGVyMy5qcGciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg4NDQyNjg1LCJleHAiOjE3OTYyMTg2ODV9.s0rILPQqBQYQJAgZaICWHlwH9Wb0l5Le26aSnBpd6VtoRVA5dY27r5m_anIEExQj-ryV9D7megxshyQTFiJvCg',
    quote:
      'برای من، یادگیری واقعی زمانی اتفاق می‌افتد که دانش‌آموز بتواند مفاهیم را درک کند، نه اینکه صرفاً آن‌ها را حفظ کند. در کلاس‌هایم با توجه به سطح هر دانش‌آموز، آموزش طوری پیش می‌رود که هم پایه‌ها تقویت شود و هم مهارت حل مسئله و تحلیل افزایش پیدا کند. هدف من این است که ریاضی از یک درس سخت به نقطه قوت شما تبدیل شود و سؤالات آن را با لبخند پاسخ دهید.',
    experience: ['۸ سال تدریس حضوری', '۴ سال تدریس آنلاین'],
    education: [
      'کارشناسی آموزش ریاضی دانشگاه فرهنگیان ساری',
      'کارشناسی ارشد ریاضی محض دانشگاه خوارزمی تهران',
    ],
    publications: [
      'جزوه ریاضی متوسطه اول؛ پایه نهم',
      'جزوه ریاضی متوسطه دوم؛ پایه‌های دهم و یازدهم',
      'مشاوره آمادگی کنکور رشته‌های ریاضی؛ درس ریاضی',
      'جزوه آموزش تست‌زنی، تحلیل آزمون و جمع‌بندی ریاضی',
    ],
    teachingStyle: [
      'آموزش مفهومی، تیپ‌بندی سؤالات و تقویت پایه‌های ریاضی',
    ],
  },
];

function useCanHover(): boolean {
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(
      '(hover: hover) and (pointer: fine)',
    );

    const updateHoverState = () => {
      setCanHover(mediaQuery.matches);
    };

    updateHoverState();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateHoverState);

      return () => {
        mediaQuery.removeEventListener('change', updateHoverState);
      };
    }

    mediaQuery.addListener(updateHoverState);

    return () => {
      mediaQuery.removeListener(updateHoverState);
    };
  }, []);

  return canHover;
}

function ResumeList({
  title,
  items,
  icon,
}: ResumeListProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm">
      <h5 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-slate-800">
        <span className="text-indigo-600">{icon}</span>
        {title}
      </h5>

      <ul className="space-y-1.5 text-sm leading-7 text-slate-700">
        {items.map((item, index) => (
          <li
            key={`${title}-${index}`}
            className="flex items-start gap-2"
          >
            <Star className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AutoScrollResume({
  active,
  children,
}: AutoScrollResumeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeoutRef = useRef<number | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    const clearAll = () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (startTimeoutRef.current !== null) {
        window.clearTimeout(startTimeoutRef.current);
        startTimeoutRef.current = null;
      }
      if (retryTimeoutRef.current !== null) {
        window.clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };

    clearAll();
    container.scrollTop = 0;

    if (!active) {
      return () => {
        cancelled = true;
        clearAll();
      };
    }

    const START_DELAY = 5000;
    const DOWN_SPEED = 0.5;
    const UP_SPEED = 1.35;
    const BOTTOM_PAUSE = 3000;
    const RETRY_DELAY = 250;

    type Direction = 'down' | 'up';
    let direction: Direction = 'down';

    const step = () => {
      if (cancelled) return;

      const el = containerRef.current;
      if (!el) return;

      const maxScroll = el.scrollHeight - el.clientHeight;

      if (maxScroll <= 0) {
        retryTimeoutRef.current = window.setTimeout(() => {
          if (!cancelled) {
            animationFrameRef.current = window.requestAnimationFrame(step);
          }
        }, RETRY_DELAY);
        return;
      }

      if (direction === 'down') {
        el.scrollTop += DOWN_SPEED;

        if (el.scrollTop >= maxScroll - 1) {
          el.scrollTop = maxScroll;
          direction = 'up';

          startTimeoutRef.current = window.setTimeout(() => {
            if (!cancelled) {
              animationFrameRef.current = window.requestAnimationFrame(step);
            }
          }, BOTTOM_PAUSE);

          return;
        }
      } else {
        el.scrollTop -= UP_SPEED;

        if (el.scrollTop <= 0) {
          el.scrollTop = 0;
          direction = 'down';
        }
      }

      animationFrameRef.current = window.requestAnimationFrame(step);
    };

    startTimeoutRef.current = window.setTimeout(() => {
      if (!cancelled) {
        animationFrameRef.current = window.requestAnimationFrame(step);
      }
    }, START_DELAY);

    return () => {
      cancelled = true;
      clearAll();
    };
  }, [active]);

  return (
    <div
      ref={containerRef}
      className="h-full min-h-0 overflow-y-auto px-4 pb-4 pt-3"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        overscrollBehavior: 'contain',
      }}
    >
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InstructorCard({
  teacher,
  open,
  canHover,
  onToggle,
  onHoverOpen,
  onHoverClose,
}: InstructorCardProps) {
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group min-h-0"
      onMouseEnter={() => {
        if (canHover) {
          onHoverOpen();
        }
      }}
      onMouseLeave={() => {
        if (canHover) {
          onHoverClose();
        }
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label={`نمایش رزومه ${teacher.name}`}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className="block w-full cursor-pointer rounded-[1.25rem] md:rounded-[1.6rem] text-right focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 focus:ring-offset-white"
      >
        <div
          className="min-h-0"
          style={{ perspective: '1800px' }}
        >
          <div
            className="relative h-124 md:h-144 w-full min-h-0 rounded-[1.25rem] md:rounded-[1.6rem] transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform"
            style={{
              transform: open ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Front face */}
            <div
              className="absolute inset-0 overflow-hidden rounded-[1.25rem] md:rounded-[1.6rem] border border-slate-200 bg-white shadow-lg"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                <img
                  src={teacher.image}
                  alt={teacher.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>

              <div className="p-3.5 md:p-4">
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 md:px-3 py-1 text-[11px] md:text-xs font-bold text-emerald-700">
                    <School className="h-3.5 w-3.5" />
                    معلم رسمی آموزش و پرورش
                  </span>
                </div>

                <h4
                  className="text-[1.65rem] md:text-3xl leading-tight text-slate-900"
                  style={{
                    fontFamily: 'DigiLalezarPlus, sans-serif',
                  }}
                >
                  {teacher.name}
                </h4>

                <p className="mt-1 text-[13px] md:text-sm font-semibold text-indigo-700">
                  {teacher.role}
                </p>

                <p className="mt-2.5 md:mt-3 text-[13px] md:text-sm leading-6 md:leading-7 text-slate-600">
                  برای دیدن رزومه و سوابق، کارت را لمس یا کلیک کنید.
                </p>
              </div>
            </div>

            {/* Back face */}
            <div
              className="absolute inset-0 flex h-full min-h-0 flex-col overflow-hidden rounded-[1.25rem] md:rounded-[1.6rem] border border-indigo-200 bg-slate-50 shadow-lg"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-indigo-100 bg-white/90 px-3.5 md:px-4 py-2.5 md:py-3 backdrop-blur-sm">
                <div className="min-w-0">
                  <p className="text-[11px] md:text-xs font-bold text-indigo-600">
                    رزومه و سوابق
                  </p>

                  <h5 className="mt-0.5 truncate text-base md:text-lg font-extrabold text-slate-900">
                    {teacher.name}
                  </h5>
                </div>

                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-indigo-100 px-2.5 md:px-3 py-1.5 text-[10px] md:text-[11px] font-bold text-gray-600">
                  <Sparkles className="h-3.5 w-3.5" />
                  اسکرول کنید
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden">
                <AutoScrollResume active={open}>
                  <>
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white">
                          <Heart className="h-3.5 w-3.5 fill-white" />
                          به گفته خود استاد
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                          <School className="h-3.5 w-3.5" />
                          معلم رسمی
                        </span>
                      </div>

                      <p className="text-justify text-sm leading-7 text-slate-700">
                        {teacher.quote}
                      </p>
                    </div>

                    <ResumeList
                      title="سابقه تدریس"
                      icon={<BookOpen className="h-4 w-4" />}
                      items={teacher.experience}
                    />

                    <ResumeList
                      title="تحصیلات"
                      icon={<GraduationCap className="h-4 w-4" />}
                      items={teacher.education}
                    />

                    <ResumeList
                      title="تألیفات"
                      icon={<PenSquare className="h-4 w-4" />}
                      items={teacher.publications}
                    />

                    <ResumeList
                      title="رتبه‌های برتر"
                      icon={<Medal className="h-4 w-4" />}
                      items={teacher.topRanks}
                    />

                    <ResumeList
                      title="سبک تدریس"
                      icon={<Sparkles className="h-4 w-4" />}
                      items={teacher.teachingStyle}
                    />
                  </>
                </AutoScrollResume>
              </div>
            </div>
          </div>
        </div>
      </button>
    </motion.article>
  );
}

export default function AboutSection() {
  const [activeCardId, setActiveCardId] = useState<string | null>(
    null,
  );

  const sectionRef = useRef<HTMLElement | null>(null);
  const canHover = useCanHover();

  useEffect(() => {
    if (!activeCardId) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const section = sectionRef.current;

      if (!section) {
        return;
      }

      const target = event.target;

      if (target instanceof Node && !section.contains(target)) {
        setActiveCardId(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveCardId(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDown,
      );
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeCardId]);

  const handleCardToggle = (teacherId: string) => {
    setActiveCardId((currentId) => {
      if (canHover) {
        return teacherId;
      }

      return currentId === teacherId ? null : teacherId;
    });
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      dir="rtl"
      aria-labelledby="about-heading"
      className="py-12 md:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55 }}
          className="min-h-0 rounded-2xl md:rounded-3xl border border-white/60 bg-white/70 p-4 md:p-8 shadow-xl backdrop-blur-md"
        >
          <div className="mb-6 md:mb-8 text-center">
            <h3
              id="about-heading"
              style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
              className="text-[1.9rem] md:text-4xl leading-tight"
            >
              <span className="bg-linear-to-l from-indigo-600 via-fuchsia-500 to-amber-400 bg-clip-text text-transparent">
                اساتید ما، تفاوت ما
              </span>
            </h3>

            <p className="mx-auto mt-2.5 md:mt-3 max-w-3xl text-sm md:text-base leading-7 md:leading-8 text-slate-600">
              تیم آموزشی تارگت با ترکیب تجربه، روش‌های نوین و تدریس
              مفهومی، مسیر یادگیری را برای دانش‌آموزان روشن و
              لذت‌بخش می‌کند.
            </p>
          </div>

          <div className="grid min-h-0 grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {instructors.map((teacher, index) => {
              const isOpen = activeCardId === teacher.id;

              return (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.08,
                  }}
                  className="min-h-0"
                >
                  <InstructorCard
                    teacher={teacher}
                    open={isOpen}
                    canHover={canHover}
                    onToggle={() => handleCardToggle(teacher.id)}
                    onHoverOpen={() => {
                      if (canHover) {
                        setActiveCardId(teacher.id);
                      }
                    }}
                    onHoverClose={() => {
                      if (canHover) {
                        setActiveCardId((currentId) =>
                          currentId === teacher.id
                            ? null
                            : currentId,
                        );
                      }
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
