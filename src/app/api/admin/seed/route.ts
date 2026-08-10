import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '@/lib/store';

export async function GET() {
  try {
    // 1. Seed categories
    for (const cat of INITIAL_CATEGORIES) {
      await prisma.category.upsert({
        where: { id: cat.id },
        update: {},
        create: {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
          description: cat.description,
          isFeatured: cat.isFeatured ?? true,
        },
      });
    }

    // 2. Prepare and seed products
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
    });

    const count = await prisma.product.count();

    return NextResponse.json({
      success: true,
      message: `Успішно перенесено ${seedData.length} товарів у базу даних Supabase PostgreSQL!`,
      totalInDatabase: count,
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Помилка міграції товарів:', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
