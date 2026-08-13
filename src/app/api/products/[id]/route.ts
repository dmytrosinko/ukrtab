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
    const resolved = await params;
    const rawId = resolved.id || '';
    const id = decodeURIComponent(rawId);
    const body = await request.json();

    const updateData: any = {
      name: body.name,
      price: body.price !== undefined ? parseFloat(body.price) : undefined,
      oldPrice: body.oldPrice !== undefined && body.oldPrice !== null && body.oldPrice !== '' ? parseFloat(body.oldPrice) : null,
      sku: body.sku || null,
      status: body.status || 'В наявності',
      categoryId: body.categoryId || null,
      description: body.description || null,
      image: body.image,
      images: body.images ? (typeof body.images === 'string' ? body.images : JSON.stringify(body.images)) : (body.image ? JSON.stringify([body.image]) : undefined),
      unit: body.unit || 'шт.',
      isFeatured: Boolean(body.isFeatured),
    };

    let product = null;

    // 1. Try Prisma DB lookup and update / upsert
    try {
      const existing = await prisma.product.findFirst({
        where: {
          OR: [{ id }, { slug: id }, { name: body.name }],
        },
      });

      if (existing) {
        product = await prisma.product.update({
          where: { id: existing.id },
          data: updateData,
        });
      } else {
        const slugToUse = body.slug || id;
        product = await prisma.product.upsert({
          where: { slug: slugToUse },
          update: updateData,
          create: {
            id: body.id || id,
            slug: slugToUse,
            ...updateData,
          },
        });
      }
    } catch (dbErr) {
      console.warn('Prisma DB update/upsert skipped or failed:', dbErr);
    }

    // 2. Sync / update in MEMORY_PRODUCTS if present or fallback
    const targetName = (body.name || '').trim().toLowerCase();
    const memIdx = MEMORY_PRODUCTS.findIndex(
      (p) => p.id === id || p.slug === id || (p.name && p.name.trim().toLowerCase() === targetName)
    );
    const updatedMemObj = {
      id: product?.id || body.id || id,
      slug: product?.slug || body.slug || id,
      ...updateData,
      updatedAt: new Date(),
    };

    if (memIdx !== -1) {
      MEMORY_PRODUCTS[memIdx] = {
        ...MEMORY_PRODUCTS[memIdx],
        ...updatedMemObj,
      };
    } else if (!product) {
      MEMORY_PRODUCTS.unshift(updatedMemObj);
    }

    return NextResponse.json(product || updatedMemObj);
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
    const resolved = await params;
    const rawId = resolved.id || '';
    const id = decodeURIComponent(rawId);

    try {
      const existing = await prisma.product.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
        },
      });
      if (existing) {
        await prisma.product.delete({
          where: { id: existing.id },
        });
      }
    } catch (e) {}

    const memIdx = MEMORY_PRODUCTS.findIndex((p) => p.id === id || p.slug === id);
    if (memIdx !== -1) {
      MEMORY_PRODUCTS.splice(memIdx, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
