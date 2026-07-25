import React from 'react';
import { Truck, CreditCard, MapPin, CheckCircle } from 'lucide-react';

export default function DeliveryPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Доставка та оплата</h1>
        <p className="text-sm text-slate-600">
          Ми відправляємо замовлення по всій Україні щодня, крім неділі. Більшість стандартних позицій виготовляються та відвантажуються в день замовлення.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Truck className="w-5 h-5 text-emerald-600" />
            <span>Способи доставки</span>
          </h3>

          <ul className="space-y-3 text-xs text-slate-700">
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <b>Нова Пошта (у відділення або поштомат)</b>
                <p className="text-slate-500">Термін доставки: 1-2 дні. Оплата за тарифами перевізника.</p>
              </div>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <b>Укрпошта Експрес</b>
                <p className="text-slate-500">Термін доставки: 2-4 дні по Україні.</p>
              </div>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <b>Самовивіз у м. Дніпро</b>
                <p className="text-slate-500">Видача замовлень за адресою: м. Дніпро, вул. Миру 2т (за попереднім узгодженням).</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Payment */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <span>Способи оплати</span>
          </h3>

          <ul className="space-y-3 text-xs text-slate-700">
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <b>Оплата при отриманні (Післяплата)</b>
                <p className="text-slate-500">Оплата готівкою або карткою у відділенні Нової Пошти після огляду товару.</p>
              </div>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <b>Безготівковий розрахунок / IBAN / На картку</b>
                <p className="text-slate-500">Оплата на розрахунковий рахунок або банківську картку для фізичних та юридичних осіб.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
