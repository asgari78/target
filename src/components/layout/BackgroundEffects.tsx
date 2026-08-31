'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50">
      {/* پترن نقطه‌ای پس‌زمینه (Dot Grid Pattern) */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* هاله نورانی اول (آبی/نیلی) */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-300/30 blur-[100px] mix-blend-multiply pointer-events-none"
      />

      {/* هاله نورانی دوم (زمردی/سبز) */}
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-300/30 blur-[120px] mix-blend-multiply pointer-events-none"
      />

      {/* هاله نورانی سوم (بنفش - متحرک در مرکز) */}
      <motion.div
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -50, 50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[30%] left-[30%] w-[400px] h-[400px] rounded-full bg-purple-300/30 blur-[100px] mix-blend-multiply pointer-events-none"
      />
    </div>
  );
}
