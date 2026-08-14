import { NextResponse } from 'next/server';
import { prisma, isDbConfigured } from '@/lib/prisma';
import { INITIAL_CATEGORIES } from '@/lib/store';

export async function GET() {
  try {
    if (isDbConfigured) {
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
      } catch (dbErr) {
        console.warn('Categories DB query error, serving static fallback:', dbErr);
      }
    }

    return NextResponse.json(INITIAL_CATEGORIES);
  } catch (error) {
    console.error('Error fetching categories:', error);
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
