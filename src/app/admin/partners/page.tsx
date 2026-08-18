'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit3, Search, RefreshCw, Upload, Check, ExternalLink, Handshake } from 'lucide-react';
import { PartnerLogo } from '@/lib/types';

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<PartnerLogo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerLogo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    image: '',
    linkUrl: '',
    sortOrder: '0',
    isActive: true,
  });

  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/partners?t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setPartners(data);
      }
    } catch (e) {
      console.error('Failed to fetch admin partners:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
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
            const maxDim = 400;
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
              const compressedDataUrl = canvas.toDataURL('image/png', 0.85);
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
    setEditingPartner(null);
    setFormData({
      name: '',
      image: '',
      linkUrl: '',
      sortOrder: String(partners.length + 1),
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEditPartner = (p: PartnerLogo) => {
    setEditingPartner(p);
    setFormData({
      name: p.name || '',
      image: p.image || '',
      linkUrl: p.linkUrl || '',
      sortOrder: String(p.sortOrder || 0),
      isActive: p.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert('Будь ласка, завантажте логотип компанії або вкажіть посилання на фото');
      return;
    }

    if (editingPartner) {
      const partnerId = editingPartner.id;
      const updatedObj: PartnerLogo = {
        ...editingPartner,
        name: formData.name || '',
        image: formData.image,
        linkUrl: formData.linkUrl || '',
        sortOrder: Number(formData.sortOrder) || 0,
        isActive: formData.isActive,
      };

      setPartners((prev) => prev.map((p) => (p.id === partnerId ? updatedObj : p)));
      setIsModalOpen(false);
      setEditingPartner(null);

      // PUT API call
      try {
        const res = await fetch(`/api/partners/${encodeURIComponent(partnerId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedObj),
        });
        if (!res.ok) {
          throw new Error('Помилка сервера при оновленні партнера');
        }
        await fetchPartners();
      } catch (err) {
        console.error('Failed to update partner:', err);
        alert('Не вдалося зберегти зміни партнера на сервері');
        await fetchPartners();
      }
    } else {
      const partnerId = 'partner-' + Date.now();
      const newObj: PartnerLogo = {
        id: partnerId,
        name: formData.name || '',
        image: formData.image,
        linkUrl: formData.linkUrl || '',
        sortOrder: Number(formData.sortOrder) || 0,
        isActive: formData.isActive,
        createdAt: new Date(),
      };

      setPartners((prev) => [newObj, ...prev]);
      setIsModalOpen(false);

      try {
        const res = await fetch('/api/partners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newObj),
        });
        if (!res.ok) {
          throw new Error('Помилка сервера при створенні партнера');
        }
        await fetchPartners();
      } catch (err) {
        console.error('Failed to create partner:', err);
        alert('Не вдалося додати компанію на сервері');
        await fetchPartners();
      }
    }

    setFormData({
      name: '',
      image: '',
      linkUrl: '',
      sortOrder: '0',
      isActive: true,
    });
  };

  const handleDeletePartner = async (id: string) => {
    if (!confirm('Видалити цей логотип компанії?')) return;
    setPartners((prev) => prev.filter((p) => p.id !== id));

    try {
      const res = await fetch(`/api/partners/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Помилка сервера при видаленні партнера');
      }
      await fetchPartners();
    } catch (e) {
      console.error('Failed to delete partner:', e);
      alert('Не вдалося видалити компанію на сервері');
      await fetchPartners();
    }
  };

  const filteredPartners = partners.filter((p) =>
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
            <Handshake className="w-6 h-6 text-emerald-600" />
            <span>Управління секцією "Нам довіряють"</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Додавайте логотипи компаній, партнерів та організацій для блоку на головній сторінці.
          </p>
        </div>

        <div className="flex flex-wrap space-x-3 w-full sm:w-auto">
          <button
            onClick={handleOpenModal}
            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Додати компанію</span>
          </button>
          <button
            onClick={fetchPartners}
            className="p-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-2xl transition"
            title="Оновити список"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Пошук компанії за назвою..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-emerald-500 shadow-sm"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Partners List / Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-medium">
            Завантаження логотипів партнерів...
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 font-medium">
            Логотипів компаній не знайдено
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-4">Логотип</th>
                  <th className="p-4">Назва компанії</th>
                  <th className="p-4">Посилання</th>
                  <th className="p-4">Порядок</th>
                  <th className="p-4">Статус</th>
                  <th className="p-4 text-right">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPartners.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0 p-1 flex items-center justify-center">
                        <img src={p.image} alt="" className="max-w-full max-h-full object-contain" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{p.name || 'Без назви'}</div>
                    </td>
                    <td className="p-4">
                      {p.linkUrl ? (
                        <a
                          href={p.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline flex items-center space-x-1 font-bold"
                        >
                          <span className="truncate max-w-xs">{p.linkUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400 font-normal">-</span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-600">{p.sortOrder || 0}</td>
                    <td className="p-4">
                      <span
                        className={`font-bold px-2.5 py-1 rounded-full text-[10px] ${
                          p.isActive ?? true
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {p.isActive ?? true ? 'Активний' : 'Прихований'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => handleEditPartner(p)}
                        className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                        title="Редагувати"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePartner(p.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
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

      {/* Add / Edit Partner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                {editingPartner ? (
                  <>
                    <Edit3 className="w-5 h-5 text-emerald-600" />
                    <span>Редагувати компанію</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-emerald-600" />
                    <span>Додати нову компанію у "Нам довіряють"</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingPartner(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePartner} className="space-y-4 text-xs">
              {/* Company Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Назва компанії / організації</label>
                <input
                  type="text"
                  placeholder="наприклад: ЗСУ, Нова Пошта, ТОВ Вектор..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Logo Upload / URL */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Логотип компанії *</label>

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
                    <span>Завантажити логотип</span>
                  </button>

                  <span className="text-slate-400 font-bold">або</span>

                  <input
                    type="url"
                    placeholder="Посилання на логотип (URL)"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                {/* Photo Preview Box */}
                {formData.image && (
                  <div className="mt-2 relative w-24 h-24 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-2 flex items-center justify-center">
                    <img src={formData.image} alt="Preview" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>

              {/* Website Link & Sort Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Посилання на сайт (опціонально)</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Порядок сортування</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isActiveToggle" className="font-bold text-slate-800 cursor-pointer">
                  Відображати компанію на сайті
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-2xl text-xs shadow-lg shadow-emerald-600/20 transition active:scale-95 flex items-center justify-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingPartner ? 'Зберегти зміни' : 'Додати компанію'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingPartner(null);
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
