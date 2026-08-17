import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { NavigationProgressBar } from '@/components/NavigationProgressBar';
import { Analytics } from '@vercel/analytics/next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ukrtab.com.ua'),
  title: 'Укртаб — Виробництво магнітів, наліпок на авто та адресних табличок',
  description: 'Магазин Укртаб (Дніпро). Магнітні наліпки на авто, знаки ЗСУ, Охорона, адресні таблички на будинок, сувенірні автономери. Доставка по всій Україні.',
  keywords: 'укртаб, магнітні наліпки на авто, знаки зсу, міни небезпечно, адресні таблички, автономери на замовлення',
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
        </CartProvider>

        <GoogleAnalytics gaId={gaId} />
        <Analytics />
      </body>
    </html>
  );
}
