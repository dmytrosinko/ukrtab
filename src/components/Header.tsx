'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Search, 
  ShoppingCart, 
  Menu, 
  X, 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck,
  Package,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/types';
import Image from 'next/image';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, totalPrice, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCatalogOpen, setIsMobileCatalogOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);
  const [totalMatchCount, setTotalMatchCount] = useState<number>(0);
  const searchContainerRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchFocused(false);
  }, [pathname]);

  // Debounced live search API query
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query || query.length < 2) {
      setMatchedProducts([]);
      setTotalMatchCount(0);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      fetch(`/api/products?search=${encodeURIComponent(query)}&limit=5&paginated=true`)
        .then((r) => r.json())
        .then((data) => {
          if (data && Array.isArray(data.items)) {
            setMatchedProducts(data.items);
            setTotalMatchCount(data.total || data.items.length);
          } else if (Array.isArray(data)) {
            setMatchedProducts(data.slice(0, 5));
            setTotalMatchCount(data.length);
          } else {
            setMatchedProducts([]);
            setTotalMatchCount(0);
          }
        })
        .catch(() => {
          setMatchedProducts([]);
          setTotalMatchCount(0);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsMobileMenuOpen(false);
      setIsSearchFocused(false);
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isLinkActive = (path: string) => pathname === path;

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-40 border-b border-slate-100">
      {/* Top Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <a href="tel:+380664418050" className="hover:text-emerald-400 transition">+380 (66) 441-80-50</a>
              <span className="text-slate-600">|</span>
              <a href="tel:+380683677015" className="hover:text-emerald-400 transition">+380 (68) 367-70-15</a>
            </div>
            <div className="hidden md:flex items-center space-x-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Пн-Нд: 10:00 - 21:00</span>
            </div>
            <div className="hidden lg:flex items-center space-x-1.5 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>м. Запоріжжя (вул. Миру, 1г) • м. Дніпро (вул. Миру 2т)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition transform">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              УКР<span className="text-emerald-600">ТАБ</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium tracking-wide">
              Магніти • Таблички • Знаки
            </div>
          </div>
        </Link>

        {/* Search Bar */}
        <form
          ref={searchContainerRef}
          onSubmit={handleSearch}
          className="hidden sm:flex flex-1 max-w-lg relative"
        >
          <input
            type="text"
            placeholder="Шукати магнітні наліпки, знаки ЗСУ, адресні таблички..."
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchFocused(true);
            }}
            className="w-full pl-4 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-emerald-600 transition"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Instant Search Dropdown */}
          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {isSearching ? (
                <div className="p-6 text-center text-xs text-slate-400 font-medium">
                  Пошук...
                </div>
              ) : matchedProducts.length > 0 ? (
                <div>
                  <div className="p-3 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                    <span>Знайдені товари ({totalMatchCount})</span>
                    <span>Клацніть для переходу</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {matchedProducts.map((prod) => (
                      <Link
                        key={prod.id}
                        href={`/product/${prod.slug || prod.id}`}
                        onClick={() => setIsSearchFocused(false)}
                        className="flex items-center space-x-3 p-3 hover:bg-slate-50 transition group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 shrink-0 overflow-hidden p-1 relative flex items-center justify-center">
                          {prod.image ? (
                            <Image
                              src={prod.image}
                              alt={prod.name}
                              fill
                              sizes="48px"
                              className="object-contain p-0.5 group-hover:scale-110 transition duration-200"
                            />
                          ) : (
                            <span className="text-[9px] text-slate-400">Фото</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-600 transition">
                            {prod.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {prod.sku ? `Арт: ${prod.sku} • ` : ''}
                            <span className="text-emerald-600 font-bold">{prod.price} ₴</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center space-x-2 border-t border-emerald-100 transition"
                  >
                    <span>Переглянути всі {totalMatchCount} товарів</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 font-medium space-y-1">
                  <div>Нічого не знайдено за запитом "<span className="font-bold text-slate-800">{searchQuery}</span>"</div>
                  <div className="text-[11px] text-slate-400">Спробуйте змінити слово або використати коротшу фразу</div>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Cart & Constructor Buttons */}
        <div className="flex items-center space-x-3">
          <Link
            href="/constructor"
            className="hidden sm:flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-2.5 rounded-xl font-extrabold text-xs shadow-md shadow-amber-500/20 transition transform active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>🎨 Конструктор</span>
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center space-x-3 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition transform active:scale-95 shrink-0"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-[10px] uppercase tracking-wider text-emerald-100 font-medium">Кошик</div>
              <div className="text-xs font-bold">{totalPrice} ₴</div>
            </div>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-emerald-600 transition"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-slate-50 border-t border-slate-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-8 text-sm font-semibold">
          <Link
            href="/"
            className={`py-3 transition border-b-2 ${
              isLinkActive('/')
                ? 'border-emerald-600 text-emerald-600 font-bold'
                : 'border-transparent text-slate-700 hover:text-emerald-600'
            }`}
          >
            Головна
          </Link>

          {/* Catalog & Categories Megamenu Dropdown */}
          <div className="relative group py-3">
            <Link
              href="/catalog"
              className={`transition flex items-center space-x-1 ${
                isLinkActive('/catalog')
                  ? 'text-emerald-600 font-bold'
                  : 'text-slate-700 hover:text-emerald-600'
              }`}
            >
              <span>Каталог товарів</span>
              <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:rotate-180">▼</span>
            </Link>

            {/* Categories Dropdown Menu (Main Categories Only) */}
            <div className="absolute top-full left-0 hidden group-hover:grid grid-cols-2 gap-2.5 w-[560px] bg-white rounded-3xl border border-slate-200 shadow-2xl p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[85vh] overflow-y-auto">
              {/* Full Catalog Action */}
              <div className="col-span-full">
                <Link
                  href="/catalog"
                  className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-xs transition border border-emerald-100 group/all"
                >
                  <span className="flex items-center space-x-2.5">
                    <span className="text-lg">📦</span>
                    <span>Всі товари каталогу UKRTAB</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-emerald-600 group-hover/all:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Category 1 */}
              <Link
                href="/catalog/magniti-na-avto"
                className="flex items-start space-x-3 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition group/cat"
              >
                <span className="text-2xl shrink-0 mt-0.5">🚗</span>
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-slate-900 group-hover/cat:text-emerald-600 transition">
                    Магнітні наклейки на авто
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium line-clamp-1">
                    Реклама, шеврони ЗСУ, авто-магніти
                  </div>
                </div>
              </Link>

              {/* Category 2 */}
              <Link
                href="/catalog/suvenirni-avtonomera"
                className="flex items-start space-x-3 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition group/cat"
              >
                <span className="text-2xl shrink-0 mt-0.5">🚙</span>
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-slate-900 group-hover/cat:text-emerald-600 transition">
                    Сувенірні автономера
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium line-clamp-1">
                    Номери ЗСУ, для автосалонів, іменні
                  </div>
                </div>
              </Link>

              {/* Category 3 */}
              <Link
                href="/catalog/adresni-tablichki"
                className="flex items-start space-x-3 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition group/cat"
              >
                <span className="text-2xl shrink-0 mt-0.5">🏠</span>
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-slate-900 group-hover/cat:text-emerald-600 transition">
                    Адресні таблички на будинок
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium line-clamp-1">
                    Таблички на фасад будинку та паркан
                  </div>
                </div>
              </Link>

              {/* Category 4 */}
              <Link
                href="/catalog/tablichki-dlya-biznesu"
                className="flex items-start space-x-3 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition group/cat"
              >
                <span className="text-2xl shrink-0 mt-0.5">🚪</span>
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-slate-900 group-hover/cat:text-emerald-600 transition">
                    Таблички для бізнесу та дверей
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium line-clamp-1">
                    На двері, кабінети, графік роботи
                  </div>
                </div>
              </Link>

              {/* Category 5 */}
              <Link
                href="/catalog/informatsijni-tablichki"
                className="flex items-start space-x-3 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition group/cat"
              >
                <span className="text-2xl shrink-0 mt-0.5">📋</span>
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-slate-900 group-hover/cat:text-emerald-600 transition">
                    Інформаційні таблички ПВХ
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium line-clamp-1">
                    Відеоспостереження, знаки безпеки
                  </div>
                </div>
              </Link>

              {/* Category 6 */}
              <Link
                href="/catalog/ritualni-tablichki"
                className="flex items-start space-x-3 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition group/cat"
              >
                <span className="text-2xl shrink-0 mt-0.5">🪦</span>
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-slate-900 group-hover/cat:text-emerald-600 transition">
                    Ритуальні таблички
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium line-clamp-1">
                    На пам'ятник та хрест з фото
                  </div>
                </div>
              </Link>

              {/* Category 7 */}
              <Link
                href="/catalog/trafareti"
                className="flex items-start space-x-3 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition group/cat"
              >
                <span className="text-2xl shrink-0 mt-0.5">🎨</span>
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-slate-900 group-hover/cat:text-emerald-600 transition">
                    Трафарети на замовлення
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium line-clamp-1">
                    Багаторазові пластикові трафарети
                  </div>
                </div>
              </Link>

              {/* Category 8 */}
              <Link
                href="/catalog/uf-druk"
                className="flex items-start space-x-3 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition group/cat"
              >
                <span className="text-2xl shrink-0 mt-0.5">🖨️</span>
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-slate-900 group-hover/cat:text-emerald-600 transition">
                    Прямий УФ-друк
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium line-clamp-1">
                    Фотодрук на пластику та композиті
                  </div>
                </div>
              </Link>
            </div>
          </div>
          <Link
            href="/constructor"
            className={`py-3 transition border-b-2 flex items-center space-x-1 ${
              isLinkActive('/constructor')
                ? 'border-amber-500 text-amber-600 font-bold'
                : 'border-transparent text-amber-600 hover:text-amber-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Конструктор товарів</span>
          </Link>
          <Link
            href="/blog"
            className={`py-3 transition border-b-2 ${
              isLinkActive('/blog')
                ? 'border-emerald-600 text-emerald-600 font-bold'
                : 'border-transparent text-slate-700 hover:text-emerald-600'
            }`}
          >
            Статті & Блог
          </Link>
          <Link
            href="/delivery"
            className={`py-3 transition border-b-2 ${
              isLinkActive('/delivery')
                ? 'border-emerald-600 text-emerald-600 font-bold'
                : 'border-transparent text-slate-700 hover:text-emerald-600'
            }`}
          >
            Доставка та оплата
          </Link>
          <Link
            href="/about"
            className={`py-3 transition border-b-2 ${
              isLinkActive('/about')
                ? 'border-emerald-600 text-emerald-600 font-bold'
                : 'border-transparent text-slate-700 hover:text-emerald-600'
            }`}
          >
            Про нас
          </Link>
          <Link
            href="/contacts"
            className={`py-3 transition border-b-2 ${
              isLinkActive('/contacts')
                ? 'border-emerald-600 text-emerald-600 font-bold'
                : 'border-transparent text-slate-700 hover:text-emerald-600'
            }`}
          >
            Контакти
          </Link>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Пошук товарів..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-slate-400"
            >
              <Search className="w-5 h-5 text-emerald-600" />
            </button>
          </form>

          <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-800">
            <Link
              href="/"
              className={`p-2 rounded-xl transition ${
                isLinkActive('/') ? 'bg-emerald-50 text-emerald-600 font-bold' : 'hover:bg-slate-50'
              }`}
            >
              Головна
            </Link>

            {/* Mobile Catalog with Categories Toggle */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-2 space-y-2">
              <div className="flex items-center justify-between">
                <Link
                  href="/catalog"
                  className="font-bold text-slate-900 hover:text-emerald-600 flex items-center space-x-1.5 p-1"
                >
                  <span>📦 Каталог товарів (Усі)</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileCatalogOpen(!isMobileCatalogOpen)}
                  className="text-xs font-bold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition"
                >
                  {isMobileCatalogOpen ? 'Згорнути ▲' : 'Категорії ▼'}
                </button>
              </div>

              {isMobileCatalogOpen && (
                <div className="grid grid-cols-1 gap-1 pt-2 pl-1 border-t border-slate-200/70 text-xs animate-in fade-in duration-150">
                  <Link href="/catalog/magniti-na-avto" className="p-2 rounded-xl hover:bg-white flex items-center space-x-2 font-bold text-slate-800">
                    <span>🚗</span>
                    <span>Магнітні наклейки на авто</span>
                  </Link>
                  <Link href="/catalog/suvenirni-avtonomera" className="p-2 rounded-xl hover:bg-white flex items-center space-x-2 font-bold text-slate-800">
                    <span>🚙</span>
                    <span>Сувенірні автономера</span>
                  </Link>
                  <Link href="/catalog/adresni-tablichki" className="p-2 rounded-xl hover:bg-white flex items-center space-x-2 font-bold text-slate-800">
                    <span>🏠</span>
                    <span>Адресні таблички на будинок</span>
                  </Link>
                  <Link href="/catalog/tablichki-dlya-biznesu" className="p-2 rounded-xl hover:bg-white flex items-center space-x-2 font-bold text-slate-800">
                    <span>🚪</span>
                    <span>Таблички для бізнесу та дверей</span>
                  </Link>
                  <Link href="/catalog/informatsijni-tablichki" className="p-2 rounded-xl hover:bg-white flex items-center space-x-2 font-bold text-slate-800">
                    <span>📋</span>
                    <span>Інформаційні таблички ПВХ</span>
                  </Link>
                  <Link href="/catalog/ritualni-tablichki" className="p-2 rounded-xl hover:bg-white flex items-center space-x-2 font-bold text-slate-800">
                    <span>🪦</span>
                    <span>Ритуальні таблички з фото</span>
                  </Link>
                  <Link href="/catalog/trafareti" className="p-2 rounded-xl hover:bg-white flex items-center space-x-2 font-bold text-slate-800">
                    <span>🎨</span>
                    <span>Трафарети на замовлення</span>
                  </Link>
                  <Link href="/catalog/uf-druk" className="p-2 rounded-xl hover:bg-white flex items-center space-x-2 font-bold text-slate-800">
                    <span>🖨️</span>
                    <span>Прямий УФ-друк</span>
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/constructor"
              className="p-2 rounded-xl bg-amber-500/10 text-amber-700 font-extrabold flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 fill-amber-600 text-amber-600" />
              <span>🎨 Створити свій дизайн</span>
            </Link>
            <Link
              href="/blog"
              className={`p-2 rounded-xl transition ${
                isLinkActive('/blog') ? 'bg-emerald-50 text-emerald-600 font-bold' : 'hover:bg-slate-50'
              }`}
            >
              📚 Статті & Блог
            </Link>
            <Link
              href="/delivery"
              className={`p-2 rounded-xl transition ${
                isLinkActive('/delivery') ? 'bg-emerald-50 text-emerald-600 font-bold' : 'hover:bg-slate-50'
              }`}
            >
              Доставка та оплата
            </Link>
            <Link
              href="/about"
              className={`p-2 rounded-xl transition ${
                isLinkActive('/about') ? 'bg-emerald-50 text-emerald-600 font-bold' : 'hover:bg-slate-50'
              }`}
            >
              Про нас
            </Link>
            <Link
              href="/contacts"
              className={`p-2 rounded-xl transition ${
                isLinkActive('/contacts') ? 'bg-emerald-50 text-emerald-600 font-bold' : 'hover:bg-slate-50'
              }`}
            >
              Контакти
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
