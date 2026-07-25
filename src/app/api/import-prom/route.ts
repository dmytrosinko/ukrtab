import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const xmlFile = formData.get('file') as File | null;
    const rawXmlText = formData.get('xmlText') as string | null;

    let xmlString = '';
    if (xmlFile) {
      xmlString = await xmlFile.text();
    } else if (rawXmlText) {
      xmlString = rawXmlText;
    } else {
      return NextResponse.json({ error: 'No XML file or text provided' }, { status: 400 });
    }

    if (!xmlString.includes('<yml_catalog') && !xmlString.includes('<shop') && !xmlString.includes('<offers')) {
      return NextResponse.json(
        { error: 'Invalid Prom.ua YML/XML format. Missing <yml_catalog> or <offers> tag.' },
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

    // 2. Parse offers (Products)
    const offerRegex = /<offer\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/offer>/gi;
    let importedProductsCount = 0;

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

    return NextResponse.json({
      success: true,
      categoriesImported: Object.keys(categoryMap).length,
      productsImported: importedProductsCount,
    });
  } catch (error) {
    console.error('Error importing Prom.ua feed:', error);
    return NextResponse.json({ error: 'Failed to parse Prom.ua XML feed' }, { status: 500 });
  }
}
