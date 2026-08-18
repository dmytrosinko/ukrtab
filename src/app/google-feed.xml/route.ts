import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_PRODUCTS } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache feed for 1 hour

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '&':
          return '&amp;';
        case '\'':
          return '&apos;';
        case '"':
          return '&quot;';
        default:
          return c;
      }
    })
    .trim();
}

function cleanDescription(text?: string | null, fallbackTitle?: string): string {
  if (!text || !text.trim()) {
    return `Купити ${fallbackTitle || 'товар'} від виробника Укртаб. Висока якість, УФ-стійкий друк, швидке виготовлення 1-2 дні та доставка Новою Поштою по всій Україні.`;
  }

  // Remove scripts, styles, embedded images, base64 data and SVG
  let cleaned = text
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    cleaned = `Купити ${fallbackTitle || 'товар'} від виробника Укртаб. Висока якість, УФ-стійкий друк, швидке виготовлення 1-2 дні та доставка Новою Поштою по всій Україні.`;
  }

  // Google Merchant limit for description is 5000 chars, limit to 2000 chars for optimal payload size
  return cleaned.length > 2000 ? cleaned.slice(0, 1990) + '...' : cleaned;
}

function isValidHttpUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('data:') || trimmed.length > 2000) return false;
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

function getShippingWeight(product: any): string {
  if (product.features) {
    try {
      const features = typeof product.features === 'string' ? JSON.parse(product.features) : product.features;
      if (Array.isArray(features)) {
        for (const f of features) {
          const name = String(f.name || f.key || '').toLowerCase();
          const val = String(f.value || '');
          if (name.includes('ваг') || name.includes('weight')) {
            const matchKg = val.match(/([0-9]+(?:[.,][0-9]+)?)\s*кг/i);
            if (matchKg) {
              const kg = parseFloat(matchKg[1].replace(',', '.'));
              if (!isNaN(kg) && kg > 0) return `${kg} kg`;
            }
            const matchG = val.match(/([0-9]+(?:[.,][0-9]+)?)\s*г/i);
            if (matchG) {
              const g = parseFloat(matchG[1].replace(',', '.'));
              if (!isNaN(g) && g > 0) return `${(g / 1000).toFixed(2)} kg`;
            }
          }
        }
      }
    } catch (e) {}
  }

  const nameLower = (product.name || '').toLowerCase();
  const catLower = (product.category?.name || '').toLowerCase();

  // Address plates, stands, large signs
  if (
    nameLower.includes('адресн') || 
    catLower.includes('адресн') || 
    nameLower.includes('стенд') || 
    nameLower.includes('вивіск') || 
    nameLower.includes('знак')
  ) {
    return '1.0 kg';
  }

  // Sets or multiple items
  if (nameLower.includes('комплект') || nameLower.includes('набір')) {
    return '0.8 kg';
  }

  // License / souvenir plates
  if (nameLower.includes('номер') || catLower.includes('номер')) {
    return '0.5 kg';
  }

  // Car magnets / vinyl stickers
  if (nameLower.includes('магніт') || catLower.includes('магніт') || nameLower.includes('наліпк') || nameLower.includes('наклейк')) {
    return '0.4 kg';
  }

  return '0.5 kg';
}

export async function GET() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ukrtab.com.ua').replace(/\/+$/, '');

  let products: any[] = [];

  try {
    const dbProducts = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    if (dbProducts && dbProducts.length > 0) {
      products = dbProducts;
    } else {
      products = INITIAL_PRODUCTS;
    }
  } catch (error) {
    console.error('Error querying products for Google Merchant Feed:', error);
    products = INITIAL_PRODUCTS;
  }

  // Filter out any dummy / test products
  const validProducts = products.filter(
    (p) =>
      p &&
      p.name &&
      p.price > 0 &&
      p.name !== 'top of the top' &&
      p.name !== 'еталон краси' &&
      p.name !== 'Mavvir'
  );

  const xmlItems = validProducts
    .map((product) => {
      const id = String(product.sku || `UKR-${product.id}`).slice(0, 50);
      const rawTitle = String(product.name || 'Товар').trim();
      const title = rawTitle.length > 150 ? rawTitle.slice(0, 147) + '...' : rawTitle;
      const description = cleanDescription(product.description, title);
      const link = `${siteUrl}/product/${product.slug || product.id}`;
      const price = `${Number(product.price).toFixed(2)} UAH`;
      const availability = product.status === 'Немає в наявності' ? 'out_of_stock' : 'in_stock';
      const shippingWeight = getShippingWeight(product);
      
      const mainImage = isValidHttpUrl(product.image) 
        ? product.image 
        : `${siteUrl}/favicon.ico`;

      // Additional images (strictly validate and cap to 5)
      let additionalImages: string[] = [];
      try {
        if (product.images) {
          const parsed = JSON.parse(product.images);
          if (Array.isArray(parsed)) {
            additionalImages = parsed
              .filter((img: string) => isValidHttpUrl(img) && img !== mainImage)
              .slice(0, 5);
          }
        }
      } catch (e) {}

      const additionalImageTags = additionalImages
        .map((img) => `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`)
        .join('\n');

      const categoryName = String(product.category?.name || 'Автомобільні аксесуари та таблички').slice(0, 100);

      return `    <item>
      <g:id>${escapeXml(id)}</g:id>
      <g:title><![CDATA[${title}]]></g:title>
      <g:description><![CDATA[${description}]]></g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(mainImage)}</g:image_link>
${additionalImageTags ? additionalImageTags + '\n' : ''}      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:brand>Ukrtab</g:brand>
      <g:condition>new</g:condition>
      <g:product_type><![CDATA[${categoryName}]]></g:product_type>
      <g:shipping_weight>${shippingWeight}</g:shipping_weight>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Ukrtab — Магніти на авто, сувенірні номери та адресні таблички</title>
    <link>${siteUrl}</link>
    <description>Офіційний товарний фід інтернет-магазину Ukrtab для Google Shopping, Google Free Listings та товарних каруселей</description>
${xmlItems}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
