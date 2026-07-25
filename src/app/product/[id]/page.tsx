import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailClient } from './ProductDetailClient';
import { Product } from '@/lib/types';
import { ArrowLeft, ShieldCheck, Truck, Clock } from 'lucide-react';

export const revalidate = 30;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    include: { category: true },
  });

  if (!product) {
    notFound();
  }

  // Related products
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      NOT: { id: product.id },
    },
    take: 4,
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Breadcrumbs & Back button */}
      <div className="flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-emerald-600">
          Головна
        </Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-emerald-600">
          Каталог
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/catalog/${product.category.slug}`}
              className="hover:text-emerald-600"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Detail Client Component */}
      <ProductDetailClient product={product as unknown as Product} />

      {/* Trust & Shipping info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Доставка по Україні</h4>
            <p className="text-[11px] text-slate-500">
              Нова Пошта (1-2 дні), Укрпошта або самовивіз у м. Дніпро.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Швидке виготовлення</h4>
            <p className="text-[11px] text-slate-500">
              Більшість позицій у наявності. Індивідуальні макети — 1-2 дні.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Гарантія витривалості</h4>
            <p className="text-[11px] text-slate-500">
              Стійкість до автомийок, снігу, дощу та УФ-випромінювання.
            </p>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h3 className="text-xl font-black text-slate-900">Схожі товари з категорії</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel as unknown as Product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
