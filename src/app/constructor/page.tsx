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
  Trash2,
  Square,
  Circle as CircleIcon,
  Shield,
  RectangleHorizontal,
  CheckCircle2,
  Sparkle
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/types';

interface ShapeOption {
  id: string;
  name: string;
  iconName: 'square' | 'rectangle' | 'circle' | 'shield' | 'plate';
  aspectRatio: number; // width / height
  sizes: { label: string; price: number; widthCm: number; heightCm: number }[];
}

const SHAPES: ShapeOption[] = [
  {
    id: 'square',
    name: 'Квадрат',
    iconName: 'square',
    aspectRatio: 1,
    sizes: [
      { label: '15 x 15 см', price: 150, widthCm: 15, heightCm: 15 },
      { label: '25 x 25 см (Хіт)', price: 250, widthCm: 25, heightCm: 25 },
      { label: '30 x 30 см', price: 350, widthCm: 30, heightCm: 30 },
    ],
  },
  {
    id: 'rectangle',
    name: 'Прямокутник',
    iconName: 'rectangle',
    aspectRatio: 2,
    sizes: [
      { label: '30 x 15 см', price: 220, widthCm: 30, heightCm: 15 },
      { label: '40 x 20 см (Авто)', price: 320, widthCm: 40, heightCm: 20 },
      { label: '50 x 25 см', price: 450, widthCm: 50, heightCm: 25 },
    ],
  },
  {
    id: 'car-plate',
    name: 'Автономер',
    iconName: 'plate',
    aspectRatio: 4.7,
    sizes: [
      { label: '52 x 11 см (Стандарт)', price: 250, widthCm: 52, heightCm: 11 },
      { label: '52 x 11 см (Посилений)', price: 320, widthCm: 52, heightCm: 11 },
    ],
  },
  {
    id: 'circle',
    name: 'Круглий',
    iconName: 'circle',
    aspectRatio: 1,
    sizes: [
      { label: 'Ø 15 см', price: 170, widthCm: 15, heightCm: 15 },
      { label: 'Ø 25 см', price: 280, widthCm: 25, heightCm: 25 },
      { label: 'Ø 30 см', price: 380, widthCm: 30, heightCm: 30 },
    ],
  },
  {
    id: 'shield',
    name: 'Шеврон / Щит',
    iconName: 'shield',
    aspectRatio: 0.85,
    sizes: [
      { label: '20 x 24 см', price: 260, widthCm: 20, heightCm: 24 },
      { label: '25 x 30 см', price: 360, widthCm: 25, heightCm: 30 },
    ],
  },
];

const PRESET_BG_COLORS = [
  { label: 'Білий', value: '#ffffff' },
  { label: 'Чорний', value: '#0f172a' },
  { label: 'Жовтий', value: '#facc15' },
  { label: 'Зелений ЗСУ', value: '#15803d' },
  { label: 'Синьо-Жовтий', value: 'ua-flag' },
];

export default function ConstructorPage() {
  const { addToCart } = useCart();

  // Selected Shape & Size
  const [selectedShape, setSelectedShape] = useState<ShapeOption>(SHAPES[0]);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number>(1);
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [isReinforced, setIsReinforced] = useState<boolean>(false);
  const [lamination, setLamination] = useState<'gloss' | 'matt'>('gloss');

  // Image Upload State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);

  // Inscription / Text Overlay State
  const [text, setText] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [textBgColor, setTextBgColor] = useState<string>('#15803d');
  const [textPosition, setTextPosition] = useState<'top' | 'middle' | 'bottom'>('bottom');

  const [added, setAdded] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeSize = selectedShape.sizes[selectedSizeIndex] || selectedShape.sizes[0];
  const totalPrice = activeSize.price + (isReinforced ? 50 : 0);

  // File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImageSrc(ev.target.result as string);
          setZoom(1);
          setRotation(0);
          setOffsetX(0);
          setOffsetY(0);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas Drawing Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 600;
    const H = Math.round(W / selectedShape.aspectRatio);
    canvas.width = W;
    canvas.height = H;

    // Fill Background
    if (bgColor === 'ua-flag') {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, W, H / 2);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(0, H / 2, W, H / 2);
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, H);
    }

    // Draw Image if uploaded
    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        ctx.save();
        ctx.translate(W / 2 + offsetX, H / 2 + offsetY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);

        const drawW = img.width > 600 ? 500 : img.width;
        const drawH = (img.height * drawW) / img.width;

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        renderText(ctx, W, H);
      };
    } else {
      // Placeholder illustration
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(20, 20, W - 40, H - 40);
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Завантажте ваші фото або логотип', W / 2, H / 2);
      renderText(ctx, W, H);
    }

    function renderText(c: CanvasRenderingContext2D, width: number, height: number) {
      if (!text.trim()) return;

      c.save();
      const fontSize = Math.round(height * 0.09);
      c.font = `bold ${fontSize}px sans-serif`;
      c.textAlign = 'center';

      let yPos = height * 0.85;
      if (textPosition === 'top') yPos = height * 0.18;
      if (textPosition === 'middle') yPos = height * 0.52;

      const metrics = c.measureText(text);
      const textWidth = metrics.width;
      const padding = 16;

      // Background Badge
      if (textBgColor && textBgColor !== 'transparent') {
        c.fillStyle = textBgColor;
        c.roundRect(
          width / 2 - textWidth / 2 - padding,
          yPos - fontSize * 0.8,
          textWidth + padding * 2,
          fontSize * 1.3,
          10
        );
        c.fill();
      }

      // Text Shadow
      c.shadowColor = 'rgba(0,0,0,0.5)';
      c.shadowBlur = 6;

      // Text Fill
      c.fillStyle = textColor;
      c.fillText(text, width / 2, yPos);
      c.restore();
    }
  }, [selectedShape, bgColor, imageSrc, zoom, rotation, offsetX, offsetY, text, textColor, textBgColor, textPosition]);

  const handleAddToCart = () => {
    const canvas = canvasRef.current;
    const previewUrl = canvas
      ? canvas.toDataURL('image/png')
      : (imageSrc || 'https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg');

    const customProduct: Product = {
      id: 'custom-' + Date.now(),
      name: `Магніт на замовлення "${selectedShape.name}" ${activeSize.label}`,
      slug: 'custom-magnet-' + Date.now(),
      price: totalPrice,
      sku: 'CUSTOM-MAG',
      status: 'Під замовлення',
      description: `Індивідуальне виготовлення. Форма: ${selectedShape.name}, Розмір: ${activeSize.label}, Ламінація: ${lamination === 'gloss' ? 'Глянцева' : 'Матова'}${isReinforced ? ', Посилений вініл 1.5мм' : ''}${text ? `, Текст: "${text}"` : ''}`,
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
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-slate-900 to-emerald-950 text-white p-8 rounded-3xl shadow-xl space-y-3">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Зроби свій магніт за 1 хвилину</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          Онлайн-Конструктор Магнітів
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl">
          Завантажте картинку з телефону або комп&apos;ютера, оберіть розмір та додайте власний текст. Ми виготовимо магніт з УФ-ламінацією за 1-2 дні!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Visual Preview Sticky Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Попередній перегляд
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                {selectedShape.name} ({activeSize.label})
              </span>
            </div>

            {/* Canvas Display */}
            <div className="relative w-full aspect-square bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center p-4 border border-slate-200 shadow-inner">
              <canvas
                ref={canvasRef}
                className={`w-full max-h-full object-contain shadow-lg bg-white transition-all ${
                  selectedShape.id === 'circle' ? 'rounded-full' : 'rounded-xl'
                }`}
              />
            </div>

            {/* Price & Cart button */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-500">Ціна макету:</span>
                <span className="text-3xl font-black text-emerald-600">{totalPrice} ₴</span>
              </div>

              <button
                onClick={handleAddToCart}
                className={`w-full py-4 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center space-x-2 transition transform active:scale-95 shadow-lg ${
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

        {/* Steps Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: Shape & Size */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 bg-emerald-600 text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
              <span>Оберіть форму та розмір</span>
            </h3>

            {/* Shape Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {SHAPES.map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => {
                    setSelectedShape(shape);
                    setSelectedSizeIndex(0);
                  }}
                  className={`p-3 rounded-2xl font-bold text-xs border text-center transition flex flex-col items-center gap-1.5 ${
                    selectedShape.id === shape.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {shape.iconName === 'square' && <Square className="w-5 h-5 text-emerald-600" />}
                  {shape.iconName === 'rectangle' && <RectangleHorizontal className="w-5 h-5 text-emerald-600" />}
                  {shape.iconName === 'circle' && <CircleIcon className="w-5 h-5 text-emerald-600" />}
                  {shape.iconName === 'shield' && <Shield className="w-5 h-5 text-emerald-600" />}
                  {shape.iconName === 'plate' && <Square className="w-5 h-5 text-emerald-600" />}
                  <span>{shape.name}</span>
                </button>
              ))}
            </div>

            {/* Size Buttons */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700">Оберіть розмір магніту</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {selectedShape.sizes.map((size, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSizeIndex(idx)}
                    className={`p-3 rounded-2xl font-bold text-xs border text-center transition ${
                      selectedSizeIndex === idx
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>{size.label}</div>
                    <div className="text-[11px] opacity-90 mt-0.5">{size.price} ₴</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 2: Upload Image */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 bg-emerald-600 text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
              <span>Завантажте ваші фото або логотип</span>
            </h3>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 p-8 rounded-2xl text-center cursor-pointer transition space-y-3"
            >
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-900 text-sm">
                  Натисніть сюди, щоб обрати фото з галереї
                </div>
                <div className="text-xs text-slate-500">
                  Підтримуються формати JPG, PNG, SVG або фото з банера
                </div>
              </div>
            </div>

            {/* Simple Controls if image uploaded */}
            {imageSrc && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Налаштування фото:</span>
                  <button
                    onClick={() => setImageSrc(null)}
                    className="text-xs text-red-500 font-bold hover:underline"
                  >
                    Видалити фото
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Масштаб (Збільшити / Зменшити): {Math.round(zoom * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.3"
                      max="3"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Поворот: {rotation}°
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="90"
                        value={rotation}
                        onChange={(e) => setRotation(parseInt(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                      <button
                        onClick={() => setRotation((prev) => (prev + 90) % 360)}
                        className="p-2 bg-white border rounded-xl hover:bg-slate-100 shrink-0"
                        title="Повернути на 90°"
                      >
                        <RotateCw className="w-4 h-4 text-slate-700" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: Add Text Inscription */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 bg-emerald-600 text-white rounded-full text-xs flex items-center justify-center font-bold">3</span>
              <span>Додайте текст або напис (за бажанням)</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Текст на магніті</label>
                <input
                  type="text"
                  placeholder="наприклад: ОХОРОНА / ЗСУ / МІНИ / +380 (67) 000-00-00"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {text && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Колір букв</label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-9 rounded-xl border cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Колір плашки</label>
                    <input
                      type="color"
                      value={textBgColor}
                      onChange={(e) => setTextBgColor(e.target.value)}
                      className="w-full h-9 rounded-xl border cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Розміщення</label>
                    <select
                      value={textPosition}
                      onChange={(e) => setTextPosition(e.target.value as 'top' | 'middle' | 'bottom')}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="top">Вгорі</option>
                      <option value="middle">По центру</option>
                      <option value="bottom">Внизу</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 4: Options & Material */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 bg-emerald-600 text-white rounded-full text-xs flex items-center justify-center font-bold">4</span>
              <span>Матеріали та Покриття</span>
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-start space-x-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isReinforced}
                  onChange={(e) => setIsReinforced(e.target.checked)}
                  className="mt-0.5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <div>
                  <span className="font-extrabold text-slate-900">Посилений вініловий магніт 1.5 мм (+50 ₴)</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Рекомендовано для легкових авто на трасі (швидкість понад 120 км/год)
                  </p>
                </div>
              </label>

              <div className="flex items-center space-x-4 pt-1">
                <span className="font-bold text-slate-700">Захисна ламінація:</span>
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    name="lamination"
                    value="gloss"
                    checked={lamination === 'gloss'}
                    onChange={() => setLamination('gloss')}
                    className="text-emerald-600"
                  />
                  <span className="font-bold text-slate-800">Глянцева</span>
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
                  <span className="font-bold text-slate-800">Матова</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
