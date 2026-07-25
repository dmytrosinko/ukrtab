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
  Square,
  Circle as CircleIcon,
  Shield,
  RectangleHorizontal,
  Pencil,
  Eraser,
  Star,
  Triangle,
  Minus,
  Download,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  ArrowUp,
  ArrowDown,
  MousePointer,
  Sparkle,
  Image as ImageIcon
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/types';

// Types for Photoshop Graphic Objects
type ToolMode = 'select' | 'brush' | 'eraser' | 'shape-rect' | 'shape-circle' | 'shape-star' | 'text' | 'image';

interface GraphicObject {
  id: string;
  name: string;
  type: 'image' | 'text' | 'rect' | 'circle' | 'star' | 'path';
  x: number; // canvas x (pixels)
  y: number; // canvas y (pixels)
  width: number;
  height: number;
  rotation: number; // degrees
  scale: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  // Specific data
  src?: string; // for image
  text?: string; // for text
  fontSize?: number;
  fontFamily?: string;
  pathPoints?: { x: number; y: number }[]; // for freehand brush drawing
}

interface MagnetShape {
  id: string;
  name: string;
  ratioWidth: number;
  ratioHeight: number;
  sizes: { label: string; price: number; w: number; h: number }[];
}

const MAGNET_SHAPES: MagnetShape[] = [
  {
    id: 'square',
    name: 'Квадрат',
    ratioWidth: 1,
    ratioHeight: 1,
    sizes: [
      { label: '15 x 15 см', price: 150, w: 15, h: 15 },
      { label: '25 x 25 см (Хіт)', price: 250, w: 25, h: 25 },
      { label: '30 x 30 см', price: 350, w: 30, h: 30 },
    ],
  },
  {
    id: 'rectangle',
    name: 'Прямокутник',
    ratioWidth: 2,
    ratioHeight: 1,
    sizes: [
      { label: '30 x 15 см', price: 220, w: 30, h: 15 },
      { label: '40 x 20 см (Авто)', price: 320, w: 40, h: 20 },
      { label: '50 x 25 см', price: 450, w: 50, h: 25 },
    ],
  },
  {
    id: 'car-plate',
    name: 'Автономер 52х11',
    ratioWidth: 4.7,
    ratioHeight: 1,
    sizes: [
      { label: '52 x 11 см (Стандарт)', price: 250, w: 52, h: 11 },
      { label: '52 x 11 см (Посилений)', price: 320, w: 52, h: 11 },
    ],
  },
  {
    id: 'circle',
    name: 'Круглий магніт',
    ratioWidth: 1,
    ratioHeight: 1,
    sizes: [
      { label: 'Ø 15 см', price: 170, w: 15, h: 15 },
      { label: 'Ø 25 см', price: 280, w: 25, h: 25 },
      { label: 'Ø 30 см', price: 380, w: 30, h: 30 },
    ],
  },
  {
    id: 'shield',
    name: 'Шеврон / Щит',
    ratioWidth: 0.85,
    ratioHeight: 1,
    sizes: [
      { label: '20 x 24 см', price: 260, w: 20, h: 24 },
      { label: '25 x 30 см', price: 360, w: 25, h: 30 },
    ],
  },
];

export default function ConstructorPage() {
  const { addToCart } = useCart();
  const [selectedShape, setSelectedShape] = useState<MagnetShape>(MAGNET_SHAPES[0]);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number>(1);
  const [isReinforced, setIsReinforced] = useState<boolean>(false);
  const [lamination, setLamination] = useState<'gloss' | 'matt'>('gloss');
  const [bgColor, setBgColor] = useState<string>('#ffffff');

  // Photoshop Tools State
  const [activeTool, setActiveTool] = useState<ToolMode>('select');
  const [primaryColor, setPrimaryColor] = useState<string>('#15803d');
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [brushSize, setBrushSize] = useState<number>(6);

  // Objects Array (Photoshop Layers)
  const [objects, setObjects] = useState<GraphicObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Freehand Drawing State
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

  // Dragging State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [added, setAdded] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeSize = selectedShape.sizes[selectedSizeIndex] || selectedShape.sizes[0];
  const totalPrice = activeSize.price + (isReinforced ? 50 : 0);

  const selectedObject = objects.find((o) => o.id === selectedId) || null;

  // Initial Starter Objects
  useEffect(() => {
    if (objects.length === 0) {
      const defaultText: GraphicObject = {
        id: 'obj-text-1',
        name: 'Текст ЗСУ',
        type: 'text',
        x: 300,
        y: 120,
        width: 280,
        height: 50,
        rotation: 0,
        scale: 1,
        fillColor: '#15803d',
        strokeColor: '#ffffff',
        strokeWidth: 2,
        opacity: 100,
        visible: true,
        locked: false,
        text: 'ЗСУ • УКТАБ',
        fontSize: 36,
        fontFamily: 'Impact, sans-serif',
      };

      const defaultShield: GraphicObject = {
        id: 'obj-rect-1',
        name: 'Рамка знаку',
        type: 'rect',
        x: 300,
        y: 280,
        width: 320,
        height: 200,
        rotation: 0,
        scale: 1,
        fillColor: 'transparent',
        strokeColor: '#15803d',
        strokeWidth: 6,
        opacity: 100,
        visible: true,
        locked: false,
      };

      setObjects([defaultShield, defaultText]);
      setSelectedId(defaultText.id);
    }
  }, []);

  // Upload Photo to Canvas
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const resultSrc = ev.target?.result as string;
        if (resultSrc) {
          const img = new Image();
          img.src = resultSrc;
          img.onload = () => {
            const newImgObj: GraphicObject = {
              id: 'img-' + Date.now(),
              name: `Фото (${objects.length + 1})`,
              type: 'image',
              x: 300,
              y: 200,
              width: img.width > 300 ? 250 : img.width,
              height: img.width > 300 ? (img.height * 250) / img.width : img.height,
              rotation: 0,
              scale: 1,
              fillColor: 'transparent',
              strokeColor: 'transparent',
              strokeWidth: 0,
              opacity: 100,
              visible: true,
              locked: false,
              src: resultSrc,
            };
            setObjects((prev) => [...prev, newImgObj]);
            setSelectedId(newImgObj.id);
            setActiveTool('select');
          };
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Text Object
  const handleAddText = () => {
    const newText: GraphicObject = {
      id: 'text-' + Date.now(),
      name: `Текст (${objects.length + 1})`,
      type: 'text',
      text: 'НОВИЙ ТЕКСТ',
      x: 300,
      y: 200,
      width: 200,
      height: 40,
      rotation: 0,
      scale: 1,
      fillColor: primaryColor,
      strokeColor: strokeColor,
      strokeWidth: 1,
      opacity: 100,
      visible: true,
      locked: false,
      fontSize: 28,
      fontFamily: 'Montserrat, sans-serif',
    };
    setObjects((prev) => [...prev, newText]);
    setSelectedId(newText.id);
    setActiveTool('select');
  };

  // Add Geometric Shapes (Rectangle, Circle, Star)
  const handleAddShape = (shapeType: 'rect' | 'circle' | 'star') => {
    const newShape: GraphicObject = {
      id: 'shape-' + Date.now(),
      name: shapeType === 'rect' ? 'Прямокутник' : shapeType === 'circle' ? 'Коло' : 'Зірка',
      type: shapeType,
      x: 300,
      y: 200,
      width: 140,
      height: 140,
      rotation: 0,
      scale: 1,
      fillColor: primaryColor,
      strokeColor: strokeColor,
      strokeWidth: 3,
      opacity: 100,
      visible: true,
      locked: false,
    };
    setObjects((prev) => [...prev, newShape]);
    setSelectedId(newShape.id);
    setActiveTool('select');
  };

  // Main Canvas Render Pipeline
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
    if (bgColor === 'ua-flag') {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, W, H / 2);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(0, H / 2, W, H / 2);
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, H);
    }

    // Load Image Objects
    const loadedImages: Record<string, HTMLImageElement> = {};
    let pending = 0;

    objects.forEach((obj) => {
      if (obj.type === 'image' && obj.visible && obj.src) {
        pending++;
        const img = new Image();
        img.src = obj.src;
        img.onload = () => {
          loadedImages[obj.id] = img;
          pending--;
          if (pending === 0) renderScene();
        };
        img.onerror = () => {
          pending--;
          if (pending === 0) renderScene();
        };
      }
    });

    if (pending === 0) renderScene();

    function renderScene() {
      if (!ctx) return;

      objects.forEach((obj) => {
        if (!obj.visible) return;

        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate((obj.rotation * Math.PI) / 180);
        ctx.scale(obj.scale, obj.scale);
        ctx.globalAlpha = obj.opacity / 100;

        if (obj.type === 'image') {
          const img = loadedImages[obj.id];
          if (img) {
            ctx.drawImage(img, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
          }
        } else if (obj.type === 'rect') {
          ctx.fillStyle = obj.fillColor;
          ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
          if (obj.strokeWidth > 0) {
            ctx.strokeStyle = obj.strokeColor;
            ctx.lineWidth = obj.strokeWidth;
            ctx.strokeRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
          }
        } else if (obj.type === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, obj.width / 2, 0, Math.PI * 2);
          ctx.fillStyle = obj.fillColor;
          ctx.fill();
          if (obj.strokeWidth > 0) {
            ctx.strokeStyle = obj.strokeColor;
            ctx.lineWidth = obj.strokeWidth;
            ctx.stroke();
          }
        } else if (obj.type === 'star') {
          drawStar(ctx, 0, 0, 5, obj.width / 2, obj.width / 4, obj.fillColor, obj.strokeColor, obj.strokeWidth);
        } else if (obj.type === 'text') {
          ctx.font = `bold ${obj.fontSize || 28}px ${obj.fontFamily || 'sans-serif'}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          if (obj.strokeWidth > 0) {
            ctx.strokeStyle = obj.strokeColor;
            ctx.lineWidth = obj.strokeWidth * 2;
            ctx.strokeText(obj.text || '', 0, 0);
          }
          ctx.fillStyle = obj.fillColor;
          ctx.fillText(obj.text || '', 0, 0);
        } else if (obj.type === 'path' && obj.pathPoints && obj.pathPoints.length > 0) {
          ctx.beginPath();
          ctx.strokeStyle = obj.strokeColor;
          ctx.lineWidth = obj.strokeWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          obj.pathPoints.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x - obj.x, pt.y - obj.y);
            else ctx.lineTo(pt.x - obj.x, pt.y - obj.y);
          });
          ctx.stroke();
        }

        ctx.restore();
      });

      // Active Freehand Drawing Path Preview
      if (currentPath.length > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = activeTool === 'eraser' ? bgColor : primaryColor;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        currentPath.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        ctx.restore();
      }

      // Selected Object Highlight Outline
      if (selectedObject && selectedObject.visible) {
        ctx.save();
        ctx.translate(selectedObject.x, selectedObject.y);
        ctx.rotate((selectedObject.rotation * Math.PI) / 180);
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(
          (-selectedObject.width * selectedObject.scale) / 2 - 8,
          (-selectedObject.height * selectedObject.scale) / 2 - 8,
          selectedObject.width * selectedObject.scale + 16,
          selectedObject.height * selectedObject.scale + 16
        );
        ctx.restore();
      }
    }
  }, [objects, selectedId, selectedShape, bgColor, activeTool, currentPath, primaryColor, brushSize, selectedObject]);

  // Helper for drawing 5-point star
  function drawStar(
    c: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number,
    fill: string,
    stroke: string,
    strokeW: number
  ) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    c.beginPath();
    c.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      c.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      c.lineTo(x, y);
      rot += step;
    }
    c.lineTo(cx, cy - outerRadius);
    c.closePath();
    c.fillStyle = fill;
    c.fill();
    if (strokeW > 0) {
      c.strokeStyle = stroke;
      c.lineWidth = strokeW;
      c.stroke();
    }
  }

  // Mouse Interactivity for Dragging & Drawing
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    if (activeTool === 'brush' || activeTool === 'eraser') {
      setIsDrawing(true);
      setCurrentPath([{ x: mouseX, y: mouseY }]);
      return;
    }

    // Select/Move Mode: Click Detection
    let clickedId: string | null = null;
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if (!obj.visible || obj.locked) continue;
      const hw = (obj.width * obj.scale) / 2;
      const hh = (obj.height * obj.scale) / 2;
      if (mouseX >= obj.x - hw && mouseX <= obj.x + hw && mouseY >= obj.y - hh && mouseY <= obj.y + hh) {
        clickedId = obj.id;
        setDragOffset({ x: mouseX - obj.x, y: mouseY - obj.y });
        break;
      }
    }

    setSelectedId(clickedId);
    if (clickedId) setIsDragging(true);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    if (isDrawing) {
      setCurrentPath((prev) => [...prev, { x: mouseX, y: mouseY }]);
    } else if (isDragging && selectedId) {
      setObjects((prev) =>
        prev.map((o) =>
          o.id === selectedId ? { ...o, x: mouseX - dragOffset.x, y: mouseY - dragOffset.y } : o
        )
      );
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing && currentPath.length > 1) {
      const newPathObj: GraphicObject = {
        id: 'path-' + Date.now(),
        name: activeTool === 'eraser' ? 'Гумка' : 'Малюнок олівцем',
        type: 'path',
        x: currentPath[0].x,
        y: currentPath[0].y,
        width: 100,
        height: 100,
        rotation: 0,
        scale: 1,
        fillColor: 'transparent',
        strokeColor: activeTool === 'eraser' ? bgColor : primaryColor,
        strokeWidth: brushSize,
        opacity: 100,
        visible: true,
        locked: false,
        pathPoints: currentPath,
      };
      setObjects((prev) => [...prev, newPathObj]);
      setSelectedId(newPathObj.id);
    }

    setIsDrawing(false);
    setCurrentPath([]);
    setIsDragging(false);
  };

  // Object Property Updates
  const updateSelected = (updater: (prev: GraphicObject) => GraphicObject) => {
    if (!selectedId) return;
    setObjects((prev) => prev.map((o) => (o.id === selectedId ? updater(o) : o)));
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setObjects((prev) => prev.filter((o) => o.id !== selectedId));
    setSelectedId(null);
  };

  const handleAddToCart = () => {
    const canvas = canvasRef.current;
    const previewUrl = canvas ? canvas.toDataURL('image/png') : 'https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg';

    const customProduct: Product = {
      id: 'custom-' + Date.now(),
      name: `Магніт з фотошоп-графікою "${selectedShape.name}" ${activeSize.label}`,
      slug: 'custom-graphic-magnet-' + Date.now(),
      price: totalPrice,
      sku: 'CUSTOM-GRAPHIC-MAG',
      status: 'Під замовлення',
      description: `Індивідуальна графічна студія. Форма: ${selectedShape.name}, Розмір: ${activeSize.label}, Товщина: ${isReinforced ? '1.5 мм (Посилений)' : '0.8 мм'}, Покриття: ${lamination === 'gloss' ? 'Глянцева' : 'Матова'}`,
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
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Photoshop Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Графічна Студія Photoshop Canvas</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">
            Конструктор Графіки: Малювання, Форми, Текст та Фото
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 transition shadow-md"
          >
            <Upload className="w-4 h-4" />
            <span>Додати фото</span>
          </button>
        </div>
      </div>

      {/* Main Photoshop Toolbar & Canvas Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Toolbar & Tools (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Main Drawing Tools */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b pb-2">
              Інструменти малювання
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => setActiveTool('select')}
                className={`p-2.5 rounded-xl border flex items-center space-x-2 transition ${
                  activeTool === 'select'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <MousePointer className="w-4 h-4 text-emerald-600" />
                <span>Виділення</span>
              </button>

              <button
                onClick={() => setActiveTool('brush')}
                className={`p-2.5 rounded-xl border flex items-center space-x-2 transition ${
                  activeTool === 'brush'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <Pencil className="w-4 h-4 text-emerald-600" />
                <span>Пензель</span>
              </button>

              <button
                onClick={() => setActiveTool('eraser')}
                className={`p-2.5 rounded-xl border flex items-center space-x-2 transition ${
                  activeTool === 'eraser'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <Eraser className="w-4 h-4 text-red-500" />
                <span>Гумка</span>
              </button>

              <button
                onClick={handleAddText}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center space-x-2 transition"
              >
                <Type className="w-4 h-4 text-emerald-600" />
                <span>Текст</span>
              </button>
            </div>

            {/* Geometric Shapes Adding */}
            <div className="pt-2 border-t space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                Малювати геометричні форми:
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAddShape('rect')}
                  className="p-2 bg-slate-50 border rounded-xl hover:bg-emerald-50 text-slate-700 flex-1 flex items-center justify-center gap-1 text-xs font-bold"
                >
                  <Square className="w-4 h-4 text-emerald-600" />
                  <span>Квадрат</span>
                </button>
                <button
                  onClick={() => handleAddShape('circle')}
                  className="p-2 bg-slate-50 border rounded-xl hover:bg-emerald-50 text-slate-700 flex-1 flex items-center justify-center gap-1 text-xs font-bold"
                >
                  <CircleIcon className="w-4 h-4 text-emerald-600" />
                  <span>Коло</span>
                </button>
                <button
                  onClick={() => handleAddShape('star')}
                  className="p-2 bg-slate-50 border rounded-xl hover:bg-emerald-50 text-slate-700 flex-1 flex items-center justify-center gap-1 text-xs font-bold"
                >
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>Зірка</span>
                </button>
              </div>
            </div>

            {/* Colors & Brush Size */}
            <div className="pt-2 border-t space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Основний колір</label>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full h-8 rounded-xl border cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Колір обводки</label>
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-full h-8 rounded-xl border cursor-pointer"
                  />
                </div>
              </div>

              {(activeTool === 'brush' || activeTool === 'eraser') && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Товщина пензля: {brushSize}px
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="40"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Layer Panel Stack */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Шари ({objects.length})</span>
              </h3>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {[...objects].reverse().map((obj) => (
                <div
                  key={obj.id}
                  onClick={() => setSelectedId(obj.id)}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer border transition ${
                    selectedId === obj.id
                      ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950'
                      : 'border-slate-100 bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="truncate">{obj.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setObjects((prev) => prev.filter((o) => o.id !== obj.id));
                    }}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Canvas Viewport (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 sticky top-24">
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Інтерактивне полотно магніту
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                {selectedShape.name} ({activeSize.label})
              </span>
            </div>

            {/* HTML5 Interactive Canvas */}
            <div className="relative w-full aspect-square bg-slate-900 rounded-3xl overflow-hidden flex items-center justify-center p-4 border border-slate-800 shadow-2xl">
              <canvas
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                className={`w-full max-h-full object-contain cursor-crosshair bg-white transition-all ${
                  selectedShape.id === 'circle' ? 'rounded-full' : 'rounded-2xl'
                }`}
              />
            </div>

            {/* Object Controls Inspector */}
            {selectedObject && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 text-xs">
                <div className="font-bold text-slate-800 flex justify-between items-center">
                  <span>Редагування шару: {selectedObject.name}</span>
                  <button onClick={deleteSelected} className="text-red-500 hover:underline">
                    Видалити
                  </button>
                </div>

                {selectedObject.type === 'text' && (
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Змінити текст</label>
                    <input
                      type="text"
                      value={selectedObject.text || ''}
                      onChange={(e) =>
                        updateSelected((o) => ({ ...o, text: e.target.value }))
                      }
                      className="w-full px-3 py-1.5 bg-white border rounded-xl font-bold"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Масштаб: {Math.round(selectedObject.scale * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.3"
                      max="3"
                      step="0.05"
                      value={selectedObject.scale}
                      onChange={(e) =>
                        updateSelected((o) => ({ ...o, scale: parseFloat(e.target.value) }))
                      }
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Поворот: {selectedObject.rotation}°
                    </label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="5"
                      value={selectedObject.rotation}
                      onChange={(e) =>
                        updateSelected((o) => ({ ...o, rotation: parseInt(e.target.value) }))
                      }
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Ordering Panel (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase border-b pb-2">
              Форма та Замовлення
            </h3>

            {/* Shape selection */}
            <div className="space-y-1.5">
              {MAGNET_SHAPES.map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => {
                    setSelectedShape(shape);
                    setSelectedSizeIndex(0);
                  }}
                  className={`w-full p-2 rounded-xl text-xs font-bold border text-left transition flex justify-between ${
                    selectedShape.id === shape.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                      : 'border-slate-100 bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{shape.name}</span>
                  <span>{shape.sizes[0].price} ₴+</span>
                </button>
              ))}
            </div>

            {/* Size selection */}
            <div className="pt-2 border-t space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Розмір магніту</label>
              {selectedShape.sizes.map((size, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSizeIndex(idx)}
                  className={`w-full p-2 rounded-xl text-xs font-bold border text-left transition flex justify-between ${
                    selectedSizeIndex === idx
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-100 bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{size.label}</span>
                  <span>{size.price} ₴</span>
                </button>
              ))}
            </div>

            {/* Price & Add to cart */}
            <div className="pt-3 border-t space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-500">До сплати:</span>
                <span className="text-2xl font-black text-emerald-600">{totalPrice} ₴</span>
              </div>

              <button
                onClick={handleAddToCart}
                className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition shadow-lg ${
                  added
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Додано в кошик!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Замовити цей макет</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
