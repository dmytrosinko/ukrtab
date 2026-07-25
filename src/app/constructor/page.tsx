'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Upload, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Type, 
  Palette, 
  ShoppingCart, 
  Check, 
  Sparkles, 
  RefreshCw,
  Sliders,
  Move,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/types';

interface ShapeOption {
  id: string;
  name: string;
  ratio: string;
  sizes: { label: string; price: number; width: number; height: number }[];
}

const SHAPES: ShapeOption[] = [
  {
    id: 'square',
    name: 'Квадрат',
    ratio: '1:1',
    sizes: [
      { label: '15 x 15 см', price: 150, width: 15, height: 15 },
      { label: '25 x 25 см', price: 250, width: 25, height: 25 },
      { label: '30 x 30 см', price: 350, width: 30, height: 30 },
    ],
  },
  {
    id: 'rectangle',
    name: 'Прямокутник на авто',
    ratio: '2.5:1',
    sizes: [
      { label: '30 x 15 см', price: 220, width: 30, height: 15 },
      { label: '40 x 15 см', price: 300, width: 40, height: 15 },
      { label: '50 x 20 см', price: 450, width: 50, height: 20 },
    ],
  },
  {
    id: 'circle',
    name: 'Круглий магніт',
    ratio: '1:1',
    sizes: [
      { label: 'Ø 15 см', price: 170, width: 15, height: 15 },
      { label: 'Ø 25 см', price: 280, width: 25, height: 25 },
      { label: 'Ø 30 см', price: 380, width: 30, height: 30 },
    ],
  },
];

export default function ConstructorPage() {
  const { addToCart } = useCart();
  const [selectedShape, setSelectedShape] = useState<ShapeOption>(SHAPES[0]);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number>(0);
  const [lamination, setLamination] = useState<'gloss' | 'matt'>('gloss');
  const [isReinforced, setIsReinforced] = useState<boolean>(false);

  // Uploaded Image State
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [posX, setPosX] = useState<number>(0);
  const [posY, setPosY] = useState<number>(0);
  const [filter, setFilter] = useState<'normal' | 'grayscale' | 'sepia' | 'contrast'>('normal');

  // Text Overlay State
  const [overlayText, setOverlayText] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [textBgColor, setTextBgColor] = useState<string>('#008000');
  const [textSize, setTextSize] = useState<number>(20);
  const [textPosY, setTextPosY] = useState<number>(80); // percentage

  const [added, setAdded] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeSize = selectedShape.sizes[selectedSizeIndex] || selectedShape.sizes[0];
  const totalPrice = activeSize.price + (isReinforced ? 50 : 0);

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImageSrc(event.target.result as string);
          // reset transformations
          setScale(1);
          setRotation(0);
          setPosX(0);
          setPosY(0);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Render Canvas Snapshot
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 500;
    canvas.height = selectedShape.id === 'rectangle' ? 250 : 500;

    // Background preview pattern
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw uploaded image
    if (uploadedImageSrc) {
      const img = new Image();
      img.src = uploadedImageSrc;
      img.onload = () => {
        ctx.save();
        ctx.translate(canvas.width / 2 + posX, canvas.height / 2 + posY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale, scale);

        // Apply filters
        if (filter === 'grayscale') ctx.filter = 'grayscale(100%)';
        else if (filter === 'sepia') ctx.filter = 'sepia(100%)';
        else if (filter === 'contrast') ctx.filter = 'contrast(150%)';

        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();

        drawOverlayText(ctx, canvas.width, canvas.height);
      };
    } else {
      // Placeholder state
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Завантажте ваше зображення або логотип', canvas.width / 2, canvas.height / 2);

      drawOverlayText(ctx, canvas.width, canvas.height);
    }
  }, [uploadedImageSrc, scale, rotation, posX, posY, filter, overlayText, textColor, textBgColor, textSize, textPosY, selectedShape]);

  const drawOverlayText = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!overlayText.trim()) return;

    ctx.save();
    const yPos = (height * textPosY) / 100;
    ctx.font = `bold ${textSize * 1.2}px sans-serif`;
    ctx.textAlign = 'center';

    const textWidth = ctx.measureText(overlayText).width;
    const padding = 12;

    // Draw text background badge
    ctx.fillStyle = textBgColor;
    ctx.roundRect(
      width / 2 - textWidth / 2 - padding,
      yPos - textSize * 1.2,
      textWidth + padding * 2,
      textSize * 1.6,
      8
    );
    ctx.fill();

    // Draw text
    ctx.fillStyle = textColor;
    ctx.fillText(overlayText, width / 2, yPos - 2);
    ctx.restore();
  };

  const handleAddToCart = () => {
    const canvas = canvasRef.current;
    const previewUrl = canvas ? canvas.toDataURL('image/png') : (uploadedImageSrc || 'https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg');

    const customProduct: Product = {
      id: 'custom-' + Date.now(),
      name: `Індивідуальний магніт "${selectedShape.name}" ${activeSize.label}`,
      slug: 'custom-magnet-' + Date.now(),
      price: totalPrice,
      sku: 'CUSTOM-MAG',
      status: 'Під замовлення',
      description: `Індивідуальний дизайн. Форма: ${selectedShape.name}, Розмір: ${activeSize.label}, Ламінація: ${lamination === 'gloss' ? 'Глянцева' : 'Матова'}${isReinforced ? ', Посилений вініл 1.5мм' : ''}${overlayText ? `, Текст: "${overlayText}"` : ''}`,
      image: previewUrl,
      images: JSON.stringify([previewUrl]),
      unit: 'шт.',
      features: JSON.stringify({ shape: selectedShape.name, size: activeSize.label, lamination }),
      isFeatured: false,
    };

    addToCart(customProduct, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Онлайн-Конструктор Магнітів</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Створіть свій власний магніт на авто</h1>
          <p className="text-xs text-slate-300">
            Завантажте власне фото, логотип компанії або додайте індивідуальний текст. Ми виготовимо магніт з посиленою УФ-ламінацією за 1-2 дні!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Canvas Preview Area (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 sticky top-24">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Попередній перегляд (Preview)</span>
              </h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                {activeSize.label}
              </span>
            </div>

            {/* Canvas Container */}
            <div className="relative w-full aspect-square bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center p-4 border border-slate-200">
              <canvas
                ref={canvasRef}
                className={`w-full max-h-full object-contain shadow-lg bg-white transition-all ${
                  selectedShape.id === 'circle' ? 'rounded-full' : 'rounded-xl'
                }`}
              />
            </div>

            {/* Price & Add to Cart */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-500">Вартість замовлення:</span>
                <span className="text-2xl font-black text-emerald-600">{totalPrice} ₴</span>
              </div>

              <button
                onClick={handleAddToCart}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition transform active:scale-95 shadow-lg ${
                  added
                    ? 'bg-emerald-700 text-white shadow-emerald-700/30'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Додано в кошик!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Замовити цей магніт</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Controls & Editing Tools (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Upload & Image Tools */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Upload className="w-5 h-5 text-emerald-600" />
              <span>1. Завантаження та редагування зображення</span>
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow-md shadow-emerald-600/20 shrink-0"
              >
                <Upload className="w-4 h-4" />
                <span>Завантажити фото або логотип</span>
              </button>

              {uploadedImageSrc && (
                <button
                  onClick={() => {
                    setUploadedImageSrc(null);
                    setScale(1);
                    setRotation(0);
                    setPosX(0);
                    setPosY(0);
                  }}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold"
                >
                  Видалити фото
                </button>
              )}
            </div>

            {/* Editing Controls if image uploaded */}
            {uploadedImageSrc && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4 pt-4">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                  <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Інструменти редагування</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Scale */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Масштаб: {Math.round(scale * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.2"
                      max="3"
                      step="0.05"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  {/* Rotation */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Поворот: {rotation}°
                    </label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="5"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  {/* Move X */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Зсув X (горизонтально)</label>
                    <input
                      type="range"
                      min="-200"
                      max="200"
                      value={posX}
                      onChange={(e) => setPosX(parseInt(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  {/* Move Y */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Зсув Y (вертикально)</label>
                    <input
                      type="range"
                      min="-200"
                      max="200"
                      value={posY}
                      onChange={(e) => setPosY(parseInt(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Кольоровий ефект</label>
                  <div className="flex space-x-2 text-xs">
                    {(['normal', 'grayscale', 'sepia', 'contrast'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-xl font-bold capitalize transition ${
                          filter === f
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {f === 'normal' ? 'Звичайний' : f === 'grayscale' ? 'Ч/Б' : f === 'sepia' ? 'Сепія' : 'Контраст'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Text Overlay */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Type className="w-5 h-5 text-emerald-600" />
              <span>2. Додати текст або напис на магніт</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Введіть ваш текст</label>
                <input
                  type="text"
                  placeholder="наприклад: ОХОРОНА / ЗСУ / +380 67 000-00-00"
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {overlayText && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Колір тексту</label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-9 rounded-xl border border-slate-200 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Колір фону під тексту</label>
                    <input
                      type="color"
                      value={textBgColor}
                      onChange={(e) => setTextBgColor(e.target.value)}
                      className="w-full h-9 rounded-xl border border-slate-200 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Розмір шрифту</label>
                    <input
                      type="range"
                      min="12"
                      max="40"
                      value={textSize}
                      onChange={(e) => setTextSize(parseInt(e.target.value))}
                      className="w-full accent-emerald-600 mt-2"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Shape & Size Selection */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Palette className="w-5 h-5 text-emerald-600" />
              <span>3. Форма, розміри та матеріали</span>
            </h3>

            {/* Shape selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Форма магніту</label>
              <div className="grid grid-cols-3 gap-3 text-xs">
                {SHAPES.map((shape) => (
                  <button
                    key={shape.id}
                    onClick={() => {
                      setSelectedShape(shape);
                      setSelectedSizeIndex(0);
                    }}
                    className={`p-3 rounded-2xl font-bold border-2 transition text-center ${
                      selectedShape.id === shape.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {shape.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Size selection */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700">Розмір магніту</label>
              <div className="grid grid-cols-3 gap-3 text-xs">
                {selectedShape.sizes.map((size, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSizeIndex(idx)}
                    className={`p-3 rounded-2xl font-bold border-2 transition text-center ${
                      selectedSizeIndex === idx
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div>{size.label}</div>
                    <div className="text-[11px] opacity-90 mt-0.5">{size.price} ₴</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Material Options */}
            <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={isReinforced}
                  onChange={(e) => setIsReinforced(e.target.checked)}
                  className="text-emerald-600 rounded focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-slate-800">Посилений вініловий магніт 1.5 мм (+50 ₴)</span>
                  <p className="text-slate-500 text-[11px]">Для впевненого тримання на швидкостях понад 120 км/год</p>
                </div>
              </label>

              <div className="flex items-center space-x-4">
                <span className="font-bold text-slate-700">Покриття ламінації:</span>
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    name="lamination"
                    value="gloss"
                    checked={lamination === 'gloss'}
                    onChange={() => setLamination('gloss')}
                    className="text-emerald-600"
                  />
                  <span className="font-semibold text-slate-800">Глянцева</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    name="lamination"
                    value="matt"
                    checked={lamination === 'matt'}
                    onChange={() => setLamination('matt')}
                    className="text-emerald-600"
                  />
                  <span className="font-semibold text-slate-800">Матова</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
