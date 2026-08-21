'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Banner } from '@/lib/types';

export function BannerSlider({ banners }: { banners: Banner[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    if (!banners || banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const current = banners[currentIndex];

  const minSwipeDistance = 45;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    } else if (isRightSwipe) {
      setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  return (
    <div 
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800 aspect-[2.4/1] sm:aspect-[2.4/1] md:aspect-[2.5/1] lg:aspect-[2.6/1] flex items-center select-none group"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={current.image}
          alt={current.title || 'Слайд UKRTAB'}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1280px"
          className="object-contain sm:object-cover opacity-100 transition-all duration-700 ease-out"
        />
        {/* Soft gradient only on desktop when title exists */}
        {current.title && (
          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/30 to-transparent" />
        )}
      </div>

      {/* Whole banner clickable link */}
      {current.linkUrl && (
        <Link
          href={current.linkUrl}
          className="absolute inset-0 z-10 cursor-pointer"
          aria-label={current.title || 'Переглянути категорію'}
        />
      )}

      {/* Desktop Content (shown only on larger screens when title exists so mobile graphics are 100% clean) */}
      {current.title && (
        <div className="hidden md:block relative z-20 max-w-xl px-8 md:px-12 py-8 space-y-4 pointer-events-none">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
            <span>🇺🇦 Виробництво в Україні • Запоріжжя • Дніпро</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-md">
            {current.title}
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal line-clamp-2">
            Виготовлення вінілових магнітів для авто, захисних знаків та номерних табличок з доставкою Новою Поштою.
          </p>

          {current.linkUrl && (
            <div className="pt-2 pointer-events-auto">
              <Link
                href={current.linkUrl}
                className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5"
              >
                <span>Переглянути каталог</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Desktop Navigation Arrows (hidden on mobile to prevent blocking content) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
        }}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/60 text-white hover:bg-emerald-600 hover:text-white transition backdrop-blur-md opacity-0 group-hover:opacity-100 shadow-lg"
        aria-label="Попередній слайд"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setCurrentIndex((prev) => (prev + 1) % banners.length);
        }}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/60 text-white hover:bg-emerald-600 hover:text-white transition backdrop-blur-md opacity-0 group-hover:opacity-100 shadow-lg"
        aria-label="Наступний слайд"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicators / Dots */}
      <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-1.5 sm:space-x-2">
        {banners.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(i);
            }}
            aria-label={`Перейти до слайду ${i + 1}`}
            className={`h-1.5 sm:h-2 rounded-full transition-all ${
              i === currentIndex ? 'w-6 sm:w-8 bg-emerald-500' : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
