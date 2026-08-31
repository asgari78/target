'use client';

import { useEffect, useState } from 'react';
import NoticeBox from '@/src/components/layout/NoticeBox';
import CourseList from '@/src/components/courses/CourseList';
import RegistrationModal from '@/src/components/modal/RegistrationModal';
import { fetchActiveCourses } from '@/src/lib/courses';
import type { Course, RegistrationType } from '@/src/types';

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Course | null>(null);
  const [regType, setRegType] = useState<RegistrationType>('in_person');

  useEffect(() => {
    fetchActiveCourses()
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRegister = (course: Course, type: RegistrationType) => {
    setRegType(type);
    setSelected(course);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6">
      {/* نکته مهم — جمع‌وجور */}
      <NoticeBox />

      {/* ۳ دوره بلافاصله بعد از لود دیده می‌شوند */}
      <CourseList
        courses={courses}
        isLoading={loading}
        onRegisterClick={(course, type) => handleRegister(course, type)}
      />

      <RegistrationModal
        course={selected}
        registrationType={regType}
        onClose={() => setSelected(null)}
      />
    </main>
  );
}
