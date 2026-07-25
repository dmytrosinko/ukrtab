const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('./scraped_prom_full.json', 'utf8'));

const products = raw.map((item, index) => {
  const urlParts = (item.offers?.url || '').split('/');
  const lastPart = urlParts[urlParts.length - 1] || '';
  const matchId = lastPart.match(/p(\d+)/);
  const promId = matchId ? matchId[1] : `p-prom-${index + 1}`;

  const cleanName = item.name
    .replace(/\\u[\0-9a-fA-F]{4}/g, (m) => String.fromCharCode(parseInt(m.replace('\\u', ''), 16)))
    .trim();

  const cleanDesc = (item.description || cleanName)
    .replace(/\\u[\0-9a-fA-F]{4}/g, (m) => String.fromCharCode(parseInt(m.replace('\\u', ''), 16)))
    .trim();

  const priceNum = parseFloat(item.offers?.price) || 100;
  const oldPriceNum = Math.round(priceNum * 1.18);

  const slug = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9а-яіїєґ]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) + '-' + promId.slice(-4);

  const sku = item.sku || `SKU-${promId.slice(-4)}`;

  return {
    id: `p${promId}`,
    name: cleanName,
    slug,
    price: priceNum,
    oldPrice: oldPriceNum,
    sku,
    status: item.offers?.availability?.includes('OutOfStock') ? 'Під замовлення' : 'В наявності',
    categoryId: 'cat-1',
    description: cleanDesc,
    image: item.image || 'https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg',
    images: JSON.stringify([item.image || 'https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg']),
    unit: 'шт.',
    features: '[]',
    isFeatured: index % 3 === 0,
  };
});

console.log(`Formatted ${products.length} products.`);

const storeContent = `import { Product, Category } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Магнітні наліпки на авто',
    slug: 'magnitni-nalipki-na-avto',
    image: 'https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg',
    description: 'Міцні вінілові магніти на авто із захисною ламінацією від непогоди та УФ.',
    isFeatured: true,
  },
];

export const INITIAL_PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};
`;

fs.writeFileSync('src/lib/store.ts', storeContent);
console.log('Updated src/lib/store.ts successfully!');
