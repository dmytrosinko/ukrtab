import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Award, ThumbsUp, Truck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
          Про компанію Укртаб
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Виробництво магнітів, наліпок на авто та інформаційних табличок
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Компанія <b>Укртаб</b> спеціалізується на виготовленні високоякісної патріотичної продукції, магнітних наліпок на автомобільний транспорт, попереджувальних знаків (Обережно Міни, Охорона) та адресних табличок з надійних матеріалів.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Власне виробництво</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Використовуємо сучасні вінілові магніти товщиною 0.8 мм з посиленим притяганням та захисною ламінацією.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Стійкість до негоди</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Продукція витримує дощ, сніг, автомобільні мийки високого тиску та пряме сонячне проміння.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">553+ Вдячних клієнтів</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Працюємо з підрозділами ЗСУ, службами безпеки, інкасацією, комерційними підприємствами та приватними клієнтами.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-4">
        <h3 className="text-xl font-bold">Готові зробити замовлення?</h3>
        <p className="text-xs text-slate-300">
          Оберіть товари з нашого каталогу або зв’яжіться з нашим менеджером для виготовлення індивідуального макету.
        </p>
        <Link
          href="/catalog"
          className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition"
        >
          Перейти до каталогу
        </Link>
      </div>
    </div>
  );
}
