'use client';

import { motion } from 'framer-motion';
const instructors = [
  {
    name: 'حامد شهبازی',
    role: 'استاد ریاضیات تیزهوشان و جامع ششم',
    experience: '۱۵ سال سابقه تدریس',
    courses: ['دوره جامع تیزهوشان ششم', 'ریاضی پیشرفته تیزهوشان', 'ریاضی جامع ششم'],
  },
  {
    name: 'علی نصیری',
    role: 'استاد ریاضیات جامع پنجم',
    experience: '۱۲ سال سابقه تدریس',
    courses: ['ریاضی جامع پنجم'],
  },
  {
    name: 'محمدجواد عسگری',
    role: 'استاد ریاضیات جامع چهارم',
    experience: '۱۰ سال سابقه تدریس',
    courses: ['ریاضی جامع چهارم'],
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-28 relative z-10" aria-labelledby="about-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 p-8 md:p-12 text-center"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            اساتید ما، تفاوت ما
          </h3>
          <p className="text-navy-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            کادر تدریس موسسه تارگت از اساتید مجرب و متخصص تشکیل شده که با تسلط کامل بر مباحث ریاضی و تکنیک‌های تدریس، مسیر موفقیت دانش‌آموزان را هموار می‌کنند.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {instructors.map((instructor, index) => (
              <motion.div
                key={instructor.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                className="text-right"
              >
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-navy-700/50 mx-auto md:mx-0">
                  <span className="text-2xl font-bold text-gold-400">
                    {instructor.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-white mb-1">{instructor.name}</h4>
                <p className="text-gold-400 text-sm mb-3">{instructor.role}</p>
                <p className="text-navy-300 text-sm mb-4">{instructor.experience}</p>
                <ul className="space-y-1 text-sm text-navy-400">
                  {instructor.courses.map((course, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden="true" />
                      {course}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}