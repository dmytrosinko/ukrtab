import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center font-bold text-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-xl font-black text-white tracking-tight uppercase">
              УКР<span className="text-emerald-400">ТАБ</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Виробництво вінілових та магнітних наліпок на авто, попереджувальних знаків ЗСУ/Охорона та адресних табличок з доставкою по всій Україні.
          </p>
        </div>

        {/* Catalog Links */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Каталог товарів</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/catalog?search=наліп" className="hover:text-emerald-400 transition">
                Магнітні наліпки на авто
              </Link>
            </li>
            <li>
              <Link href="/catalog?search=зсу" className="hover:text-emerald-400 transition">
                Магніти та знаки ЗСУ
              </Link>
            </li>
            <li>
              <Link href="/catalog?search=знак" className="hover:text-emerald-400 transition">
                Попереджувальні знаки ⚠️ Міни / Охорона
              </Link>
            </li>
            <li>
              <Link href="/catalog?search=табличк" className="hover:text-emerald-400 transition">
                Таблички адресні на будинок
              </Link>
            </li>
            <li>
              <Link href="/catalog?search=автономер" className="hover:text-emerald-400 transition">
                Автономери під замовлення
              </Link>
            </li>
          </ul>
        </div>

        {/* Information */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Інформація</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/about" className="hover:text-emerald-400 transition">
                Про компанію Укртаб
              </Link>
            </li>
            <li>
              <Link href="/delivery" className="hover:text-emerald-400 transition">
                Доставка Новою Поштою та Укрпоштою
              </Link>
            </li>
            <li>
              <Link href="/contacts" className="hover:text-emerald-400 transition">
                Контактні дані
              </Link>
            </li>
          </ul>
        </div>

        {/* Contacts */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Контакти</h4>
          <div className="flex items-start space-x-2 text-xs text-slate-300">
            <Phone className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <a href="tel:+380664418050" className="block hover:text-white transition">+380 (66) 441-80-50</a>
              <a href="tel:+380683677015" className="block hover:text-white transition">+380 (68) 367-70-15</a>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
            <a href="mailto:mabitzp@gmail.com" className="hover:text-white transition">
              mabitzp@gmail.com
            </a>
          </div>
          <div className="flex items-start space-x-2 text-xs text-slate-300">
            <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <span>Україна, м. Дніпро, вул. Миру 2т</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-8 mt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © {new Date().getFullYear()} Укртаб. Всі права захищено.
        </div>
      </div>
    </footer>
  );
}
