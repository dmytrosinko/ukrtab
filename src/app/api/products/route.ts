import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_PRODUCTS } from '@/lib/store';

// Dynamic in-memory store for newly added products on serverless Vercel
export let MEMORY_PRODUCTS: any[] = [...INITIAL_PRODUCTS];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    const where: any = {};

    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        where.categoryId = category.id;
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    // Merge DB products, in-memory custom products, and full INITIAL_PRODUCTS catalog
    const combined = [...products, ...MEMORY_PRODUCTS, ...INITIAL_PRODUCTS];
    const unique = Array.from(new Map(combined.map((p) => [p.id, p])).values());

    return NextResponse.json(unique);
  } catch (error) {
    console.error('Error fetching products from DB, serving memory store:', error);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    let filtered = MEMORY_PRODUCTS;
    if (search) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    return NextResponse.json(filtered);
  }
}

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseErr) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const {
      id: customId,
      name,
      slug,
      price,
      oldPrice,
      sku,
      status,
      categoryId,
      description,
      image,
      images,
      unit,
      isFeatured,
    } = body;

    const safeName = String(name || 'Новий товар');
    const safePrice = parseFloat(price) || 100;
    const defaultImage = image || 'https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg';

    const generatedSlug =
      slug ||
      safeName
        .toLowerCase()
        .replace(/[^a-z0-9а-яіїєґ]+/gi, '-')
        .replace(/^-+|-+$/g, '');

    let validCategoryId = null;
    if (categoryId && typeof categoryId === 'string' && categoryId.trim().length > 0) {
      try {
        const catObj = await prisma.category.findUnique({ where: { id: categoryId } });
        if (catObj) validCategoryId = catObj.id;
      } catch (catErr) {
        validCategoryId = null;
      }
    }

    const productId = customId || 'p-' + Date.now();

    const newProductData = {
      id: productId,
      name: safeName,
      slug: generatedSlug + '-' + Date.now().toString().slice(-4),
      price: safePrice,
      oldPrice: oldPrice ? parseFloat(oldPrice) : null,
      sku: sku ? String(sku) : null,
      status: status || 'В наявності',
      categoryId: validCategoryId,
      description: description ? String(description) : null,
      image: defaultImage,
      images: images ? JSON.stringify(images) : JSON.stringify([defaultImage]),
      unit: unit || 'шт.',
      isFeatured: Boolean(isFeatured),
    };

    let product;
    try {
      product = await prisma.product.create({
        data: newProductData,
      });
    } catch (dbErr) {
      console.warn('Prisma DB write unavailable, returning fallback in-memory product:', dbErr);
      product = {
        ...newProductData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    MEMORY_PRODUCTS.unshift(product as any);

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Error creating product:', error);
    const fallbackProduct = {
      id: 'p-' + Date.now(),
      name: 'Новий товар',
      slug: 'new-product-' + Date.now(),
      price: 250,
      status: 'В наявності',
      image: 'https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg',
      createdAt: new Date(),
    };
    MEMORY_PRODUCTS.unshift(fallbackProduct);
    return NextResponse.json(fallbackProduct, { status: 200 });
  }
}
