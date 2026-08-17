'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Search,
  Check,
  RefreshCw,
  Upload,
  Tag,
  Layers,
  Save,
  RotateCcw,
  Percent,
  CheckSquare,
  Square,
  AlertCircle,
  Sparkles,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { Product, Category } from '@/lib/types';
import { INITIAL_CATEGORIES } from '@/lib/store';
import { getCategoryOptions } from '@/lib/categories';

const LOCAL_STORAGE_STAGED_KEY = 'ukrtab_admin_staged_changes_v1';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // View Mode: 'list' (Standard) vs 'batch' (Batch Editor & Staging)
  const [viewMode, setViewMode] = useState<'list' | 'batch'>('batch');

  // Staged local changes for batch mode
  const [stagedCreates, setStagedCreates] = useState<Product[]>([]);
  const [stagedUpdates, setStagedUpdates] = useState<Record<string, Partial<Product>>>({});
  const [stagedDeletes, setStagedDeletes] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Bulk operation modals/popups
  const [bulkCategory, setBulkCategory] = useState<string>('');
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [bulkPricePercent, setBulkPricePercent] = useState<string>('');
  const [isSavingBatch, setIsSavingBatch] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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

  // Load initial data and restore staged state from localStorage if exists
  useEffect(() => {
    fetchData();
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_STAGED_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.creates) setStagedCreates(parsed.creates);
          if (parsed.updates) setStagedUpdates(parsed.updates);
          if (parsed.deletes) setStagedDeletes(parsed.deletes);
        }
      } catch (e) {}

      const params = new URLSearchParams(window.location.search);
      if (params.get('add') === 'true') {
        handleOpenModal();
      }
    }
  }, []);

  // Save staged changes to localStorage for safety
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasChanges =
      stagedCreates.length > 0 ||
      Object.keys(stagedUpdates).length > 0 ||
      stagedDeletes.length > 0;

    if (hasChanges) {
      localStorage.setItem(
        LOCAL_STORAGE_STAGED_KEY,
        JSON.stringify({
          creates: stagedCreates,
          updates: stagedUpdates,
          deletes: stagedDeletes,
        })
      );
    } else {
      localStorage.removeItem(LOCAL_STORAGE_STAGED_KEY);
    }
  }, [stagedCreates, stagedUpdates, stagedDeletes]);

  // Counts of pending changes
  const pendingCreatesCount = stagedCreates.length;
  const pendingUpdatesCount = Object.keys(stagedUpdates).length;
  const pendingDeletesCount = stagedDeletes.length;
  const totalPendingChanges = pendingCreatesCount + pendingUpdatesCount + pendingDeletesCount;

  // Staging Helpers
  const handleStageUpdate = (productId: string, field: keyof Product, value: any) => {
    // If it's in stagedCreates, update directly in stagedCreates
    const createIdx = stagedCreates.findIndex((p) => p.id === productId);
    if (createIdx !== -1) {
      setStagedCreates((prev) => {
        const copy = [...prev];
        copy[createIdx] = { ...copy[createIdx], [field]: value };
        return copy;
      });
      return;
    }

    // Otherwise record in stagedUpdates
    setStagedUpdates((prev) => {
      const existing = prev[productId] || {};
      return {
        ...prev,
        [productId]: {
          ...existing,
          [field]: value,
        },
      };
    });
  };

  const handleStageDeleteToggle = (productId: string) => {
    // If it's a newly staged create, remove it completely from creates
    if (stagedCreates.some((p) => p.id === productId)) {
      setStagedCreates((prev) => prev.filter((p) => p.id !== productId));
      setSelectedIds((prev) => prev.filter((id) => id !== productId));
      return;
    }

    // Toggle delete flag for existing product
    setStagedDeletes((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleAddStagedRow = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    const newId = 'staged-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const defaultCat = categories[0]?.id || 'cat-other';

    const newProd: Product = {
      id: newId,
      name: 'Новий товар ' + num,
      slug: 'new-product-' + num,
      price: 150,
      oldPrice: null,
      sku: `UKR-${num}`,
      status: 'В наявності',
      categoryId: defaultCat,
      description: '',
      image: 'https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg',
      images: JSON.stringify(['https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg']),
      unit: 'шт.',
      features: '[]',
      isFeatured: false,
    };

    setStagedCreates((prev) => [newProd, ...prev]);
    showToast('➕ Додано новий рядок товару до чернетки');
  };

  // Bulk actions on selected products
  const handleBulkApplyCategory = () => {
    if (!bulkCategory || selectedIds.length === 0) return;
    selectedIds.forEach((id) => {
      handleStageUpdate(id, 'categoryId', bulkCategory);
    });
    showToast(`🏷️ Категорію оновлено для ${selectedIds.length} товарів (очікує збереження)`);
    setBulkCategory('');
  };

  const handleBulkApplyStatus = () => {
    if (!bulkStatus || selectedIds.length === 0) return;
    selectedIds.forEach((id) => {
      handleStageUpdate(id, 'status', bulkStatus);
    });
    showToast(`📦 Статус оновлено для ${selectedIds.length} товарів (очікує збереження)`);
    setBulkStatus('');
  };

  const handleBulkApplyPricePercent = () => {
    const percent = parseFloat(bulkPricePercent);
    if (isNaN(percent) || selectedIds.length === 0) return;

    selectedIds.forEach((id) => {
      const currentItem = getEffectiveProduct(id);
      if (currentItem && currentItem.price) {
        const multiplier = 1 + percent / 100;
        const newPrice = Math.max(1, Math.round(currentItem.price * multiplier));
        handleStageUpdate(id, 'price', newPrice);
      }
    });

    showToast(`💰 Ціну змінено на ${percent}% для ${selectedIds.length} товарів`);
    setBulkPricePercent('');
  };

  const handleBulkMarkDelete = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => {
      if (!stagedDeletes.includes(id)) {
        handleStageDeleteToggle(id);
      }
    });
    showToast(`🗑️ Позначено на видалення: ${selectedIds.length} товарів`);
  };

  const handleSelectAll = (filteredList: Product[]) => {
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredList.map((p) => p.id));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Discard all local changes
  const handleDiscardAllStaged = () => {
    if (!confirm('Ви дійсно бажаєте скинути всі незбережені зміни?')) return;
    setStagedCreates([]);
    setStagedUpdates({});
    setStagedDeletes([]);
    setSelectedIds([]);
    localStorage.removeItem(LOCAL_STORAGE_STAGED_KEY);
    showToast('↺ Всі локальні зміни скинуто');
  };

  // Save entire batch in 1 single API call
  const handleSaveBatch = async () => {
    if (totalPendingChanges === 0) return;
    setIsSavingBatch(true);

    try {
      const createsPayload = stagedCreates.map((p) => ({
        ...p,
        id: undefined, // let server generate safe clean ID if needed
      }));

      const updatesPayload = Object.entries(stagedUpdates)
        .filter(([id]) => !stagedDeletes.includes(id))
        .map(([id, fields]) => ({
          id,
          ...fields,
        }));

      const deletesPayload = stagedDeletes;

      const res = await fetch('/api/products/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creates: createsPayload,
          updates: updatesPayload,
          deletes: deletesPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Помилка пакетного збереження');
      }

      // Reset staging state
      setStagedCreates([]);
      setStagedUpdates({});
      setStagedDeletes([]);
      setSelectedIds([]);
      localStorage.removeItem(LOCAL_STORAGE_STAGED_KEY);

      showToast(
        `✅ Збережено за 1 запит! Додано: ${data.createdCount || 0}, оновлено: ${
          data.updatedCount || 0
        }, видалено: ${data.deletedCount || 0}`
      );

      // Re-fetch clean list from DB
      await fetchData();
    } catch (e: any) {
      console.error('Batch save error:', e);
      alert('Помилка збереження: ' + (e?.message || 'Не вдалося зберегти зміни'));
    } finally {
      setIsSavingBatch(false);
    }
  };

  // Helper to get merged product state (Server base + Staged updates)
  const getEffectiveProduct = (productId: string): Product | undefined => {
    const stagedCreate = stagedCreates.find((p) => p.id === productId);
    if (stagedCreate) return stagedCreate;

    const baseProd = products.find((p) => p.id === productId);
    if (!baseProd) return undefined;

    const updates = stagedUpdates[productId];
    if (!updates) return baseProd;

    return {
      ...baseProd,
      ...updates,
    };
  };

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
      categoryId: categories[0]?.id || 'cat-other',
      image: '',
      images: [],
      description: '',
      unit: 'шт.',
    });
    setNewImageUrlInput('');
    setIsModalOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    const effective = getEffectiveProduct(prod.id) || prod;
    setEditingProduct(effective);

    let parsedImgs: string[] = [];
    if (effective.images) {
      try {
        const arr = JSON.parse(effective.images);
        if (Array.isArray(arr)) parsedImgs = arr;
      } catch (e) {}
    }
    if (parsedImgs.length === 0 && effective.image) {
      parsedImgs = [effective.image];
    }

    setFormData({
      name: effective.name || '',
      price: effective.price !== undefined && effective.price !== null ? String(effective.price) : '',
      oldPrice: effective.oldPrice !== undefined && effective.oldPrice !== null ? String(effective.oldPrice) : '',
      sku: effective.sku || '',
      status: effective.status || 'В наявності',
      categoryId: effective.categoryId || 'cat-other',
      image: effective.image || (parsedImgs[0] || ''),
      images: parsedImgs,
      description: effective.description || '',
      unit: effective.unit || 'шт.',
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

  const handleSaveModalProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('Будь ласка, вкажіть назву товару та ціну');
      return;
    }

    const defaultImage =
      formData.image ||
      formData.images[0] ||
      'https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg';
    const allImagesList = formData.images.length > 0 ? formData.images : [defaultImage];

    if (editingProduct) {
      // Stage the update locally
      const updatedFields: Partial<Product> = {
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

      handleStageUpdate(editingProduct.id, 'name', updatedFields.name);
      handleStageUpdate(editingProduct.id, 'price', updatedFields.price);
      handleStageUpdate(editingProduct.id, 'oldPrice', updatedFields.oldPrice);
      handleStageUpdate(editingProduct.id, 'sku', updatedFields.sku);
      handleStageUpdate(editingProduct.id, 'status', updatedFields.status);
      handleStageUpdate(editingProduct.id, 'categoryId', updatedFields.categoryId);
      handleStageUpdate(editingProduct.id, 'description', updatedFields.description);
      handleStageUpdate(editingProduct.id, 'image', updatedFields.image);
      handleStageUpdate(editingProduct.id, 'images', updatedFields.images);
      handleStageUpdate(editingProduct.id, 'unit', updatedFields.unit);

      showToast(`📝 Товар "${formData.name}" оновлено в чернетці`);
    } else {
      // Stage new create
      const newProdObj: Product = {
        id: 'staged-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name: formData.name,
        slug:
          formData.name.toLowerCase().replace(/[^a-z0-9а-яіїєґ]+/gi, '-') +
          '-' +
          Date.now().toString().slice(-4),
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

      setStagedCreates((prev) => [newProdObj, ...prev]);
      showToast(`➕ Товар "${formData.name}" додано до чернетки`);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Combine staged creates and existing products
  const allMergedProducts: Product[] = [
    ...stagedCreates,
    ...products.map((p) => {
      const updates = stagedUpdates[p.id];
      return updates ? { ...p, ...updates } : p;
    }),
  ];

  // Filter combined products
  const filteredProducts = allMergedProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategoryFilter === 'all' || p.categoryId === selectedCategoryFilter;

    const matchesStatus =
      selectedStatusFilter === 'all' || p.status === selectedStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Управління товарами</h2>
            <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
              ISR Eco Mode
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Всього товарів у базі: <span className="font-bold text-slate-800">{products.length}</span> •
            Всі зміни фіксуються в локальній чернетці та відправляються 1 запитом
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Dedupe button */}
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
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition"
            title="Очистити однакові дублікати товарів"
          >
            <span>🧹 Дублікати</span>
          </button>

          {/* Add fast row button */}
          <button
            onClick={handleAddStagedRow}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition active:scale-95 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Додати товар</span>
          </button>

          {/* Open Full Modal */}
          <button
            onClick={handleOpenModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition shadow-md shadow-emerald-600/20 active:scale-95"
          >
            <Edit3 className="w-4 h-4" />
            <span>Повна форма</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={fetchData}
            className="p-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition"
            title="Оновити список з сервера"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode and Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Пошук за назвою або артикулом SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">Усі категорії ({categories.length})</option>
              {getCategoryOptions(categories).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">Усі статуси</option>
              <option value="В наявності">В наявності</option>
              <option value="Під замовлення">Під замовлення</option>
              <option value="Немає в наявності">Немає в наявності</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Controls on Selected Items */}
        {selectedIds.length > 0 && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2.5 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
            <div className="text-xs font-black text-emerald-950 flex items-center space-x-1.5 mr-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Обрано: {selectedIds.length}</span>
            </div>

            {/* Bulk Category dropdown */}
            <div className="flex items-center gap-1.5">
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-medium text-slate-800"
              >
                <option value="">Змінити категорію...</option>
                {getCategoryOptions(categories).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleBulkApplyCategory}
                disabled={!bulkCategory}
                className="bg-emerald-600 disabled:opacity-40 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs transition"
              >
                Застосувати
              </button>
            </div>

            {/* Bulk Status dropdown */}
            <div className="flex items-center gap-1.5">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-medium text-slate-800"
              >
                <option value="">Змінити статус...</option>
                <option value="В наявності">В наявності</option>
                <option value="Під замовлення">Під замовлення</option>
                <option value="Немає в наявності">Немає в наявності</option>
              </select>
              <button
                type="button"
                onClick={handleBulkApplyStatus}
                disabled={!bulkStatus}
                className="bg-emerald-600 disabled:opacity-40 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs transition"
              >
                Застосувати
              </button>
            </div>

            {/* Bulk Price Adjust % */}
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="±%"
                value={bulkPricePercent}
                onChange={(e) => setBulkPricePercent(e.target.value)}
                className="w-16 px-2 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-bold text-center"
              />
              <button
                type="button"
                onClick={handleBulkApplyPricePercent}
                disabled={!bulkPricePercent}
                className="bg-emerald-600 disabled:opacity-40 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs transition flex items-center space-x-1"
                title="Змінити ціну для всіх обраних на X%"
              >
                <Percent className="w-3 h-3" />
                <span>Змінити ціну</span>
              </button>
            </div>

            {/* Bulk Mark for Deletion */}
            <button
              type="button"
              onClick={handleBulkMarkDelete}
              className="ml-auto bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center space-x-1 border border-rose-200"
            >
              <Trash2 className="w-3 h-3" />
              <span>Позначити на видалення</span>
            </button>
          </div>
        )}
      </div>

      {/* Interactive Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-medium flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Завантаження товарів...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 font-medium">Товарів не знайдено</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3.5 w-10 text-center">
                    <button
                      type="button"
                      onClick={() => handleSelectAll(filteredProducts)}
                      className="text-slate-400 hover:text-emerald-600"
                    >
                      {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5 w-14">Фото</th>
                  <th className="p-3.5 min-w-[220px]">Назва товару</th>
                  <th className="p-3.5 min-w-[150px]">Категорія</th>
                  <th className="p-3.5 min-w-[110px]">Артикул (SKU)</th>
                  <th className="p-3.5 min-w-[130px]">Ціна / Знижка</th>
                  <th className="p-3.5 min-w-[140px]">Статус</th>
                  <th className="p-3.5 text-right w-24">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProducts.map((p) => {
                  const isNewStaged = stagedCreates.some((c) => c.id === p.id);
                  const isUpdatedStaged = Boolean(stagedUpdates[p.id]);
                  const isDeletedStaged = stagedDeletes.includes(p.id);
                  const isSelected = selectedIds.includes(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={`transition ${
                        isDeletedStaged
                          ? 'bg-rose-50/60 opacity-60 line-through'
                          : isNewStaged
                          ? 'bg-emerald-50/40'
                          : isUpdatedStaged
                          ? 'bg-amber-50/30'
                          : isSelected
                          ? 'bg-slate-50'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleSelectRow(p.id)}
                          className="text-slate-400 hover:text-emerald-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Photo Thumbnail */}
                      <td className="p-3">
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 group cursor-pointer"
                             onClick={() => handleEditProduct(p)}
                             title="Редагувати фото">
                          <img src={p.image} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                            <Edit3 className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </td>

                      {/* Inline Editable Name */}
                      <td className="p-3">
                        <div className="space-y-1">
                          <input
                            type="text"
                            disabled={isDeletedStaged}
                            value={p.name}
                            onChange={(e) => handleStageUpdate(p.id, 'name', e.target.value)}
                            className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold text-slate-900 focus:outline-none transition ${
                              isNewStaged
                                ? 'bg-emerald-50/80 border-emerald-300 focus:border-emerald-500'
                                : isUpdatedStaged
                                ? 'bg-amber-50/80 border-amber-300 focus:border-amber-500'
                                : 'bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-emerald-500'
                            }`}
                          />
                          <div className="flex items-center gap-1.5 px-1">
                            {isNewStaged && (
                              <span className="text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.2 rounded">
                                НОВИЙ (ЧЕРНЕТКА)
                              </span>
                            )}
                            {isUpdatedStaged && !isNewStaged && (
                              <span className="text-[9px] bg-amber-500 text-slate-950 font-extrabold px-1.5 py-0.2 rounded">
                                ЗМІНЕНО
                              </span>
                            )}
                            {isDeletedStaged && (
                              <span className="text-[9px] bg-rose-600 text-white font-black px-1.5 py-0.2 rounded">
                                ОЧІКУЄ ВИДАЛЕННЯ
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Inline Category selector */}
                      <td className="p-3">
                        <select
                          disabled={isDeletedStaged}
                          value={p.categoryId || 'cat-other'}
                          onChange={(e) => handleStageUpdate(p.id, 'categoryId', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                        >
                          {getCategoryOptions(categories).map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Inline SKU */}
                      <td className="p-3">
                        <input
                          type="text"
                          disabled={isDeletedStaged}
                          value={p.sku || ''}
                          onChange={(e) => handleStageUpdate(p.id, 'sku', e.target.value)}
                          placeholder="UKR-0000"
                          className="w-full font-mono text-[11px] px-2 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg font-bold text-emerald-800 focus:outline-none focus:border-emerald-500"
                        />
                      </td>

                      {/* Inline Price & OldPrice */}
                      <td className="p-3">
                        <div className="flex items-center space-x-1.5">
                          <div className="relative w-20">
                            <input
                              type="number"
                              disabled={isDeletedStaged}
                              value={p.price}
                              onChange={(e) =>
                                handleStageUpdate(p.id, 'price', parseFloat(e.target.value) || 0)
                              }
                              className="w-full px-2 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-900 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">₴</span>

                          <div className="relative w-16">
                            <input
                              type="number"
                              disabled={isDeletedStaged}
                              value={p.oldPrice !== null && p.oldPrice !== undefined ? p.oldPrice : ''}
                              placeholder="Стара"
                              onChange={(e) =>
                                handleStageUpdate(
                                  p.id,
                                  'oldPrice',
                                  e.target.value ? parseFloat(e.target.value) : null
                                )
                              }
                              className="w-full px-1.5 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-[10px] text-amber-700 placeholder:text-slate-300 focus:outline-none"
                              title="Стара ціна зі знижкою"
                            />
                          </div>
                        </div>
                      </td>

                      {/* Inline Status */}
                      <td className="p-3">
                        <select
                          disabled={isDeletedStaged}
                          value={p.status || 'В наявності'}
                          onChange={(e) => handleStageUpdate(p.id, 'status', e.target.value)}
                          className={`w-full px-2 py-1.5 rounded-lg text-[11px] font-bold border focus:outline-none ${
                            p.status === 'Під замовлення'
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : p.status === 'Немає в наявності'
                              ? 'bg-rose-50 text-rose-900 border-rose-200'
                              : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          }`}
                        >
                          <option value="В наявності">В наявності</option>
                          <option value="Під замовлення">Під замовлення</option>
                          <option value="Немає в наявності">Немає в наявності</option>
                        </select>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleEditProduct(p)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Відкрити повну картку"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStageDeleteToggle(p.id)}
                          className={`p-1.5 rounded-lg transition ${
                            isDeletedStaged
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-bold text-[10px]'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          title={isDeletedStaged ? 'Відновити товар' : 'Позначити на видалення'}
                        >
                          {isDeletedStaged ? <RotateCcw className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
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

      {/* Floating Action Bar for Single Batch Commit (Sticky at bottom) */}
      {totalPendingChanges > 0 && (
        <div className="fixed bottom-6 inset-x-4 max-w-4xl mx-auto z-40 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-3xl shadow-2xl border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-amber-300 flex items-center space-x-2">
                <span>{totalPendingChanges} незбережених змін у чернетці</span>
              </div>
              <div className="text-[11px] text-slate-300">
                {pendingCreatesCount > 0 && `+${pendingCreatesCount} нових `}
                {pendingUpdatesCount > 0 && `• ${pendingUpdatesCount} змінено `}
                {pendingDeletesCount > 0 && `• -${pendingDeletesCount} на видалення `}
                (буде відправлено 1 запитом без перевитрат ISR)
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDiscardAllStaged}
              disabled={isSavingBatch}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 font-bold rounded-xl text-xs transition"
            >
              Скасувати
            </button>

            <button
              type="button"
              onClick={handleSaveBatch}
              disabled={isSavingBatch}
              className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-500/30 active:scale-95"
            >
              {isSavingBatch ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Збереження...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Зберегти все (1 запит)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Product (Full detail editor) */}
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
                    <span>Додати новий товар в чернетку</span>
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

            <form onSubmit={handleSaveModalProduct} className="space-y-4 text-xs">
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
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, sku: generateAutoSku(prev.name) }))
                      }
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
                    Жодної фотографії ще не додано.
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
                  <span>{editingProduct ? 'Зафіксувати в чернетці' : 'Додати в чернетку'}</span>
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
