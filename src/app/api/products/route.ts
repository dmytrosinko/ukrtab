import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_PRODUCTS } from '@/lib/store';

// Dynamic in-memory store for newly added products on serverless Vercel
let MEMORY_PRODUCTS = [...INITIAL_PRODUCTS];

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

    return NextResponse.json(products);
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
    const body = await request.json();
    const {
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

    if (!name || !price || !image) {
      return NextResponse.json(
        { error: 'Name, price, and image are required' },
        { status: 400 }
      );
    }

    const generatedSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9а-яіїєґ]+/gi, '-')
        .replace(/^-+|-+$/g, '');

    const newProductData = {
      name,
      slug: generatedSlug + '-' + Date.now().toString().slice(-4),
      price: parseFloat(price),
      oldPrice: oldPrice ? parseFloat(oldPrice) : null,
      sku: sku || null,
      status: status || 'В наявності',
      categoryId: categoryId || null,
      description: description || null,
      image,
      images: images ? JSON.stringify(images) : JSON.stringify([image]),
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
        id: 'p-' + Date.now(),
        ...newProductData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Add to in-memory store so it shows immediately in fallback GET
    MEMORY_PRODUCTS.unshift(product as any);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
