'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search, X, Package, ChevronDown, Filter } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { Product, Category } from '@/lib/types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '@/lib/store';
import { searchProducts } from '@/lib/search';
import { getCategoryTree } from '@/lib/categories';
import { trackViewItemList } from '@/lib/analytics';

const ITEMS_PER_PAGE = 16;

export function CatalogView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawSearch = searchParams.get('search') || '';
  const selectedCategorySlug = searchParams.get('category') || '';

  const [searchInput, setSearchInput] = useState(rawSearch);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [currentProducts, setCurrentProducts] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Keep local search input synced with URL search parameter
  useEffect(() => {
    setSearchInput(rawSearch);
    setCurrentPage(1);
  }, [rawSearch, selectedCategorySlug]);

  useEffect(() => {
    // Fetch categories directly from DB API
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  // Server-side paginated query for products
  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(currentPage));
    params.set('limit', String(ITEMS_PER_PAGE));
    params.set('paginated', 'true');
    if (selectedCategorySlug) params.set('category', selectedCategorySlug);
    if (rawSearch.trim()) params.set('search', rawSearch.trim());

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.items)) {
          const clean = data.items.filter(
            (p: Product) =>
              p &&
              p.name &&
              p.name !== 'top of the top' &&
              p.name !== 'еталон краси' &&
              p.name !== 'Mavvir'
          );
          setCurrentProducts(clean);
          setTotalItems(data.total || clean.length);
          setTotalPages(data.totalPages || 1);
        } else if (Array.isArray(data)) {
          const clean = data.filter(
            (p: Product) =>
              p &&
              p.name &&
              p.name !== 'top of the top' &&
              p.name !== 'еталон краси' &&
              p.name !== 'Mavvir'
          );
          const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
          setCurrentProducts(clean.slice(startIndex, startIndex + ITEMS_PER_PAGE));
          setTotalItems(clean.length);
          setTotalPages(Math.ceil(clean.length / ITEMS_PER_PAGE) || 1);
        }
      })
      .catch((e) => {
        console.error('Error fetching catalog products from DB:', e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedCategorySlug, rawSearch, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput.trim()) params.set('search', searchInput.trim());
    if (selectedCategorySlug) params.set('category', selectedCategorySlug);
    router.push(`/catalog${params.toString() ? '?' + params.toString() : ''}`);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    const params = new URLSearchParams();
    if (selectedCategorySlug) params.set('category', selectedCategorySlug);
    router.push(`/catalog${params.toString() ? '?' + params.toString() : ''}`);
  };

  const handleSelectCategory = (slug: string) => {
    const params = new URLSearchParams();
    if (rawSearch) params.set('search', rawSearch);
    if (slug) params.set('category', slug);
    router.push(`/catalog${params.toString() ? '?' + params.toString() : ''}`);
  };

  const toggleCategoryExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Find active category or subcategory
  const activeCategory = categories.find((c) => c.slug === selectedCategorySlug);
  
  const categoryTree = getCategoryTree(categories);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  useEffect(() => {
    if (currentProducts.length > 0) {
      trackViewItemList(currentProducts, activeCategory ? activeCategory.name : 'Каталог товарів');
    }
  }, [currentProducts, activeCategory]);

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

          {(rawSearch || selectedCategorySlug) && (
            <div className="text-xs text-slate-500 font-bold bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 shrink-0">
              Усього знайдено: <span className="text-emerald-600 font-extrabold text-sm">{totalItems}</span> товарів
            </div>
          )}
        </div>

        {/* Active Search & Category Filter Pills */}
        {(rawSearch || selectedCategorySlug) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="text-slate-500 font-medium">Активні фільтри:</span>
            {selectedCategorySlug && (
              <Link
                href={rawSearch ? `/catalog?search=${encodeURIComponent(rawSearch)}` : '/catalog'}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-full flex items-center space-x-2 transition cursor-pointer shadow-sm"
                title="Скинути категорію"
              >
                <span>Категорія: {activeCategory ? activeCategory.name : selectedCategorySlug}</span>
                <X className="w-3.5 h-3.5 ml-1 inline-block" />
              </Link>
            )}
            {rawSearch && (
              <Link
                href={selectedCategorySlug ? `/catalog?category=${encodeURIComponent(selectedCategorySlug)}` : '/catalog'}
                className="bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-full flex items-center space-x-2 transition cursor-pointer shadow-sm"
                title="Скинути пошук"
              >
                <span>Пошук: "{rawSearch}"</span>
                <X className="w-3.5 h-3.5 ml-1 inline-block text-emerald-700" />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Main Content Layout with Sidebar Categories & Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <aside className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 text-slate-900 font-black text-sm">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Категорії товарів</span>
            </div>

            <div className="space-y-1 text-xs font-semibold">
              <button
                onClick={() => handleSelectCategory('')}
                className={`w-full text-left px-3.5 py-2 rounded-xl transition flex items-center justify-between ${
                  !selectedCategorySlug
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>Усі товари</span>
                <span className="text-[10px] opacity-75">{totalItems}</span>
              </button>

              {categoryTree.map((mainCat) => {
                const isMainSelected = selectedCategorySlug === mainCat.slug;
                const hasChildren = mainCat.children && mainCat.children.length > 0;
                const isExplicitlyCollapsed = expandedCategories[mainCat.id] === false;
                const isExpanded = hasChildren && !isExplicitlyCollapsed;

                return (
                  <div key={mainCat.id} className="space-y-1">
                    <div
                      onClick={() => handleSelectCategory(mainCat.slug)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center justify-between cursor-pointer group ${
                        isMainSelected
                          ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                          : 'text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <span className="line-clamp-1">{mainCat.name}</span>
                      {hasChildren && (
                        <button
                          type="button"
                          onClick={(e) => toggleCategoryExpand(mainCat.id, e)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                        >
                          <ChevronDown
                            className={`w-3.5 h-3.5 transform transition-transform ${
                              isExpanded ? 'rotate-180 text-emerald-600' : ''
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Subcategories List */}
                    {hasChildren && isExpanded && (
                      <div className="pl-4 space-y-1 border-l-2 border-slate-100 ml-3 my-1">
                        {mainCat.children!.map((subCat) => {
                          const isSubSelected = selectedCategorySlug === subCat.slug;
                          return (
                            <button
                              key={subCat.id}
                              onClick={() => handleSelectCategory(subCat.slug)}
                              className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] transition block ${
                                isSubSelected
                                  ? 'bg-emerald-600 text-white font-bold'
                                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                              }`}
                            >
                              {subCat.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Product Grid Container */}
        <div className="lg:col-span-3 space-y-6">
          {currentProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
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
                  Спробуйте змінити обрану категорію або очистити фільтри пошуку.
                </p>
              </div>
              <button
                onClick={() => {
                  handleClearSearch();
                  handleSelectCategory('');
                }}
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
      </div>
    </div>
  );
}
