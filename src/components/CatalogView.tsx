'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search, X, Package, ChevronDown, Filter } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { Product, Category } from '@/lib/types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '@/lib/store';
import { searchProducts } from '@/lib/search';
import { getCategoryTree, getCategoryIcon } from '@/lib/categories';
import { trackViewItemList } from '@/lib/analytics';

const ITEMS_PER_PAGE = 18;
const INITIAL_CHUNK_SIZE = 9;

// In-memory LRU client cache for instant 0ms category switching
const catalogMemoryCache = new Map<string, { items: Product[]; total: number; totalPages: number }>();

interface CatalogViewProps {
  initialProducts?: Product[];
  initialCategories?: Category[];
  initialTotal?: number;
  initialTotalPages?: number;
  initialPage?: number;
  initialCategorySlug?: string;
  initialSearch?: string;
}

export function CatalogView({
  initialProducts = [],
  initialCategories = INITIAL_CATEGORIES,
  initialTotal = 0,
  initialTotalPages = 1,
  initialPage = 1,
  initialCategorySlug = '',
  initialSearch = '',
}: CatalogViewProps) {
  const searchParams = useSearchParams();
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(
    searchParams.get('category') ?? initialCategorySlug
  );
  const [rawSearch, setRawSearch] = useState(
    searchParams.get('search') ?? initialSearch
  );
  const [searchInput, setSearchInput] = useState(rawSearch);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [currentProducts, setCurrentProducts] = useState<Product[]>(initialProducts);
  const [totalItems, setTotalItems] = useState<number>(initialTotal || initialProducts.length);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages || 1);
  const [currentPage, setCurrentPage] = useState<number>(initialPage || 1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isFirstMount = React.useRef(true);

  // Cache initial server products
  useEffect(() => {
    const initialKey = `${initialCategorySlug}:${initialSearch}:${initialPage}`;
    if (initialProducts.length > 0 && !catalogMemoryCache.has(initialKey)) {
      catalogMemoryCache.set(initialKey, {
        items: initialProducts,
        total: initialTotal || initialProducts.length,
        totalPages: initialTotalPages || 1,
      });
    }
  }, []);

  // Background hydration for the rest of initial products if only 9 were loaded on SSR
  useEffect(() => {
    if (initialProducts.length > 0 && initialProducts.length < (initialTotal || 0) && initialProducts.length <= INITIAL_CHUNK_SIZE) {
      const params = new URLSearchParams();
      params.set('page', String(initialPage));
      params.set('limit', String(ITEMS_PER_PAGE));
      params.set('paginated', 'true');
      if (initialCategorySlug) params.set('category', initialCategorySlug);
      if (initialSearch.trim()) params.set('search', initialSearch.trim());

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
            const key = `${initialCategorySlug}:${initialSearch}:${initialPage}`;
            catalogMemoryCache.set(key, {
              items: clean,
              total: data.total || clean.length,
              totalPages: data.totalPages || 1,
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  // Sync state if browser back/forward or external navigation occurs
  useEffect(() => {
    const urlCategory = searchParams.get('category') ?? '';
    const urlSearch = searchParams.get('search') ?? '';
    if (urlCategory !== selectedCategorySlug) {
      setSelectedCategorySlug(urlCategory);
    }
    if (urlSearch !== rawSearch) {
      setRawSearch(urlSearch);
      setSearchInput(urlSearch);
    }
  }, [searchParams]);

  // Client-side query when user filters or changes page (skip on first mount)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const cacheKey = `${selectedCategorySlug}:${rawSearch}:${currentPage}`;
    if (catalogMemoryCache.has(cacheKey)) {
      const cached = catalogMemoryCache.get(cacheKey)!;
      setCurrentProducts(cached.items);
      setTotalItems(cached.total);
      setTotalPages(cached.totalPages);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Step 1: Fast fetch first 9 items
    const fastParams = new URLSearchParams();
    fastParams.set('page', String(currentPage));
    fastParams.set('limit', String(INITIAL_CHUNK_SIZE));
    fastParams.set('paginated', 'true');
    if (selectedCategorySlug) fastParams.set('category', selectedCategorySlug);
    if (rawSearch.trim()) fastParams.set('search', rawSearch.trim());

    fetch(`/api/products?${fastParams.toString()}`)
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
          setTotalPages(Math.ceil((data.total || clean.length) / ITEMS_PER_PAGE) || 1);
          setIsLoading(false);

          // Step 2: Background hydration of full page batch (18 items) if more available
          if ((data.total || clean.length) > INITIAL_CHUNK_SIZE) {
            const fullParams = new URLSearchParams();
            fullParams.set('page', String(currentPage));
            fullParams.set('limit', String(ITEMS_PER_PAGE));
            fullParams.set('paginated', 'true');
            if (selectedCategorySlug) fullParams.set('category', selectedCategorySlug);
            if (rawSearch.trim()) fullParams.set('search', rawSearch.trim());

            fetch(`/api/products?${fullParams.toString()}`)
              .then((res) => res.json())
              .then((fullData) => {
                if (fullData && Array.isArray(fullData.items)) {
                  const fullClean = fullData.items.filter(
                    (p: Product) =>
                      p &&
                      p.name &&
                      p.name !== 'top of the top' &&
                      p.name !== 'еталон краси' &&
                      p.name !== 'Mavvir'
                  );
                  setCurrentProducts(fullClean);
                  catalogMemoryCache.set(cacheKey, {
                    items: fullClean,
                    total: fullData.total || fullClean.length,
                    totalPages: Math.ceil((fullData.total || fullClean.length) / ITEMS_PER_PAGE) || 1,
                  });
                }
              })
              .catch(() => {});
          } else {
            catalogMemoryCache.set(cacheKey, {
              items: clean,
              total: data.total || clean.length,
              totalPages: 1,
            });
          }
        }
      })
      .catch((e) => {
        console.error('Error fetching catalog products from DB:', e);
        setIsLoading(false);
      });
  }, [selectedCategorySlug, rawSearch, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    setRawSearch(q);
    setCurrentPage(1);
    setIsLoading(true);

    const params = new URLSearchParams();
    if (q) params.set('search', q);
    if (selectedCategorySlug) params.set('category', selectedCategorySlug);
    const newUrl = `/catalog${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState(null, '', newUrl);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setRawSearch('');
    setCurrentPage(1);
    setIsLoading(true);

    const params = new URLSearchParams();
    if (selectedCategorySlug) params.set('category', selectedCategorySlug);
    const newUrl = `/catalog${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState(null, '', newUrl);
  };

  const handleSelectCategory = (slug: string) => {
    setSelectedCategorySlug(slug);
    setCurrentPage(1);
    setIsLoading(true);

    const params = new URLSearchParams();
    if (rawSearch) params.set('search', rawSearch);
    if (slug) params.set('category', slug);
    const newUrl = `/catalog${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState(null, '', newUrl);
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
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center justify-between ${
                  !selectedCategorySlug
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>📦</span>
                  <span>Усі товари</span>
                </span>
                <span className="text-[10px] opacity-75">{totalItems}</span>
              </button>

              {categoryTree.map((mainCat) => {
                const isMainSelected = selectedCategorySlug === mainCat.slug;
                const hasChildren = Boolean(mainCat.children && mainCat.children.length > 0);
                const isAnyChildSelected = Boolean(
                  hasChildren && mainCat.children!.some((c) => c.slug === selectedCategorySlug)
                );
                const isExplicitlyCollapsed = expandedCategories[mainCat.id] === false;
                // Auto-expand if child is selected, otherwise default expanded unless toggled off
                const isExpanded = hasChildren && (isAnyChildSelected || !isExplicitlyCollapsed);
                const icon = getCategoryIcon(mainCat.slug);

                return (
                  <div key={mainCat.id} className="space-y-1">
                    <div
                      onClick={() => handleSelectCategory(mainCat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between cursor-pointer group ${
                        isMainSelected
                          ? 'bg-emerald-50 text-emerald-700 font-black border border-emerald-200'
                          : isAnyChildSelected
                          ? 'text-emerald-700 font-bold bg-slate-50/80'
                          : 'text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center space-x-2 min-w-0 pr-1">
                        <span className="shrink-0 text-sm">{icon}</span>
                        <span className="truncate">{mainCat.name}</span>
                      </span>

                      {hasChildren && (
                        <button
                          type="button"
                          onClick={(e) => toggleCategoryExpand(mainCat.id, e)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition shrink-0"
                          title={isExpanded ? 'Згорнути підкатегорії' : 'Розгорнути підкатегорії'}
                        >
                          <ChevronDown
                            className={`w-3.5 h-3.5 transform transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-emerald-600' : ''
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Subcategories List */}
                    {hasChildren && isExpanded && (
                      <div className="pl-4 space-y-1 border-l-2 border-slate-100 ml-4 my-1">
                        {mainCat.children!.map((subCat) => {
                          const isSubSelected = selectedCategorySlug === subCat.slug;
                          return (
                            <button
                              key={subCat.id}
                              onClick={() => handleSelectCategory(subCat.slug)}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] transition block ${
                                isSubSelected
                                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                              }`}
                            >
                              • {subCat.name}
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
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="aspect-square bg-slate-100 relative" />
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="h-2.5 w-16 bg-slate-100 rounded-md" />
                      <div className="h-4 w-full bg-slate-200 rounded-md" />
                      <div className="h-4 w-3/4 bg-slate-200 rounded-md" />
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="h-6 w-20 bg-slate-200 rounded-lg" />
                      <div className="h-9 w-20 bg-emerald-100 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : currentProducts.length > 0 ? (
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
