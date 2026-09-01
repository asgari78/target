import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "موسسه آموزشی تارگت | دوره‌های تخصصی ریاضیات پایه‌های چهارم تا ششم",
    template: "%s | موسسه آموزشی تارگت",
  },
  description: "دوره‌های جامع ریاضیات برای پایه‌های چهارم، پنجم و ششم با اساتید مجرب. کلاس‌های حضوری در قم و آنلاین در سراسر ایران. ثبت‌نام آسان و سریع.",
  keywords: [
    "موسسه آموزشی تارگت",
    "دوره ریاضیات",
    "تیزهوشان ششم",
    "ریاضیات جامع ششم",
    "ریاضیات جامع پنجم",
    "ریاضیات جامع چهارم",
    "کلاس حضوری قم",
    "کلاس آنلاین ریاضیات",
    "آموزش ریاضیات پایه ششم",
    "آموزش ریاضیات پایه پنجم",
    "آموزش ریاضیات پایه چهارم",
  ],
  authors: [{ name: "موسسه آموزشی تارگت" }],
  creator: "موسسه آموزشی تارگت",
  publisher: "موسسه آموزشی تارگت",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://target-academy.ir"),
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://target-academy.ir",
    siteName: "موسسه آموزشی تارگت",
    title: "موسسه آموزشی تارگت | دوره‌های تخصصی ریاضیات",
    description: "دوره‌های جامع ریاضیات برای پایه‌های چهارم، پنجم و ششم با اساتید مجرب. کلاس‌های حضوری در قم و آنلاین در سراسر ایران.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "موسسه آموزشی تارگت - دوره‌های ریاضیات",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "موسسه آموزشی تارگت | دوره‌های تخصصی ریاضیات",
    description: "دوره‌های جامع ریاضیات برای پایه‌های چهارم، پنجم و ششم با اساتید مجرب.",
    images: ["/images/og-image.jpg"],
    creator: "@targetacademy",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#102a43",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "موسسه آموزشی تارگت",
    alternateName: "Target Academy",
    url: "https://target-academy.ir",
    logo: "https://target-academy.ir/images/logo.png",
    description: "موسسه آموزشی تارگت ارائه‌دهنده دوره‌های تخصصی ریاضیات برای پایه‌های چهارم تا ششم با تدریس حضوری در قم و آنلاین در سراسر ایران.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "خیابان امام، بلوار زینبیه",
      addressLocality: "قم",
      addressCountry: "IR",
    },
    telephone: "+98-25-37741234",
    email: "info@target-academy.ir",
    sameAs: [
      "https://telegram.me/targetacademy",
      "https://instagram.com/targetacademy",
      "https://twitter.com/targetacademy",
      "https://linkedin.com/company/targetacademy",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "دوره‌های ریاضیات",
      category: "Educational Courses",
    },
  };

  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://gutcdmaqciskdrecukkj.supabase.co" />
      </head>
      <body className="min-h-full flex flex-col bg-white">
        {children}
      </body>
    </html>
  );
}