import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const xmlFile = formData.get('file') as File | null;
    const rawXmlText = formData.get('xmlText') as string | null;
    const feedUrl = formData.get('feedUrl') as string | null;

    let xmlString = '';
    if (xmlFile) {
      xmlString = await xmlFile.text();
    } else if (feedUrl) {
      const res = await fetch(feedUrl);
      if (!res.ok) {
        return NextResponse.json({ error: `Failed to fetch XML feed from URL (${res.status})` }, { status: 400 });
      }
      xmlString = await res.text();
    } else if (rawXmlText) {
      xmlString = rawXmlText;
    } else {
      return NextResponse.json({ error: 'No XML file, feed URL or text provided' }, { status: 400 });
    }

    if (
      !xmlString.includes('<yml_catalog') &&
      !xmlString.includes('<shop') &&
      !xmlString.includes('<offers') &&
      !xmlString.includes('<rss') &&
      !xmlString.includes('<item>')
    ) {
      return NextResponse.json(
        { error: 'Недійсний формат XML/YML файлу. Потрібен фід Prom.ua або Google Merchant Center.' },
        { status: 400 }
      );
    }

    // 1. Parse categories
    const categoryMap: Record<string, string> = {}; // promCatId -> dbCatId
    const categoryRegex = /<category\s+id="([^"]+)"(?:[^>]*)>([\s\S]*?)<\/category>/gi;
    let match;

    while ((match = categoryRegex.exec(xmlString)) !== null) {
      const promCatId = match[1];
      const catName = match[2].trim().replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
      if (catName) {
        const slug = catName
          .toLowerCase()
          .replace(/[^a-z0-9а-яіїєґ]+/gi, '-')
          .replace(/^-+|-+$/g, '') + '-' + promCatId;

        const dbCat = await prisma.category.upsert({
          where: { slug },
          update: { name: catName },
          create: { name: catName, slug },
        });

        categoryMap[promCatId] = dbCat.id;
      }
    }

    let importedProductsCount = 0;
    let importedCategoriesCount = Object.keys(categoryMap).length;

    // 2. Parse YML offers or RSS Google Merchant items with deduplication
    const isRssMerchant = xmlString.includes('<rss') || xmlString.includes('<item>') || xmlString.includes('g:title');

    if (isRssMerchant) {
      const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
      let match;
      const dedupeMap = new Map<string, any>();

      function getGTag(itemBlock: string, tag: string) {
        const reg = new RegExp(`<g:${tag}>([\\s\\S]*?)<\\/g:${tag}>`, 'i');
        const m = itemBlock.match(reg);
        if (!m) return '';
        return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
      }

      function getAllGTags(itemBlock: string, tag: string) {
        const reg = new RegExp(`<g:${tag}>([\\s\\S]*?)<\\/g:${tag}>`, 'gi');
        const list: string[] = [];
        let m;
        while ((m = reg.exec(itemBlock)) !== null) {
          list.push(m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim());
        }
        return list;
      }

      while ((match = itemRegex.exec(xmlString)) !== null) {
        const itemBlock = match[1];
        const gId = getGTag(itemBlock, 'id');
        const title = getGTag(itemBlock, 'title') || getGTag(itemBlock, 'name');
        const description = getGTag(itemBlock, 'description');
        const priceStr = getGTag(itemBlock, 'price');
        const price = parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0;
        const mainImg = getGTag(itemBlock, 'image_link');
        const addImgs = getAllGTags(itemBlock, 'additional_image_link');
        const availability = getGTag(itemBlock, 'availability');

        if (!title || !price) continue;

        const dedupeKey = `${title.trim().toLowerCase()}_${price}`;
        if (!dedupeMap.has(dedupeKey)) {
          const allPics = Array.from(new Set([mainImg, ...addImgs].filter(Boolean)));
          dedupeMap.set(dedupeKey, {
            gId,
            title: title.trim(),
            description: description.replace(/<[^>]*>?/gm, '').trim(),
            price,
            status: availability === 'in stock' ? 'В наявності' : 'Під замовлення',
            images: allPics,
            mainImage: allPics[0] || 'https://images.prom.ua/6793582624_w640_h640_magnitna-naklejka-morska.jpg',
          });
        }
      }

      // Upsert deduplicated Google Merchant items into database
      for (const p of Array.from(dedupeMap.values())) {
        const slug = p.title
          .toLowerCase()
          .replace(/[^a-z0-9а-яіїєґ]+/gi, '-')
          .replace(/^-+|-+$/g, '') + '-' + (p.gId ? p.gId.slice(-4) : Date.now().toString().slice(-4));

        await prisma.product.upsert({
          where: { slug },
          update: {
            name: p.title,
            price: p.price,
            status: p.status,
            description: p.description,
            image: p.mainImage,
            images: JSON.stringify(p.images),
          },
          create: {
            id: 'p' + (p.gId || Date.now()),
            name: p.title,
            slug,
            price: p.price,
            status: p.status,
            description: p.description,
            image: p.mainImage,
            images: JSON.stringify(p.images),
            sku: 'SKU-' + (p.gId ? p.gId.slice(-4) : 'PROM'),
            unit: 'шт.',
          },
        });
        importedProductsCount++;
      }
    } else {
      // Standard YML offer parser
      const offerRegex = /<offer\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/offer>/gi;
      let match;

      while ((match = offerRegex.exec(xmlString)) !== null) {
        const promOfferId = match[1];
        const offerBlock = match[2];

        const getTagValue = (tagName: string) => {
          const tagRegex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
          const m = offerBlock.match(tagRegex);
          if (!m) return '';
          return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
        };

        const name = getTagValue('name') || getTagValue('title');
        const priceStr = getTagValue('price');
        const oldPriceStr = getTagValue('oldprice');
        const categoryIdProm = getTagValue('categoryId');
        const sku = getTagValue('vendorCode') || getTagValue('code') || promOfferId;
        const description = getTagValue('description');

        // Picture tags
        const picRegex = /<picture[^>]*>([\s\S]*?)<\/picture>/gi;
        const pictures: string[] = [];
        let picMatch;
        while ((picMatch = picRegex.exec(offerBlock)) !== null) {
          if (picMatch[1].trim()) pictures.push(picMatch[1].trim());
        }

        if (name && priceStr) {
          const price = parseFloat(priceStr.replace(',', '.')) || 0;
          const oldPrice = oldPriceStr ? parseFloat(oldPriceStr.replace(',', '.')) : null;
          const mainImage = pictures[0] || 'https://images.prom.ua/6793582624_w640_h640_magnitna-naklejka-morska.jpg';
          const dbCatId = categoryMap[categoryIdProm] || null;

          const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9а-яіїєґ]+/gi, '-')
            .replace(/^-+|-+$/g, '') + '-' + promOfferId;

          await prisma.product.upsert({
            where: { slug },
            update: {
              name,
              price,
              oldPrice,
              sku,
              description,
              image: mainImage,
              images: JSON.stringify(pictures),
              categoryId: dbCatId,
            },
            create: {
              name,
              slug,
              price,
              oldPrice,
              sku,
              description,
              image: mainImage,
              images: JSON.stringify(pictures),
              categoryId: dbCatId,
            },
          });

          importedProductsCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      categoriesImported: importedCategoriesCount,
      productsImported: importedProductsCount,
    });
  } catch (error) {
    console.error('Error importing Prom.ua feed:', error);
    return NextResponse.json({ error: 'Failed to parse Prom.ua XML feed' }, { status: 500 });
  }
}
