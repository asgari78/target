'use client';

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Heart,
  Medal,
  PenSquare,
  RotateCcw,
  School,
  Sparkles,
  Users2,
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
  index: number;
  isOpen: boolean;
  canHover: boolean;
  onToggle: () => void;
};

type ResumeListProps = {
  title: string;
  items?: string[];
  icon: ReactNode;
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
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const updateHoverState = () => setCanHover(mediaQuery.matches);

    updateHoverState();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateHoverState);
      return () => mediaQuery.removeEventListener('change', updateHoverState);
    }

    mediaQuery.addListener(updateHoverState);
    return () => mediaQuery.removeListener(updateHoverState);
  }, []);

  return canHover;
}

function ResumeList({ title, items, icon }: ResumeListProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-2.5 shadow-xs transition-colors hover:bg-white">
      <h5 className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-900">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500 text-white shadow-xs">
          {icon}
        </span>
        {title}
      </h5>

      <ul className="space-y-1 text-[11px] leading-5 font-medium text-slate-700">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InstructorCard({
  teacher,
  index,
  isOpen,
  canHover,
  onToggle,
}: InstructorCardProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <div
      tabIndex={0}
      role="button"
      aria-expanded={isOpen}
      aria-label={`نمایش سوابق و رزومه ${teacher.name}`}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className="group relative h-[470px] sm:h-[500px] w-full cursor-pointer select-none rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
      style={{ perspective: 1200 }}
    >
      {/* Motion Card Wrapper with 3D Transform */}
      <motion.div
        className="relative h-full w-full rounded-2xl"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isOpen ? 180 : 0 }}
        transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* ================= روی کارت (FRONT FACE) ================= */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 text-right shadow-sm backdrop-blur-[2px] transition-all duration-300 hover:shadow-lg"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Radial Glow Layer */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(80%_45%_at_100%_0%,rgba(250,204,21,0.14),transparent_60%),radial-gradient(75%_45%_at_0%_100%,rgba(139,92,246,0.08),transparent_60%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-[1px] z-[1] rounded-[15px] border border-white/70"
          />

          {/* تصویر استاد */}
          <div className="relative z-[2] aspect-[1/1] w-full shrink-0 overflow-hidden bg-slate-100">
            <Image
              src={teacher.image}
              alt={teacher.name}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={index < 2}
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent"
            />

            {/* نشان رسمی آموزش و پرورش */}
            <div className="absolute right-2.5 top-2.5 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/90 px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold text-slate-800 shadow-sm backdrop-blur">
                <School className="h-3 w-3 text-emerald-600" />
                معلم رسمی آموزش و پرورش
              </span>
            </div>

            {/* راهنمای لمسی در موبایل */}
            <div className="absolute bottom-2.5 left-2.5 z-10 sm:hidden">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-black/55 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-xs">
                <RotateCcw className="h-2.5 w-2.5" />
                لمس برای رزومه کامل
              </span>
            </div>
          </div>

          {/* محتوای متنی روی کارت */}
          <div className="relative z-[2] flex flex-1 flex-col justify-between p-3.5">
            <div>
              <h4
                style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
                className="text-xl sm:text-2xl leading-tight text-slate-900 transition-colors group-hover:text-amber-600"
              >
                {teacher.name}
              </h4>

              <p className="mt-1 text-xs font-semibold text-slate-600 line-clamp-1">
                {teacher.role}
              </p>

              <div className="mt-2.5 rounded-xl border border-amber-100 bg-amber-50/60 p-2">
                <p className="text-[11px] leading-relaxed text-slate-700 line-clamp-2">
                  {teacher.quote}
                </p>
              </div>
            </div>

            {/* دکمه اکشن پایین کارت رو */}
            <div className="pt-2">
              <div
                className="
                  inline-flex w-full items-center justify-center gap-2
                  rounded-xl border border-slate-300/80
                  bg-linear-to-r from-slate-900 via-slate-800 to-slate-900
                  py-2.5 text-xs font-extrabold text-white shadow-sm
                  transition-all duration-300 group-hover:from-black group-hover:via-slate-900
                "
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-black">
                  <Sparkles className="h-2.5 w-2.5" />
                </span>
                مشاهده کارنامه و رزومه کامل
              </div>
            </div>
          </div>
        </div>

        {/* ================= پشت کارت (BACK FACE - رزومه با تم روشن و جذاب) ================= */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-linear-to-b from-white via-slate-50/90 to-amber-50/20 text-right shadow-lg"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* افکت نوری گوشه‌ها برای جذابیت و عمق */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(75%_45%_at_100%_0%,rgba(251,191,36,0.15),transparent_60%),radial-gradient(75%_45%_at_0%_100%,rgba(16,185,129,0.06),transparent_60%)]"
          />

          {/* هدر بالای پشت کارت */}
          <div className="relative z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/80 p-3 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-amber-400/80 shadow-xs">
                <Image
                  src={teacher.image}
                  alt={teacher.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h5
                  style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
                  className="text-base sm:text-lg leading-tight text-slate-900"
                >
                  {teacher.name}
                </h5>
                <span className="text-[10px] font-bold text-amber-700">سوابق علمی و آموزشی</span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-700 shadow-xs transition-colors hover:bg-slate-50">
              <RotateCcw className="h-3 w-3 text-amber-600" />
              بازگشت
            </span>
          </div>

          {/* لیست اسکرول‌خور محتوای رزومه با کنتراست عالی */}
          <div
            className="relative z-10 flex-1 space-y-2.5 overflow-y-auto p-3.5 scrollbar-thin scrollbar-thumb-slate-200"
            style={{ scrollbarWidth: 'thin' }}
          >
            {/* کلام استاد */}
            <div className="rounded-xl border border-amber-200/90 bg-amber-50/80 p-2.5 shadow-xs">
              <div className="mb-1 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">
                  <Heart className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                  پیام استاد به تارگتی‌ها
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                  <School className="h-3 w-3" />
                  رسمی آموزش و پرورش
                </span>
              </div>
              <p className="text-justify text-[11px] leading-5 font-medium text-slate-700">
                {teacher.quote}
              </p>
            </div>

            <ResumeList
              title="سابقه تدریس"
              icon={<BookOpen className="h-3 w-3" />}
              items={teacher.experience}
            />

            <ResumeList
              title="تحصیلات دانشگاهی"
              icon={<GraduationCap className="h-3 w-3" />}
              items={teacher.education}
            />

            <ResumeList
              title="تألیفات و انتشارات"
              icon={<PenSquare className="h-3 w-3" />}
              items={teacher.publications}
            />

            <ResumeList
              title="رتبه‌های برتر و قبولی‌ها"
              icon={<Medal className="h-3 w-3" />}
              items={teacher.topRanks}
            />

            <ResumeList
              title="سبک و متد تدریس"
              icon={<Sparkles className="h-3 w-3" />}
              items={teacher.teachingStyle}
            />
          </div>

          {/* نوار پایانی پشت کارت */}
          <div className="relative z-10 border-t border-slate-200/80 bg-white/90 px-3 py-2 text-center text-[10px] font-bold text-slate-600">
            آکادمی تیزهوشان تارگت • آموزش عمیق و مفهومی
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AboutSection() {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const canHover = useCanHover();

  useEffect(() => {
    if (!activeCardId) return;

    const handlePointerDown = (event: PointerEvent) => {
      const section = sectionRef.current;
      if (!section) return;

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
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeCardId]);

  const handleCardToggle = (teacherId: string) => {
    setActiveCardId((currentId) => (currentId === teacherId ? null : teacherId));
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      dir="rtl"
      aria-labelledby="about-heading"
      className="relative z-10 mt-4 py-4 md:mt-6 md:py-8"
    >
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="mb-6 md:mb-8"
        >
          <h2 id="about-heading" className="flex flex-col items-start gap-1 text-right">
            <span
              style={{ fontFamily: 'DigiLalezarPlus, sans-serif' }}
              className="inline-flex items-center gap-2 text-xl leading-tight text-slate-900 sm:text-2xl md:text-4xl"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-amber-300 shadow-sm md:h-10 md:w-10">
                <Users2 className="h-4 w-4 md:h-5 md:w-5" />
              </span>
              اساتید ما، تفاوت ما
            </span>

            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 sm:text-xs md:text-sm">
              کادر تخصصی و رسمی تیزهوشان آکادمی تارگت
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
            </span>
          </h2>

          <span className="mt-2 block h-1 w-full rounded-full bg-linear-to-l from-slate-900 via-amber-500 sm:w-36 md:w-52" />
        </motion.header>

        {/* Teachers Grid */}
        <div
          role="region"
          aria-label="اساتید آکادمی تارگت"
          className="
            -mx-3 flex gap-3 overflow-x-auto px-3 pb-4 pt-1
            snap-x snap-mandatory scrollbar-none
            sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:p-0
            lg:grid-cols-3 lg:gap-6
          "
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
          }}
        >
          {instructors.map((teacher, index) => {
            const isOpen = activeCardId === teacher.id;

            return (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 16, scale: 0.985 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.42, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="group shrink-0 snap-start w-[88%] xs:w-[80%] sm:w-auto"
                onMouseEnter={() => {
                  if (canHover) setActiveCardId(teacher.id);
                }}
                onMouseLeave={() => {
                  if (canHover) {
                    setActiveCardId((currentId) =>
                      currentId === teacher.id ? null : currentId,
                    );
                  }
                }}
              >
                <InstructorCard
                  teacher={teacher}
                  index={index}
                  isOpen={isOpen}
                  canHover={canHover}
                  onToggle={() => handleCardToggle(teacher.id)}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
