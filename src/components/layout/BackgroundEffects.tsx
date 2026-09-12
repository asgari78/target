'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface MousePosition {
  x: number;
  y: number;
}

export default function BackgroundEffects() {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0.5, y: 0.5 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });
  const mouseRef = useRef<MousePosition>({ x: 0.5, y: 0.5 });
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Throttled mousemove handler - max 30fps
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = performance.now();
    if (now - lastUpdateRef.current < 33) return; // ~30fps
    lastUpdateRef.current = now;

    mouseRef.current = {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    };
  }, []);

  // RAF loop for smooth animation - only when not reduced motion
  useEffect(() => {
    if (prefersReducedMotion) return;

    const animate = () => {
      setMousePosition(mouseRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [prefersReducedMotion]);

  // Mousemove listener with passive option
  useEffect(() => {
    if (prefersReducedMotion) return;

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove, prefersReducedMotion]);

  // Device orientation - simplified, no permission request for better performance
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        mouseRef.current = {
          x: 0.5 + (e.gamma / 90) * 0.3,
          y: 0.5 + (e.beta / 90) * 0.3,
        };
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden bg-white">
        <Image
          src="/images/BgSite.jpg"
          alt=""
          fill
          className="object-cover opacity-20"
          priority
          aria-hidden="true"
          sizes="100vw"
        />
      </div>
    );
  }

  const mouseX = (mousePosition.x - 0.5) * 2;
  const mouseY = (mousePosition.y - 0.5) * 2;

  const combinedX = mouseX * 0.7;
  const combinedY = mouseY * 0.7;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-white">
      <Image
        src="/images/BgSite.jpg"
        alt=""
        fill
        className="object-cover opacity-20"
        priority
        aria-hidden="true"
        sizes="100vw"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #102a43 1px, transparent 0)',
          backgroundSize: '30px 30px',
        }}
      />

      <motion.div
        animate={{
          x: [-100, 100, -100],
          y: [-50, 50, -50],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          transform: `translate(${combinedX * 30}px, ${combinedY * 30}px)`,
        }}
        className="absolute top-[-15%] left-[-15%] w-150 h-150 rounded-full bg-navy-300/20 blur-[120px] mix-blend-multiply pointer-events-none"
        aria-hidden="true"
      />

      <motion.div
        animate={{
          x: [100, -100, 100],
          y: [50, -50, 50],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        style={{
          transform: `translate(${combinedX * -40}px, ${combinedY * -40}px)`,
        }}
        className="absolute bottom-[-15%] right-[-15%] w-175 h-175 rounded-full bg-gold-300/15 blur-[140px] mix-blend-multiply pointer-events-none"
        aria-hidden="true"
      />

      <motion.div
        animate={{
          x: [0, 80, -80, 0],
          y: [0, -60, 60, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 5,
        }}
        style={{
          transform: `translate(${combinedX * 25}px, ${combinedY * 25}px)`,
        }}
        className="absolute top-[30%] left-[25%] w-125 h-125 rounded-full bg-navy-400/15 blur-[120px] mix-blend-multiply pointer-events-none"
        aria-hidden="true"
      />

      <motion.div
        animate={{
          x: [0, -60, 60, 0],
          y: [0, 80, -80, 0],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 8,
        }}
        style={{
          transform: `translate(${combinedX * -35}px, ${combinedY * -35}px)`,
        }}
        className="absolute bottom-[20%] right-[30%] w-100 h-100 rounded-full bg-gold-400/10 blur-[100px] mix-blend-multiply pointer-events-none"
        aria-hidden="true"
      />

      <div className="absolute inset-0 bg-linear-to-b from-navy-950/10 via-transparent to-navy-950/10 pointer-events-none" aria-hidden="true" />
    </div>
  );
}