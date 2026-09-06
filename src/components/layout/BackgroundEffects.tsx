'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface MousePosition {
  x: number;
  y: number;
}

interface DeviceOrientation {
  gamma: number | null;
  beta: number | null;
}

export default function BackgroundEffects() {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0.5, y: 0.5 });
  const [deviceOrientation, setDeviceOrientation] = useState<DeviceOrientation>({ gamma: null, beta: null });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });
  const mouseRef = useRef<MousePosition>({ x: 0.5, y: 0.5 });
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const animate = () => {
      setMousePosition(mouseRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        setDeviceOrientation({
          gamma: Math.max(-90, Math.min(90, e.gamma)),
          beta: Math.max(-90, Math.min(90, e.beta)),
        });
      }
    };

    if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
      (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission().then((permission: string) => {
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, { passive: true });
        }
      }).catch(() => {
        window.addEventListener('deviceorientation', handleOrientation, { passive: true });
      });
    } else {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

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
        />
      </div>
    );
  }

  const mouseX = (mousePosition.x - 0.5) * 2;
  const mouseY = (mousePosition.y - 0.5) * 2;

  const deviceX = deviceOrientation.gamma !== null ? deviceOrientation.gamma / 90 : 0;
  const deviceY = deviceOrientation.beta !== null ? deviceOrientation.beta / 90 : 0;

  const combinedX = mouseX * 0.7 + deviceX * 0.3;
  const combinedY = mouseY * 0.7 + deviceY * 0.3;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-white">
      <Image
        src="/images/BgSite.jpg"
        alt=""
        fill
        className="object-cover opacity-20"
        priority
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 z-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #102a43 1px, transparent 0)',
          backgroundSize: '30px 30px',
        }}
        aria-hidden="true"
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

      <div className="absolute inset-0" aria-hidden="true">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            animate={{
              x: [0, (i % 2 === 0 ? 1 : -1) * 50, 0],
              y: [0, (i % 3 === 0 ? 1 : -1) * 40, 0],
              rotate: [0, (i % 2 === 0 ? 1 : -1) * 15, 0],
              opacity: [0.05, 0.12, 0.05],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 1.5,
            }}
            style={{
              transform: `translate(${combinedX * 20}px, ${combinedY * 20}px)`,
              width: `${80 + i * 20}px`,
              height: `${80 + i * 20}px`,
              top: `${10 + i * 12}%`,
              left: `${15 + i * 8}%`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-linear-to-b from-navy-950/10 via-transparent to-navy-950/10 pointer-events-none" aria-hidden="true" />
    </div>
  );
}