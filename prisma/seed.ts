import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding UKRTAB database...');

  // 1. Site Settings
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      companyName: 'Укртаб',
      phone1: '+380 (66) 441-80-50',
      phone2: '+380 (68) 367-70-15',
      email: 'feoktistova.dnepr@gmail.com',
      address: 'м. Дніпро, вул. Миру 2т',
      reviewsCount: 553,
      workHours: 'Пн-Нд: 10:00 - 21:00',
    },
  });

  // 2. Banners
  await prisma.banner.deleteMany({});
  const banners = [
    {
      title: 'Виготовлення магнітних наліпок на авто будь-якої складності',
      image: 'https://images.prom.ua/6956069219_6956069219.jpg',
      linkUrl: '/catalog/magnitni-nalipki-na-avto',
      sortOrder: 1,
    },
    {
      title: 'Патріотична продукція ЗСУ та військова символіка',
      image: 'https://images.prom.ua/6956070005_6956070005.jpg',
      linkUrl: '/catalog/magniti-zsu',
      sortOrder: 2,
    },
    {
      title: 'Попереджувальні знаки: Міни, Охорона, Заборона входу',
      image: 'https://images.prom.ua/6956071056_6956071056.jpg',
      linkUrl: '/catalog/poperedzhuvalni-znaki',
      sortOrder: 3,
    },
    {
      title: 'Адресні таблички та знаки на будинки на замовлення',
      image: 'https://images.prom.ua/6956072311_6956072311.jpg',
      linkUrl: '/catalog/tablichki-adresni',
      sortOrder: 4,
    },
  ];

  for (const b of banners) {
    await prisma.banner.create({ data: b });
  }

  // 3. Categories
  const categoriesData = [
    {
      name: 'Магнітні наліпки на авто',
      slug: 'magnitni-nalipki-na-avto',
      image: 'https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg',
      description: 'Якісні магнітні наліпки для легкових та вантажних авто. Легко знімаються та не пошкоджують фарбу.',
      isFeatured: true,
    },
    {
      name: 'Магніти ЗСУ',
      slug: 'magniti-zsu',
      image: 'https://images.prom.ua/6955960434_w297_h200_magniti-zsu.jpg',
      description: 'Магніти та знаки розрізнення ЗСУ, Морська піхота, ТрО, ДШВ, волонтерські знаки.',
      isFeatured: true,
    },
    {
      name: 'Попереджувальні знаки ⚠️ Міни / Охорона',
      slug: 'poperedzhuvalni-znaki',
      image: 'https://images.prom.ua/6964429952_w297_h200_poperedzhuvalni-znaki-.jpg',
      description: 'Знаки "НЕБЕЗПЕЧНО МІНИ", "ОХОРОНА", "ВХІД ЗАБОРОНЕНО" для розмінування та охорони об’єктів.',
      isFeatured: true,
    },
    {
      name: 'Таблички адресні',
      slug: 'tablichki-adresni',
      image: 'https://images.prom.ua/3984689222_w297_h200_tablichki-adresni.jpg',
      description: 'Адресні таблички на приватні будинки та офіси з міцного пластику або металу.',
      isFeatured: true,
    },
    {
      name: 'Автономер під замовлення',
      slug: 'avtonomer-pid-zakaz',
      image: 'https://images.prom.ua/3985094159_w297_h200_avtonomer-pid-zamovlennya.jpg',
      description: 'Сувенірні та магнітні автономери, спеціальні знаки та імені номерні знаки.',
      isFeatured: true,
    },
    {
      name: '🛡️ ОХОРОНА — Магнітні та вінілові знаки',
      slug: 'ohorona-magnitni-znaki',
      image: 'https://images.prom.ua/6964638294_w297_h200_-ohorona-.jpg',
      description: 'Спеціалізовані знаки та наліпки для служб безпеки, інкасації та патрульних служб.',
      isFeatured: true,
    },
    {
      name: 'Патріотичні магніти УТМР',
      slug: 'patrioticheskie-magnity-utmr',
      image: 'https://images.prom.ua/6959102821_w297_h200_patriotichni-magniti-dlya.jpg',
      description: 'Магніти для мисливців та рибалок УТМР з фірмовою символікою.',
      isFeatured: false,
    },
    {
      name: 'Магніти для реклами та бізнесу',
      slug: 'magniti-dlya-reklami',
      image: 'https://images.prom.ua/6958880775_w297_h200_magniti-dlya-reklami.jpg',
      description: 'Магніти з логотипами компаній, контактами служб таксі та сервісних центрів.',
      isFeatured: false,
    },
  ];

  const createdCategories: Record<string, string> = {};

  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    createdCategories[cat.slug] = c.id;
  }

  // 4. Products
  const productsData = [
    {
      name: 'Магнітна наклейка Морська піхота 25*25см',
      slug: 'magnitna-naklejka-morska-pihota-25x25',
      price: 250,
      oldPrice: 300,
      sku: 'MP-2525',
      status: 'В наявності',
      categoryId: createdCategories['magniti-zsu'],
      description: 'Якісна магнітна наклейка "Морська піхота" розміром 25х25 см. Виготовлена з міцного вінілового магніту товщиною 0.8 мм з ламінацією. Стійка до дощу, снігу, мийки авто та сонячного проміння.',
      image: 'https://images.prom.ua/6793582624_w640_h640_magnitna-naklejka-morska.jpg',
      images: JSON.stringify([
        'https://images.prom.ua/6793582624_w640_h640_magnitna-naklejka-morska.jpg',
      ]),
      unit: 'шт.',
      isFeatured: true,
    },
    {
      name: 'Наклейка магнітна Каблук 15*15см (комплект)',
      slug: 'naklejka-magnitna-kabluk-15x15',
      price: 150,
      oldPrice: 180,
      sku: 'KAB-1515',
      status: 'В наявності',
      categoryId: createdCategories['magnitni-nalipki-na-avto'],
      description: 'Попереджувальний магнітний знак "Каблук" 15х15 см. Надійно тримається на металевому кузові авто, не залишає слідів.',
      image: 'https://images.prom.ua/6793705342_w640_h640_naklejka-magnitna-kabluk.jpg',
      images: JSON.stringify([
        'https://images.prom.ua/6793705342_w640_h640_naklejka-magnitna-kabluk.jpg',
      ]),
      unit: 'шт.',
      isFeatured: true,
    },
    {
      name: 'Наклейка ЗСУ квадрат синьо-жовтий 30*30см',
      slug: 'naklejka-zsu-kvadrat-30x30',
      price: 125,
      oldPrice: 150,
      sku: 'ZSU-3030',
      status: 'В наявності',
      categoryId: createdCategories['magniti-zsu'],
      description: 'Яскрава магнітна наклейка ЗСУ квадратна синьо-жовта 30х30 см. Посилений вініловий магніт для роботи в будь-яких погодних умовах.',
      image: 'https://images.prom.ua/6794611879_w640_h640_naklejka-zsu-kvadrat.jpg',
      images: JSON.stringify([
        'https://images.prom.ua/6794611879_w640_h640_naklejka-zsu-kvadrat.jpg',
      ]),
      unit: 'шт.',
      isFeatured: true,
    },
    {
      name: 'Наклейка магнітна Вовки Да Вінчі 15*15см',
      slug: 'naklejka-magnitna-vovki-davinci',
      price: 180,
      oldPrice: 220,
      sku: 'VDV-1515',
      status: 'В наявності',
      categoryId: createdCategories['magniti-zsu'],
      description: 'Патріотична магнітна наклейка спеціального підрозділу Вовки Да Вінчі. Захищена УФ-ламінацією.',
      image: 'https://images.prom.ua/6793582624_w640_h640_magnitna-naklejka-morska.jpg',
      images: JSON.stringify([
        'https://images.prom.ua/6793582624_w640_h640_magnitna-naklejka-morska.jpg',
      ]),
      unit: 'шт.',
      isFeatured: true,
    },
    {
      name: 'Попереджувальний знак ⚠️ ОБЕРЕЖНО МІНИ! (30х20см)',
      slug: 'sign-mines-warning-30x20',
      price: 120,
      oldPrice: 140,
      sku: 'SIGN-MINE',
      status: 'В наявності',
      categoryId: createdCategories['poperedzhuvalni-znaki'],
      description: 'Міцний попереджувальний знак про мінну небезпеку для позначення небезпечних територій та робіт з розмінування.',
      image: 'https://images.prom.ua/6964429952_w297_h200_poperedzhuvalni-znaki-.jpg',
      images: JSON.stringify([
        'https://images.prom.ua/6964429952_w297_h200_poperedzhuvalni-znaki-.jpg',
      ]),
      unit: 'шт.',
      isFeatured: true,
    },
    {
      name: 'Адресна табличка з металопластику "Класична"',
      slug: 'adresna-tablichka-klassik',
      price: 450,
      oldPrice: 520,
      sku: 'TAB-ADR-01',
      status: 'В наявності',
      categoryId: createdCategories['tablichki-adresni'],
      description: 'Виготовлення адресних табличок з назвою вулиці та номером будинку під замовлення. Матеріал: АКП (алюмінієвий композит), не іржавіє, витримує від -40 до +60C.',
      image: 'https://images.prom.ua/3984689222_w297_h200_tablichki-adresni.jpg',
      images: JSON.stringify([
        'https://images.prom.ua/3984689222_w297_h200_tablichki-adresni.jpg',
      ]),
      unit: 'шт.',
      isFeatured: true,
    },
    {
      name: 'Магнітна наклейка 🛡️ ОХОРОНА (40х15см)',
      slug: 'magnitna-naklejka-ohorona-40x15',
      price: 220,
      oldPrice: 260,
      sku: 'OHR-4015',
      status: 'В наявності',
      categoryId: createdCategories['ohorona-magnitni-znaki'],
      description: 'Спеціальний магнітний знак для служб швидкого реагування та патрульних автомобілів охорони.',
      image: 'https://images.prom.ua/6964638294_w297_h200_-ohorona-.jpg',
      images: JSON.stringify([
        'https://images.prom.ua/6964638294_w297_h200_-ohorona-.jpg',
      ]),
      unit: 'шт.',
      isFeatured: true,
    },
    {
      name: 'Автономер магнітний сувенірний (Іменний)',
      slug: 'avtonomer-magnitny-custom',
      price: 350,
      oldPrice: 400,
      sku: 'AUTO-NUM-01',
      status: 'В наявності',
      categoryId: createdCategories['avtonomer-pid-zakaz'],
      description: 'Індивідуальний сувенірний магнітний номерний знак з вашим текстом, поплавком або позивним.',
      image: 'https://images.prom.ua/3985094159_w297_h200_avtonomer-pid-zamovlennya.jpg',
      images: JSON.stringify([
        'https://images.prom.ua/3985094159_w297_h200_avtonomer-pid-zamovlennya.jpg',
      ]),
      unit: 'шт.',
      isFeatured: true,
    },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  console.log('Database successfully seeded!');
}

main()
  .catch((e) => {
    console.error('Error seeding DB:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
