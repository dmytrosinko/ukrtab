'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Banner } from '@/lib/types';

export function BannerSlider({ banners }: { banners: Banner[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const current = banners[currentIndex];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800 min-h-[320px] md:min-h-[420px] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={current.image}
          alt={current.title || 'Слайд UKRTAB'}
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover opacity-45 transform scale-105 transition-all duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl px-6 md:px-12 py-10 space-y-4">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
          <span>🇺🇦 Виробництво в Україні • Дніпро</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-md">
          {current.title || 'Якісні магніти та знаки на замовлення'}
        </h2>
        <p className="text-sm md:text-base text-slate-300 leading-relaxed font-normal">
          Виготовлення вінілових магнітів для авто, захисних знаків та номерних табличок з доставкою Новою Поштою.
        </p>

        {current.linkUrl && (
          <div className="pt-2">
            <Link
              href={current.linkUrl}
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5"
            >
              <span>Переглянути каталог</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Controls */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-900/60 text-white hover:bg-emerald-600 transition backdrop-blur-md"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-900/60 text-white hover:bg-emerald-600 transition backdrop-blur-md"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === currentIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
