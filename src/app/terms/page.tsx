import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ShieldCheck, CheckCircle, CreditCard, Truck, RotateCcw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Договір публічної оферти (Умови використання) — Укртаб',
  description: 'Офіційний договір публічної оферти купівлі-продажу товарів в інтернет-магазині Укртаб. Права, обов\'язки сторін, умови оплати, доставки, гарантії та повернення.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ukrtab.com.ua'}/terms`,
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 px-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-xl space-y-3">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold">
          <FileText className="w-4 h-4" />
          <span>Офіційні правила магазину</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Договір публічної оферти
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          Публічний договір купівлі-продажу товарів через інтернет-магазин ukrtab.com.ua відповідно до Цивільного кодексу України та Закону «Про електронну комерцію».
        </p>
      </div>

      {/* Content */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-8 text-slate-700 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
            1. Загальні положення
          </h2>
          <p>
            1.1. Цей договір є офіційною публічною пропозицією (офертою) Продавця (інтернет-магазин <strong>Укртаб</strong>) укласти договір купівлі-продажу товарів дистанційним способом на умовах, викладених нижче.
          </p>
          <p>
            1.2. Оформлення замовлення на сайті ukrtab.com.ua, натискання кнопки «Оформити замовлення», або попередня оплата товару є повним і беззастережним прийняттям (акцептом) умов цього Договору Покупцем.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
            2. Предмет договору
          </h2>
          <p>
            2.1. Продавець зобов&apos;язується виготовити та/або передати у власність Покупця Товар (магнітні наклейки на авто, сувенірні номери, адресні таблички, трафарети, поліграфію тощо), а Покупець зобов&apos;язується прийняти та оплатити Товар на умовах цього Договору.
          </p>
          <p>
            2.2. Характеристики, розміри, макети та ціна Товарів зазначаються на відповідних сторінках інтернет-магазину або узгоджуються з менеджером індивідуально.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
            3. Оформлення замовлення та виготовлення
          </h2>
          <p>
            3.1. Покупець самостійно оформлює замовлення через сайт, або зв&apos;язується з Продавцем за допомогою контактних телефонів та месенджерів (Viber, Telegram, WhatsApp).
          </p>
          <p>
            3.2. Термін виготовлення замовлень становить від 1 до 2 робочих днів з моменту затвердження макету (якщо інше не погоджено окремо).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <CreditCard className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>4. Ціна товару та порядок оплати</span>
          </h2>
          <p>
            4.1. Ціни на Товари вказуються на сайті у національній валюті України — гривні (UAH).
          </p>
          <p>4.2. Оплата здійснюється такими способами:</p>
          <ul className="space-y-1.5 list-disc pl-5">
            <li>Безготівковий розрахунок на банківський рахунок (IBAN) Продавця;</li>
            <li>Онлайн-оплата або переказ на банківську карту;</li>
            <li>Інші погоджені між сторонами способи оплати.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>5. Умови доставки</span>
          </h2>
          <p>
            5.1. Доставка Товарів здійснюється по всій території України службами доставки «Нова Пошта» та «Укрпошта» до відділення, поштомату або адресно кур&apos;єром.
          </p>
          <p>
            5.2. Вартість доставки розраховується за тарифами відповідної транспортної компанії та сплачується Покупцем при отриманні посилки, якщо інше не передбачено спеціальними акціями.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <RotateCcw className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>6. Повернення, обмін та гарантійні зобов&apos;язання</span>
          </h2>
          <p>
            6.1. Повернення та обмін товарів здійснюється відповідно до чинного Закону України «Про захист прав споживачів» та внутрішніх <Link href="/returns" className="text-emerald-600 font-bold underline">Правил повернення товару</Link>.
          </p>
          <p>
            6.2. Покупець має право повернути або обміняти стандартний товар належної якості протягом 14 календарних днів за умови збереження товарного вигляду та споживчих властивостей.
          </p>
          <p>
            6.3. Товари належної якості, виготовлені за індивідуальним персональним замовленням з нанесенням унікального тексту або дизайну клієнта, не підлягають стандартному поверненню відповідно до законодавства, крім випадків виробничого браку.
          </p>
          <p>
            6.4. У разі виявлення виробничого браку Продавець гарантує 100% безкоштовну заміну виробу або повне повернення коштів.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
            7. Реквізити та контакти Продавця
          </h2>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <div><strong>Найменування:</strong> Інтернет-магазин «Укртаб» (Ukrtab)</div>
            <div><strong>Фактична адреса виробництва:</strong> м. Запоріжжя, вул. Миру, 1г, 69000, Україна</div>
            <div><strong>Представництво:</strong> м. Дніпро, вул. Миру, 2т, 49000, Україна</div>
            <div><strong>Телефони відділу продажів:</strong> +380 (66) 441-80-50, +380 (68) 367-70-15</div>
            <div><strong>Email:</strong> <a href="mailto:mabitzp@gmail.com" className="text-emerald-600 underline">mabitzp@gmail.com</a></div>
            <div><strong>Графік роботи:</strong> Пн-Нд 10:00 – 21:00</div>
          </div>
        </section>
      </div>

      <div className="text-center text-xs text-slate-500">
        <Link href="/contacts" className="text-emerald-600 font-semibold hover:underline">
          Контакти
        </Link>
        {' '}&bull;{' '}
        <Link href="/privacy" className="text-emerald-600 font-semibold hover:underline">
          Політика конфіденційності
        </Link>
        {' '}&bull;{' '}
        <Link href="/delivery" className="text-emerald-600 font-semibold hover:underline">
          Оплата та доставка
        </Link>
      </div>
    </div>
  );
}
