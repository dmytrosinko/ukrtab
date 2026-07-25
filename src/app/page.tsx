import Link from 'next/link';
import { BannerSlider } from '@/components/BannerSlider';
import { ProductCard } from '@/components/ProductCard';
import { ShieldCheck, Truck, Clock, ThumbsUp, ArrowRight, Layers } from 'lucide-react';
import { Product, Category, Banner } from '@/lib/types';

export const revalidate = 60;

const FALLBACK_BANNERS = [
  {
    id: 'b1',
    title: 'Виготовлення магнітних наліпок на авто будь-якої складності',
    image: 'https://images.prom.ua/6956069219_6956069219.jpg',
    linkUrl: '/catalog',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'b2',
    title: 'Патріотична продукція ЗСУ та військова символіка',
    image: 'https://images.prom.ua/6956070005_6956070005.jpg',
    linkUrl: '/catalog',
    sortOrder: 2,
    isActive: true,
  },
];

const FALLBACK_CATEGORIES = [
  { id: 'c1', name: 'Магнітні наліпки на авто', slug: 'magnitni-nalipki-na-avto', image: 'https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg' },
  { id: 'c2', name: 'Магніти ЗСУ', slug: 'magniti-zsu', image: 'https://images.prom.ua/6955960434_w297_h200_magniti-zsu.jpg' },
  { id: 'c3', name: 'Попереджувальні знаки ⚠️ Міни', slug: 'poperedzhuvalni-znaki', image: 'https://images.prom.ua/6964429952_w297_h200_poperedzhuvalni-znaki-.jpg' },
  { id: 'c4', name: 'Таблички адресні', slug: 'tablichki-adresni', image: 'https://images.prom.ua/3984689222_w297_h200_tablichki-adresni.jpg' },
];

const FALLBACK_PRODUCTS: any[] = [
  {
    id: 'prod-1',
    name: 'Магнітна наклейка Морська піхота 25*25см',
    slug: 'magnitna-naklejka-morska-pihota-25x25',
    price: 250,
    oldPrice: 300,
    sku: 'MP-2525',
    status: 'В наявності',
    image: 'https://images.prom.ua/6793582624_w640_h640_magnitna-naklejka-morska.jpg',
    unit: 'шт.',
  },
  {
    id: 'prod-2',
    name: 'Наклейка магнітна Каблук 15*15см',
    slug: 'naklejka-magnitna-kabluk-15x15',
    price: 150,
    oldPrice: 180,
    sku: 'KAB-1515',
    status: 'В наявності',
    image: 'https://images.prom.ua/6793705342_w640_h640_naklejka-magnitna-kabluk.jpg',
    unit: 'шт.',
  },
  {
    id: 'prod-3',
    name: 'Наклейка ЗСУ квадрат синьо-жовтий 30*30см',
    slug: 'naklejka-zsu-kvadrat-30x30',
    price: 125,
    oldPrice: 150,
    sku: 'ZSU-3030',
    status: 'В наявності',
    image: 'https://images.prom.ua/6794611879_w640_h640_naklejka-zsu-kvadrat.jpg',
    unit: 'шт.',
  },
  {
    id: 'prod-4',
    name: 'Попереджувальний знак ⚠️ ОБЕРЕЖНО МІНИ! (30х20см)',
    slug: 'sign-mines-warning-30x20',
    price: 120,
    oldPrice: 140,
    sku: 'SIGN-MINE',
    status: 'В наявності',
    image: 'https://images.prom.ua/6964429952_w297_h200_poperedzhuvalni-znaki-.jpg',
    unit: 'шт.',
  },
];

export default async function HomePage() {
  let banners: any[] = FALLBACK_BANNERS;
  let categories: any[] = FALLBACK_CATEGORIES;
  let products: any[] = FALLBACK_PRODUCTS;

  if (!process.env.VERCEL) {
    try {
      const { prisma } = await import('@/lib/prisma');
      const [b, c, p] = await Promise.all([
        prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
        prisma.category.findMany({ where: { isFeatured: true }, take: 8 }),
        prisma.product.findMany({ where: { isFeatured: true }, take: 12, include: { category: true } }),
      ]);
      if (b && b.length > 0) banners = b;
      if (c && c.length > 0) categories = c;
      if (p && p.length > 0) products = p;
    } catch (e) {
      console.error('Prisma homepage fetch failed, using fallback data:', e);
    }
  }

  const safeBanners: Banner[] = JSON.parse(JSON.stringify(banners));
  const safeCategories: Category[] = JSON.parse(JSON.stringify(categories));
  const safeProducts: Product[] = JSON.parse(JSON.stringify(products));

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner Slider */}
      <BannerSlider banners={safeBanners} />

      {/* Trust Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Швидка доставка</h4>
            <p className="text-[11px] text-slate-500">Нова Пошта & Укрпошта</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Виготовлення 1-2 дні</h4>
            <p className="text-[11px] text-slate-500">Власне виробництво</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">553+ відгуків</h4>
            <p className="text-[11px] text-slate-500">99% позитивних оцінок</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Гарантія якості</h4>
            <p className="text-[11px] text-slate-500">УФ-стійкий друк</p>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-emerald-600" />
              <span>Групи товарів та послуг</span>
            </h2>
            <p className="text-xs text-slate-500">Оберіть потрібну категорію для швидкого пошуку</p>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>Всі категорії</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {safeCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalog?category=${cat.slug}`}
              className="group bg-white rounded-2xl p-3 border border-slate-100 shadow-sm hover:shadow-lg transition-all text-center space-y-3"
            >
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 relative">
                <img
                  src={cat.image || 'https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <h3 className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 line-clamp-2 transition">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Products Gallery */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Вітрина популярних товарів
            </h2>
            <p className="text-xs text-slate-500">Найпопулярніші магнітні наліпки та знаки UKRTAB</p>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>Дивитися всі</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {safeProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
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
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-lg shadow-emerald-600/30"
          >
            📞 +380 (66) 441-80-50
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
