// tailwind.config.ts

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // رنگ‌های سازمانی برند (قابل شخصی‌سازی)
        primary: {
          DEFAULT: '#3b82f6', // آبی ملایم
          hover: '#2563eb',
          light: '#dbeafe',
        },
        secondary: {
          DEFAULT: '#10b981', // سبز زمردی (برای دکمه‌های تایید و پرداخت)
          hover: '#059669',
        }
      },
      fontFamily: {
        // فرض بر این است که فونت فارسی (مثل Vazirmatn) را در layout.tsx لود می‌کنید
        sans: ['var(--font-vazirmatn)', 'system-ui', 'sans-serif'],
      },
      // انیمیشن‌های پیش‌فرض برای مُدال‌ها (تکمیل‌کننده framer-motion)
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in-out',
      }
    },
  },
  plugins: [],
};

export default config;
