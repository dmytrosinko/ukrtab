import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailClient } from './ProductDetailClient';
import { Product } from '@/lib/types';
import { ShieldCheck, Truck, Clock } from 'lucide-react';
import { INITIAL_PRODUCTS } from '@/lib/store';

export const revalidate = 60;

export default async function ProductDetailPage({
  params,
}: {
  params?: Promise<{ id: string }> | { id: string };
}) {
  let id = '';
  try {
    const resolved = params instanceof Promise ? await params : (params || { id: '' });
    id = resolved.id || '';
  } catch (e) {
    id = '';
  }

  let product: any = null;
  let relatedProducts: any[] = [];

  // Try store first for 100% fail-safe Vercel serverless execution
  product = INITIAL_PRODUCTS.find((p) => p.id === id || p.slug === id);

  if (!product && !process.env.VERCEL) {
    try {
      const { prisma } = await import('@/lib/prisma');
      product = await prisma.product.findFirst({
        where: { OR: [{ id }, { slug: id }] },
        include: { category: true },
      });
    } catch (e) {
      console.error('Prisma query failed on product detail:', e);
    }
  }

  if (!product) {
    product = INITIAL_PRODUCTS[0];
  }

  // Related products from store
  relatedProducts = INITIAL_PRODUCTS.filter(
    (p) => p.id !== product.id && p.categoryId === product.categoryId
  );

  const safeProduct: Product = JSON.parse(JSON.stringify(product));
  const safeRelated: Product[] = JSON.parse(JSON.stringify(relatedProducts));

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
        {safeProduct.category && (
          <>
            <span>/</span>
            <Link
              href={`/catalog?category=${safeProduct.category.slug}`}
              className="hover:text-emerald-600"
            >
              {safeProduct.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">{safeProduct.name}</span>
      </div>

      {/* Main Detail Client Component */}
      <ProductDetailClient product={safeProduct} />

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
      {safeRelated.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h3 className="text-xl font-black text-slate-900">Схожі товари з категорії</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {safeRelated.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
