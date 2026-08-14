'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { trackViewCart, trackRemoveFromCart } from '@/lib/analytics';

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice, clearCart } =
    useCart();

  useEffect(() => {
    if (isCartOpen && items.length > 0) {
      trackViewCart(items, totalPrice);
    }
  }, [isCartOpen]);

  const handleRemove = (item: (typeof items)[0]) => {
    trackRemoveFromCart(item.product, item.quantity);
    removeFromCart(item.product.id);
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-lg">Кошик покупок</h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-slate-500 font-medium">Ваш кошик порожній</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                >
                  Перейти до каталогу
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100 relative group"
                >
                  <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-slate-800 line-clamp-2">
                      {item.product.name}
                    </h4>
                    <div className="text-xs font-bold text-emerald-600 mt-1">
                      {item.product.price} ₴ / {item.product.unit || 'шт.'}
                    </div>

                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center border border-slate-200 rounded-md bg-white">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-slate-500 hover:text-slate-800"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-slate-500 hover:text-slate-800"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        = {(item.product.price * item.quantity).toFixed(0)} ₴
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(item)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-4">
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-sm font-medium">Разом до сплати:</span>
                <span className="text-xl font-black text-emerald-600">{totalPrice} ₴</span>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 transition"
                >
                  <span>Оформити замовлення</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={clearCart}
                  className="w-full text-xs text-slate-500 hover:text-slate-800 py-1"
                >
                  Очистити кошик
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
