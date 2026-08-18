import React from 'react';
import { Truck, CreditCard, CheckCircle, RotateCcw, ShieldCheck, AlertCircle, Phone, Mail, HelpCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Доставка, оплата та повернення товару — Укртаб | Нова Пошта, Укрпошта по всій Україні',
  description: 'Офіційні правила доставки, оплати, повернення та обміну продукції компанії Укртаб. Доставка Новою Поштою (1-2 дні) або Укрпоштою по всій Україні. Гарантія та повернення 14 днів.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ukrtab.com.ua'}/delivery`,
  },
};

export default function DeliveryPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16 px-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-xl space-y-3">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Офіційні умови для клієнтів</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Оплата, доставка та повернення товару
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          Ми виготовляємо та щодня відправляємо замовлення по всій Україні (крім неділі). Більшість стандартних позицій виготовляються та відвантажуються протягом 1–2 робочих днів.
        </p>
      </div>

      {/* Main Grid: Delivery & Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-4">
            <Truck className="w-6 h-6 text-emerald-600 shrink-0" />
            <span>Способи доставки по Україні</span>
          </h2>

          <ul className="space-y-4 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <b className="text-slate-900">Нова Пошта (відділення або поштомат)</b>
                <p className="text-slate-500 text-xs mt-0.5">Термін доставки: 1–2 дні по Україні. Вартість розраховується за тарифами перевізника.</p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <b className="text-slate-900">Кур&apos;єрська доставка Нової Пошти</b>
                <p className="text-slate-500 text-xs mt-0.5">Адресна доставка кур&apos;єром прямо до ваших дверей у будь-якому населеному пункті України.</p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <b className="text-slate-900">Укрпошта Експрес</b>
                <p className="text-slate-500 text-xs mt-0.5">Термін доставки: 2–4 робочих дні у будь-яке відділення по Україні.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Payment */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-4">
            <CreditCard className="w-6 h-6 text-emerald-600 shrink-0" />
            <span>Способи оплати</span>
          </h2>

          <ul className="space-y-4 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <b className="text-slate-900">Безготівковий розрахунок / IBAN (для ФОП та Юр. осіб)</b>
                <p className="text-slate-500 text-xs mt-0.5">Оплата на розрахунковий рахунок ФОП за офіційними реквізитами з наданням накладних.</p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <b className="text-slate-900">Оплата на банківську картку</b>
                <p className="text-slate-500 text-xs mt-0.5">Швидка оплата через інтернет-банкінг (Приват24, Monobank тощо).</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Return & Exchange Policy (Google Merchant Center & Law of Ukraine Compliant) */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Правила повернення та обміну товару
              </h2>
              <p className="text-xs text-slate-500">Відповідно до Закону України «Про захист прав споживачів»</p>
            </div>
          </div>
          <span className="inline-flex items-center self-start sm:self-auto bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">
            Гарантія 14 днів
          </span>
        </div>

        {/* Policy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quality Goods Return */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>Повернення товару належної якості</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Покупець має право повернути або обміняти товар належної якості протягом <b>14 календарних днів</b> з моменту отримання, якщо:
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li>Товар не був у вжитку і не має слідів монтажу чи використання;</li>
              <li>Збережено товарний вигляд, захисні плівки та цілісність пакування;</li>
              <li>Витрати на послуги зворотної доставки оплачує <b>покупець</b>.</li>
            </ul>
          </div>

          {/* Faulty Goods Return */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>Повернення товару неналежної якості (Виробничий брак)</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Якщо при отриманні або огляді ви виявили виробничий дефект чи невідповідність характеристикам:
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li>Ми здійснюємо <b>безкоштовний обмін</b> або повертаємо 100% сплачених коштів;</li>
              <li>Витрати на зворотну доставку повністю бере на себе компанія <b>«Укртаб»</b>;</li>
              <li>Комісія за повернення коштів або обробку замовлення — <b>0 грн (відсутня)</b>.</li>
            </ul>
          </div>
        </div>

        {/* Step-by-step instructions */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <span>Як оформити повернення або обмін:</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs">1</div>
              <b className="text-slate-900 block">Зв&apos;яжіться з нами</b>
              <p className="text-slate-500">
                Зателефонуйте менеджеру або напишіть у Viber/Telegram чи на email, повідомивши номер вашого замовлення.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs">2</div>
              <b className="text-slate-900 block">Надішліть товар</b>
              <p className="text-slate-500">
                Відправте товар службою доставки «Нова Пошта» (реквізити для відправлення надасть менеджер) та повідомте номер ТТН.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs">3</div>
              <b className="text-slate-900 block">Отримайте кошти</b>
              <p className="text-slate-500">
                Повернення коштів здійснюється на банківську картку чи рахунок клієнта протягом <b>1–3 робочих днів</b> після отримання та огляду посилки.
              </p>
            </div>
          </div>
        </div>

        {/* Note on custom individual orders */}
        <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex items-start space-x-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <b className="font-bold">Зверніть увагу щодо індивідуальних замовлень:</b>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              Згідно з Постановою КМУ №172, товари належної якості, виготовлені за індивідуальним замовленням з унікальними написами, розмірами чи персональним макетом клієнта, не підлягають стандартному поверненню, якщо вони не мають виробничого браку. У разі виявлення будь-якого виробничого браку ми гарантовано переробляємо або замінюємо виріб за власний рахунок!
            </p>
          </div>
        </div>

        {/* Contact info for returns */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-slate-900">Відділ роботи з клієнтами:</span>
            <a href="tel:+380664418050" className="flex items-center space-x-1 hover:text-emerald-600 transition">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>+380 (66) 441-80-50</span>
            </a>
            <a href="mailto:mabitzp@gmail.com" className="flex items-center space-x-1 hover:text-emerald-600 transition">
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              <span>mabitzp@gmail.com</span>
            </a>
          </div>
          <Link href="/contacts" className="text-emerald-600 font-bold hover:underline">
            Всі контакти та адреса магазину →
          </Link>
        </div>
      </div>
    </div>
  );
}
