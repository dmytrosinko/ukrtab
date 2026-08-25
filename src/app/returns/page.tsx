import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { RotateCcw, ShieldCheck, CheckCircle, AlertCircle, Phone, Mail, HelpCircle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Політика повернення та обміну товару — Укртаб | Гарантія 14 днів',
  description: 'Офіційні правила повернення та обміну товарів в інтернет-магазині Укртаб згідно із Законом України «Про захист прав споживачів». Умови повернення протягом 14 днів, компенсація доставки при браку, терміни виплат.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ukrtab.com.ua'}/returns`,
  },
};

export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 px-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-xl space-y-3">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold">
          <RotateCcw className="w-4 h-4" />
          <span>Захист прав споживачів</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Політика повернення та обміну
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          Ми дбаємо про кожного клієнта та забезпечуємо чесні та прозорі умови повернення та обміну товарів згідно із законодавством України.
        </p>
      </div>

      {/* Main Rules */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Правила повернення товарів
            </h2>
            <p className="text-xs text-slate-500 mt-1">Відповідно до Закону України «Про захист прав споживачів»</p>
          </div>
          <span className="inline-flex items-center bg-emerald-100 text-emerald-800 text-xs font-bold px-3.5 py-1.5 rounded-full">
            Гарантія повернення 14 днів
          </span>
        </div>

        {/* 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Standard Return */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/70 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Повернення товару належної якості</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ви можете повернути або обміняти стандартний товар належної якості протягом <strong>14 днів</strong> з моменту отримання за таких умов:
            </p>
            <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
              <li>Товар не використовувався і не має слідів експлуатації чи монтажу;</li>
              <li>Збережено товарний вигляд, наклейки, захисні шари та упаковку;</li>
              <li>Витрати на доставку повернення сплачує покупець за тарифами перевізника.</li>
            </ul>
          </div>

          {/* Defect / Warranty Return */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/70 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Повернення у разі виробничого браку</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Якщо при отриманні товару виявлено будь-який виробничий дефект або пошкодження:
            </p>
            <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
              <li>Ми здійснюємо <strong>100% безкоштовний обмін</strong> виробу або повне повернення коштів;</li>
              <li>Всі витрати на пересилку бере на себе інтернет-магазин «Укртаб»;</li>
              <li>Будь-які комісії за повернення коштів відсутні (0 грн).</li>
            </ul>
          </div>
        </div>

        {/* Step by step */}
        <div className="space-y-4 pt-2">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <span>Як виконати повернення чи обмін (3 прості кроки):</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs">1</div>
              <b className="text-slate-900 block text-sm">Зв&apos;яжіться з нами</b>
              <p className="text-slate-500">
                Зателефонуйте або напишіть у Viber/Telegram, вказавши номер замовлення та причину звернення.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs">2</div>
              <b className="text-slate-900 block text-sm">Відправте посилку</b>
              <p className="text-slate-500">
                Надішліть товар службою «Нова Пошта» за реквізитами, наданими менеджером, і надішліть номер ТТН.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs">3</div>
              <b className="text-slate-900 block text-sm">Повернення коштів</b>
              <p className="text-slate-500">
                Кошти перераховуються на вашу банківську картку чи рахунок протягом <strong>1–3 робочих днів</strong> з моменту отримання нами посилки.
              </p>
            </div>
          </div>
        </div>

        {/* Note on individual customized orders */}
        <div className="bg-amber-50 border border-amber-200/90 p-5 rounded-2xl flex items-start space-x-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <b className="font-bold text-amber-950">Особливості для товарів за індивідуальним замовленням:</b>
            <p className="text-amber-800 leading-relaxed">
              Згідно з Постановою Кабінету Міністрів України №172, не підлягають стандартному поверненню товари належної якості, виготовлені під персональне замовлення (з індивідуальними номерами, прізвищами, спеціальними адресами або ексклюзивними макетами покупця), якщо вони не містять виробничого браку. У разі браку ми негайно переробляємо або компенсуємо замовлення!
            </p>
          </div>
        </div>

        {/* Contact info for returns */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-slate-900">Служба клієнтської підтримки:</span>
            <a href="tel:+380664418050" className="flex items-center space-x-1 hover:text-emerald-600 transition font-bold text-slate-900">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>+380 (66) 441-80-50</span>
            </a>
            <a href="mailto:mabitzp@gmail.com" className="flex items-center space-x-1 hover:text-emerald-600 transition font-bold text-slate-900">
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              <span>mabitzp@gmail.com</span>
            </a>
          </div>
          <Link href="/delivery" className="text-emerald-600 font-bold hover:underline flex items-center space-x-1">
            <span>Умови оплати та доставки</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
