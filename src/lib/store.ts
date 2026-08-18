import { Product, Category, PartnerLogo } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  // 1. Магніти на авто
  {
    id: 'cat-magnets',
    name: 'Магніти на авто',
    slug: 'magniti-na-avto',
    image: 'https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg',
    description: 'Рекламні та інформаційні магніти на автомобілі, шеврони',
    isFeatured: true,
  },
  {
    id: 'cat-magnets-promo',
    parentId: 'cat-magnets',
    name: 'Рекламні магніти',
    slug: 'reklamni-magniti',
    isFeatured: true,
  },
  {
    id: 'cat-magnets-info',
    parentId: 'cat-magnets',
    name: 'Інформаційні магніти',
    slug: 'informatsijni-magniti',
    isFeatured: true,
  },

  // 2. Сувенірні автономера
  {
    id: 'cat-plates',
    name: 'Сувенірні автономера',
    slug: 'suvenirni-avtonomera',
    image: 'https://images.prom.ua/6960951508_w500_h500_suvenirni-avtonomera-z.jpg',
    description: 'Іменні, військові та номери з оригінальним написом',
    isFeatured: true,
  },
  {
    id: 'cat-plates-military',
    parentId: 'cat-plates',
    name: 'Військові номери ЗСУ',
    slug: 'vijskovi-nomeri',
    isFeatured: true,
  },
  {
    id: 'cat-plates-salon',
    parentId: 'cat-plates',
    name: 'Номери для автосалонів та СТО',
    slug: 'nomeri-dlya-avtosaloniv',
    isFeatured: true,
  },
  {
    id: 'cat-plates-name',
    parentId: 'cat-plates',
    name: 'Іменні номери',
    slug: 'imenni-nomeri',
    isFeatured: true,
  },
  {
    id: 'cat-plates-text',
    parentId: 'cat-plates',
    name: 'Номери з написом',
    slug: 'nomeri-z-napisom',
    isFeatured: true,
  },

  // 3. Адресні таблички
  {
    id: 'cat-address',
    name: 'Адресні таблички',
    slug: 'adresni-tablichki',
    image: 'https://images.prom.ua/6974843980_w500_h500_patriotichnij-magnit-na.jpg',
    description: 'Адресні таблички та номери на будинок',
    isFeatured: true,
  },
  {
    id: 'cat-address-house',
    parentId: 'cat-address',
    name: 'Адресні таблички на будинок',
    slug: 'adresni-tablichki-na-budinok',
    isFeatured: true,
  },
  {
    id: 'cat-address-numbers',
    parentId: 'cat-address',
    name: 'Номери на будинок та паркан',
    slug: 'nomeri-na-budinok',
    isFeatured: true,
  },

  // 4. Таблички для бізнесу
  {
    id: 'cat-business',
    name: 'Таблички для бізнесу',
    slug: 'tablichki-dlya-biznesu',
    image: 'https://images.prom.ua/6972629971_w500_h500_magnitni-vizitki-dlya.jpg',
    description: 'Графік роботи, таблички на двері, кабінетні таблички',
    isFeatured: true,
  },
  {
    id: 'cat-business-doors',
    parentId: 'cat-business',
    name: 'Таблички на двері та кабінети',
    slug: 'tablichki-na-dveri',
    isFeatured: true,
  },
  {
    id: 'cat-business-cabinet',
    parentId: 'cat-business',
    name: 'Кабінетні таблички',
    slug: 'kabinetni-tablichki',
    isFeatured: true,
  },
  {
    id: 'cat-business-schedule',
    parentId: 'cat-business',
    name: 'Графік роботи',
    slug: 'grafik-roboti',
    isFeatured: true,
  },

  // 5. Інформаційні таблички
  {
    id: 'cat-info',
    name: 'Інформаційні таблички',
    slug: 'informatsijni-tablichki',
    image: 'https://images.prom.ua/6795155337_w500_h500_tablichka-z-plastiku.jpg',
    description: 'Попереджувальні, забороняючі таблички, відеоспостереження та ін.',
    isFeatured: true,
  },
  {
    id: 'cat-info-popered',
    parentId: 'cat-info',
    name: 'Попереджувальні таблички',
    slug: 'poperedzhuvalni-tablichki',
    isFeatured: true,
  },
  {
    id: 'cat-info-zaboron',
    parentId: 'cat-info',
    name: 'Забороняючі таблички',
    slug: 'zaboronyayuchi-tablichki',
    isFeatured: true,
  },
  {
    id: 'cat-info-video',
    parentId: 'cat-info',
    name: 'Відеоспостереження',
    slug: 'videosposterezhennya',
    isFeatured: true,
  },
  {
    id: 'cat-info-dog',
    parentId: 'cat-info',
    name: 'Злий собака',
    slug: 'zlij-sobaka',
    isFeatured: true,
  },
  {
    id: 'cat-info-noparking',
    parentId: 'cat-info',
    name: 'Не паркувати',
    slug: 'ne-parkuvati',
    isFeatured: true,
  },

  // 6. Ритуальні таблички
  {
    id: 'cat-ritual',
    name: 'Ритуальні таблички',
    slug: 'ritualni-tablichki',
    description: 'Ритуальні таблички на могилу, хрест та пам’ятник з фото',
    isFeatured: true,
  },

  // 7. Трафарети на замовлення
  {
    id: 'cat-trafareti',
    name: 'Трафарети на замовлення',
    slug: 'trafareti',
    description: 'Багаторазові пластикові трафарети під фарбування',
    isFeatured: true,
  },

  // 8. Прямий УФ-друк
  {
    id: 'cat-uf-druk',
    name: 'Прямий УФ-друк',
    slug: 'uf-druk',
    description: 'Ультрафіолетовий прямий фотодрук на пластику та композиті',
    isFeatured: true,
  },

  // 9. Інше (Завжди в кінці)
  {
    id: 'cat-other',
    name: 'Інше (без категорії)',
    slug: 'inshe',
    description: 'Товари без категорії та додаткова продукція',
    isFeatured: false,
  },
];

export const INITIAL_PARTNERS: PartnerLogo[] = [
  {
    id: 'partner-1',
    name: 'Збройні Сили України',
    image: 'https://images.prom.ua/6964688153_w500_h500_magniti-dlya-sluzhb.jpg',
    linkUrl: '',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'partner-2',
    name: 'Служби Охорони України',
    image: 'https://images.prom.ua/6964688153_w500_h500_magniti-dlya-sluzhb.jpg',
    linkUrl: '',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'partner-3',
    name: 'Нова Пошта',
    image: 'https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg',
    linkUrl: 'https://novaposhta.ua',
    sortOrder: 3,
    isActive: true,
  },
];

export const INITIAL_PRODUCTS: Product[] = [];
