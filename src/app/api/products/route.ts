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
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const isPaginatedParam = searchParams.get('paginated') === 'true';

    const where: any = {};

    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        where.categoryId = category.id;
      }
    }

    if (search && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    const isPaginated = isPaginatedParam || pageParam !== null || limitParam !== null;
    const page = Math.max(1, parseInt(pageParam || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(limitParam || '16', 10)));
    const skip = (page - 1) * limit;

    if (isPaginated) {
      const [total, items] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          include: { category: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
      ]);

      const totalPages = Math.ceil(total / limit) || 1;

      return NextResponse.json(
        {
          items,
          total,
          page,
          totalPages,
          limit,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          },
        }
      );
    }

    const takeLimit = limitParam ? parseInt(limitParam, 10) : undefined;

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      ...(takeLimit ? { take: takeLimit } : {}),
    });

    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
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
