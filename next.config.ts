import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // پذیرش تمام دامنه‌های https بدون محدودیت
      },
      {
        protocol: 'http',
        hostname: '**', // پذیرش دامنه‌های http در صورت نیاز
      },
    ],
  },
};

export default nextConfig;
