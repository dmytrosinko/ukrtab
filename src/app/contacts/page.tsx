import React from 'react';
import { Phone, Mail, MapPin, Clock, Star, ShieldCheck, FileText, RotateCcw, Truck } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Контакти Укртаб — Телефони, адреси виробництва та реквізити інтернет-магазину',
  description: 'Офіційні контакти виробника Укртаб: телефони +380 (66) 441-80-50, +380 (68) 367-70-15. Адреси виробництва: м. Запоріжжя, вул. Миру, 1г, індекс 69000; м. Дніпро, вул. Миру 2т, індекс 49000. Графік роботи, реквізити та месенджери.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ukrtab.com.ua'}/contacts`,
  },
};

export default function ContactsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Офіційний виробник та інтернет-магазин</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Контактна інформація</h1>
        <p className="text-sm sm:text-base text-slate-600">
          Ми завжди раді відповісти на ваші запитання, проконсультувати щодо матеріалів, розрахувати оптову вартість або допомогти з виготовленням індивідуального макету.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact info cards */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Телефони відділу продажів</h3>
            <div className="space-y-2.5 text-sm font-bold text-slate-900">
              <a href="tel:+380664418050" className="flex items-center space-x-2 hover:text-emerald-600 transition">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>+380 (66) 441-80-50 <span className="text-xs font-normal text-slate-500">(Ксенія)</span></span>
              </a>
              <a href="tel:+380683677015" className="flex items-center space-x-2 hover:text-emerald-600 transition">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>+380 (68) 367-70-15 <span className="text-xs font-normal text-slate-500">(Дмитро)</span></span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Месенджери (швидкий зв&apos;язок)</h3>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href="viber://chat?number=%2B380664418050"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#6F3FAA]/10 hover:bg-[#6F3FAA]/20 text-[#6F3FAA] font-bold text-xs transition"
              >
                <span>🟣 Viber</span>
              </a>
              <a
                href="https://t.me/+380664418050"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] font-bold text-xs transition"
              >
                <span>🔵 Telegram</span>
              </a>
              <a
                href="https://wa.me/380664418050"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-xs transition"
              >
                <span>🟢 WhatsApp</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Електронна пошта</h3>
            <a href="mailto:mabitzp@gmail.com" className="flex items-center space-x-2 text-sm font-bold text-slate-900 hover:text-emerald-600 transition">
              <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>mabitzp@gmail.com</span>
            </a>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Адреси виробництва та представництв</h3>
            <div className="space-y-3 text-sm text-slate-900">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                <div>
                  <div className="font-bold">м. Запоріжжя (Головне виробництво та офіс)</div>
                  <div className="text-xs text-slate-500 font-normal">вулиця Миру, 1г, індекс 69000, Україна</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                <div>
                  <div className="font-bold">м. Дніпро (Представництво)</div>
                  <div className="text-xs text-slate-500 font-normal">вулиця Миру, 2т, індекс 49000, Україна</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Графік прийому замовлень</h3>
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Понеділок — Неділя: 10:00 - 21:00</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Онлайн-замовлення через сайт приймаються цілодобово 24/7.</p>
          </div>
        </div>

        {/* Legal & Info card */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="bg-gradient-to-tr from-slate-900 to-emerald-950 text-white p-8 rounded-3xl space-y-5 shadow-lg">
            <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>Офіційний виробник UKRTAB</span>
            </div>
            <h3 className="text-2xl font-black">Швидке виготовлення 1-2 дні</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Власна виробнича база УФ-друку, лазерної та плотерної порізки, виготовлення магнітної реклами, автомобільних номерів та фасадних табличок.
            </p>
            <div className="border-t border-slate-800 pt-4 text-xs text-slate-400 space-y-1">
              <div><strong>Торговельна назва:</strong> Укртаб / UKRTAB</div>
              <div><strong>Юридична діяльність:</strong> Виробництво та реалізація поліграфічної та сувенірної продукції</div>
            </div>
          </div>

          {/* Policy quick links */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Офіційні правила та документи</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <Link href="/delivery" className="flex items-center space-x-2 p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Оплата та доставка</span>
              </Link>
              <Link href="/returns" className="flex items-center space-x-2 p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition">
                <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Повернення та обмін</span>
              </Link>
              <Link href="/terms" className="flex items-center space-x-2 p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition">
                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Публічна оферта</span>
              </Link>
              <Link href="/privacy" className="flex items-center space-x-2 p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Політика конфіденційності</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
