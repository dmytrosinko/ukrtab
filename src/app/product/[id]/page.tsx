'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShoppingCart, Plus, Minus, Check, Tag, ShieldCheck, Truck, Clock, X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { INITIAL_PRODUCTS } from '@/lib/store';

export default function ProductDetailPage() {
  const params = useParams();
  const rawId = typeof params?.id === 'string' ? params.id : '';
  const targetId = decodeURIComponent(rawId);

  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    if (!targetId && !rawId) return;

    // 1. Try localStorage custom/edited products first
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ukrtab_custom_products');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const found = parsed.find(
              (p: Product) =>
                p.id === targetId ||
                p.slug === targetId ||
                p.id === rawId ||
                p.slug === rawId ||
                p.name === targetId
            );
            if (found) {
              setProduct(found);
              setSelectedImage(found.image);
              return;
            }
          }
        }
      } catch (e) {
        console.error('Error loading custom product in client detail view:', e);
      }
    }

    // 2. Try INITIAL_PRODUCTS match as local static check
    const initMatch = INITIAL_PRODUCTS.find(
      (p) => p.id === targetId || p.slug === targetId || p.id === rawId || p.slug === rawId
    );

    // 3. Fallback fetch all products API or fallback to first catalog item
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const found = data.find(
            (p: Product) =>
              p.id === targetId ||
              p.slug === targetId ||
              p.id === rawId ||
              p.slug === rawId
          );
          if (found) {
            setProduct(found);
            setSelectedImage(found.image);
            return;
          }
        }
        // If not found in API list, use initMatch if found
        if (initMatch) {
          setProduct(initMatch);
          setSelectedImage(initMatch.image);
        } else if (INITIAL_PRODUCTS.length > 0) {
          setProduct(INITIAL_PRODUCTS[0]);
          setSelectedImage(INITIAL_PRODUCTS[0].image);
        }
      })
      .catch(() => {
        if (initMatch) {
          setProduct(initMatch);
          setSelectedImage(initMatch.image);
        } else if (INITIAL_PRODUCTS.length > 0) {
          setProduct(INITIAL_PRODUCTS[0]);
          setSelectedImage(INITIAL_PRODUCTS[0].image);
        }
      });
  }, [targetId, rawId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsZoomOpen(false);
      }
    };
    if (isZoomOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isZoomOpen]);

  if (!product) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 font-medium space-y-3">
        <div>Завантаження картки товару...</div>
        <Link href="/catalog" className="inline-block text-emerald-600 font-bold hover:underline">
          ← повернутися до каталогу
        </Link>
      </div>
    );
  }

  let imagesList: string[] = [product.image];
  try {
    if (product.images) {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed) && parsed.length > 0) {
        imagesList = parsed;
      }
    }
  } catch (e) {}

  const activeImg = selectedImage || product.image;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-emerald-600">
          Головна
        </Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-emerald-600">
          Каталог
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Detail Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images Section */}
        <div className="space-y-4">
          <div
            onClick={() => activeImg && setIsZoomOpen(true)}
            className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative group cursor-pointer flex items-center justify-center p-3"
          >
            {activeImg ? (
              <>
                <img
                  src={activeImg}
                  alt={product.name}
                  className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm text-slate-800 px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 text-xs font-bold">
                    <ZoomIn className="w-4 h-4 text-emerald-600" />
                    <span>Натисніть для збільшення</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-xs">
                Немає зображення
              </div>
            )}
            {product.oldPrice && (
              <span className="absolute top-4 left-4 bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-md flex items-center space-x-1 z-10">
                <Tag className="w-3.5 h-3.5" />
                <span>АКЦІЯ</span>
              </span>
            )}
          </div>

          {/* Thumbnail selector if multiple images */}
          {imagesList.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto p-1.5">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition bg-slate-50 shrink-0 ${
                    activeImg === img
                      ? 'border-emerald-600 ring-2 ring-emerald-600/30 font-bold'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain p-1" />
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

      {/* Trust & Shipping info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Доставка по Україні</h4>
            <p className="text-[11px] text-slate-500">
              Нова Пошта (1-2 дні), Укрпошта або самовивіз у м. Дніпро.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Швидке виготовлення</h4>
            <p className="text-[11px] text-slate-500">
              Більшість позицій у наявності. Індивідуальні макети — 1-2 дні.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Гарантія витривалості</h4>
            <p className="text-[11px] text-slate-500">
              Стійкість до автомийок, снігу, дощу та УФ-випромінювання.
            </p>
          </div>
        </div>
      </div>

      {/* Fullscreen Popup Modal */}
      {isZoomOpen && activeImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsZoomOpen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white bg-slate-800/80 hover:bg-slate-700 p-3 rounded-full transition shadow-xl z-50 border border-white/20 group"
            aria-label="Закрити"
            title="Закрити (Esc)"
          >
            <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>

          {/* Multi-image navigation controls */}
          {imagesList.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIdx = imagesList.indexOf(activeImg);
                  const prevIdx = (currentIdx - 1 + imagesList.length) % imagesList.length;
                  setSelectedImage(imagesList[prevIdx]);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-slate-800/80 hover:bg-slate-700 p-3 rounded-full transition z-50 border border-white/20 shadow-xl"
                title="Попереднє фото"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIdx = imagesList.indexOf(activeImg);
                  const nextIdx = (currentIdx + 1) % imagesList.length;
                  setSelectedImage(imagesList[nextIdx]);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-slate-800/80 hover:bg-slate-700 p-3 rounded-full transition z-50 border border-white/20 shadow-xl"
                title="Наступне фото"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Modal content */}
          <div
            className="relative w-full h-full max-w-[95vw] max-h-[92vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImg}
              alt={product.name}
              className="w-full h-full max-w-[92vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl bg-white/5 p-2 border border-white/10"
            />

            {imagesList.length > 1 && (
              <div className="flex space-x-2 mt-4 overflow-x-auto max-w-full p-2 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 shrink-0">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition bg-white/5 shrink-0 ${
                      activeImg === img ? 'border-emerald-500 ring-2 ring-emerald-500/40' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

