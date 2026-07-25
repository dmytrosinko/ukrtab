'use client';

import React, { useState, useEffect } from 'react';
import { Order } from '@/lib/types';
import { ShoppingCart, Phone, MapPin, Trash2, CheckCircle2, Clock, Truck } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchOrders();
    } catch (e) {
      alert('Помилка оновлення статусу');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Видалити це замовлення?')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) fetchOrders();
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
          onClick={fetchOrders}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
        >
          Оновити список
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-xs text-slate-400">
          Завантаження замовлень...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-xs text-slate-400">
          Замовлень поки немає
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-black text-emerald-600">#{o.orderNumber}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(o.createdAt).toLocaleString('uk-UA')}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-slate-500">Статус:</span>
                  <select
                    value={o.status}
                    onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                    className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="Нове">🟢 Нове</option>
                    <option value="В обробці">🟡 В обробці</option>
                    <option value="Відправлено">🔵 Відправлено</option>
                    <option value="Виконано">✅ Виконано</option>
                    <option value="Скасовано">🔴 Скасовано</option>
                  </select>

                  <button
                    onClick={() => handleDeleteOrder(o.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Customer & Shipping info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider mb-1">Покупець</div>
                  <div className="font-bold text-slate-900">{o.customerName}</div>
                  <div className="text-slate-600 flex items-center space-x-1 mt-0.5">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{o.customerPhone}</span>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider mb-1">Доставка</div>
                  <div className="font-semibold text-slate-800">{o.deliveryMethod}</div>
                  <div className="text-slate-600 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span>{o.city} {o.warehouseInfo ? `— ${o.warehouseInfo}` : ''}</span>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider mb-1">Оплата</div>
                  <div className="font-semibold text-slate-800">{o.paymentMethod}</div>
                  <div className="text-base font-black text-emerald-600 mt-1">{o.total} ₴</div>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Товари в замовленні</div>
                <div className="space-y-1">
                  {o.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs font-medium">
                      <span>{item.productName} ({item.quantity} шт.)</span>
                      <span className="font-bold">{(item.price * item.quantity).toFixed(0)} ₴</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
