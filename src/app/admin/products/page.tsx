'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit3, Image as ImageIcon, Search, Check, RefreshCw, Upload, Sparkles } from 'lucide-react';
import { Product } from '@/lib/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    oldPrice: '',
    sku: '',
    status: 'В наявності',
    image: '',
    description: '',
    unit: 'шт.',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const resProd = await fetch('/api/products');
      const dataProd = await resProd.json();
      if (Array.isArray(dataProd)) {
        // Filter out old local test entries if present
        const clean = dataProd.filter(
          (p: Product) =>
            p.name !== 'top of the top' &&
            p.name !== 'еталон краси' &&
            p.name !== 'Mavvir'
        );
        setProducts(clean);
      }
    } catch (e) {
      console.error('Failed to fetch admin products:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Photo File Upload & Compress to max 500px JPEG (~20KB)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const resultSrc = ev.target?.result as string;
        if (resultSrc) {
          const img = new Image();
          img.src = resultSrc;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 500;
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
              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
              setFormData((prev) => ({ ...prev, image: compressedDataUrl }));
            } else {
              setFormData((prev) => ({ ...prev, image: resultSrc }));
            }
          };
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('Будь ласка, вкажіть назву товару та ціну');
      return;
    }

    const defaultImage = formData.image || 'https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg';

    const newProdObj: Product = {
      id: 'prod-' + Date.now(),
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/[^a-z0-9а-яіїєґ]+/gi, '-') + '-' + Date.now().toString().slice(-4),
      price: parseFloat(formData.price) || 250,
      oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : undefined,
      sku: formData.sku || 'SKU-' + Date.now().toString().slice(-4),
      status: formData.status || 'В наявності',
      description: formData.description || '',
      image: defaultImage,
      images: JSON.stringify([defaultImage]),
      unit: formData.unit || 'шт.',
      features: '[]',
      isFeatured: false,
    };

    try {
      if (typeof window !== 'undefined') {
        const existing = localStorage.getItem('ukrtab_custom_products');
        const customArr = existing ? JSON.parse(existing) : [];
        localStorage.setItem('ukrtab_custom_products', JSON.stringify([newProdObj, ...customArr]));
      }
    } catch (e) {}

    setProducts((prev) => [newProdObj, ...prev]);
    setIsModalOpen(false);

    setFormData({
      name: '',
      price: '',
      oldPrice: '',
      sku: '',
      status: 'В наявності',
      image: '',
      description: '',
      unit: 'шт.',
    });

    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProdObj,
          image: defaultImage,
        }),
      });
    } catch (err) {
      console.warn('Network send handled safely:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Ви дійсно бажаєте видалити цей товар?')) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      if (typeof window !== 'undefined') {
        const existing = localStorage.getItem('ukrtab_custom_products');
        if (existing) {
          const customArr = JSON.parse(existing).filter((p: any) => p.id !== id);
          localStorage.setItem('ukrtab_custom_products', JSON.stringify(customArr));
        }
      }
    } catch (e) {}

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

        <div className="flex space-x-3 w-full sm:w-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Додати новий товар</span>
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
                  <th className="p-4">Артикул</th>
                  <th className="p-4">Ціна</th>
                  <th className="p-4">Статус</th>
                  <th className="p-4 text-right">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img src={p.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                    </td>
                    <td className="p-4 font-mono text-slate-500">{p.sku || '-'}</td>
                    <td className="p-4 font-black text-slate-900">{p.price} ₴</td>
                    <td className="p-4">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition"
                        title="Видалити"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <span>Додати новий товар в магазин</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              {/* Product Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Назва товару *</label>
                <input
                  type="text"
                  required
                  placeholder="наприклад: Мітя зробив магніт"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Price & SKU */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ціна в грн (₴) *</label>
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
                  <label className="block font-bold text-slate-700 mb-1">Артикул (SKU)</label>
                  <input
                    type="text"
                    placeholder="ZSU-3030"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Photo Upload Area */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Фото товару</label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 border transition shrink-0"
                  >
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>Завантажити фото</span>
                  </button>

                  <span className="text-slate-400 font-bold">або</span>

                  <input
                    type="url"
                    placeholder="Вставити посилання на фото (URL)"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                {/* Photo Preview Box */}
                {formData.image && (
                  <div className="mt-2 relative w-24 h-24 rounded-2xl border border-slate-200 overflow-hidden bg-slate-100">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Product Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Опис товару</label>
                <textarea
                  rows={3}
                  placeholder="Детальний опис товару, характеристики, товщина магнітного вінілу, розміри..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Submit / Cancel buttons */}
              <div className="flex space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-2xl text-xs shadow-lg shadow-emerald-600/20 transition active:scale-95"
                >
                  Опублікувати товар на сайті
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
