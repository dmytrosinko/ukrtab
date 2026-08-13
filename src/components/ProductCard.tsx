'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Check, Tag } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = React.useState(false);

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Image Container */}
      <Link href={`/product/${product.id}`} className="relative block aspect-square overflow-hidden bg-slate-50 flex items-center justify-center p-2">
        <img
          src={product.image}
          alt={product.name}
          className="max-w-full max-h-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            {product.status || 'В наявності'}
          </span>
          {product.oldPrice && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Tag className="w-3 h-3" />
              ЗНИЖКА
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {product.sku && (
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">
              Код: {product.sku}
            </div>
          )}
          <Link
            href={`/product/${product.id}`}
            className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 line-clamp-2 transition leading-snug"
          >
            {product.name}
          </Link>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-lg font-black text-slate-900">
              {product.price} <span className="text-xs font-bold text-slate-500">₴/{product.unit || 'шт.'}</span>
            </div>
            {product.oldPrice && (
              <div className="text-xs text-slate-400 line-through">
                {product.oldPrice} ₴
              </div>
            )}
          </div>

          <button
            onClick={handleBuy}
            className={`p-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition transform active:scale-95 ${
              added
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Додано</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Купити</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
