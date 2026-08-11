'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search, X, Package } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/types';
import { INITIAL_PRODUCTS } from '@/lib/store';
import { searchProducts } from '@/lib/search';

const ITEMS_PER_PAGE = 16;

export function CatalogView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawSearch = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(rawSearch);
  const [allProducts, setAllProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Keep local search input synced with URL search parameter
  useEffect(() => {
    setSearchInput(rawSearch);
    setCurrentPage(1);
  }, [rawSearch]);

  useEffect(() => {
    // Fetch products from database API or fallback to INITIAL_PRODUCTS
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        const serverItems = Array.isArray(data) && data.length > 0 ? data : INITIAL_PRODUCTS;
        const map = new Map<string, Product>();
        serverItems.forEach((p) => {
          if (!p || !p.name) return;
          const key = p.name.trim().toLowerCase();
          if (!map.has(key) && !map.has(p.id)) {
            map.set(key, p);
          }
        });
        const unique = Array.from(map.values());
        const clean = unique.filter(
          (p) =>
            p.name !== 'top of the top' &&
            p.name !== 'еталон краси' &&
            p.name !== 'Mavvir'
        );
        if (clean.length > 0) {
          setAllProducts(clean);
        }
      })
      .catch((e) => {
        console.error('Error fetching catalog products:', e);
      });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchInput.trim())}`);
    } else {
      router.push('/catalog');
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    router.push('/catalog');
  };

  // Filter products using smart tokenized search
  const filteredProducts = rawSearch ? searchProducts(allProducts, rawSearch) : allProducts;

  // Calculate pagination
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

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
      for (let i = start; i <= end; i++) pages.push(i);
      if (safeCurrentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Search Bar Banner */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Каталог товарів UKRTAB
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Вінілові магніти, знаки ЗСУ, автономери та адресні таблички від виробника.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-bold bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 shrink-0">
            Усього знайдено: <span className="text-emerald-600 font-extrabold text-sm">{totalItems}</span> товарів
          </div>
        </div>

        {/* Catalog In-Page Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            placeholder="Пошук у каталозі (наприклад: ЗСУ, шеврон, адресна табличка, автономери)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-11 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />

          <div className="absolute right-2 flex items-center space-x-1">
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
                title="Очистити"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm"
            >
              Шукати
            </button>
          </div>
        </form>

        {/* Active Search Filter Pill */}
        {rawSearch && (
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="text-slate-500 font-medium">Результати за запитом:</span>
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold px-3 py-1 rounded-full flex items-center space-x-2">
              <span>"{rawSearch}"</span>
              <button
                onClick={handleClearSearch}
                className="hover:text-red-600 font-bold ml-1"
                title="Скинути фільтр"
              >
                ✕
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Product Grid */}
      {currentProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {currentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">За запитом нічого не знайдено</h3>
            <p className="text-xs text-slate-500">
              Спробуйте змінити пошуковий запит або переглянути всі товари каталогу.
            </p>
          </div>
          <button
            onClick={handleClearSearch}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition inline-block shadow-md shadow-emerald-600/20"
          >
            Показати всі товари
          </button>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <button
            onClick={() => handlePageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            title="Попередня сторінка"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1.5 text-xs font-bold">
            {getPageNumbers().map((num, i) =>
              typeof num === 'number' ? (
                <button
                  key={i}
                  onClick={() => handlePageChange(num)}
                  className={`w-9 h-9 rounded-xl transition flex items-center justify-center ${
                    num === safeCurrentPage
                      ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/20'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {num}
                </button>
              ) : (
                <span key={i} className="px-2 text-slate-400">
                  ...
                </span>
              )
            )}
          </div>

          <button
            onClick={() => handlePageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage === totalPages}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            title="Наступна сторінка"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
