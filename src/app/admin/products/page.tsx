'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit3, Image as ImageIcon, Search, Check, RefreshCw, Upload, Tag } from 'lucide-react';
import { Product, Category } from '@/lib/types';
import { INITIAL_CATEGORIES } from '@/lib/store';
import { getCategoryOptions } from '@/lib/categories';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    oldPrice: '',
    sku: '',
    status: 'В наявності',
    categoryId: 'cat-other',
    image: '',
    images: [] as string[],
    description: '',
    unit: 'шт.',
  });

  const [newImageUrlInput, setNewImageUrlInput] = useState('');

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      try {
        const resCat = await fetch('/api/categories');
        const dataCat = await resCat.json();
        if (Array.isArray(dataCat) && dataCat.length > 0) {
          setCategories(dataCat);
        }
      } catch (catErr) {}

      const resProd = await fetch('/api/products');
      const dataProd = await resProd.json();
      const serverItems: Product[] = Array.isArray(dataProd) ? dataProd : [];

      const clean = serverItems.filter(
        (p: Product) =>
          p &&
          p.name &&
          p.name !== 'top of the top' &&
          p.name !== 'еталон краси' &&
          p.name !== 'Mavvir'
      );
      setProducts(clean);
    } catch (e) {
      console.error('Failed to fetch admin products:', e);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('add') === 'true') {
        handleOpenModal();
      }
    }
  }, []);

  // Handle Photo File Upload & Compress to max 600px JPEG (~30KB)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const resultSrc = ev.target?.result as string;
          if (resultSrc) {
            const img = new Image();
            img.src = resultSrc;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const maxDim = 600;
              let w = img.width;
              let h = img.height;
              if (w > maxDim || h > maxDim) {
                if (w > h) {
                  h = Math.round((h * maxDim) / w);
                  w = maxDim;
                } else {
                  w = Math.round((w * maxDim) / h);
                  h = maxDim;
                }
              }
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, w, h);
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
                setFormData((prev) => {
                  const updatedImgs = [...prev.images, compressedDataUrl];
                  return {
                    ...prev,
                    image: prev.image || compressedDataUrl,
                    images: updatedImgs,
                  };
                });
              }
            };
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrlInput.trim()) return;
    const url = newImageUrlInput.trim();
    setFormData((prev) => {
      const updated = [...prev.images, url];
      return {
        ...prev,
        image: prev.image || url,
        images: updated,
      };
    });
    setNewImageUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => {
      const updated = prev.images.filter((_, idx) => idx !== indexToRemove);
      const newMain = updated[0] || '';
      return {
        ...prev,
        image: newMain,
        images: updated,
      };
    });
  };

  const generateAutoSku = (name?: string) => {
    const num = Math.floor(1000 + Math.random() * 9000);
    if (name && name.trim().length > 0) {
      const clean = name.trim().toUpperCase().replace(/[^A-ZА-ЯІЇЄҐ0-9]/g, '');
      const prefix = clean.length >= 2 ? clean.slice(0, 3) : 'UKR';
      return `${prefix}-${num}`;
    }
    return `UKR-${num}`;
  };

  const handleOpenModal = () => {
    setEditingProduct(null);
    const autoSku = generateAutoSku();
    setFormData({
      name: '',
      price: '',
      oldPrice: '',
      sku: autoSku,
      status: 'В наявності',
      categoryId: 'cat-other',
      image: '',
      images: [],
      description: '',
      unit: 'шт.',
    });
    setNewImageUrlInput('');
    setIsModalOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);

    let parsedImgs: string[] = [];
    if (prod.images) {
      try {
        const arr = JSON.parse(prod.images);
        if (Array.isArray(arr)) parsedImgs = arr;
      } catch (e) {}
    }
    if (parsedImgs.length === 0 && prod.image) {
      parsedImgs = [prod.image];
    }

    setFormData({
      name: prod.name || '',
      price: prod.price !== undefined && prod.price !== null ? String(prod.price) : '',
      oldPrice: prod.oldPrice !== undefined && prod.oldPrice !== null ? String(prod.oldPrice) : '',
      sku: prod.sku || '',
      status: prod.status || 'В наявності',
      categoryId: prod.categoryId || 'cat-other',
      image: prod.image || (parsedImgs[0] || ''),
      images: parsedImgs,
      description: prod.description || '',
      unit: prod.unit || 'шт.',
    });
    setNewImageUrlInput('');
    setIsModalOpen(true);
  };

  const handleNameChange = (nameVal: string) => {
    setFormData((prev) => {
      const autoSku = editingProduct ? prev.sku : generateAutoSku(nameVal);
      return {
        ...prev,
        name: nameVal,
        sku: autoSku,
      };
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('Будь ласка, вкажіть назву товару та ціну');
      return;
    }

    const defaultImage = formData.image || formData.images[0] || 'https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg';
    const allImagesList = formData.images.length > 0 ? formData.images : [defaultImage];

    if (editingProduct) {
      // Editing existing product
      const updatedProdObj: Product = {
        ...editingProduct,
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
        sku: formData.sku || editingProduct.sku || generateAutoSku(formData.name),
        status: formData.status || 'В наявності',
        categoryId: formData.categoryId || 'cat-other',
        description: formData.description || '',
        image: defaultImage,
        images: JSON.stringify(allImagesList),
        unit: formData.unit || 'шт.',
      };

      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updatedProdObj : p)));
      setIsModalOpen(false);
      setEditingProduct(null);

      // PUT to API
      try {
        await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProdObj),
        });
      } catch (err) {
        console.warn('Network send handled safely:', err);
      }
    } else {
      // Creating new product
      const newProdObj: Product = {
        id: 'prod-' + Date.now(),
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9а-яіїєґ]+/gi, '-') + '-' + Date.now().toString().slice(-4),
        price: parseFloat(formData.price) || 250,
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
        sku: formData.sku || generateAutoSku(formData.name),
        status: formData.status || 'В наявності',
        categoryId: formData.categoryId || 'cat-other',
        description: formData.description || '',
        image: defaultImage,
        images: JSON.stringify(allImagesList),
        unit: formData.unit || 'шт.',
        features: '[]',
        isFeatured: false,
      };

      setProducts((prev) => [newProdObj, ...prev]);
      setIsModalOpen(false);

      try {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newProdObj,
            image: defaultImage,
            images: allImagesList,
          }),
        });
      } catch (err) {
        console.warn('Network send handled safely:', err);
      }
    }

    setFormData({
      name: '',
      price: '',
      oldPrice: '',
      sku: '',
      status: 'В наявності',
      categoryId: 'cat-other',
      image: '',
      images: [],
      description: '',
      unit: 'шт.',
    });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Ви дійсно бажаєте видалити цей товар?')) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Управління товарами (CMS)</h2>
          <p className="text-xs text-slate-500">Всього товарів у каталозі: {products.length}</p>
        </div>

        <div className="flex flex-wrap items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={async () => {
              if (confirm('Видалити всі однакові дублікати товарів з бази даних?')) {
                try {
                  const res = await fetch('/api/admin/dedupe');
                  const data = await res.json();
                  alert(data.message || 'Очищення дублікатів завершено');
                  fetchData();
                } catch (e) {
                  alert('Помилка виконання очищення');
                }
              }
            }}
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-4 py-3 rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 border border-amber-300"
            title="Очистити однакові дублікати товарів з однаковою назвою та ціною"
          >
            <span>🧹 Очистити дублікати</span>
          </button>

          <button
            onClick={handleOpenModal}
            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Додати новий товар</span>
          </button>

          <button
            onClick={fetchData}
            className="p-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-2xl transition"
            title="Оновити список"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <input
          type="text"
          placeholder="Пошук товару за назвою або артикулом SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-emerald-500 shadow-sm"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-medium">Завантаження товарів...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 font-medium">Товарів не знайдено</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-4">Фото</th>
                  <th className="p-4">Назва товару</th>
                  <th className="p-4">Категорія</th>
                  <th className="p-4">Артикул</th>
                  <th className="p-4">Ціна / Знижка</th>
                  <th className="p-4">Статус</th>
                  <th className="p-4 text-right">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProducts.map((p) => {
                  const catMatch = categories.find((c) => c.id === p.categoryId) || INITIAL_CATEGORIES.find((c) => c.id === (p.categoryId || 'cat-other'));
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <img src={p.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                        {p.description && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 font-normal mt-0.5">
                            {p.description}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-[11px]">
                          {catMatch ? catMatch.name : 'Інше'}
                        </span>
                      </td>
                    <td className="p-4 font-mono text-slate-500">{p.sku || '-'}</td>
                    <td className="p-4">
                      <div className="font-black text-slate-900">{p.price} ₴ <span className="text-[10px] font-normal text-slate-400">/{p.unit || 'шт.'}</span></div>
                      {p.oldPrice && (
                        <div className="text-[10px] text-amber-600 font-bold line-through">
                          {p.oldPrice} ₴
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                          p.status === 'Під замовлення'
                            ? 'bg-amber-100 text-amber-800'
                            : p.status === 'Немає в наявності'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.status || 'В наявності'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => handleEditProduct(p)}
                        className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                        title="Редагувати товар"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                        title="Видалити"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                {editingProduct ? (
                  <>
                    <Edit3 className="w-5 h-5 text-emerald-600" />
                    <span>Редагувати товар</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-emerald-600" />
                    <span>Додати новий товар в магазин</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProduct(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Product Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Назва товару *</label>
                <input
                  type="text"
                  required
                  placeholder="наприклад: Магніт Табличка"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Категорія товару *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  {getCategoryOptions(categories).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  За замовченням призначається категорія "Інше". Ви можете обрати головну категорію або її підкатегорію.
                </p>
              </div>

              {/* Price & Old Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ціна (₴) *</label>
                  <input
                    type="number"
                    required
                    placeholder="250"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Стара ціна / Знижка (₴)</label>
                  <input
                    type="number"
                    placeholder="300 (залиште порожнім якщо немає)"
                    value={formData.oldPrice}
                    onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* SKU & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Артикул (SKU)</label>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, sku: generateAutoSku(prev.name) }))}
                      className="text-[10px] text-emerald-600 font-bold hover:underline"
                    >
                      ⚡ Згенерувати
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="UKR-1234"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-emerald-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Статус наявності</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="В наявності">В наявності</option>
                    <option value="Під замовлення">Під замовлення</option>
                    <option value="Немає в наявності">Немає в наявності</option>
                  </select>
                </div>
              </div>

              {/* Unit selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Одиниця виміру</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="шт.">шт. (штука)</option>
                  <option value="компл.">компл. (комплект)</option>
                  <option value="пачка">пачка</option>
                  <option value="м²">м² (квадратний метр)</option>
                  <option value="уп.">уп. (упаковка)</option>
                </select>
              </div>

              {/* Photo Upload Area */}
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800">
                    Фотографії товару ({formData.images.length})
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Перше фото — головне</span>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleImageFileUpload}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm transition shrink-0"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Додати фото з пристрою</span>
                  </button>

                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="url"
                      placeholder="Або вставити URL фото..."
                      value={newImageUrlInput}
                      onChange={(e) => setNewImageUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs transition shrink-0"
                    >
                      + Додати URL
                    </button>
                  </div>
                </div>

                {/* Multiple Photos Gallery List */}
                {formData.images.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 pt-2">
                    {formData.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 bg-white transition ${
                          idx === 0 ? 'border-emerald-500 shadow-xs' : 'border-slate-200'
                        }`}
                      >
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        
                        {idx === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-white text-[9px] font-black text-center py-0.5">
                            ГОЛОВНЕ
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-lg text-[10px] transition opacity-90 sm:opacity-0 group-hover:opacity-100 shadow-sm"
                          title="Видалити фото"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic text-center py-2">
                    Жодної фотографії ще не додано. Натисніть «Додати фото з пристрою» або вставте посилання.
                  </div>
                )}
              </div>

              {/* Product Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Опис товару</label>
                <textarea
                  rows={4}
                  placeholder="Детальний опис товару, характеристики, товщина магнітного вінілу, розміри..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed"
                />
              </div>

              {/* Submit / Cancel buttons */}
              <div className="flex space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-2xl text-xs shadow-lg shadow-emerald-600/20 transition active:scale-95 flex items-center justify-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProduct ? 'Зберегти зміни' : 'Опублікувати товар на сайті'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition"
                >
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
