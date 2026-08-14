import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_CATEGORIES } from '@/lib/store';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    if (categories && categories.length > 0) {
      return NextResponse.json(categories, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    return NextResponse.json(INITIAL_CATEGORIES);
  } catch (error) {
    console.error('Error fetching categories from DB:', error);
    return NextResponse.json(INITIAL_CATEGORIES);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, image, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9а-яіїєґ]+/gi, '-')
      .replace(/^-+|-+$/g, '') + '-' + Date.now().toString().slice(-4);

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        image: image || null,
        description: description || null,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
