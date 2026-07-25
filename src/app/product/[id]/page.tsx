import { ProductDetailClient } from './ProductDetailClient';
import { Product } from '@/lib/types';
import { ShieldCheck, Truck, Clock } from 'lucide-react';
import { INITIAL_PRODUCTS } from '@/lib/store';

export const revalidate = 0;

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

  let product: any = INITIAL_PRODUCTS.find((p) => p.id === id || p.slug === id);

  if (!product && !process.env.VERCEL) {
    try {
      const { prisma } = await import('@/lib/prisma');
      product = await prisma.product.findFirst({
        where: { OR: [{ id }, { slug: id }] },
      });
    } catch (e) {}
  }

  const safeProduct: Product = product
    ? JSON.parse(JSON.stringify(product))
    : {
        id,
        name: 'Завантаження товару...',
        slug: id,
        price: 0,
        status: 'В наявності',
        image: '',
        description: '',
        unit: 'шт.',
      };

  return (
    <div className="space-y-8 pb-12">
      {/* Main Detail Client Component */}
      <ProductDetailClient initialProduct={safeProduct} productId={id} />

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
    </div>
  );
}
