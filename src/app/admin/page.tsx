import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Package, ShoppingCart, FolderTree, Upload, ArrowRight, TrendingUp } from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [productsCount, ordersCount, categoriesCount, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.category.count(),
    prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { items: true } }),
  ]);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Товарів у каталозі</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{productsCount}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Замовлень всього</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{ordersCount}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Категорій товарів</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{categoriesCount}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FolderTree className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Prom.ua Import Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-slate-900 p-8 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-block bg-emerald-400/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase">
            🚀 Модуль переходу з Prom.ua
          </div>
          <h2 className="text-2xl font-black">Перенесіть свій каталог з Prom.ua в 1 клік!</h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Завантажте ваш YML/XML файл вивантаження з Prom.ua і наш імпортер автоматично створить усі категорії, товари, фотографії та описи.
          </p>
        </div>
        <Link
          href="/admin/import-prom"
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3.5 rounded-2xl text-xs flex items-center space-x-2 shrink-0 transition shadow-lg"
        >
          <Upload className="w-4 h-4" />
          <span>Імпортувати каталог Prom.ua</span>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Останні замовлення</span>
          </h3>
          <Link href="/admin/orders" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1">
            <span>Всі замовлення</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-medium">
            Поки немає нових замовлень
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className="p-3">№</th>
                  <th className="p-3">Клієнт</th>
                  <th className="p-3">Телефон</th>
                  <th className="p-3">Доставка</th>
                  <th className="p-3">Сума</th>
                  <th className="p-3">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-emerald-600">#{o.orderNumber}</td>
                    <td className="p-3 font-bold text-slate-900">{o.customerName}</td>
                    <td className="p-3 text-slate-600">{o.customerPhone}</td>
                    <td className="p-3 text-slate-600">{o.deliveryMethod} ({o.city})</td>
                    <td className="p-3 font-black text-slate-900">{o.total} ₴</td>
                    <td className="p-3">
                      <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full text-[10px]">
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
