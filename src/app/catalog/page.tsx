import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/types';
import { Filter, Search } from 'lucide-react';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '@/lib/store';

export const revalidate = 30;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; search?: string }>;
}) {
  let categorySlug: string | undefined;
  let search: string | undefined;

  try {
    const resolved = searchParams ? await searchParams : {};
    categorySlug = resolved.category;
    search = resolved.search;
  } catch (e) {
    categorySlug = undefined;
    search = undefined;
  }

  let categories: any[] = [];
  let products: any[] = [];

  try {
    categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });

    const where: any = {};

    if (categorySlug) {
      const activeCat = categories.find((c) => c.slug === categorySlug);
      if (activeCat) where.categoryId = activeCat.id;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch (e) {
    console.error('Prisma query failed on catalog, using fallback store:', e);
    categories = INITIAL_CATEGORIES.map((c) => ({ ...c, _count: { products: 2 } }));
    products = INITIAL_PRODUCTS;
    if (search) {
      const query = search.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(query));
    }
  }

  const activeCategoryName = categorySlug
    ? categories.find((c) => c.slug === categorySlug)?.name || 'Каталог'
    : 'Всі товари';

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {search ? `Пошук за запитом: "${search}"` : activeCategoryName}
        </h1>
        <p className="text-xs text-slate-500">
          Знайдено товарів: <span className="font-bold text-emerald-600">{products.length}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Категорії</span>
            </h3>

            <div className="space-y-1 text-xs">
              <Link
                href="/catalog"
                className={`block px-3 py-2 rounded-xl transition ${
                  !categorySlug
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Всі категорії
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/catalog?category=${cat.slug}`}
                  className={`flex justify-between items-center px-3 py-2 rounded-xl transition ${
                    categorySlug === cat.slug
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[10px] opacity-75 ml-2">({cat._count?.products || 0})</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="md:col-span-3">
          {products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Товарів не знайдено</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Спробуйте змінити фільтри або пошуковий запит
              </p>
              <Link
                href="/catalog"
                className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
              >
                Скинути фільтри
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product as unknown as Product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
