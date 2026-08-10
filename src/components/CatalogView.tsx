'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/types';
import { INITIAL_PRODUCTS } from '@/lib/store';

const ITEMS_PER_PAGE = 16;

export function CatalogView() {
  const [search, setSearch] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    let localCustom: Product[] = [];
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get('search'));
      try {
        const saved = localStorage.getItem('ukrtab_custom_products');
        if (saved) localCustom = JSON.parse(saved);
      } catch (e) {}
    }

    // Fetch server products API and merge with persistent local custom items
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        const serverItems = Array.isArray(data) ? data : [];
        const combined = [...localCustom, ...serverItems, ...INITIAL_PRODUCTS];
        const unique = Array.from(new Map(combined.map((p) => [p.id, p])).values());
        const clean = unique.filter(
          (p) =>
            p.name !== 'top of the top' &&
            p.name !== 'еталон краси' &&
            p.name !== 'Mavvir'
        );
        setAllProducts(clean);
      })
      .catch((e) => {
        console.error('Error fetching catalog products:', e);
        const combined = [...localCustom, ...INITIAL_PRODUCTS];
        const unique = Array.from(new Map(combined.map((p) => [p.id, p])).values());
        setAllProducts(unique);
      });
  }, []);

  // Filter products by search query if present
  let products = allProducts;
  if (search) {
    const query = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
    );
  }

  // Reset to page 1 if search filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Calculate pagination
  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const currentProducts = products.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) pages.push('...');
      
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i > 1 && i < totalPages) pages.push(i);
      }
      
      if (safeCurrentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Info */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {search ? `Пошук за запитом: "${search}"` : 'Каталог усіх товарів'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Показано <span className="font-bold text-slate-900">{totalItems > 0 ? startIndex + 1 : 0}–{endIndex}</span> з{' '}
            <span className="font-bold text-emerald-600">{totalItems}</span> позицій на Prom.ua
          </p>
        </div>

        <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 text-xs text-slate-600 font-bold self-start md:self-auto">
          Сторінка {safeCurrentPage} з {totalPages}
        </div>
      </div>

      {/* Product Grid */}
      <main>
        {totalItems === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-4">
            <p className="text-slate-400 font-medium text-sm">На жаль, товарів не знайдено</p>
            <Link
              href="/catalog"
              className="inline-block bg-slate-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-slate-800 transition"
            >
              Скинути пошук
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {currentProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center space-x-2">
          <button
            onClick={() => handlePageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center space-x-1 text-xs font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Назад</span>
          </button>

          <div className="flex items-center space-x-1">
            {getPageNumbers().map((num, idx) => {
              if (num === '...') {
                return (
                  <span key={`dots-${idx}`} className="px-2 text-slate-400 text-xs">
                    ...
                  </span>
                );
              }
              const isCurrent = num === safeCurrentPage;
              return (
                <button
                  key={`page-${num}`}
                  onClick={() => handlePageChange(Number(num))}
                  className={`w-9 h-9 rounded-xl font-bold text-xs transition ${
                    isCurrent
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-105'
                      : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage === totalPages}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center space-x-1 text-xs font-bold"
          >
            <span className="hidden sm:inline">Вперед</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
