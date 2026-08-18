'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Upload, 
  Handshake,
  SlidersHorizontal,
  ArrowLeft,
  ShieldCheck,
  LogOut
} from 'lucide-react';

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    {
      label: 'Дашборд',
      href: '/admin',
      icon: LayoutDashboard,
      isActive: pathname === '/admin',
    },
    {
      label: 'Товари',
      href: '/admin/products',
      icon: Package,
      isActive: pathname ? pathname.startsWith('/admin/products') : false,
    },
    {
      label: 'Замовлення',
      href: '/admin/orders',
      icon: ShoppingCart,
      isActive: pathname ? pathname.startsWith('/admin/orders') : false,
    },
    {
      label: 'Банери',
      href: '/admin/banners',
      icon: SlidersHorizontal,
      isActive: pathname ? pathname.startsWith('/admin/banners') : false,
    },
    {
      label: 'Партнери',
      href: '/admin/partners',
      icon: Handshake,
      isActive: pathname ? pathname.startsWith('/admin/partners') : false,
    },
    {
      label: 'Імпорт з Prom.ua',
      href: '/admin/import-prom',
      icon: Upload,
      isActive: pathname ? pathname.startsWith('/admin/import-prom') : false,
    },
  ];

  return (
    <header className="bg-slate-900 text-white rounded-3xl p-4 md:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800">
      <Link href="/admin" className="flex items-center space-x-3 group">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-500/20 group-hover:scale-105 transition transform">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight group-hover:text-emerald-400 transition">UKRTAB CMS</h1>
          <p className="text-xs text-slate-400 font-medium">Панель управління магазином</p>
        </div>
      </Link>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition transform active:scale-95 ${
                item.isActive
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/40 scale-[1.02]'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${item.isActive ? 'text-white' : 'text-emerald-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

        <Link
          href="/"
          className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>На сайт</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Вийти</span>
        </button>
      </div>
    </header>
  );
}
