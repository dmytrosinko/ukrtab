import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Політика конфіденційності та захисту персональних даних — Укртаб',
  description: 'Офіційна політика конфіденційності інтернет-магазину Укртаб. Правила збору, обробки, використання та захисту персональних даних користувачів згідно з чинним законодавством України.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ukrtab.com.ua'}/privacy`,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 px-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-xl space-y-3">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Безпека та захист даних</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Політика конфіденційності
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          Ми поважаємо вашу конфіденційність і гарантуємо надійний захист ваших персональних даних відповідно до Закону України «Про захист персональних даних».
        </p>
      </div>

      {/* Content */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-8 text-slate-700 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>1. Загальні положення</span>
          </h2>
          <p>
            Ця Політика конфіденційності визначає порядок збору, обробки, використання та захисту персональної інформації користувачів (далі — «Користувач») інтернет-магазину <strong>Укртаб</strong> (веб-сайт ukrtab.com.ua).
          </p>
          <p>
            Використовуючи наш сайт, оформлюючи замовлення або передаючи свої дані через форми зв&apos;язку, Користувач надає повну та беззастережну згоду на обробку своїх персональних даних відповідно до цієї Політики.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Eye className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>2. Які дані ми збираємо</span>
          </h2>
          <p>При взаємодії з нашим сайтом ми можемо збирати такі категорії персональних даних:</p>
          <ul className="space-y-2 list-none pl-1">
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
              <span><strong>Контактна інформація:</strong> Прізвище, ім&apos;я, номер мобільного телефону, адреса електронної пошти (email).</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
              <span><strong>Дані для доставки:</strong> Населений пункт, номер відділення Нової Пошти / Укрпошти або точна адреса доставки кур&apos;єром.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
              <span><strong>Технічна інформація:</strong> IP-адреса, файли cookies, тип пристрою та браузера, історія переглядів для коректної роботи сайту та аналітики.</span>
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>3. Мета збору та використання даних</span>
          </h2>
          <p>Ми використовуємо зібрану інформацію виключно для таких цілей:</p>
          <ul className="space-y-1.5 list-disc pl-5">
            <li>Обробка та виконання замовлень покупця;</li>
            <li>Організація виготовлення індивідуальної поліграфічної та сувенірної продукції;</li>
            <li>Відправка та доставка замовлень транспортними компаніями (Нова Пошта, Укрпошта);</li>
            <li>Комунікація щодо статусу замовлення, оплати або уточнення макетів;</li>
            <li>Надання клієнтської підтримки та гарантійного обслуговування;</li>
            <li>Покращення функціональності сайту та користувацького досвіду.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>4. Захист та нерозголошення інформації третім особам</span>
          </h2>
          <p>
            Ми застосовуємо сучасні технічні та організаційні засоби захисту (включаючи протокол шифрування SSL/HTTPS) для збереження ваших персональних даних від несанкціонованого доступу, зміни або втрати.
          </p>
          <p>
            Ми <strong>не передаємо і не продаємо</strong> ваші персональні дані третім особам, за винятком випадків, прямо необхідних для виконання вашого замовлення (передача даних службі доставки «Нова Пошта» або платіжним сервісам), або на законну вимогу державних органів України.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
            5. Використання файлів Cookie
          </h2>
          <p>
            Наш сайт використовує файли cookie для зберігання вмісту кошика, налаштувань користувача та збору анонімної статистики відвідувань (Google Analytics). Ви можете в будь-який момент вимкнути збереження cookie у налаштуваннях свого браузера.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
            6. Права користувача та контакти
          </h2>
          <p>
            Користувач має право в будь-який момент відкликати згоду на обробку персональних даних, отримати інформацію про збережені дані або вимагати їх повного видалення.
          </p>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-3 space-y-1 text-xs">
            <div><strong>Відповідальна особа / Адміністрація сайту:</strong> ФОП / Укртаб</div>
            <div><strong>Email для звернень:</strong> <a href="mailto:mabitzp@gmail.com" className="text-emerald-600 underline">mabitzp@gmail.com</a></div>
            <div><strong>Телефон:</strong> <a href="tel:+380664418050" className="text-emerald-600">+380 (66) 441-80-50</a></div>
            <div><strong>Адреса:</strong> м. Запоріжжя, вул. Миру, 1г, 69000, Україна</div>
          </div>
        </section>
      </div>

      <div className="text-center text-xs text-slate-500">
        <Link href="/contacts" className="text-emerald-600 font-semibold hover:underline">
          Зв&apos;язатися з нами
        </Link>
        {' '}&bull;{' '}
        <Link href="/terms" className="text-emerald-600 font-semibold hover:underline">
          Договір публічної оферти
        </Link>
        {' '}&bull;{' '}
        <Link href="/returns" className="text-emerald-600 font-semibold hover:underline">
          Повернення та обмін
        </Link>
      </div>
    </div>
  );
}
