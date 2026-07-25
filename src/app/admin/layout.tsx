import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Upload, 
  ArrowLeft,
  ShieldCheck,
  FolderTree
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 -mx-4 -my-6 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Navigation */}
        <header className="bg-slate-900 text-white rounded-3xl p-4 md:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xl shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">UKRTAB CMS</h1>
              <p className="text-xs text-slate-400">Панель управління магазином</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <Link
              href="/admin"
              className="flex items-center space-x-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Дашборд</span>
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center space-x-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Товари</span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center space-x-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <span>Замовлення</span>
            </Link>
            <Link
              href="/admin/import-prom"
              className="flex items-center space-x-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-600/20"
            >
              <Upload className="w-4 h-4" />
              <span>Імпорт з Prom.ua</span>
            </Link>
            <Link
              href="/"
              className="flex items-center space-x-1 px-4 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>На сайт</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
