import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* About */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center font-bold text-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-xl font-black text-white tracking-tight uppercase">
              УКР<span className="text-emerald-400">ТАБ</span>
            </div>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed">
            Виробництво магнітних наклейок на авто, сувенірних автономерів ЗСУ, адресних табличок на будинок, УФ-друку та пластикових трафаретів з доставкою по всій Україні.
          </p>
          <div className="text-xs text-emerald-400 font-semibold">
            ⚡ Термін виготовлення замовлень: 1-2 дні
          </div>
        </div>

        {/* Catalog Categories Links for SEO Link Juice */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Категорії продукції</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/catalog/magniti-na-avto" className="hover:text-emerald-400 transition">
                Магнітні наклейки на авто
              </Link>
            </li>
            <li>
              <Link href="/catalog/reklamni-magniti" className="hover:text-emerald-400 transition">
                Магнітна реклама на авто
              </Link>
            </li>
            <li>
              <Link href="/catalog/suvenirni-avtonomera" className="hover:text-emerald-400 transition">
                Сувенірні номери на авто
              </Link>
            </li>
            <li>
              <Link href="/catalog/vijskovi-nomeri" className="hover:text-emerald-400 transition">
                Сувенірні номери для військових
              </Link>
            </li>
            <li>
              <Link href="/catalog/adresni-tablichki" className="hover:text-emerald-400 transition">
                Адресні таблички на будинок
              </Link>
            </li>
            <li>
              <Link href="/catalog/tablichki-na-dveri" className="hover:text-emerald-400 transition">
                Таблички на двері та кабінети
              </Link>
            </li>
          </ul>
        </div>

        {/* More Categories & Services */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Послуги та таблички</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/catalog/informatsijni-tablichki" className="hover:text-emerald-400 transition">
                Інформаційні таблички ПВХ
              </Link>
            </li>
            <li>
              <Link href="/catalog/ritualni-tablichki" className="hover:text-emerald-400 transition">
                Ритуальні таблички з фото
              </Link>
            </li>
            <li>
              <Link href="/catalog/trafareti" className="hover:text-emerald-400 transition">
                Трафарети на замовлення
              </Link>
            </li>
            <li>
              <Link href="/catalog/uf-druk" className="hover:text-emerald-400 transition">
                УФ-друк на пластику та композиті
              </Link>
            </li>
            <li>
              <Link href="/catalog/tablichki-dlya-biznesu" className="hover:text-emerald-400 transition">
                Таблички для офісу та бізнесу
              </Link>
            </li>
            <li>
              <Link href="/catalog/nomeri-dlya-avtosaloniv" className="hover:text-emerald-400 transition">
                Номери для автосалонів та СТО
              </Link>
            </li>
          </ul>
        </div>

        {/* Contacts */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Контакти & Доставка</h4>
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
          <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
            <Link href="/about" className="hover:text-emerald-400">Про нас</Link>
            <span>•</span>
            <Link href="/delivery" className="hover:text-emerald-400">Оплата та доставка</Link>
            <span>•</span>
            <Link href="/constructor" className="hover:text-emerald-400">Конструктор</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-8 mt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © {new Date().getFullYear()} Укртаб. Виробництво в Україні. Всі права захищено.
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/sitemap.xml" className="hover:text-emerald-400">Карта сайту (Sitemap)</Link>
          <span>•</span>
          <Link href="/google-feed.xml" className="hover:text-emerald-400">Товарний фід Google</Link>
        </div>
      </div>
    </footer>
  );
}
