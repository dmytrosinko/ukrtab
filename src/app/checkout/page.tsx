'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, CheckCircle, Truck, CreditCard, User, Phone, MapPin, ArrowLeft } from 'lucide-react';
import NovaPoshtaSelector from '@/components/NovaPoshtaSelector';
import { trackPurchase, trackBeginCheckout } from '@/lib/analytics';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();

  useEffect(() => {
    if (items.length > 0) {
      trackBeginCheckout(items, totalPrice);
    }
  }, []);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    city: 'м. Дніпро',
    deliveryMethod: 'Нова Пошта',
    warehouseInfo: '',
    paymentMethod: 'Оплата за реквізитами IBAN / на картку',
    notes: '',
  });

  const [cityRef, setCityRef] = useState('db5c88f0-391c-11dd-90d9-001a92567626'); // Дніпро
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone) {
      setErrorMessage('Будь ласка, вкажіть ваше ім’я та номер телефону');
      return;
    }

    if (formData.deliveryMethod === 'Нова Пошта' && (!formData.city || !formData.warehouseInfo)) {
      setErrorMessage('Будь ласка, оберіть населений пункт та відділення або поштомат Нової Пошти');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Ваш кошик порожній');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        trackPurchase(data.orderNumber || Date.now(), totalPrice, items);
        setCreatedOrder(data);
        clearCart();
      } else {
        setErrorMessage(data.error || 'Помилка створення замовлення');
      }
    } catch (err) {
      setErrorMessage('Мережева помилка. Спробуйте пізніше.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdOrder) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">Замовлення прийнято!</h1>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="text-sm text-slate-500">Номер замовлення:</div>
          <div className="text-3xl font-black text-emerald-600">#{createdOrder.orderNumber}</div>
          <p className="text-xs text-slate-600">
            Дякуємо, <span className="font-bold">{createdOrder.customerName}</span>! Наш менеджер зв’яжеться з вами за номером <span className="font-bold">{createdOrder.customerPhone}</span> для підтвердження деталізації.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/30 transition"
        >
          Повернутися на головну
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">У кошику немає товарів</h2>
        <p className="text-xs text-slate-500">Додайте товари з каталогу для оформлення замовлення</p>
        <Link
          href="/catalog"
          className="inline-block bg-emerald-600 text-white font-bold text-xs px-6 py-3 rounded-xl"
        >
          До каталогу
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Оформлення замовлення</h1>
        <Link href="/catalog" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Продовжити покупки</span>
        </Link>
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 text-xs font-semibold">
          ⚠️ {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact & Shipping Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-emerald-600" />
              <span>Контактні дані покупця</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Прізвище та ім’я *</label>
                <input
                  type="text"
                  name="customerName"
                  required
                  placeholder="Іван Іванов"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Номер телефону *</label>
                <input
                  type="tel"
                  name="customerPhone"
                  required
                  placeholder="+380 67 123 45 67"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Email (необов’язково)</label>
                <input
                  type="email"
                  name="customerEmail"
                  placeholder="name@example.com"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Truck className="w-5 h-5 text-emerald-600" />
              <span>Доставка</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Спосіб доставки *</label>
                <select
                  name="deliveryMethod"
                  value={formData.deliveryMethod}
                  onChange={(e) => {
                    handleChange(e);
                    if (e.target.value !== 'Нова Пошта') {
                      setFormData((prev) => ({ ...prev, warehouseInfo: '' }));
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                >
                  <option value="Нова Пошта">Нова Пошта (Відділення / Поштомат)</option>
                  <option value="Укрпошта">Укрпошта</option>
                  <option value="Самовивіз Дніпро">Самовивіз (м. Дніпро, вул. Миру 2т)</option>
                </select>
              </div>

              {formData.deliveryMethod === 'Нова Пошта' ? (
                <NovaPoshtaSelector
                  selectedCity={formData.city}
                  selectedCityRef={cityRef}
                  selectedWarehouse={formData.warehouseInfo}
                  onSelectCity={(cName, cRef) => {
                    setFormData((prev) => ({ ...prev, city: cName }));
                    setCityRef(cRef);
                  }}
                  onSelectWarehouse={(whInfo) => {
                    setFormData((prev) => ({ ...prev, warehouseInfo: whInfo }));
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Місто / Населений пункт *</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="м. Київ / Дніпро"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {formData.deliveryMethod === 'Самовивіз Дніпро' ? 'Примітка до самовивозу' : 'Адреса / Индекс / Відділення'}
                    </label>
                    <input
                      type="text"
                      name="warehouseInfo"
                      placeholder={
                        formData.deliveryMethod === 'Самовивіз Дніпро'
                          ? 'Бажаний час або дата видачі'
                          : 'Вул. Шевченка 10, кв. 5 / Індекс'
                      }
                      value={formData.warehouseInfo}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>Оплата</span>
            </h3>

            <div>
              <label className="flex items-center space-x-3 p-4 bg-emerald-50/60 border-2 border-emerald-500 rounded-2xl cursor-default transition">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Оплата за реквізитами IBAN / на картку"
                  checked={true}
                  readOnly
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <span className="text-xs font-bold text-slate-900 block">
                    Оплата за реквізитами IBAN / на картку
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                    Реквізити для оплати будуть надіслані менеджером у SMS / Viber після підтвердження замовлення.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
            <label className="block text-xs font-bold text-slate-700">Примітка до замовлення</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Коментар щодо розміру, напису або вимог до виготовлення..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Ваше замовлення
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center text-xs">
                  <div className="truncate pr-2">
                    <div className="font-bold text-slate-800 truncate">{item.product.name}</div>
                    <div className="text-slate-400">{item.quantity} x {item.product.price} ₴</div>
                  </div>
                  <div className="font-black text-slate-900 whitespace-nowrap">
                    {(item.product.price * item.quantity).toFixed(0)} ₴
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Доставка:</span>
                <span>За тарифами перевізника</span>
              </div>
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-sm font-bold text-slate-900">Разом:</span>
                <span className="text-2xl font-black text-emerald-600">{totalPrice} ₴</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/30 transition transform active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Оформлення...' : 'Підтвердити замовлення'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
