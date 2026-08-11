'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Star, 
  ShoppingCart, 
  Search, 
  Menu, 
  X, 
  ShieldCheck,
  Package,
  Sparkles
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, totalPrice, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsMobileMenuOpen(false);
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
            <div className="hidden lg:flex items-center space-x-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>м. Дніпро, вул. Миру 2т</span>
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
        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-lg relative">
          <input
            type="text"
            placeholder="Шукати магнітні наліпки, знаки ЗСУ, адресні таблички..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-emerald-600 transition"
          >
            <Search className="w-5 h-5" />
          </button>
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
            className={`py-3 border-b-2 transition ${
              isLinkActive('/')
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-700 hover:text-emerald-600'
            }`}
          >
            Головна
          </Link>
          <Link
            href="/catalog"
            className={`py-3 border-b-2 transition flex items-center space-x-1 ${
              pathname.startsWith('/catalog')
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-700 hover:text-emerald-600'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-600" />
            <span>Каталог товарів</span>
          </Link>
          <Link
            href="/constructor"
            className={`py-3 border-b-2 transition flex items-center space-x-1 text-amber-700 hover:text-amber-800 ${
              isLinkActive('/constructor')
                ? 'border-amber-500 font-black'
                : 'border-transparent font-bold'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Конструктор магнітів</span>
          </Link>
          <Link
            href="/about"
            className={`py-3 border-b-2 transition ${
              isLinkActive('/about')
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-700 hover:text-emerald-600'
            }`}
          >
            Про нас
          </Link>
          <Link
            href="/delivery"
            className={`py-3 border-b-2 transition ${
              isLinkActive('/delivery')
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-700 hover:text-emerald-600'
            }`}
          >
            Доставка та оплата
          </Link>
          <Link
            href="/contacts"
            className={`py-3 border-b-2 transition ${
              isLinkActive('/contacts')
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-700 hover:text-emerald-600'
            }`}
          >
            Контакти
          </Link>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="relative mb-4">
            <input
              type="text"
              placeholder="Пошук..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-slate-800 font-medium hover:text-emerald-600">
            Головна
          </Link>
          <Link href="/catalog" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-slate-800 font-medium hover:text-emerald-600">
            Каталог товарів
          </Link>
          <Link href="/constructor" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-amber-700 font-black">
            🎨 Конструктор магнітів
          </Link>
          <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-slate-800 font-medium hover:text-emerald-600">
            Про нас
          </Link>
          <Link href="/delivery" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-slate-800 font-medium hover:text-emerald-600">
            Доставка та оплата
          </Link>
          <Link href="/contacts" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-slate-800 font-medium hover:text-emerald-600">
            Контакти
          </Link>
        </div>
      )}
    </header>
  );
}
