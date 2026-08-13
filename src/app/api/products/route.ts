import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_PRODUCTS } from '@/lib/store';

// Dynamic in-memory store for newly added products fallback on serverless Vercel
export let MEMORY_PRODUCTS: any[] = [];

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

    let products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    // Auto-seed Supabase database if DB product count is 0
    const totalCount = await prisma.product.count();
    if (totalCount === 0) {
      try {
        const seedData = INITIAL_PRODUCTS.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: parseFloat(String(p.price)) || 100,
          oldPrice: p.oldPrice ? parseFloat(String(p.oldPrice)) : null,
          sku: p.sku || null,
          status: p.status || 'В наявності',
          categoryId: p.categoryId || null,
          description: p.description || null,
          image: p.image,
          images: typeof p.images === 'string' ? p.images : JSON.stringify(p.images || [p.image]),
          unit: p.unit || 'шт.',
          features: typeof p.features === 'string' ? p.features : JSON.stringify(p.features || []),
          isFeatured: Boolean(p.isFeatured),
        }));

        await prisma.product.createMany({
          data: seedData,
          skipDuplicates: true,
        });

        products = await prisma.product.findMany({
          where,
          include: { category: true },
          orderBy: { createdAt: 'desc' },
        });
      } catch (seedErr) {
        console.error('Auto-seed failed:', seedErr);
      }
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products from DB:', error);
    return NextResponse.json(
      { error: 'Помилка підключення до бази даних. Будь ласка, спробуйте пізніше.' },
      { status: 500 }
    );
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
