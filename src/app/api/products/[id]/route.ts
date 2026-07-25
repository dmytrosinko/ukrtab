import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_PRODUCTS } from '@/lib/store';
import { MEMORY_PRODUCTS } from '../route';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolved = await params;
    const rawId = resolved.id || '';
    const id = decodeURIComponent(rawId);

    // 1. Try Prisma DB
    try {
      const product = await prisma.product.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
        },
        include: { category: true },
      });
      if (product) {
        return NextResponse.json(product);
      }
    } catch (e) {}

    // 2. Try MEMORY_PRODUCTS
    const memMatch = MEMORY_PRODUCTS.find((p) => p.id === id || p.slug === id);
    if (memMatch) {
      return NextResponse.json(memMatch);
    }

    // 3. Try INITIAL_PRODUCTS
    const initMatch = INITIAL_PRODUCTS.find((p) => p.id === id || p.slug === id);
    if (initMatch) {
      return NextResponse.json(initMatch);
    }

    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching product detail route:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        price: parseFloat(body.price),
        oldPrice: body.oldPrice ? parseFloat(body.oldPrice) : null,
        sku: body.sku,
        status: body.status,
        categoryId: body.categoryId || null,
        description: body.description,
        image: body.image,
        images: body.images ? JSON.stringify(body.images) : undefined,
        unit: body.unit,
        isFeatured: body.isFeatured,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    try {
      await prisma.product.delete({
        where: { id },
      });
    } catch (e) {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
