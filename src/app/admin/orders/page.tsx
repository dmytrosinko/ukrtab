'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Order, Product } from '@/lib/types';
import { ShoppingCart, Phone, MapPin, Trash2, ExternalLink, Package } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsMap, setProductsMap] = useState<Map<string, Product>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrdersAndProducts = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Orders
      const resOrders = await fetch('/api/orders');
      const dataOrders = await resOrders.json();
      if (Array.isArray(dataOrders)) setOrders(dataOrders);

      // 2. Fetch Products to match photos & links for items
      const resProds = await fetch('/api/products');
      const dataProds = await resProds.json();
      const pMap = new Map<string, Product>();

      if (Array.isArray(dataProds)) {
        dataProds.forEach((p: Product) => {
          if (!p) return;
          if (p.id) pMap.set(p.id, p);
          if (p.slug) pMap.set(p.slug, p);
          if (p.name) pMap.set(p.name.trim().toLowerCase(), p);
        });
      }

      // Merge custom localStorage products if present
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('ukrtab_custom_products');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              parsed.forEach((p: Product) => {
                if (!p) return;
                if (p.id) pMap.set(p.id, p);
                if (p.slug) pMap.set(p.slug, p);
                if (p.name) pMap.set(p.name.trim().toLowerCase(), p);
              });
            }
          }
        } catch (err) {}
      }

      setProductsMap(pMap);
    } catch (e) {
      console.error('Failed to fetch admin orders or products:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndProducts();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchOrdersAndProducts();
    } catch (e) {
      alert('Помилка оновлення статусу');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Видалити це замовлення?')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) fetchOrdersAndProducts();
    } catch (e) {
      alert('Помилка видалення замовлення');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Управління замовленнями</h2>
          <p className="text-xs text-slate-500">Усього замовлень у системі: {orders.length}</p>
        </div>
        <button
          onClick={fetchOrdersAndProducts}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition shadow-sm"
        >
          Оновити список
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-xs text-slate-400 font-medium">
          Завантаження замовлень...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-xs text-slate-400 font-medium">
          Замовлень поки немає
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              id={`order-${o.orderNumber}`}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5 hover:border-slate-300 transition target:ring-4 target:ring-emerald-500/30 target:border-emerald-500"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-black text-emerald-600">#{o.orderNumber}</span>
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(o.createdAt).toLocaleString('uk-UA')}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-slate-500">Статус:</span>
                  <select
                    value={o.status}
                    onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Нове">🟢 Нове</option>
                    <option value="В обробці">🟡 В обробці</option>
                    <option value="Відправлено">🔵 Відправлено</option>
                    <option value="Виконано">✅ Виконано</option>
                    <option value="Скасовано">🔴 Скасовано</option>
                  </select>

                  <button
                    onClick={() => handleDeleteOrder(o.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    title="Видалити замовлення"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Customer & Shipping info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider mb-1 text-[10px]">
                    Покупець
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{o.customerName}</div>
                  <div className="text-slate-600 flex items-center space-x-1 mt-1 font-medium">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <a href={`tel:${o.customerPhone}`} className="hover:underline hover:text-emerald-700">
                      {o.customerPhone}
                    </a>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider mb-1 text-[10px]">
                    Доставка
                  </div>
                  <div className="font-bold text-slate-800">{o.deliveryMethod}</div>
                  <div className="text-slate-600 flex items-start space-x-1 mt-1 font-medium leading-tight">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      {o.city} {o.warehouseInfo ? `— ${o.warehouseInfo}` : ''}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider mb-1 text-[10px]">
                    Оплата та сума
                  </div>
                  <div className="font-semibold text-slate-800">{o.paymentMethod}</div>
                  <div className="text-xl font-black text-emerald-600 mt-1">{o.total} ₴</div>
                </div>
              </div>

              {o.notes && (
                <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start space-x-2">
                  <span className="font-bold text-amber-700 shrink-0">💬 Коментар клієнта:</span>
                  <span className="font-medium whitespace-pre-wrap">{o.notes}</span>
                </div>
              )}

              {/* Items List with Photos & Direct Links */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Товари в замовленні ({o.items?.length || 0})</span>
                </div>
                <div className="space-y-2.5">
                  {o.items?.map((item, idx) => {
                    const matchedProduct =
                      (item as any).product ||
                      (item.productId ? productsMap.get(item.productId) : null) ||
                      productsMap.get(item.productName.trim().toLowerCase());

                    const pImage =
                      (item as any).product?.image ||
                      matchedProduct?.image ||
                      'https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg';

                    const targetId =
                      matchedProduct?.id || item.productId || matchedProduct?.slug || item.productName;

                    return (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/70 shadow-xs hover:border-emerald-300 transition gap-3"
                      >
                        {/* Photo & Title */}
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <img
                              src={pImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-xs line-clamp-1">
                              {item.productName}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                              {item.quantity} шт. × {item.price} ₴
                            </div>
                          </div>
                        </div>

                        {/* Price & External Link Button */}
                        <div className="flex items-center justify-between sm:justify-end space-x-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <span className="font-black text-slate-900 text-xs sm:text-sm">
                            {(item.price * item.quantity).toFixed(0)} ₴
                          </span>

                          <Link
                            href={`/product/${encodeURIComponent(targetId)}`}
                            target="_blank"
                            className="bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 transition shadow-xs"
                            title="Відкрити сторінку товару на сайті"
                          >
                            <span>Товар</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
