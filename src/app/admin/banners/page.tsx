'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  RefreshCw, 
  Upload, 
  Check, 
  ExternalLink, 
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  Link as LinkIcon,
  Settings,
  X,
  RotateCcw
} from 'lucide-react';
import { Banner } from '@/lib/types';

const DEFAULT_QUICK_LINKS = [
  { label: 'Сувенірні автономера', url: '/catalog/suvenirni-avtonomera' },
  { label: 'Військові номери', url: '/catalog/vijskovi-nomeri' },
  { label: 'Іменні номери', url: '/catalog/imenni-nomeri' },
  { label: 'Магніти на авто', url: '/catalog/magniti-na-avto' },
  { label: 'Рекламні магніти', url: '/catalog/reklamni-magniti' },
  { label: 'Адресні таблички', url: '/catalog/adresni-tablichki' },
  { label: 'Таблички для бізнесу', url: '/catalog/tablichki-dlya-biznesu' },
  { label: 'Інформаційні таблички', url: '/catalog/informatsijni-tablichki' },
  { label: 'Ритуальні таблички', url: '/catalog/ritualni-tablichki' },
  { label: 'Трафарети', url: '/catalog/trafareti' },
  { label: 'Прямий УФ-друк', url: '/catalog/uf-druk' },
  { label: 'Конструктор макетів', url: '/constructor' },
  { label: 'Каталог загальний', url: '/catalog' },
];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingReorder, setIsSavingReorder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [quickLinks, setQuickLinks] = useState(DEFAULT_QUICK_LINKS);
  const [isEditingQuickLinks, setIsEditingQuickLinks] = useState(false);
  const [newQuickLabel, setNewQuickLabel] = useState('');
  const [newQuickUrl, setNewQuickUrl] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    image: '',
    linkUrl: '',
    sortOrder: '0',
    isActive: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ukrtab_banner_quicklinks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuickLinks(parsed);
        }
      }
    } catch (e) {}
  }, []);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/banners?t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        // Sort by sortOrder
        const sorted = [...data].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setBanners(sorted);
      }
    } catch (e) {
      console.error('Failed to fetch admin banners:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

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
            const maxDim = 1280;
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
              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
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

  const handleOpenModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      image: '',
      linkUrl: '/catalog',
      sortOrder: String(banners.length + 1),
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEditBanner = (b: Banner) => {
    setEditingBanner(b);
    setFormData({
      title: b.title || '',
      image: b.image || '',
      linkUrl: b.linkUrl || '',
      sortOrder: String(b.sortOrder || 0),
      isActive: b.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert('Будь ласка, завантажте фонове зображення для банера або вкажіть URL');
      return;
    }

    if (editingBanner) {
      const bannerId = editingBanner.id;
      const updatedObj: Banner = {
        ...editingBanner,
        title: formData.title || '',
        image: formData.image,
        linkUrl: formData.linkUrl || '',
        sortOrder: Number(formData.sortOrder) || 0,
        isActive: formData.isActive,
      };

      setBanners((prev) =>
        prev
          .map((b) => (b.id === bannerId ? updatedObj : b))
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      );
      setIsModalOpen(false);
      setEditingBanner(null);

      try {
        const res = await fetch(`/api/banners/${encodeURIComponent(bannerId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedObj),
        });
        if (!res.ok) {
          throw new Error('Помилка сервера при оновленні банера');
        }
        await fetchBanners();
      } catch (err) {
        console.error('Failed to update banner:', err);
        alert('Не вдалося зберегти зміни банера на сервері');
        await fetchBanners();
      }
    } else {
      const bannerId = 'banner-' + Date.now();
      const newObj: Banner = {
        id: bannerId,
        title: formData.title || '',
        image: formData.image,
        linkUrl: formData.linkUrl || '',
        sortOrder: Number(formData.sortOrder) || 0,
        isActive: formData.isActive,
        createdAt: new Date(),
      };

      setBanners((prev) =>
        [newObj, ...prev].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      );
      setIsModalOpen(false);

      try {
        const res = await fetch('/api/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newObj),
        });
        if (!res.ok) {
          throw new Error('Помилка сервера при створенні банера');
        }
        await fetchBanners();
      } catch (err) {
        console.error('Failed to create banner:', err);
        alert('Не вдалося створити банер на сервері');
        await fetchBanners();
      }
    }

    setFormData({
      title: '',
      image: '',
      linkUrl: '',
      sortOrder: '0',
      isActive: true,
    });
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Видалити цей банер зі слайдера?')) return;
    setBanners((prev) => prev.filter((b) => b.id !== id));

    try {
      const res = await fetch(`/api/banners/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Помилка сервера при видаленні банера');
      }
      await fetchBanners();
    } catch (e) {
      console.error('Failed to delete banner:', e);
      alert('Не вдалося видалити банер на сервері');
      await fetchBanners();
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    const newActiveState = !banner.isActive;
    const updated = { ...banner, isActive: newActiveState };

    setBanners((prev) => prev.map((b) => (b.id === banner.id ? updated : b)));

    try {
      const res = await fetch(`/api/banners/${encodeURIComponent(banner.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        throw new Error('Помилка оновлення статусу');
      }
    } catch (err) {
      console.error('Failed to toggle active state:', err);
      await fetchBanners();
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    // Recalculate 1-based sequential sortOrder
    const reordered = newBanners.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1,
    }));

    setBanners(reordered);
    setIsSavingReorder(true);

    try {
      const res = await fetch('/api/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners: reordered }),
      });
      if (!res.ok) {
        throw new Error('Помилка збереження порядку банерів');
      }
    } catch (e) {
      console.error('Failed to reorder banners:', e);
      alert('Не вдалося зберегти порядок банерів на сервері');
      await fetchBanners();
    } finally {
      setIsSavingReorder(false);
    }
  };

  const handleAddQuickLink = () => {
    if (!newQuickLabel.trim() || !newQuickUrl.trim()) return;
    const updated = [...quickLinks, { label: newQuickLabel.trim(), url: newQuickUrl.trim() }];
    setQuickLinks(updated);
    try {
      localStorage.setItem('ukrtab_banner_quicklinks', JSON.stringify(updated));
    } catch (e) {}
    setNewQuickLabel('');
    setNewQuickUrl('');
  };

  const handleDeleteQuickLink = (index: number) => {
    const updated = quickLinks.filter((_, i) => i !== index);
    setQuickLinks(updated);
    try {
      localStorage.setItem('ukrtab_banner_quicklinks', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleResetQuickLinks = () => {
    setQuickLinks(DEFAULT_QUICK_LINKS);
    try {
      localStorage.removeItem('ukrtab_banner_quicklinks');
    } catch (e) {}
  };

  const filteredBanners = banners.filter((b) =>
    (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.linkUrl || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
            <SlidersHorizontal className="w-6 h-6 text-emerald-600" />
            <span>Управління банерами головного слайдера</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Додавайте, редагуйте фонові зображення, змінюйте заголовки та налаштовуйте порядок показу слайдів на головній сторінці.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleOpenModal}
            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Додати банер</span>
          </button>
          <button
            onClick={fetchBanners}
            className="p-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-2xl transition flex items-center justify-center"
            title="Оновити список"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Info Tip */}
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-4 rounded-2xl text-xs flex items-start space-x-3">
        <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Порада для найкращого вигляду:</span> Використовуйте горизонтальні фото з високою роздільною здатністю (рекомендований розмір: <strong>1280×500 пікселів</strong>). Затемнення зменшено для яскравого та чіткого відображення рекламних банерів. Сортування можна змінювати стрілками <strong>▲ / ▼</strong>.
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Пошук банера за заголовком або посиланням..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-emerald-500 shadow-sm"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Banners List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-500">
            Всього банерів: <strong className="text-slate-900">{banners.length}</strong>
          </span>
          {isSavingReorder && (
            <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1.5 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Збереження порядку...</span>
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
            <p className="text-xs font-bold">Завантаження банерів...</p>
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <ImageIcon className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600">Банерів не знайдено</p>
            <p className="text-xs text-slate-400">Створіть свій перший рекламний слайд для головної сторінки</p>
            <button
              onClick={handleOpenModal}
              className="mt-2 inline-flex items-center space-x-2 bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Створити банер</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBanners.map((banner, index) => (
              <div
                key={banner.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  banner.isActive ? 'bg-white border-slate-200 shadow-sm hover:border-slate-300' : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                {/* Order Controls & Position */}
                <div className="flex items-center space-x-2 shrink-0">
                  <div className="flex flex-col space-y-1">
                    <button
                      type="button"
                      disabled={index === 0 || isSavingReorder}
                      onClick={() => handleMoveOrder(index, 'up')}
                      className={`p-1.5 rounded-lg border transition ${
                        index === 0
                          ? 'text-slate-300 border-slate-100 cursor-not-allowed'
                          : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 border-slate-200'
                      }`}
                      title="Перемістити вище"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === filteredBanners.length - 1 || isSavingReorder}
                      onClick={() => handleMoveOrder(index, 'down')}
                      className={`p-1.5 rounded-lg border transition ${
                        index === filteredBanners.length - 1
                          ? 'text-slate-300 border-slate-100 cursor-not-allowed'
                          : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 border-slate-200'
                      }`}
                      title="Перемістити нижче"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center">
                    #{index + 1}
                  </div>
                </div>

                {/* Banner Thumbnail & Visual Preview */}
                <div className="relative w-full md:w-56 h-28 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 shadow-inner group">
                  <img
                    src={banner.image}
                    alt={banner.title || 'Слайд'}
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent p-2.5 flex flex-col justify-end">
                    <span className="text-[10px] text-white font-bold line-clamp-2 leading-tight drop-shadow">
                      {banner.title || 'Без заголовка (графічний банер)'}
                    </span>
                  </div>
                </div>

                {/* Banner Details */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 line-clamp-2">
                      {banner.title || <span className="text-slate-400 italic">Без заголовка (тільки фонове фото)</span>}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        banner.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {banner.isActive ? 'Активний' : 'Прихований'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                    {banner.linkUrl ? (
                      <Link
                        href={banner.linkUrl}
                        target="_blank"
                        className="text-emerald-600 hover:underline flex items-center space-x-1 font-bold truncate max-w-sm"
                      >
                        <LinkIcon className="w-3 h-3 shrink-0" />
                        <span>{banner.linkUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </Link>
                    ) : (
                      <span className="text-slate-400 italic">Без посилання на сторінку</span>
                    )}
                    <span className="text-slate-300">•</span>
                    <span>Порядок: <strong className="text-slate-700 font-mono">{banner.sortOrder || 0}</strong></span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(banner)}
                    className={`p-2.5 rounded-xl border font-bold text-xs flex items-center space-x-1.5 transition ${
                      banner.isActive
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}
                    title={banner.isActive ? 'Приховати банер' : 'Увімкнути показ'}
                  >
                    {banner.isActive ? (
                      <>
                        <EyeOff className="w-4 h-4 text-slate-500" />
                        <span className="hidden sm:inline">Сховати</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 text-emerald-600" />
                        <span className="hidden sm:inline">Показати</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEditBanner(banner)}
                    className="p-2.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-xl border border-slate-200 transition font-bold text-xs flex items-center space-x-1.5"
                    title="Редагувати банер"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Редагувати</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteBanner(banner.id)}
                    className="p-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-xl border border-slate-200 transition"
                    title="Видалити"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                {editingBanner ? (
                  <>
                    <Edit3 className="w-6 h-6 text-emerald-600" />
                    <span>Редагувати слайд-банер</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-emerald-600" />
                    <span>Додати новий слайд-банер</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingBanner(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* LIVE PREVIEW BOX */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>Живий попередній перегляд на сайті:</span>
              </div>
              <div className="relative w-full rounded-2xl overflow-hidden shadow-md bg-slate-900 border border-slate-800 min-h-[200px] sm:min-h-[240px] flex items-center p-6">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                  />
                ) : (
                  <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-slate-600 text-xs">
                    [ Фонове зображення не обрано ]
                  </div>
                )}
                <div className={`absolute inset-0 ${formData.title ? 'bg-gradient-to-r from-slate-950/50 via-slate-950/20 to-transparent' : 'bg-gradient-to-t from-slate-950/30 via-transparent to-transparent'}`} />

                <div className="relative z-10 max-w-md space-y-2.5">
                  {formData.title && (
                    <>
                      <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md">
                        <span>🇺🇦 Виробництво в Україні • Дніпро</span>
                      </div>
                      <h4 className="text-lg sm:text-2xl font-black text-white leading-tight tracking-tight drop-shadow">
                        {formData.title}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                        Виготовлення вінілових магнітів для авто, захисних знаків та номерних табличок з доставкою Новою Поштою.
                      </p>
                    </>
                  )}
                  {formData.linkUrl && (
                    <div className="pt-1">
                      <div className="inline-flex items-center space-x-1.5 bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow">
                        <span>Переглянути каталог</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              {/* Banner Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Заголовок банера (Головний текст)
                </label>
                <textarea
                  rows={2}
                  placeholder="Залиште порожнім, якщо весь текст вже є на зображенні банера..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Якщо на самому фото банера вже є тексти та ціни — залиште поле пустим, щоб не перекривати фото.
                </span>
              </div>

              {/* Background Image Upload / URL */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">
                  Фонове зображення банера *
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-3 rounded-2xl text-xs flex items-center justify-center space-x-2 border border-slate-200 transition shrink-0"
                  >
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>Завантажити фото з ПК / телефону</span>
                  </button>

                  <span className="text-center text-slate-400 font-bold text-xs">або</span>

                  <input
                    type="url"
                    placeholder="Вставити пряме посилання на фото (URL)"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Target Link & Quick Links */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block font-bold text-slate-700">
                    Куди веде кнопка банера (Посилання / URL)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsEditingQuickLinks(!isEditingQuickLinks)}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                  >
                    <Settings className="w-3 h-3" />
                    <span>{isEditingQuickLinks ? 'Закрити налаштування' : 'Редагувати швидкі посилання'}</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="/catalog/suvenirni-avtonomera або https://..."
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />

                  {/* Quick Select Dropdown */}
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        setFormData({ ...formData, linkUrl: e.target.value });
                      }
                    }}
                    className="px-3 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="" disabled>📋 Оберіть зі списку категорій...</option>
                    <optgroup label="Категорії товарів">
                      <option value="/catalog">Всі товари (/catalog)</option>
                      <option value="/catalog/suvenirni-avtonomera">Сувенірні автономера</option>
                      <option value="/catalog/vijskovi-nomeri">Військові номери ЗСУ</option>
                      <option value="/catalog/imenni-nomeri">Іменні номери</option>
                      <option value="/catalog/nomeri-dlya-avtosaloniv">Номери для автосалонів</option>
                      <option value="/catalog/magniti-na-avto">Магніти на авто</option>
                      <option value="/catalog/reklamni-magniti">Рекламні магніти</option>
                      <option value="/catalog/informatsijni-magniti">Інформаційні магніти</option>
                      <option value="/catalog/adresni-tablichki">Адресні таблички</option>
                      <option value="/catalog/tablichki-dlya-biznesu">Таблички для бізнесу</option>
                      <option value="/catalog/tablichki-na-dveri">Таблички на двері</option>
                      <option value="/catalog/informatsijni-tablichki">Інформаційні таблички</option>
                      <option value="/catalog/ritualni-tablichki">Ритуальні таблички</option>
                      <option value="/catalog/trafareti">Трафарети на замовлення</option>
                      <option value="/catalog/uf-druk">Прямий УФ-друк</option>
                    </optgroup>
                    <optgroup label="Сторінки та сервіси">
                      <option value="/constructor">Онлайн-конструктор макетів</option>
                      <option value="/delivery">Доставка та оплата</option>
                      <option value="/contacts">Контакти</option>
                    </optgroup>
                  </select>
                </div>

                {/* Quick link chips */}
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-bold mr-1">Швидкі посилання:</span>
                    {quickLinks.map((item, idx) => {
                      const isSelected = formData.linkUrl === item.url;
                      return (
                        <div key={idx} className="inline-flex items-center">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, linkUrl: item.url })}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition border flex items-center space-x-1 ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border-slate-200'
                            }`}
                          >
                            <span>{item.label}</span>
                          </button>
                          {isEditingQuickLinks && (
                            <button
                              type="button"
                              onClick={() => handleDeleteQuickLink(idx)}
                              className="ml-0.5 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                              title="Видалити це посилання зі списку"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add new quick link inline editor */}
                  {isEditingQuickLinks && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 mt-2">
                      <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                        <span>Додати власну кнопку швидкого посилання:</span>
                        <button
                          type="button"
                          onClick={handleResetQuickLinks}
                          className="text-[10px] text-slate-500 hover:text-red-600 flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Скинути до стандартних</span>
                        </button>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="Назва (напр. Сувенірні номери)"
                          value={newQuickLabel}
                          onChange={(e) => setNewQuickLabel(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                        />
                        <input
                          type="text"
                          placeholder="URL (напр. /catalog/suvenirni-avtonomera)"
                          value={newQuickUrl}
                          onChange={(e) => setNewQuickUrl(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                        />
                        <button
                          type="button"
                          onClick={handleAddQuickLink}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-xs shrink-0 flex items-center justify-center space-x-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Додати</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sort Order & Active Checkbox */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Порядок сортування</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Чим менше число, тим раніше банер у слайдері (1, 2, 3...)</span>
                </div>

                <div className="flex items-center space-x-3 pt-6">
                  <input
                    type="checkbox"
                    id="isActiveBannerToggle"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 rounded-lg focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="isActiveBannerToggle" className="font-bold text-slate-800 text-xs cursor-pointer select-none">
                    Відображати цей банер у слайдері на сайті
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-2xl text-xs shadow-lg shadow-emerald-600/20 transition active:scale-95 flex items-center justify-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingBanner ? 'Зберегти зміни' : 'Опублікувати банер'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBanner(null);
                  }}
                  className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition"
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
