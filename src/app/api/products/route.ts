import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
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

    const product = await prisma.product.create({
      data: {
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
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
