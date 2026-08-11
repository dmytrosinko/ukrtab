import Link from 'next/link';
import { BannerSlider } from '@/components/BannerSlider';
import { ProductCard } from '@/components/ProductCard';
import { PartnersSection } from '@/components/PartnersSection';
import { ShieldCheck, Truck, Clock, ThumbsUp, ArrowRight } from 'lucide-react';
import { Product, Banner } from '@/lib/types';

import { INITIAL_PRODUCTS } from '@/lib/store';

export const revalidate = 60;

const FALLBACK_BANNERS = [
  {
    id: 'b1',
    title: 'Виготовлення магнітних наліпок на авто будь-якої складності',
    image: 'https://images.prom.ua/6956069219_6956069219.jpg',
    linkUrl: '/catalog',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'b2',
    title: 'Патріотична продукція ЗСУ та військова символіка',
    image: 'https://images.prom.ua/6956070005_6956070005.jpg',
    linkUrl: '/catalog',
    sortOrder: 2,
    isActive: true,
  },
];

const FALLBACK_PRODUCTS: any[] = INITIAL_PRODUCTS.slice(0, 8);

export default async function HomePage() {
  let banners: any[] = FALLBACK_BANNERS;
  let products: any[] = FALLBACK_PRODUCTS;

  if (!process.env.VERCEL) {
    try {
      const { prisma } = await import('@/lib/prisma');
      const [b, p] = await Promise.all([
        prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
        prisma.product.findMany({ where: { isFeatured: true }, take: 12 }),
      ]);
      if (b && b.length > 0) banners = b;
      if (p && p.length > 0) products = p;
    } catch (e) {
      console.error('Prisma homepage fetch failed, using fallback data:', e);
    }
  }

  const safeBanners: Banner[] = JSON.parse(JSON.stringify(banners));
  const safeProducts: Product[] = JSON.parse(JSON.stringify(products));

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner Slider */}
      <BannerSlider banners={safeBanners} />

      {/* Trust Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Швидка доставка</h4>
            <p className="text-[11px] text-slate-500">Нова Пошта & Укрпошта</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Виготовлення 1-2 дні</h4>
            <p className="text-[11px] text-slate-500">Власне виробництво</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">553+ відгуків</h4>
            <p className="text-[11px] text-slate-500">99% позитивних оцінок</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Гарантія якості</h4>
            <p className="text-[11px] text-slate-500">УФ-стійкий друк</p>
          </div>
        </div>
      </div>

      {/* Top Products Gallery */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Вітрина популярних товарів
            </h2>
            <p className="text-xs text-slate-500">Найпопулярніші магнітні наліпки та знаки UKRTAB</p>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>Дивитися всі товари</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {safeProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Partners Section "Нам довіряють" */}
      <PartnersSection />

      {/* Custom Order Callout */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <h3 className="text-2xl font-black">Потрібен свій макет або індивідуальний розмір?</h3>
          <p className="text-xs text-slate-300">
            Ми виготовляємо сувенірні магніти, автономери та адресні таблички за індивідуальними макетами клієнтів. Зв’яжіться з нашим менеджером!
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 shrink-0">
          <a
            href="tel:+380664418050"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-lg shadow-emerald-600/30"
          >
            📞 +380 (66) 441-80-50
          </a>
          <Link
            href="/contacts"
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl text-xs transition backdrop-blur-md"
          >
            Наші контакти
          </Link>
        </div>
      </div>
    </div>
  );
}
