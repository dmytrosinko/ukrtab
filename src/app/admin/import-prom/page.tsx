'use client';

import React, { useState } from 'react';
import { Upload, FileCode, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AdminImportPromPage() {
  const [xmlText, setXmlText] = useState('');
  const [feedUrl, setFeedUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !xmlText.trim() && !feedUrl.trim()) {
      setErrorMessage('Оберіть XML/YML файл, вставте посилання на фід або вставте XML текст');
      return;
    }

    setIsImporting(true);
    setErrorMessage('');
    setImportResult(null);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      } else if (feedUrl.trim()) {
        formData.append('feedUrl', feedUrl.trim());
      } else {
        formData.append('xmlText', xmlText);
      }

      const res = await fetch('/api/import-prom', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setImportResult(data);
      } else {
        setErrorMessage(data.error || 'Помилка обробки файлу');
      }
    } catch (e) {
      setErrorMessage('Помилка відправки запиту на сервер');
    } finally {
      setIsImporting(false);
    }
  };

  const handleInsertDemoXml = () => {
    const demoXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE yml_catalog SYSTEM "shops.dtd">
<yml_catalog date="2026-07-26 00:00">
  <shop>
    <categories>
      <category id="201">Сувенірні Магніти Prom</category>
      <category id="202">Попереджувальні Знаки Prom</category>
    </categories>
    <offers>
      <offer id="9901" available="true">
        <name>Магнітна наклейка "Доброго вечора ми з України" 20х20см</name>
        <price>195</price>
        <categoryId>201</categoryId>
        <picture>https://images.prom.ua/6793582624_w640_h640_magnitna-naklejka-morska.jpg</picture>
        <vendorCode>MAG-DV-2020</vendorCode>
        <description><![CDATA[Магнітна наклейка з ламінацією на кузов авто.]]></description>
      </offer>
      <offer id="9902" available="true">
        <name>Знак "Вхід тільки в касках" (Пластик 40х30см)</name>
        <price>160</price>
        <categoryId>202</categoryId>
        <picture>https://images.prom.ua/6964429952_w297_h200_poperedzhuvalni-znaki-.jpg</picture>
        <vendorCode>SIGN-HELMET</vendorCode>
        <description><![CDATA[Попереджувальний інформаційний знак для будівельних майданчиків.]]></description>
      </offer>
    </offers>
  </shop>
</yml_catalog>`;
    setXmlText(demoXml);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mb-1">
            PROM.UA YML / XML IMPORTER
          </div>
          <h2 className="text-2xl font-black text-slate-900">Імпортер каталогу з Prom.ua</h2>
          <p className="text-xs text-slate-500">
            Перенесіть всі ваші товари, фотографії, категорії та ціни з Prom.ua на ваш власний сайт
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={async () => {
              if (confirm('Імпортувати весь базовий каталог (340+ товарів та категорії) в базу даних PostgreSQL?')) {
                setIsImporting(true);
                try {
                  const res = await fetch('/api/admin/seed');
                  const data = await res.json();
                  if (res.ok) {
                    setImportResult({ productsImported: data.totalInDatabase || 340, categoriesImported: 5 });
                  } else {
                    setErrorMessage(data.error || 'Помилка сідингу');
                  }
                } catch (e) {
                  setErrorMessage('Помилка відправки запиту');
                } finally {
                  setIsImporting(false);
                }
              }
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md shadow-emerald-600/20"
          >
            ⚡ Завантажити весь базовий каталог (340+ товарів)
          </button>
          <Link
            href="/admin/products"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>До списку товарів</span>
          </Link>
        </div>
      </div>

      {importResult && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-6 rounded-3xl space-y-2">
          <div className="flex items-center space-x-2 text-emerald-700 font-black text-lg">
            <CheckCircle2 className="w-6 h-6" />
            <span>Імпорт успішно завершено!</span>
          </div>
          <p className="text-xs">
            Імпортовано категорій: <span className="font-bold">{importResult.categoriesImported}</span> |
            Імпортовано товарів: <span className="font-bold">{importResult.productsImported}</span>
          </p>
          <div className="pt-2">
            <Link
              href="/admin/products"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Переглянути імпортовані товари
            </Link>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-bold flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleImport} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* URL Import Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <RefreshCw className="w-5 h-5 text-emerald-600" />
            <span>Імпорт за посиланням на XML/YML фід (Prom.ua / Google Merchant)</span>
          </h3>

          <p className="text-xs text-slate-500">
            Вставте посилання на ваш фід експорту з Prom.ua (автоматично видаляє всі дублікати):
          </p>

          <input
            type="url"
            placeholder="https://ukrtab.prom.ua/google_merchant_center.xml?hash_tag=..."
            value={feedUrl}
            onChange={(e) => {
              setFeedUrl(e.target.value);
              setSelectedFile(null);
              setXmlText('');
            }}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* File Upload Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Upload className="w-5 h-5 text-emerald-600" />
            <span>Спосіб 1: Завантажити файл XML / YML</span>
          </h3>

          <p className="text-xs text-slate-500 leading-relaxed">
            В кабінеті Prom.ua перейдіть в розділ <b>Товари та послуги → Експорт товарів</b>, оберіть формат <b>YML/XML</b> та завантажте файл сюди.
          </p>

          <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center space-y-3 bg-slate-50 transition cursor-pointer">
            <input
              type="file"
              accept=".xml,.yml"
              onChange={handleFileChange}
              className="hidden"
              id="prom-file-input"
            />
            <label htmlFor="prom-file-input" className="cursor-pointer block space-y-2">
              <FileCode className="w-10 h-10 text-emerald-600 mx-auto" />
              <div className="text-xs font-bold text-slate-700">
                {selectedFile ? selectedFile.name : 'Натисніть для вибору .XML або .YML файлу'}
              </div>
              <div className="text-[10px] text-slate-400">Файли експорту Prom.ua</div>
            </label>
          </div>
        </div>

        {/* Text Area Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <FileCode className="w-5 h-5 text-emerald-600" />
              <span>Спосіб 2: Вставити XML код</span>
            </h3>
            <button
              type="button"
              onClick={handleInsertDemoXml}
              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 underline"
            >
              Вставити демо XML
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Ви можете скопіювати зміст YML фіду з Prom.ua та вставити в поле нижче:
          </p>

          <textarea
            rows={8}
            placeholder='<?xml version="1.0" encoding="UTF-8"?><yml_catalog ...'
            value={xmlText}
            onChange={(e) => {
              setXmlText(e.target.value);
              setSelectedFile(null);
            }}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="lg:col-span-2">
          <button
            type="submit"
            disabled={isImporting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-emerald-600/30 text-sm transition transform active:scale-95 disabled:opacity-50"
          >
            {isImporting ? 'Виконується імпорт...' : 'Запустити імпорт з Prom.ua'}
          </button>
        </div>
      </form>
    </div>
  );
}
