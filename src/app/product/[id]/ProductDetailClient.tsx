'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Check, Tag, ShieldCheck } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

export function ProductDetailClient({ product: initialProduct }: { product: Product }) {
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product>(initialProduct);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const pathSegments = window.location.pathname.split('/');
        const currentId = pathSegments[pathSegments.length - 1];

        const saved = localStorage.getItem('ukrtab_custom_products');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const found = parsed.find((p: Product) => p.id === currentId || p.slug === currentId);
            if (found) {
              setProduct(found);
            }
          }
        }
      } catch (e) {
        console.error('Error loading custom product in detail view:', e);
      }
    }
  }, [initialProduct]);

  let imagesList: string[] = [product.image];
  try {
    if (product.images) {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed) && parsed.length > 0) {
        imagesList = parsed;
      }
    }
  } catch (e) {}

  const [selectedImage, setSelectedImage] = useState(imagesList[0] || product.image);

  useEffect(() => {
    setSelectedImage(product.image);
  }, [product]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Images Section */}
      <div className="space-y-4">
        <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative">
          <img
            src={selectedImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.oldPrice && (
            <span className="absolute top-4 left-4 bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-md flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5" />
              <span>АКЦІЯ</span>
            </span>
          )}
        </div>

        {/* Thumbnail selector if multiple images */}
        {imagesList.length > 1 && (
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {imagesList.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                  selectedImage === img ? 'border-emerald-600 scale-105' : 'border-slate-200 opacity-70'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-xs mb-2">
              <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                {product.status || 'В наявності'}
              </span>
              {product.sku && (
                <span className="text-slate-400 font-mono">Артикул: {product.sku}</span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Pricing */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-baseline space-x-4">
            <span className="text-3xl font-black text-slate-900">
              {product.price} <span className="text-sm font-bold text-slate-500">₴/{product.unit || 'шт.'}</span>
            </span>
            {product.oldPrice && (
              <span className="text-base text-slate-400 line-through">
                {product.oldPrice} ₴
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Опис товару</h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>

        {/* Quantity & Buy */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-4">
            <div className="text-xs font-bold text-slate-700">Кількість:</div>
            <div className="flex items-center border-2 border-slate-200 rounded-xl bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2.5 text-slate-600 hover:text-slate-900 transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 font-black text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2.5 text-slate-600 hover:text-slate-900 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center space-x-3 transition transform shadow-xl active:scale-95 ${
              added
                ? 'bg-emerald-700 text-white shadow-emerald-700/30'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
            }`}
          >
            {added ? (
              <>
                <Check className="w-5 h-5" />
                <span>Додано в кошик ({quantity} шт.)</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                <span>Додати в кошик — {(product.price * quantity).toFixed(0)} ₴</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
