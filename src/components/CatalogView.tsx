'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/types';
import { INITIAL_PRODUCTS } from '@/lib/store';

export function CatalogView() {
  const [search, setSearch] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get('search'));

      // Merge custom created products from localStorage
      try {
        const saved = localStorage.getItem('ukrtab_custom_products');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const combined = [...parsed, ...INITIAL_PRODUCTS];
            const unique = Array.from(new Map(combined.map((p) => [p.id, p])).values());
            setAllProducts(unique);
          }
        }
      } catch (e) {
        console.error('Error loading custom products:', e);
      }
    }
  }, []);

  let products = allProducts;

  if (search) {
    const query = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query))
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {search ? `Пошук за запитом: "${search}"` : 'Каталог усіх товарів'}
        </h1>
        <p className="text-xs text-slate-500">
          Знайдено позицій у каталозі: <span className="font-bold text-emerald-600">{products.length}</span>
        </p>
      </div>

      {/* Full-width Product Grid */}
      <main>
        {products.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-3">
            <p className="text-slate-400 font-medium text-sm">На жаль, товарів не знайдено</p>
            <Link
              href="/catalog"
              className="inline-block bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs"
            >
              Скинути пошук
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
