import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { FloatingContactWidget } from '@/components/FloatingContactWidget';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { NavigationProgressBar } from '@/components/NavigationProgressBar';
import { Analytics } from '@vercel/analytics/next';
import { Suspense } from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ukrtab.com.ua';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Укртаб — Виробництво магнітів, наліпок на авто та адресних табличок',
    template: '%s | Укртаб',
  },
  description:
    'Магазин та виробництво Укртаб (Дніпро). Магнітні наклейки на авто, сувенірні автономери ЗСУ, адресні таблички на будинок, УФ-друк та трафарети. Доставка по Україні 1-2 дні.',
  keywords: [
    'магнітні наклейки на авто',
    'магніти на авто',
    'магнітна реклама на авто',
    'сувенірні номери на авто',
    'номери для військових',
    'номер з позивним',
    'адресні таблички на будинок',
    'таблички на двері',
    'інформаційні таблички',
    'ритуальні таблички',
    'трафарети на замовлення',
    'УФ друк',
    'укртаб',
    'ukrtab',
  ],
  authors: [{ name: 'Ukrtab', url: SITE_URL }],
  creator: 'Ukrtab',
  publisher: 'Ukrtab',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: './',
  },
  verification: {
    google: 'google7ead0cd001d0819d',
  },
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    url: SITE_URL,
    siteName: 'Укртаб',
    title: 'Укртаб — Магніти на авто, сувенірні номери та адресні таблички',
    description:
      'Власне виробництво автомобільних магнітів, сувенірних номерів для ЗСУ, адресних табличок та УФ-друку в Україні.',
    images: [
      {
        url: '/favicon.ico',
        width: 1200,
        height: 630,
        alt: 'Укртаб — виробництво магнітних наліпок та табличок',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Укртаб — Магніти на авто, сувенірні номери та адресні таблички',
    description:
      'Власне виробництво автомобільних магнітів, сувенірних номерів для ЗСУ та адресних табличок.',
    images: ['/favicon.ico'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-3JX1H1V7NP';

  return (
    <html lang="uk">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        <Suspense fallback={null}>
          <NavigationProgressBar />
        </Suspense>
        <CartProvider>
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <FloatingContactWidget />
        </CartProvider>

        <GoogleAnalytics gaId={gaId} />
        <Analytics />
      </body>
    </html>
  );
}
