'use client';

import { motion } from 'framer-motion';
import CourseCard from './CourseCard';
import { Course } from '@/src/types';
import { courses } from '@/src/data/coursesData';

interface CourseListProps {
  courses: Course[];
  onRegisterClick: (course: Course) => void;
}

export default function CourseList({ courses, onRegisterClick }: CourseListProps) {
  return (
    <section className="py-16 md:py-24 relative z-10" id="courses">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* بخش عنوان و توضیحات لیست دوره‌ها */}
        <div className="text-center mb-16 md:mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4"
          >
            دوره‌های آموزشی تارگت
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            مسیر موفقیت خود را با انتخاب یکی از دوره‌های تخصصی ما آغاز کنید. برای راحتی شما عزیزان، امکان پرداخت شهریه تمامی دوره‌ها به صورت <span className="font-bold text-emerald-600">اقساطی</span> فراهم شده است.
          </motion.p>
        </div>

        {/* گرید نمایش کارت‌ها */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {courses.map((course, index) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              index={index} 
              onRegisterClick={onRegisterClick} 
            />
          ))}
        </div>
        
      </div>
    </section>
  );
}