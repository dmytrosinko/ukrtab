'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Building2, Package, Check, X, Loader2, Info } from 'lucide-react';

interface City {
  ref: string;
  settlementRef: string;
  name: string;
  present: string;
  area: string;
  region: string;
}

interface Warehouse {
  ref: string;
  number: string;
  description: string;
  shortAddress: string;
  category: 'Branch' | 'Postomat';
  maxWeight: string;
}

interface NovaPoshtaSelectorProps {
  selectedCity: string;
  selectedCityRef?: string;
  selectedWarehouse: string;
  onSelectCity: (cityName: string, cityRef: string) => void;
  onSelectWarehouse: (warehouseInfo: string, warehouseRef: string) => void;
}

const POPULAR_CITIES = [
  { name: 'Київ', ref: '8d5a980d-391c-11dd-90d9-001a92567626' },
  { name: 'Дніпро', ref: 'db5c8892-41cd-11e4-ab6d-005056801329' },
  { name: 'Львів', ref: 'db5c88f5-41cd-11e4-ab6d-005056801329' },
  { name: 'Харків', ref: 'db5c88e0-41cd-11e4-ab6d-005056801329' },
  { name: 'Одеса', ref: 'db5c88d0-41cd-11e4-ab6d-005056801329' },
  { name: 'Запоріжжя', ref: 'db5c88c6-41cd-11e4-ab6d-005056801329' },
];

export default function NovaPoshtaSelector({
  selectedCity,
  selectedCityRef = '',
  selectedWarehouse,
  onSelectCity,
  onSelectWarehouse,
}: NovaPoshtaSelectorProps) {
  // City search state
  const [cityInput, setCityInput] = useState(selectedCity || '');
  const [cityRef, setCityRef] = useState(selectedCityRef || '');
  const [cityResults, setCityResults] = useState<City[]>([]);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Warehouse state
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);
  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<'ALL' | 'Branch' | 'Postomat'>('ALL');

  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Sync prop changes
  useEffect(() => {
    if (selectedCity && selectedCity !== cityInput) {
      setCityInput(selectedCity);
    }
    if (selectedCityRef && selectedCityRef !== cityRef) {
      setCityRef(selectedCityRef);
    }
  }, [selectedCity, selectedCityRef]);

  // Click outside listener for city dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search cities
  useEffect(() => {
    if (!cityInput || cityInput.trim().length < 2) {
      setCityResults([]);
      setIsSearchingCities(false);
      return;
    }

    // If city is already chosen and input matches, don't re-trigger search
    if (selectedCity === cityInput && cityRef) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingCities(true);
      try {
        const res = await fetch(`/api/novaposhta/cities?q=${encodeURIComponent(cityInput.trim())}`);
        const data = await res.json();
        setCityResults(data.cities || []);
        setShowCityDropdown(true);
      } catch (err) {
        console.error('City search failed:', err);
      } finally {
        setIsSearchingCities(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [cityInput, cityRef, selectedCity]);

  // Fetch warehouses when cityRef or cityInput changes
  useEffect(() => {
    if (!cityRef && !selectedCity) {
      setWarehouses([]);
      return;
    }

    const fetchWarehouses = async () => {
      setIsLoadingWarehouses(true);
      try {
        let url = '/api/novaposhta/warehouses?';
        if (cityRef) {
          url += `cityRef=${encodeURIComponent(cityRef)}`;
        } else {
          url += `cityName=${encodeURIComponent(selectedCity || cityInput)}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        setWarehouses(data.warehouses || []);
      } catch (err) {
        console.error('Failed to load warehouses:', err);
      } finally {
        setIsLoadingWarehouses(false);
      }
    };

    fetchWarehouses();
  }, [cityRef, selectedCity]);

  // Handle selecting a city
  const handleSelectCityItem = (city: City) => {
    setCityInput(city.present);
    setCityRef(city.ref);
    setShowCityDropdown(false);
    onSelectCity(city.present, city.ref);
    onSelectWarehouse('', ''); // Reset warehouse selection
  };

  const handlePopularCityClick = (pop: { name: string; ref: string }) => {
    const fullName = `м. ${pop.name}`;
    setCityInput(fullName);
    setCityRef(pop.ref);
    setShowCityDropdown(false);
    onSelectCity(fullName, pop.ref);
    onSelectWarehouse('', '');
  };

  // Filter warehouses based on search query and category filter
  const filteredWarehouses = warehouses.filter((wh) => {
    const matchesCategory =
      deliveryTypeFilter === 'ALL' || wh.category === deliveryTypeFilter;

    if (!warehouseSearch.trim()) return matchesCategory;

    const query = warehouseSearch.trim().toLowerCase();
    const matchesQuery =
      wh.description.toLowerCase().includes(query) ||
      wh.number.toString().includes(query) ||
      wh.shortAddress.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-4">
      {/* 1. City Search */}
      <div className="relative" ref={cityDropdownRef}>
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Населений пункт *</span>
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Введіть назву міста (напр. Київ, Дніпро...)"
            value={cityInput}
            onChange={(e) => {
              setCityInput(e.target.value);
              setCityRef('');
            }}
            onFocus={() => {
              if (cityResults.length > 0) setShowCityDropdown(true);
            }}
            className="w-full px-4 py-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          {isSearchingCities && (
            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin absolute right-3 top-3" />
          )}
          {cityInput && !isSearchingCities && (
            <button
              type="button"
              onClick={() => {
                setCityInput('');
                setCityRef('');
                setCityResults([]);
                onSelectCity('', '');
                onSelectWarehouse('', '');
              }}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick popular cities chips */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="text-[11px] text-slate-400 self-center mr-1">Популярні:</span>
          {POPULAR_CITIES.map((pop) => (
            <button
              key={pop.ref}
              type="button"
              onClick={() => handlePopularCityClick(pop)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                cityRef === pop.ref || cityInput.includes(pop.name)
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {pop.name}
            </button>
          ))}
        </div>

        {/* City Autocomplete Dropdown */}
        {showCityDropdown && cityResults.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
            {cityResults.map((city) => (
              <button
                key={city.ref}
                type="button"
                onClick={() => handleSelectCityItem(city)}
                className="w-full text-left px-4 py-2.5 hover:bg-emerald-50/60 transition flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800">{city.present}</span>
                </div>
                {cityRef === city.ref && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Warehouse / Postomat Selector */}
      {selectedCity && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Оберіть відділення або поштомат *</span>
            </label>

            {/* Filter Tabs: All / Branch / Postomat */}
            <div className="flex bg-slate-100 p-1 rounded-xl space-x-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setDeliveryTypeFilter('ALL')}
                className={`text-[11px] font-bold px-3 py-1 rounded-lg transition ${
                  deliveryTypeFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Всі
              </button>
              <button
                type="button"
                onClick={() => setDeliveryTypeFilter('Branch')}
                className={`text-[11px] font-bold px-3 py-1 rounded-lg flex items-center space-x-1 transition ${
                  deliveryTypeFilter === 'Branch'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building2 className="w-3 h-3" />
                <span>Відділення</span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryTypeFilter('Postomat')}
                className={`text-[11px] font-bold px-3 py-1 rounded-lg flex items-center space-x-1 transition ${
                  deliveryTypeFilter === 'Postomat'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Package className="w-3 h-3" />
                <span>Поштомати</span>
              </button>
            </div>
          </div>

          {/* Search inside warehouses */}
          {warehouses.length > 10 && (
            <div className="relative">
              <input
                type="text"
                placeholder="Пошук за номером або вулицею (напр. 15, Перемоги)..."
                value={warehouseSearch}
                onChange={(e) => setWarehouseSearch(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
              {warehouseSearch && (
                <button
                  type="button"
                  onClick={() => setWarehouseSearch('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Warehouse Dropdown / List */}
          {isLoadingWarehouses ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>Завантаження списку відділень Нової Пошти...</span>
            </div>
          ) : filteredWarehouses.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center space-x-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {warehouses.length === 0
                  ? 'У даному населеному пункті не знайдено відділень або спробуйте уточнити назву міста.'
                  : 'За вашим фільтром нічого не знайдено.'}
              </span>
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedWarehouse}
                onChange={(e) => {
                  const val = e.target.value;
                  const found = filteredWarehouses.find((w) => w.description === val);
                  onSelectWarehouse(val, found?.ref || '');
                }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              >
                <option value="">-- Оберіть відділення або поштомат --</option>
                {filteredWarehouses.map((wh) => (
                  <option key={wh.ref} value={wh.description}>
                    {wh.category === 'Postomat' ? '📦 [Поштомат] ' : '🏢 [Відділення] '}
                    {wh.description}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Selected Item Card Badge */}
          {selectedWarehouse && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start justify-between text-xs space-x-2">
              <div className="flex items-start space-x-2">
                {selectedWarehouse.toLowerCase().includes('поштомат') ? (
                  <Package className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                ) : (
                  <Building2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                )}
                <div>
                  <div className="font-bold text-slate-900">{selectedWarehouse}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Обрано для доставки Новою Поштою
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold text-[10px] rounded-full shrink-0">
                Обрано
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
