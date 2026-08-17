import Link from 'next/link';
import { BannerSlider } from '@/components/BannerSlider';
import { ProductCard } from '@/components/ProductCard';
import { PartnersSection } from '@/components/PartnersSection';
import {
  OrganizationJsonLd,
  LocalBusinessJsonLd,
  WebSiteJsonLd,
  ItemListJsonLd,
  FaqJsonLd,
} from '@/components/JsonLd';
import { SEO_CATEGORIES } from '@/lib/seoData';
import {
  ShieldCheck,
  Truck,
  Clock,
  ThumbsUp,
  ArrowRight,
  Sparkles,
  HelpCircle,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';
import { Product, Banner } from '@/lib/types';
import { INITIAL_PRODUCTS } from '@/lib/store';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Укртаб — Магнітні наклейки на авто, адресні таблички, сувенірні номери | Виробник в Україні',
  description: 'Виробництво та продаж магнітних наліпок на авто, сувенірних автономерів ЗСУ, адресних табличок на будинок та офісних вивісок від виробника Укртаб (Дніпро). Доставка 1-2 дні.',
  keywords:
    'магнітні наклейки на авто, магніти на авто, сувенірні номери на авто, номери для військових зсу, адресні таблички на будинок, таблички на двері, УФ друк, трафарети на замовлення, укртаб',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://ukrtab.com.ua',
  },
};

const FALLBACK_BANNERS: Banner[] = [
  {
    id: 'b1',
    title: 'Виготовлення магнітних наліпок на авто будь-якої складності',
    image: 'https://images.prom.ua/6956069219_6956069219.jpg',
    linkUrl: '/catalog/magniti-na-avto',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'b2',
    title: 'Патріотична продукція ЗСУ та військова символіка',
    image: 'https://images.prom.ua/6956070005_6956070005.jpg',
    linkUrl: '/catalog/vijskovi-nomeri',
    sortOrder: 2,
    isActive: true,
  },
];

const FALLBACK_PRODUCTS: Product[] = INITIAL_PRODUCTS.slice(0, 8);

const HOMEPAGE_FAQS = [
  {
    question: 'Як швидко виготовляються магнітні наліпки та таблички?',
    answer: 'Більшість замовлень виготовляються на власному обладнанні протягом 1-2 робочих днів. Стандартні популярні знаки та таблички відправляються в день замовлення.',
  },
  {
    question: 'Як тримаються магніти на автомобілі під час руху?',
    answer: 'Ми використовуємо потовщений магнітний вініл 0.8 мм з посиленим примагнічуванням. Він надійно тримається на швидкостях до 150 км/год та витримує зливи, мороз та безконтактні автомийки.',
  },
  {
    question: 'Чи можна виготовити сувенірний автономер або табличку за індивідуальним дизайном?',
    answer: 'Так! Наш дизайнер безкоштовно розробить макет з вашим текстом, позивним, логотипом або фотографією перед запуском у виробництво.',
  },
  {
    question: 'Якими службами здійснюється доставка по Україні?',
    answer: 'Доставляємо замовлення Новою Поштою (у відділення, поштомат або кур’єром) та Укрпоштою. У Дніпрі доступний самовивіз за адресою: вул. Миру 2т.',
  },
];

export default async function HomePage() {
  let banners: Banner[] = FALLBACK_BANNERS;
  let products: Product[] = FALLBACK_PRODUCTS;

  try {
    const [featuredProducts, dbBanners] = await Promise.all([
      prisma.product.findMany({
        where: { isFeatured: true },
        take: 12,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    if (featuredProducts && featuredProducts.length > 0) {
      products = JSON.parse(JSON.stringify(featuredProducts));
    } else {
      const latestProducts = await prisma.product.findMany({
        take: 12,
        orderBy: { createdAt: 'desc' },
      });
      if (latestProducts && latestProducts.length > 0) {
        products = JSON.parse(JSON.stringify(latestProducts));
      }
    }

    if (dbBanners && dbBanners.length > 0) {
      banners = JSON.parse(JSON.stringify(dbBanners));
    }
  } catch (e) {
    console.error('Prisma homepage fetch failed, using fallback data:', e);
  }

  const safeBanners = banners;
  const safeProducts = products;

  return (
    <div className="space-y-12 pb-12">
      {/* JSON-LD Schemas */}
      <OrganizationJsonLd />
      <LocalBusinessJsonLd />
      <WebSiteJsonLd />
      <ItemListJsonLd
        name="Популярні товари Укртаб"
        description="Магнітні наліпки на авто, сувенірні номери, адресні таблички"
        items={safeProducts}
      />
      <FaqJsonLd faqs={HOMEPAGE_FAQS} />

      {/* Hero Banner Slider */}
      <BannerSlider banners={safeBanners} />

      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Швидка доставка</h4>
            <p className="text-[11px] text-slate-500">Нова Пошта & Укрпошта по Україні</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Виготовлення 1-2 дні</h4>
            <p className="text-[11px] text-slate-500">Власне ЧПУ та УФ-виробництво</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Гарантія якості 5+ років</h4>
            <p className="text-[11px] text-slate-500">Стійкість до сонця, вологи та мийок</p>
          </div>
        </div>
      </div>

      {/* Top Categories Semantic Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Категорії нашої продукції
            </h2>
            <p className="text-xs text-slate-500">Оберіть потрібний напрямок для перегляду зразків та цін</p>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>Всі розділи</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {Object.entries(SEO_CATEGORIES).map(([key, cat]) => (
            <Link
              key={key}
              href={`/catalog/${key}`}
              className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-500 hover:shadow-md transition flex flex-col justify-between space-y-2"
            >
              <div className="space-y-1">
                <span className="text-xs font-black text-slate-900 group-hover:text-emerald-600 transition line-clamp-1">
                  {cat.name}
                </span>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug">
                  {cat.metaDescription.slice(0, 75)}...
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center space-x-1 pt-1">
                <span>Переглянути</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Products Gallery (Google Carousel Feeder) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Вітрина популярних товарів
            </h2>
            <p className="text-xs text-slate-500">Найпопулярніші магнітні наліпки, номери та знаки UKRTAB</p>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>Дивитися всі товари ({safeProducts.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {safeProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Partners Section "Нам довіряють" */}
      <PartnersSection />

      {/* Rich SEO Content Section (Targeting Primary Keywords from SEO Semantic Core) */}
      <article className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm space-y-8">
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Виробництво магнітів на авто, сувенірних автономерів та адресних табличок — Укртаб
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Компанія <b>Укртаб</b> (м. Дніпро) є провідним українським виробником сучасної візуальної та патріотичної продукції. Ми спеціалізуємося на прямому УФ-друці та лазерній порізці магнітних наклейок на авто, сувенірних та іменних номерів для військових, адресних табличок на будинки та офісних вивісок з алюмінієвого композиту та пластику.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-black text-slate-900">
              🚗 <Link href="/catalog/magniti-na-avto" className="text-emerald-700 hover:underline">Магнітні наклейки на авто</Link>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Виготовляємо магнітні наліпки з потовщеного авто-вінілу 0.8 мм із захисною ламінацією. Ідеально для шевронів ЗСУ, бригадних емблем, таксі, комерційного брендування та знаків безпеки. Легко встановлюються та знімаються без пошкодження фарби кузова.
            </p>
          </div>

          <div className="space-y-2 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-black text-slate-900">
              🛡️ <Link href="/catalog/vijskovi-nomeri" className="text-emerald-700 hover:underline">Сувенірні номери для військових ЗСУ</Link>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Іменні та військові автономери з позивними, нарукавними знаками бригад ДШВ, ГУР, ССО, НГУ та тризубом. Стандартний розмір 520х112 мм — стають точно в рамку номерного знака.
            </p>
          </div>

          <div className="space-y-2 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-black text-slate-900">
              🏡 <Link href="/catalog/adresni-tablichki" className="text-emerald-700 hover:underline">Адресні таблички на будинок</Link>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Довговічні вуличні покажчики з назвою вулиці та номером будинку з композиту АКП 3 мм та світловідбиваючим покриттям. Гарантована стійкість до вигорання та перепадів температур 7+ років.
            </p>
          </div>

          <div className="space-y-2 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-black text-slate-900">
              🖨️ <Link href="/catalog/uf-druk" className="text-emerald-700 hover:underline">Прямий УФ-друк та виготовлення трафаретів</Link>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Послуги прямого ультрафіолетового фотодруку 1440 DPI на пластику, склі, металі, банері та багаторазові пластикові трафарети ПВХ/ПЕТ для фарбування військової техніки та маркування.
            </p>
          </div>
        </div>
      </article>

      {/* FAQ Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Часті запитання покупців
            </h2>
            <p className="text-xs text-slate-500">Все, що потрібно знати про виготовлення, оплату та доставку</p>
          </div>
        </div>

        <div className="space-y-3">
          {HOMEPAGE_FAQS.map((faq, idx) => (
            <details
              key={idx}
              className="group border border-slate-200 rounded-2xl p-4 transition-all duration-200 open:border-emerald-500 open:bg-emerald-50/20"
            >
              <summary className="font-bold text-xs sm:text-sm text-slate-900 cursor-pointer list-none flex items-center justify-between">
                <span>{faq.question}</span>
                <span className="text-emerald-600 font-bold transition-transform duration-200 group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Custom Order Callout */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <h3 className="text-2xl font-black">Потрібен свій макет або індивідуальний розмір?</h3>
          <p className="text-xs text-slate-300">
            Ми виготовляємо сувенірні магніти, автономери та адресні таблички за індивідуальними макетами клієнтів. Зв’яжіться з нашим менеджером!
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 shrink-0">
          <a
            href="tel:+380664418050"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-lg shadow-emerald-600/30 flex items-center space-x-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>+380 (66) 441-80-50</span>
          </a>
          <Link
            href="/contacts"
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl text-xs transition backdrop-blur-md"
          >
            Наші контакти
          </Link>
        </div>
      </div>
    </div>
  );
}
