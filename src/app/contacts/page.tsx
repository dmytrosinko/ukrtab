import React from 'react';
import { Phone, Mail, MapPin, Clock, Star } from 'lucide-react';

export default function ContactsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Контактна інформація</h1>
        <p className="text-sm text-slate-600">
          Ми завжди раді відповісти на ваші запитання та допомогти з вибором або розробкою індивідуального макету!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact info cards */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Телефони відділу продажів</h3>
            <div className="space-y-2 text-sm font-bold text-slate-900">
              <a href="tel:+380664418050" className="flex items-center space-x-2 hover:text-emerald-600 transition">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>+380 (66) 441-80-50 (Ксенія)</span>
              </a>
              <a href="tel:+380683677015" className="flex items-center space-x-2 hover:text-emerald-600 transition">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>+380 (68) 367-70-15 (Дмитро)</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Електронна пошта</h3>
            <a href="mailto:mabitzp@gmail.com" className="flex items-center space-x-2 text-sm font-bold text-slate-900 hover:text-emerald-600 transition">
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>mabitzp@gmail.com</span>
            </a>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Адреса виробництва</h3>
            <div className="flex items-start space-x-2 text-sm font-bold text-slate-900">
              <MapPin className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
              <span>Україна, м. Дніпро, вул. Миру 2т</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Графік роботи</h3>
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Понеділок — Неділя: 10:00 - 21:00</span>
            </div>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-gradient-to-tr from-slate-900 to-emerald-950 text-white p-8 rounded-3xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>Офіційний виробник UKRTAB</span>
            </div>
            <h3 className="text-2xl font-black">Працюємо швидко та якісно</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Якщо вам потрібен розрахунок оптової партії або нанесення індивідуального логотипу — зателефонуйте нам за вказаними номерами.
            </p>
          </div>

          <div className="border-t border-slate-800 pt-4 text-xs text-slate-400">
            Офіційний інтернет-магазин компанії Укртаб.
          </div>
        </div>
      </div>
    </div>
  );
}
