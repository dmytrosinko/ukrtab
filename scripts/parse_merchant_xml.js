const fs = require('fs');
const path = require('path');

// Parse Google Merchant RSS XML file
const xmlPath = 'C:\\Users\\metmi\\.gemini\\antigravity-ide\\brain\\61885bf4-71d3-4926-81a3-200154f8aa6c\\.system_generated\\steps\\608\\content.md';
const content = fs.readFileSync(xmlPath, 'utf8');

const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
let match;
const productsMap = new Map();

function extractTag(xml, tag) {
  const reg = new RegExp(`<g:${tag}>([\\s\\S]*?)<\\/g:${tag}>`, 'i');
  const m = xml.match(reg);
  return m ? m[1].trim() : '';
}

function extractAllTags(xml, tag) {
  const reg = new RegExp(`<g:${tag}>([\\s\\S]*?)<\\/g:${tag}>`, 'gi');
  const results = [];
  let m;
  while ((m = reg.exec(xml)) !== null) {
    results.push(m[1].trim());
  }
  return results;
}

let totalItemsParsed = 0;

while ((match = itemRegex.exec(content)) !== null) {
  totalItemsParsed++;
  const itemXml = match[1];
  const id = extractTag(itemXml, 'id');
  const title = extractTag(itemXml, 'title') || extractTag(itemXml, 'name');
  const description = extractTag(itemXml, 'description');
  const priceRaw = extractTag(itemXml, 'price');
  const price = parseFloat(priceRaw.replace(/[^\d.]/g, '')) || 0;
  const image = extractTag(itemXml, 'image_link');
  const additionalImages = extractAllTags(itemXml, 'additional_image_link');
  const availability = extractTag(itemXml, 'availability');
  const productType = extractTag(itemXml, 'product_type');

  if (!title) continue;

  // Key for deduplication: title + price + main image
  const dedupeKey = `${title.trim().toLowerCase()}_${price}`;

  if (!productsMap.has(dedupeKey)) {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9а-яіїєґ]+/gi, '-')
      .replace(/^-+|-+$/g, '') + '-' + id.slice(-4);

    const allImages = image ? [image, ...additionalImages] : additionalImages;

    // Deduplicate image URLs
    const uniqueImages = Array.from(new Set(allImages));

    productsMap.set(dedupeKey, {
      id: `p${id}`,
      name: title.trim(),
      slug: slug,
      price: price,
      oldPrice: null,
      sku: `SKU-${id.slice(-4)}`,
      status: availability === 'in stock' ? 'В наявності' : 'Під замовлення',
      categoryId: 'cat-other', // default category
      description: description.replace(/<[^>]*>?/gm, '').trim(),
      image: uniqueImages[0] || 'https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg',
      images: JSON.stringify(uniqueImages),
      unit: 'шт.',
      features: '[]',
      isFeatured: false,
    });
  }
}

const uniqueProducts = Array.from(productsMap.values());
console.log(`Parsed total items: ${totalItemsParsed}`);
console.log(`Unique items after deduplication: ${uniqueProducts.length}`);

// Write JSON script output
const outPath = path.join(process.cwd(), 'scripts', 'merchant_unique_products.json');
fs.writeFileSync(outPath, JSON.stringify(uniqueProducts, null, 2), 'utf8');
console.log(`Saved unique products to ${outPath}`);
