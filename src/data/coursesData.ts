// src/data/coursesData.ts

import { Course } from '../types'; // مسیر نسبی یا استفاده از '@/' در صورت کانفیگ بودن

export const courses: Course[] = [
  {
    id: 'course-math-6',
    title: 'ریاضیات پیشرفته و تیزهوشان ششم',
    description: 'آمادگی کامل برای آزمون‌های ورودی مدارس تیزهوشان و نمونه دولتی با حل تست‌های چالشی و آموزش مفهومی.',
    instructor: {
      id: 'inst-1',
      name: 'استاد علیرضا احمدی',
      imageUrl: '/images/instructor-1.jpg' // این عکس‌ها باید در پوشه public/images قرار بگیرند
    },
    grade: 'ششم',
    schedule: 'روزهای زوج - ساعت ۱۶:۰۰ الی ۱۸:۰۰',
    basePrice: 3500000, // ۳ میلیون و ۵۰۰ هزار تومان
    installmentsCount: 6,
    coverImage: '/images/course-math-6.jpg'
  },
  {
    id: 'course-science-5',
    title: 'علوم تجربی مفهومی پنجم',
    description: 'یادگیری عمیق مفاهیم علوم همراه با آزمایش‌های عملی (به صورت مجازی) و درک کامل مباحث پایه.',
    instructor: {
      id: 'inst-2',
      name: 'استاد مریم رضایی',
      imageUrl: '/images/instructor-2.jpg'
    },
    grade: 'پنجم',
    schedule: 'یکشنبه و سه‌شنبه - ساعت ۱۸:۳۰ الی ۲۰:۰۰',
    basePrice: 2400000, // ۲ میلیون و ۴۰۰ هزار تومان
    installmentsCount: 4,
    coverImage: '/images/course-science-5.jpg'
  },
  {
    id: 'course-farsi-4',
    title: 'ادبیات و فارسی خلاق چهارم',
    description: 'تقویت مهارت‌های خوانداری، نوشتاری و درک مطلب با رویکردی جذاب و داستان‌محور مخصوص دانش‌آموزان پایه چهارم.',
    instructor: {
      id: 'inst-3',
      name: 'استاد سارا کریمی',
      imageUrl: '/images/instructor-3.jpg'
    },
    grade: 'چهارم',
    schedule: 'پنجشنبه‌ها - ساعت ۱۰:۰۰ الی ۱۳:۰۰',
    basePrice: 1800000, // ۱ میلیون و ۸۰۰ هزار تومان
    installmentsCount: 4,
    coverImage: '/images/course-farsi-4.jpg'
  }
];
