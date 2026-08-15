import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductDetailView } from '@/components/ProductDetailView';
import { Product } from '@/lib/types';
import type { Metadata } from 'next';

export const revalidate = 120;

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      take: 40,
      select: { slug: true, id: true },
      orderBy: { createdAt: 'desc' },
    });

    const params: { id: string }[] = [];
    products.forEach((p) => {
      if (p.slug) params.push({ id: p.slug });
      if (p.id && p.id !== p.slug) params.push({ id: p.id });
    });
    return params;
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const targetId = decodeURIComponent(resolved.id || '');

  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug: targetId }, { id: targetId }],
      },
    });

    if (!product) {
      return {
        title: 'Товар не знайдено | Укртаб',
      };
    }

    const description = product.description
      ? product.description.slice(0, 160)
      : `Купити ${product.name} за ціною ${product.price} ₴ від виробника Укртаб. Доставка по Україні Новою Поштою.`;

    return {
      title: `${product.name} — купити в Україні за ціною ${product.price} ₴ | Укртаб`,
      description,
      openGraph: {
        title: `${product.name} | Укртаб`,
        description,
        images: product.image ? [{ url: product.image }] : [],
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

  return <ProductDetailView product={product} />;
}
