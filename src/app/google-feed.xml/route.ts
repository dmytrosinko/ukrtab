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
  // Strip HTML tags and normalize whitespace
  const plain = text.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  return plain.length > 5000 ? plain.slice(0, 4990) + '...' : plain;
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
      const id = product.sku || `UKR-${product.id}`;
      const title = product.name;
      const description = cleanDescription(product.description, title);
      const link = `${siteUrl}/product/${product.slug || product.id}`;
      const price = `${Number(product.price).toFixed(2)} UAH`;
      const availability = product.status === 'Немає в наявності' ? 'out_of_stock' : 'in_stock';
      const mainImage = product.image || `${siteUrl}/favicon.ico`;

      // Additional images
      let additionalImages: string[] = [];
      try {
        if (product.images) {
          const parsed = JSON.parse(product.images);
          if (Array.isArray(parsed)) {
            additionalImages = parsed.filter((img: string) => img && img !== mainImage);
          }
        }
      } catch (e) {}

      const additionalImageTags = additionalImages
        .slice(0, 10)
        .map((img) => `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`)
        .join('\n');

      const categoryName = product.category?.name || 'Автомобільні аксесуари та таблички';

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
      <g:identifier_exists>no</g:identifier_exists>
      <g:shipping>
        <g:country>UA</g:country>
        <g:service>Нова Пошта</g:service>
        <g:price>0.00 UAH</g:price>
      </g:shipping>
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
