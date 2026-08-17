import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductDetailView } from '@/components/ProductDetailView';
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';
import { Product } from '@/lib/types';
import type { Metadata } from 'next';

// Cache product pages for 24h; instant updates happen on-demand via revalidatePath
export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const targetId = decodeURIComponent(resolved.id || '');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ukrtab.com.ua';

  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug: targetId }, { id: targetId }],
      },
      include: { category: true },
    });

    if (!product) {
      return {
        title: 'Товар не знайдено | Укртаб',
      };
    }

    const canonicalUrl = `${siteUrl}/product/${product.slug || product.id}`;
    const description = product.description
      ? product.description.replace(/<[^>]*>?/gm, '').slice(0, 160)
      : `Купити ${product.name} за ціною ${product.price} ₴ від виробника Укртаб. Якісний УФ-друк, магнітна основа, доставка 1-2 дні по всій Україні.`;

    const title = `${product.name} — купити в Україні за ціною ${product.price} ₴ | Укртаб`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${product.name} | Укртаб`,
        description,
        url: canonicalUrl,
        type: 'website',
        images: product.image ? [{ url: product.image, alt: product.name }] : [],
        siteName: 'Ukrtab',
        locale: 'uk_UA',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: product.image ? [product.image] : [],
      },
    };
  } catch (e) {
    return {
      title: 'Картка товару | Укртаб',
    };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = await params;
  const targetId = decodeURIComponent(resolved.id || '');

  let product: Product | null = null;

  try {
    const dbProduct = await prisma.product.findFirst({
      where: {
        OR: [{ slug: targetId }, { id: targetId }],
      },
      include: { category: true },
    });

    if (dbProduct) {
      product = JSON.parse(JSON.stringify(dbProduct));
    }
  } catch (error) {
    console.error('Error fetching product in ProductDetailPage SSR:', error);
  }

  if (!product) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 font-medium space-y-4">
        <div className="text-base font-bold text-slate-700">Товар не знайдено або він був переміщений</div>
        <div>
          <Link href="/catalog" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition">
            ← Перейти до каталогу товарів
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = product.category?.name || 'Каталог';
  const categorySlug = product.category?.slug || '';

  const breadcrumbs = [
    { name: 'Каталог', url: '/catalog' },
    ...(categorySlug ? [{ name: categoryName, url: `/catalog/${categorySlug}` }] : []),
    { name: product.name, url: `/product/${product.slug || product.id}` },
  ];

  return (
    <>
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ProductDetailView product={product} />
    </>
  );
}
