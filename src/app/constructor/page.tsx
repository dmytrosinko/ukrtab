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
  Trash2,
  Copy,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Download,
  Grid,
  Sun,
  Contrast,
  Aperture,
  Shield,
  Star,
  TriangleAlert,
  Car,
  Image as ImageIcon,
  Pipette,
  Undo,
  Redo,
  Sparkle
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/types';

// Types for Photoshop Layer System
type LayerType = 'image' | 'text' | 'sticker';

interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  x: number; // percentage from center (0 = center, -50 to 50)
  y: number; // percentage from center (0 = center, -50 to 50)
  scale: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
}

interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string;
  brightness: number; // 0 to 200 (100 = normal)
  contrast: number;   // 0 to 200 (100 = normal)
  saturation: number; // 0 to 200 (100 = normal)
  hueRotate: number;  // -180 to 180
  blur: number;       // 0 to 20
  invert: boolean;
  flipX: boolean;
  flipY: boolean;
}

interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  bgColor: string;
  bgPadding: number;
  bgRadius: number;
  shadowColor: string;
  shadowBlur: number;
  isBold: boolean;
  isItalic: boolean;
  arcDegree: number;
}

interface StickerLayer extends BaseLayer {
  type: 'sticker';
  symbol: string;
  color: string;
  size: number;
}

type Layer = ImageLayer | TextLayer | StickerLayer;

interface MagnetShape {
  id: string;
  name: string;
  ratioWidth: number;
  ratioHeight: number;
  maskShape: 'rect' | 'circle' | 'shield' | 'plate';
  sizes: { label: string; price: number; w: number; h: number }[];
}

const MAGNET_SHAPES: MagnetShape[] = [
  {
    id: 'square',
    name: 'Квадрат',
    ratioWidth: 1,
    ratioHeight: 1,
    maskShape: 'rect',
    sizes: [
      { label: '15 x 15 см', price: 150, w: 15, h: 15 },
      { label: '25 x 25 см', price: 250, w: 25, h: 25 },
      { label: '30 x 30 см', price: 350, w: 30, h: 30 },
    ],
  },
  {
    id: 'rectangle',
    name: 'Прямокутник',
    ratioWidth: 2,
    ratioHeight: 1,
    maskShape: 'rect',
    sizes: [
      { label: '30 x 15 см', price: 220, w: 30, h: 15 },
      { label: '40 x 20 см', price: 320, w: 40, h: 20 },
      { label: '50 x 25 см', price: 450, w: 50, h: 25 },
    ],
  },
  {
    id: 'car-plate',
    name: 'Автономер 52х11',
    ratioWidth: 4.7,
    ratioHeight: 1,
    maskShape: 'plate',
    sizes: [
      { label: '52 x 11 см (Стандарт)', price: 250, w: 52, h: 11 },
      { label: '52 x 11 см (Композит 3мм)', price: 320, w: 52, h: 11 },
    ],
  },
  {
    id: 'circle',
    name: 'Круглий магніт',
    ratioWidth: 1,
    ratioHeight: 1,
    maskShape: 'circle',
    sizes: [
      { label: 'Ø 15 см', price: 170, w: 15, h: 15 },
      { label: 'Ø 25 см', price: 280, w: 25, h: 25 },
      { label: 'Ø 30 см', price: 380, w: 30, h: 30 },
    ],
  },
  {
    id: 'shield',
    name: 'Шеврон / Щит ЗСУ',
    ratioWidth: 1,
    ratioHeight: 1.2,
    maskShape: 'shield',
    sizes: [
      { label: '20 x 24 см', price: 260, w: 20, h: 24 },
      { label: '25 x 30 см', price: 360, w: 25, h: 30 },
    ],
  },
];

const FONTS = [
  { name: 'Impact / Табло', value: 'Impact, sans-serif' },
  { name: 'Montserrat / Сучасний', value: 'Montserrat, sans-serif' },
  { name: 'Roboto Black / Військовий', value: 'Roboto, sans-serif' },
  { name: 'Courier / Друк', value: 'Courier New, monospace' },
  { name: 'Georgia / Класичний', value: 'Georgia, serif' },
];

const STICKER_SYMBOLS = [
  { id: 'trident', name: 'Тризуб', symbol: '🔱' },
  { id: 'zsu-cross', name: 'Хрест ЗСУ', symbol: '⚔️' },
  { id: 'warning', name: 'Обережно ⚠️', symbol: '⚠️' },
  { id: 'shield-icon', name: 'Щит', symbol: '🛡️' },
  { id: 'star-icon', name: 'Зірка', symbol: '⭐' },
  { id: 'flag', name: 'Прапор', symbol: '🇺🇦' },
  { id: 'eagle', name: 'Орел', symbol: '🦅' },
  { id: 'fire', name: 'Вогонь', symbol: '🔥' },
  { id: 'car', name: 'Авто', symbol: '🚗' },
  { id: 'check', name: 'Галочка', symbol: '✅' },
];

const BACKGROUND_PRESETS = [
  { id: 'white', name: 'Більй', color: '#ffffff' },
  { id: 'black', name: 'Чорний', color: '#0f172a' },
  { id: 'yellow', name: 'Жовтий', color: '#facc15' },
  { id: 'emerald', name: 'Зелений', color: '#059669' },
  { id: 'ua-flag', name: 'Прапор УА', color: 'gradient-ua' },
  { id: 'camo', name: 'Камуфляж', color: '#3f4e38' },
  { id: 'carbon', name: 'Карбон', color: '#1e293b' },
];

export default function ConstructorPage() {
  const { addToCart } = useCart();
  const [selectedShape, setSelectedShape] = useState<MagnetShape>(MAGNET_SHAPES[0]);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number>(0);
  const [thickness, setThickness] = useState<'std' | 'heavy' | 'reflective'>('std');
  const [lamination, setLamination] = useState<'gloss' | 'matt'>('gloss');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Layers Array State (Photoshop Stack)
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);

  const [added, setAdded] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeSize = selectedShape.sizes[selectedSizeIndex] || selectedShape.sizes[0];
  const totalPrice =
    activeSize.price + (thickness === 'heavy' ? 60 : thickness === 'reflective' ? 100 : 0);

  const activeLayer = layers.find((l) => l.id === activeLayerId) || null;

  // Add Default Starter Image Layer if empty
  useEffect(() => {
    if (layers.length === 0) {
      const defaultImage: ImageLayer = {
        id: 'img-' + Date.now(),
        name: 'Логотип UKRTAB',
        type: 'image',
        src: 'https://images.prom.ua/6793582624_w640_h640_magnitna-naklejka-morska.jpg',
        x: 0,
        y: -10,
        scale: 0.8,
        rotation: 0,
        opacity: 100,
        locked: false,
        visible: true,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hueRotate: 0,
        blur: 0,
        invert: false,
        flipX: false,
        flipY: false,
      };

      const defaultText: TextLayer = {
        id: 'txt-' + Date.now(),
        name: 'Текст магніту',
        type: 'text',
        text: 'ЗСУ • МОРСЬКА ПІХОТА',
        fontFamily: 'Impact, sans-serif',
        fontSize: 26,
        color: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 2,
        bgColor: '#059669',
        bgPadding: 12,
        bgRadius: 8,
        shadowColor: 'rgba(0,0,0,0.5)',
        shadowBlur: 10,
        isBold: true,
        isItalic: false,
        arcDegree: 0,
        x: 0,
        y: 35,
        scale: 1,
        rotation: 0,
        opacity: 100,
        locked: false,
        visible: true,
      };

      setLayers([defaultImage, defaultText]);
      setActiveLayerId(defaultImage.id);
    }
  }, []);

  // Upload Custom Photo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const newImgLayer: ImageLayer = {
            id: 'img-' + Date.now(),
            name: `Завантажене фото (${layers.length + 1})`,
            type: 'image',
            src: ev.target.result as string,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 100,
            locked: false,
            visible: true,
            brightness: 100,
            contrast: 100,
            saturation: 100,
            hueRotate: 0,
            blur: 0,
            invert: false,
            flipX: false,
            flipY: false,
          };
          setLayers((prev) => [...prev, newImgLayer]);
          setActiveLayerId(newImgLayer.id);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add New Text Layer
  const handleAddTextLayer = () => {
    const newText: TextLayer = {
      id: 'txt-' + Date.now(),
      name: `Текст (${layers.length + 1})`,
      type: 'text',
      text: 'ВЛАСТИВИЙ НАПИС',
      fontFamily: 'Montserrat, sans-serif',
      fontSize: 24,
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 2,
      bgColor: '#0f172a',
      bgPadding: 10,
      bgRadius: 6,
      shadowColor: 'rgba(0,0,0,0.4)',
      shadowBlur: 6,
      isBold: true,
      isItalic: false,
      arcDegree: 0,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 100,
      locked: false,
      visible: true,
    };
    setLayers((prev) => [...prev, newText]);
    setActiveLayerId(newText.id);
  };

  // Add Sticker Layer
  const handleAddSticker = (symbol: string, name: string) => {
    const newSticker: StickerLayer = {
      id: 'stk-' + Date.now(),
      name: `Стікер ${name}`,
      type: 'sticker',
      symbol,
      color: '#facc15',
      size: 60,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 100,
      locked: false,
      visible: true,
    };
    setLayers((prev) => [...prev, newSticker]);
    setActiveLayerId(newSticker.id);
  };

  // Layer Actions
  const updateActiveLayer = (updater: (prev: Layer) => Layer) => {
    if (!activeLayerId) return;
    setLayers((prev) =>
      prev.map((l) => (l.id === activeLayerId ? updater(l) : l))
    );
  };

  const deleteActiveLayer = () => {
    if (!activeLayerId) return;
    setLayers((prev) => prev.filter((l) => l.id !== activeLayerId));
    setActiveLayerId(null);
  };

  const duplicateActiveLayer = () => {
    if (!activeLayer) return;
    const clone: Layer = {
      ...JSON.parse(JSON.stringify(activeLayer)),
      id: 'layer-' + Date.now(),
      name: `${activeLayer.name} (копія)`,
      x: activeLayer.x + 5,
      y: activeLayer.y + 5,
    };
    setLayers((prev) => [...prev, clone]);
    setActiveLayerId(clone.id);
  };

  const moveLayerOrder = (direction: 'up' | 'down') => {
    if (!activeLayerId) return;
    const idx = layers.findIndex((l) => l.id === activeLayerId);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx + 1 : idx - 1;
    if (newIdx < 0 || newIdx >= layers.length) return;

    const copy = [...layers];
    const [item] = copy.splice(idx, 1);
    copy.splice(newIdx, 0, item);
    setLayers(copy);
  };

  // Main Canvas Photoshop Render Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 600;
    const H = Math.round((W * selectedShape.ratioHeight) / selectedShape.ratioWidth);
    canvas.width = W;
    canvas.height = H;

    // 1. Draw Background
    ctx.clearRect(0, 0, W, H);
    if (bgColor === 'gradient-ua') {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(1, '#eab308');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = bgColor;
    }
    ctx.fillRect(0, 0, W, H);

    // Grid Overlay
    if (showGrid) {
      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Render Layers Stack
    const loadedImages: Record<string, HTMLImageElement> = {};
    let pendingImages = 0;

    layers.forEach((layer) => {
      if (layer.type === 'image' && layer.visible && layer.src) {
        pendingImages++;
        const img = new Image();
        img.src = layer.src;
        img.onload = () => {
          loadedImages[layer.id] = img;
          pendingImages--;
          if (pendingImages === 0) renderAllLayers();
        };
        img.onerror = () => {
          pendingImages--;
          if (pendingImages === 0) renderAllLayers();
        };
      }
    });

    if (pendingImages === 0) {
      renderAllLayers();
    }

    function renderAllLayers() {
      if (!ctx) return;
      layers.forEach((layer) => {
        if (!layer.visible) return;

        ctx.save();
        const centerX = W / 2 + (layer.x * W) / 100;
        const centerY = H / 2 + (layer.y * H) / 100;

        ctx.translate(centerX, centerY);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.scale(layer.scale, layer.scale);
        ctx.globalAlpha = layer.opacity / 100;

        if (layer.type === 'image') {
          const img = loadedImages[layer.id];
          if (img) {
            ctx.save();
            if (layer.flipX || layer.flipY) {
              ctx.scale(layer.flipX ? -1 : 1, layer.flipY ? -1 : 1);
            }
            // Apply Photoshop Filters
            const filterParts = [
              `brightness(${layer.brightness}%)`,
              `contrast(${layer.contrast}%)`,
              `saturate(${layer.saturation}%)`,
              `hue-rotate(${layer.hueRotate}deg)`,
              layer.blur > 0 ? `blur(${layer.blur}px)` : '',
              layer.invert ? 'invert(100%)' : '',
            ].filter(Boolean);

            if (filterParts.length > 0) {
              ctx.filter = filterParts.join(' ');
            }

            const imgW = img.width > 500 ? 350 : img.width;
            const imgH = (img.height * imgW) / img.width;
            ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
            ctx.restore();
          }
        } else if (layer.type === 'text') {
          ctx.font = `${layer.isItalic ? 'italic ' : ''}${layer.isBold ? 'bold ' : ''}${layer.fontSize}px ${layer.fontFamily}`;
          ctx.textAlign = 'center';

          const textMetrics = ctx.measureText(layer.text);
          const textW = textMetrics.width;
          const textH = layer.fontSize;

          // Background Badge
          if (layer.bgColor && layer.bgColor !== 'transparent') {
            ctx.fillStyle = layer.bgColor;
            const pad = layer.bgPadding;
            ctx.beginPath();
            ctx.roundRect(-textW / 2 - pad, -textH / 2 - pad / 2, textW + pad * 2, textH + pad, layer.bgRadius);
            ctx.fill();
          }

          // Text Shadow
          if (layer.shadowBlur > 0) {
            ctx.shadowColor = layer.shadowColor;
            ctx.shadowBlur = layer.shadowBlur;
            ctx.shadowOffsetY = 4;
          }

          // Text Stroke
          if (layer.strokeWidth > 0) {
            ctx.strokeStyle = layer.strokeColor;
            ctx.lineWidth = layer.strokeWidth * 2;
            ctx.strokeText(layer.text, 0, textH / 3);
          }

          // Main Text Fill
          ctx.fillStyle = layer.color;
          ctx.fillText(layer.text, 0, textH / 3);
        } else if (layer.type === 'sticker') {
          ctx.font = `${layer.size}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(layer.symbol, 0, 0);
        }

        ctx.restore();
      });

      // Active Selection Outline Highlight
      if (activeLayer && activeLayer.visible) {
        ctx.save();
        const centerX = W / 2 + (activeLayer.x * W) / 100;
        const centerY = H / 2 + (activeLayer.y * H) / 100;
        ctx.translate(centerX, centerY);
        ctx.rotate((activeLayer.rotation * Math.PI) / 180);
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(-60 * activeLayer.scale, -40 * activeLayer.scale, 120 * activeLayer.scale, 80 * activeLayer.scale);
        ctx.restore();
      }
    }
  }, [layers, activeLayerId, selectedShape, bgColor, showGrid, activeLayer]);

  // Export Design to High-Res Image File
  const handleDownloadDesign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `UKRTAB-Magnet-Design-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Add Custom Design Product to Cart
  const handleAddToCart = () => {
    const canvas = canvasRef.current;
    const previewUrl = canvas ? canvas.toDataURL('image/png') : 'https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg';

    const customProduct: Product = {
      id: 'custom-' + Date.now(),
      name: `Індивідуальний магніт "${selectedShape.name}" ${activeSize.label}`,
      slug: 'custom-photoshop-magnet-' + Date.now(),
      price: totalPrice,
      sku: 'CUSTOM-PRO-MAG',
      status: 'Під замовлення',
      description: `Індивідуальний дизайн Фотошоп-конструктора. Форма: ${selectedShape.name}, Розмір: ${activeSize.label}, Товщина: ${thickness === 'std' ? '0.8 мм' : thickness === 'heavy' ? '1.5 мм (Посилений)' : 'Світловідбиваючий Reflective'}, Покриття: ${lamination === 'gloss' ? 'Глянцеве' : 'Матове'}`,
      image: previewUrl,
      images: JSON.stringify([previewUrl]),
      unit: 'шт.',
      features: JSON.stringify({ shape: selectedShape.name, size: activeSize.label, thickness, lamination }),
      isFeatured: false,
    };

    addToCart(customProduct, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-8 rounded-3xl shadow-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Графічна Студія Укртаб • Photoshop Canvas Editor</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Професійний Графічний Конструктор Магнітів
          </h1>
          <p className="text-xs md:text-sm text-slate-300">
            Повний контроль за вашим макетом: шари, обрізка, яскравість, контраст, шрифти, патріотичні символи та автономери.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleDownloadDesign}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center space-x-2 border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Завантажити PNG</span>
          </button>
        </div>
      </div>

      {/* Main Photoshop Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Layers Panel & Layer Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Layer Management (Photoshop Layers Panel) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Шари графіки ({layers.length})</span>
              </h3>

              <div className="flex items-center space-x-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Завантажити фото"
                  className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  onClick={handleAddTextLayer}
                  title="Додати текст"
                  className="p-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition"
                >
                  <Type className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Layer Item Stack */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {layers.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  Немає шарів. Завантажте зображення або додайте текст.
                </div>
              ) : (
                [...layers].reverse().map((layer) => (
                  <div
                    key={layer.id}
                    onClick={() => setActiveLayerId(layer.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs cursor-pointer transition ${
                      activeLayerId === layer.id
                        ? 'border-emerald-600 bg-emerald-50/80 font-bold text-emerald-950 shadow-sm'
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      {layer.type === 'image' && <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />}
                      {layer.type === 'text' && <Type className="w-4 h-4 text-emerald-600 shrink-0" />}
                      {layer.type === 'sticker' && <Sparkle className="w-4 h-4 text-amber-500 shrink-0" />}
                      <span className="truncate">{layer.name}</span>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() =>
                          setLayers((prev) =>
                            prev.map((l) => (l.id === layer.id ? { ...l, visible: !l.visible } : l))
                          )
                        }
                        className="p-1 text-slate-400 hover:text-slate-700"
                      >
                        {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-300" />}
                      </button>

                      <button
                        onClick={() =>
                          setLayers((prev) =>
                            prev.map((l) => (l.id === layer.id ? { ...l, locked: !l.locked } : l))
                          )
                        }
                        className="p-1 text-slate-400 hover:text-slate-700"
                      >
                        {layer.locked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Layer Stack Buttons */}
            {activeLayer && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => moveLayerOrder('up')}
                    title="Підняти шар вище"
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveLayerOrder('down')}
                    title="Опустити шар нижче"
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={duplicateActiveLayer}
                    title="Дублювати шар"
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={deleteActiveLayer}
                  className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Видалити</span>
                </button>
              </div>
            )}
          </div>

          {/* Active Layer Inspector (Properties Panel) */}
          {activeLayer && (
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Налаштування шару: {activeLayer.name}</span>
              </h4>

              {/* Transform Sliders */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-700 font-bold mb-1">
                    <span>Позиція X: {activeLayer.x}%</span>
                    <span>Позиція Y: {activeLayer.y}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={activeLayer.x}
                      onChange={(e) =>
                        updateActiveLayer((l) => ({ ...l, x: parseInt(e.target.value) }))
                      }
                      className="accent-emerald-600"
                    />
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={activeLayer.y}
                      onChange={(e) =>
                        updateActiveLayer((l) => ({ ...l, y: parseInt(e.target.value) }))
                      }
                      className="accent-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 font-bold mb-1">
                    <span>Масштаб: {Math.round(activeLayer.scale * 100)}%</span>
                    <span>Поворот: {activeLayer.rotation}°</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="range"
                      min="0.2"
                      max="3"
                      step="0.05"
                      value={activeLayer.scale}
                      onChange={(e) =>
                        updateActiveLayer((l) => ({ ...l, scale: parseFloat(e.target.value) }))
                      }
                      className="accent-emerald-600"
                    />
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="5"
                      value={activeLayer.rotation}
                      onChange={(e) =>
                        updateActiveLayer((l) => ({ ...l, rotation: parseInt(e.target.value) }))
                      }
                      className="accent-emerald-600"
                    />
                  </div>
                </div>

                {/* Opacity */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Прозорість: {activeLayer.opacity}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={activeLayer.opacity}
                    onChange={(e) =>
                      updateActiveLayer((l) => ({ ...l, opacity: parseInt(e.target.value) }))
                    }
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              {/* Photoshop Filters if Image */}
              {activeLayer.type === 'image' && (
                <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
                  <div className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ефекти зображення (Filters)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium">Яскравість</label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={(activeLayer as ImageLayer).brightness}
                        onChange={(e) =>
                          updateActiveLayer((l) => ({
                            ...(l as ImageLayer),
                            brightness: parseInt(e.target.value),
                          }))
                        }
                        className="w-full accent-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium">Контраст</label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={(activeLayer as ImageLayer).contrast}
                        onChange={(e) =>
                          updateActiveLayer((l) => ({
                            ...(l as ImageLayer),
                            contrast: parseInt(e.target.value),
                          }))
                        }
                        className="w-full accent-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium">Насиченість</label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={(activeLayer as ImageLayer).saturation}
                        onChange={(e) =>
                          updateActiveLayer((l) => ({
                            ...(l as ImageLayer),
                            saturation: parseInt(e.target.value),
                          }))
                        }
                        className="w-full accent-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium">Відтінок (Hue)</label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={(activeLayer as ImageLayer).hueRotate}
                        onChange={(e) =>
                          updateActiveLayer((l) => ({
                            ...(l as ImageLayer),
                            hueRotate: parseInt(e.target.value),
                          }))
                        }
                        className="w-full accent-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Text Controls if Text Layer */}
              {activeLayer.type === 'text' && (
                <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Редагувати текст</label>
                    <input
                      type="text"
                      value={(activeLayer as TextLayer).text}
                      onChange={(e) =>
                        updateActiveLayer((l) => ({
                          ...(l as TextLayer),
                          text: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Шрифт</label>
                      <select
                        value={(activeLayer as TextLayer).fontFamily}
                        onChange={(e) =>
                          updateActiveLayer((l) => ({
                            ...(l as TextLayer),
                            fontFamily: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs"
                      >
                        {FONTS.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Колір тексту</label>
                      <input
                        type="color"
                        value={(activeLayer as TextLayer).color}
                        onChange={(e) =>
                          updateActiveLayer((l) => ({
                            ...(l as TextLayer),
                            color: e.target.value,
                          }))
                        }
                        className="w-full h-8 rounded-xl border border-slate-200 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Фон під текстом</label>
                      <input
                        type="color"
                        value={(activeLayer as TextLayer).bgColor}
                        onChange={(e) =>
                          updateActiveLayer((l) => ({
                            ...(l as TextLayer),
                            bgColor: e.target.value,
                          }))
                        }
                        className="w-full h-8 rounded-xl border border-slate-200 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Обводка (Stroke)</label>
                      <input
                        type="color"
                        value={(activeLayer as TextLayer).strokeColor}
                        onChange={(e) =>
                          updateActiveLayer((l) => ({
                            ...(l as TextLayer),
                            strokeColor: e.target.value,
                          }))
                        }
                        className="w-full h-8 rounded-xl border border-slate-200 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center Column: Canvas Viewport (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 sticky top-24">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Palette className="w-4 h-4 text-emerald-600" />
                <span>Студійний Canvas</span>
              </h3>

              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center space-x-1 transition ${
                  showGrid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Сітка</span>
              </button>
            </div>

            {/* Canvas Frame Container */}
            <div className="relative w-full aspect-square bg-slate-900 rounded-3xl overflow-hidden flex items-center justify-center p-6 border border-slate-800 shadow-inner">
              <canvas
                ref={canvasRef}
                className={`w-full max-h-full object-contain shadow-2xl transition-all ${
                  selectedShape.maskShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                }`}
              />
            </div>

            {/* Price & Order Card */}
            <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-5 rounded-2xl space-y-3 shadow-lg">
              <div className="flex justify-between items-baseline">
                <div>
                  <div className="text-xs text-slate-300">Вартість виготовлення:</div>
                  <div className="text-xs text-emerald-400 font-semibold">{activeSize.label}</div>
                </div>
                <div className="text-3xl font-black text-emerald-400">{totalPrice} ₴</div>
              </div>

              <button
                onClick={handleAddToCart}
                className={`w-full py-4 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center space-x-2 transition transform active:scale-95 shadow-xl ${
                  added
                    ? 'bg-emerald-700 text-white shadow-emerald-700/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Макет додано в кошик!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Замовити цей макет</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Shapes, Materials & Presets (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Form & Size Settings */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Форма та Розміри</span>
            </h3>

            {/* Shape Buttons */}
            <div className="space-y-1.5">
              {MAGNET_SHAPES.map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => {
                    setSelectedShape(shape);
                    setSelectedSizeIndex(0);
                  }}
                  className={`w-full p-2.5 rounded-2xl font-bold text-xs border text-left transition flex items-center justify-between ${
                    selectedShape.id === shape.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm'
                      : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{shape.name}</span>
                  <span className="text-[10px] font-normal opacity-75">
                    {shape.sizes[0].price} ₴+
                  </span>
                </button>
              ))}
            </div>

            {/* Size Options */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Оберіть розмір</label>
              <div className="space-y-1.5">
                {selectedShape.sizes.map((size, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSizeIndex(idx)}
                    className={`w-full p-2.5 rounded-2xl font-bold text-xs border text-left transition flex justify-between items-center ${
                      selectedSizeIndex === idx
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                        : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{size.label}</span>
                    <span>{size.price} ₴</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Thickness Selection */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <label className="block font-bold text-slate-700">Товщина магнітного вінілу</label>
              <div className="space-y-1.5">
                <button
                  onClick={() => setThickness('std')}
                  className={`w-full p-2.5 rounded-xl border text-left font-bold transition ${
                    thickness === 'std'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  0.8 мм Стандарт
                </button>
                <button
                  onClick={() => setThickness('heavy')}
                  className={`w-full p-2.5 rounded-xl border text-left font-bold transition ${
                    thickness === 'heavy'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  1.5 мм Посилений (+60 ₴)
                </button>
                <button
                  onClick={() => setThickness('reflective')}
                  className={`w-full p-2.5 rounded-xl border text-left font-bold transition ${
                    thickness === 'reflective'
                      ? 'border-amber-500 bg-amber-50 text-amber-950'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  ✨ Світловідбиваючий (+100 ₴)
                </button>
              </div>
            </div>
          </div>

          {/* Background Presets */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Фон канвасу (Background)
            </h3>

            <div className="grid grid-cols-4 gap-2">
              {BACKGROUND_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setBgColor(preset.color)}
                  className={`h-9 rounded-xl border-2 transition flex items-center justify-center font-bold text-[10px] ${
                    bgColor === preset.color
                      ? 'border-emerald-600 scale-105 shadow-md'
                      : 'border-slate-200'
                  }`}
                  style={{
                    background:
                      preset.color === 'gradient-ua'
                        ? 'linear-gradient(to bottom, #0284c7, #eab308)'
                        : preset.color,
                    color: preset.id === 'white' || preset.id === 'yellow' ? '#000' : '#fff',
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sticker / Military Library */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Бібліотека символів</span>
            </h3>

            <div className="grid grid-cols-5 gap-2">
              {STICKER_SYMBOLS.map((stk) => (
                <button
                  key={stk.id}
                  onClick={() => handleAddSticker(stk.symbol, stk.name)}
                  title={stk.name}
                  className="aspect-square bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl flex items-center justify-center text-xl transition transform active:scale-95"
                >
                  {stk.symbol}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
