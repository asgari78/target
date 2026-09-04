'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import Header from '@/src/components/layout/Header';
import NoticeBox from '@/src/components/layout/NoticeBox';
import HeroSlider from '@/src/components/layout/HeroSlider';
import CourseList from '@/src/components/courses/CourseList';
import RegistrationModal from '@/src/components/modal/RegistrationModal';
import Footer from '@/src/components/layout/Footer';
import BackgroundEffects from '@/src/components/layout/BackgroundEffects';
import { fetchActiveCourses } from '@/src/lib/courses';
import type { Course, RegistrationType } from '@/src/types';
import StatsSection from '@/src/components/layout/StatsSection';
import AboutSection from '@/src/components/layout/AboutSection';
import WhyTargetSection from '@/src/components/layout/WhyTargetSection';
import TestimonialsSection from '@/src/components/layout/TestimonialsSection';

function CoursesContent() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [registrationType, setRegistrationType] = useState<RegistrationType>('in_person');

  useEffect(() => {
    let mounted = true;
    fetchActiveCourses()
      .then((data) => {
        if (mounted) {
          setCourses(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleRegister = (course: Course, type: RegistrationType) => {
    setRegistrationType(type);
    setSelectedCourse(course);
  };

  const handleCloseModal = () => {
    setSelectedCourse(null);
  };

  if (error) {
    return (
      <section className="py-16 md:py-24 relative z-10" aria-labelledby="error-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-12"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 id="error-heading" className="text-xl font-bold text-slate-900 mb-2">خطا در بارگذاری دوره‌ها</h3>
            <p className="text-slate-500 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              تلاش مجدد
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <>
      <NoticeBox />
      <HeroSlider />
      <CourseList
        courses={courses}
        isLoading={loading}
        onRegisterClick={handleRegister}
      />
      <StatsSection />
      <AboutSection />
      <WhyTargetSection />
      <TestimonialsSection />
      <RegistrationModal
        course={selectedCourse}
        registrationType={registrationType}
        onClose={handleCloseModal}
      />
      <Footer />
    </>
  );
}

function LoadingFallback() {
  return (
    <>
      <NoticeBox />
      <HeroSlider />
      <StatsSection />
      <AboutSection />
      <WhyTargetSection />
      <TestimonialsSection />
      <CourseList
        courses={[]}
        isLoading={true}
        onRegisterClick={() => {}}
      />
      <Footer />
    </>
  );
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <BackgroundEffects />
      <Header />
      <main className="flex-1">
        <Suspense fallback={<LoadingFallback />}>
          <CoursesContent />
        </Suspense>
      </main>
    </div>
  );
}