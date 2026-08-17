import React, { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Product, Category } from '@/lib/types';
import { INITIAL_CATEGORIES } from '@/lib/store';
import { getCategorySeo, SEO_CATEGORIES } from '@/lib/seoData';
import { ProductCard } from '@/components/ProductCard';
import {
  BreadcrumbJsonLd,
  ItemListJsonLd,
  FaqJsonLd,
} from '@/components/JsonLd';
import {
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const categorySlug = decodeURIComponent(resolved.category || '');
  const seo = getCategorySeo(categorySlug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ukrtab.com.ua';
  const canonicalUrl = `${siteUrl}/catalog/${categorySlug}`;

  if (!seo) {
    return {
      title: 'Каталог товарів | Укртаб',
      description: 'Каталог продукції від виробника Укртаб (Дніпро). Магнітні наліпки на авто, адресні таблички, сувенірні номери.',
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  return {
    title: seo.title,
    description: seo.metaDescription,
    keywords: [seo.primaryQuery, ...seo.additionalQueries].join(', '),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seo.title,
      description: seo.metaDescription,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Ukrtab',
      locale: 'uk_UA',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.metaDescription,
    },
  };
}

export default async function CategoryLandingPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const resolved = await params;
  const categorySlug = decodeURIComponent(resolved.category || '');
  const seo = getCategorySeo(categorySlug);

  let products: Product[] = [];
  let totalItems = 0;

  try {
    // Look up category in database
    const dbCategory = await prisma.category.findFirst({
      where: {
        OR: [{ slug: categorySlug }, { id: categorySlug }],
      },
    });

    const where: any = {};
    if (dbCategory) {
      where.OR = [{ categoryId: dbCategory.id }, { categoryId: dbCategory.slug }];
    } else if (seo) {
      // Fallback search by keywords in category name / description
      where.OR = [
        { name: { contains: seo.primaryQuery, mode: 'insensitive' } },
        { description: { contains: seo.primaryQuery, mode: 'insensitive' } },
        ...seo.additionalQueries.slice(0, 3).map((q) => ({
          name: { contains: q, mode: 'insensitive' },
        })),
      ];
    } else {
      where.categoryId = categorySlug;
    }

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take: 36,
      }),
    ]);

    totalItems = total;
    products = JSON.parse(JSON.stringify(items));

    // If query was too restrictive and returned 0, fetch featured products
    if (products.length === 0) {
      const fallbackItems = await prisma.product.findMany({
        include: { category: true },
        orderBy: { isFeatured: 'desc' },
        take: 24,
      });
      products = JSON.parse(JSON.stringify(fallbackItems));
      totalItems = products.length;
    }
  } catch (error) {
    console.error('Error loading category SSR products:', error);
  }

  const categoryName = seo?.name || 'Товари категорії';
  const h1Title = seo?.h1 || categoryName;

  const breadcrumbs = [
    { name: 'Каталог', url: '/catalog' },
    { name: categoryName, url: `/catalog/${categorySlug}` },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* JSON-LD Structured Data for Google Rich Snippets & Carousel */}
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ItemListJsonLd name={categoryName} description={seo?.metaDescription} items={products} />
      {seo?.faqs && <FaqJsonLd faqs={seo.faqs} />}

      {/* Breadcrumb Bar */}
      <nav aria-label="Хлібні крихти" className="flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-emerald-600 transition">
          Головна
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/catalog" className="hover:text-emerald-600 transition">
          Каталог
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-bold text-slate-900">{categoryName}</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
          <ShieldCheck className="w-4 h-4" />
          <span>Власне виробництво UKRTAB • Доставка по Україні 1-2 дні</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
          {h1Title}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          {seo?.introText || 'Широкий асортимент якісної продукції від виробника Укртаб. Виготовлення за 1-2 дні з доставкою по всій Україні.'}
        </p>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <Link
          href="/catalog"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition shrink-0"
        >
          Всі товари
        </Link>
        {Object.entries(SEO_CATEGORIES).map(([key, cat]) => (
          <Link
            key={key}
            href={`/catalog/${key}`}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              key === categorySlug
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Product Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">
            Товари у наявності ({totalItems})
          </h2>
          <Link
            href="/constructor"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Створити свій дизайн</span>
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 space-y-3">
            <p className="text-sm font-bold text-slate-700">За цією категорією наразі готуються нові моделі</p>
            <p className="text-xs text-slate-500">Зателефонуйте нам для індивідуального розрахунку та виготовлення!</p>
            <Link
              href="/catalog"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
            >
              Переглянути всі товари
            </Link>
          </div>
        )}
      </section>

      {/* SEO Description & Key Advantages Article */}
      {seo && (
        <article className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Особливості та переваги продукції {seo.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {seo.bodyText}
            </p>
          </div>

          {seo.bulletPoints && seo.bulletPoints.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {seo.bulletPoints.map((point, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold text-slate-800 leading-relaxed">
                    {point}
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>
      )}

      {/* FAQ Accordion Section for Google Expandable Snippets */}
      {seo?.faqs && seo.faqs.length > 0 && (
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Часті запитання про {seo.name}
              </h2>
              <p className="text-xs text-slate-500">Відповіді на популярні запитання наших клієнтів</p>
            </div>
          </div>

          <div className="space-y-4">
            {seo.faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group border border-slate-200 rounded-2xl p-4 transition-all duration-200 open:border-emerald-500 open:bg-emerald-50/20"
              >
                <summary className="font-bold text-xs sm:text-sm text-slate-900 cursor-pointer list-none flex items-center justify-between">
                  <span>{faq.question}</span>
                  <span className="text-emerald-600 font-bold transition-transform duration-200 group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Individual Order Callout */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-black">Потрібен індивідуальний розмір або власний макет?</h3>
          <p className="text-xs text-slate-300">
            Ми безкоштовно підготуємо макет для друку, нанесемо ваш логотип чи позивний та виготовимо замовлення за 1-2 дні!
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 shrink-0">
          <a
            href="tel:+380664418050"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-lg shadow-emerald-600/30 flex items-center space-x-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>+380 (66) 441-80-50</span>
          </a>
          <Link
            href="/contacts"
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl text-xs transition backdrop-blur-md"
          >
            Контакти та адреса
          </Link>
        </div>
      </div>
    </div>
  );
}
