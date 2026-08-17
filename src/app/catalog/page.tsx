import React, { Suspense } from 'react';
import { CatalogView } from '@/components/CatalogView';
import { prisma } from '@/lib/prisma';
import { INITIAL_CATEGORIES } from '@/lib/store';
import { Product, Category } from '@/lib/types';
import { getCategorySeo } from '@/lib/seoData';
import { BreadcrumbJsonLd, ItemListJsonLd } from '@/components/JsonLd';
import type { Metadata } from 'next';

// Catalog uses dynamic searchParams and should render on-demand without ISR Data Cache writes
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const selectedCategorySlug = typeof resolvedParams.category === 'string' ? resolvedParams.category.trim() : '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ukrtab.com.ua';

  if (selectedCategorySlug) {
    const seo = getCategorySeo(selectedCategorySlug);
    if (seo) {
      return {
        title: seo.title,
        description: seo.metaDescription,
        keywords: [seo.primaryQuery, ...seo.additionalQueries].join(', '),
        alternates: {
          canonical: `${siteUrl}/catalog/${seo.slug}`,
        },
        openGraph: {
          title: seo.title,
          description: seo.metaDescription,
          url: `${siteUrl}/catalog/${seo.slug}`,
          type: 'website',
          siteName: 'Ukrtab',
        },
      };
    }
  }

  return {
    title: 'Каталог товарів — Магніти на авто, сувенірні номери, адресні таблички | Укртаб',
    description: 'Повний каталог продукції Укртаб (Дніпро): магнітні наліпки на авто, адресні таблички, попереджувальні знаки, автономери на замовлення. Доставка по Україні.',
    alternates: {
      canonical: `${siteUrl}/catalog`,
    },
    openGraph: {
      title: 'Каталог товарів | Укртаб',
      description: 'Повний каталог магнітів на авто, знаків ЗСУ, номерів та табличок від виробника Укртаб.',
      url: `${siteUrl}/catalog`,
      type: 'website',
      siteName: 'Ukrtab',
    },
  };
}

const ITEMS_PER_PAGE = 18;
const INITIAL_CHUNK_SIZE = 9;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const rawSearch = typeof resolvedParams.search === 'string' ? resolvedParams.search.trim() : '';
  const selectedCategorySlug = typeof resolvedParams.category === 'string' ? resolvedParams.category.trim() : '';
  const pageParam = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page, 10) : 1;
  const currentPage = Math.max(1, isNaN(pageParam) ? 1 : pageParam);
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  let categories: Category[] = INITIAL_CATEGORIES;
  let products: Product[] = [];
  let totalItems = 0;
  let totalPages = 1;

  try {
    // 1. Fetch categories
    const dbCategories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    if (dbCategories && dbCategories.length > 0) {
      categories = JSON.parse(JSON.stringify(dbCategories));
    }

    // 2. Build where clause
    const where: any = {};

    if (selectedCategorySlug) {
      const category = await prisma.category.findFirst({
        where: {
          OR: [{ slug: selectedCategorySlug }, { id: selectedCategorySlug }],
        },
      });
      if (category) {
        where.OR = [{ categoryId: category.id }, { categoryId: category.slug }];
      } else {
        where.categoryId = selectedCategorySlug;
      }
    }

    if (rawSearch) {
      where.OR = [
        { name: { contains: rawSearch, mode: 'insensitive' } },
        { description: { contains: rawSearch, mode: 'insensitive' } },
        { sku: { contains: rawSearch, mode: 'insensitive' } },
      ];
    }

    // 3. Fast initial fetch: only fetch 9 items on SSR for speed
    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: INITIAL_CHUNK_SIZE,
      }),
    ]);

    totalItems = total;
    totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;
    products = JSON.parse(JSON.stringify(items));
  } catch (error) {
    console.error('Error in CatalogPage SSR fetch:', error);
  }

  const breadcrumbs = [
    { name: 'Каталог товарів', url: '/catalog' },
    ...(selectedCategorySlug ? [{ name: selectedCategorySlug, url: `/catalog?category=${selectedCategorySlug}` }] : []),
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ItemListJsonLd
        name="Каталог продукції Укртаб"
        description="Магнітні наліпки, таблички та автономери"
        items={products}
      />
      <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400 font-bold">Завантаження каталогу...</div>}>
        <CatalogView
          initialProducts={products}
          initialCategories={categories}
          initialTotal={totalItems}
          initialTotalPages={totalPages}
          initialPage={currentPage}
          initialCategorySlug={selectedCategorySlug}
          initialSearch={rawSearch}
        />
      </Suspense>
    </>
  );
}
