import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { INITIAL_BANNERS } from '@/lib/store';
import { Banner } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let dbBanners: Banner[] = [];

    try {
      dbBanners = await prisma.banner.findMany({
        orderBy: { sortOrder: 'asc' },
      });

      // If DB is completely empty on initial run, seed with initial banners once
      if (dbBanners.length === 0 && INITIAL_BANNERS.length > 0) {
        for (const b of INITIAL_BANNERS) {
          try {
            await prisma.banner.create({
              data: {
                id: b.id,
                title: b.title || '',
                image: b.image,
                linkUrl: b.linkUrl || '',
                sortOrder: b.sortOrder || 0,
                isActive: b.isActive ?? true,
              },
            });
          } catch (seedErr) {}
        }

        dbBanners = await prisma.banner.findMany({
          orderBy: { sortOrder: 'asc' },
        });
      }
    } catch (dbErr) {
      console.warn('Prisma banner fetch notice:', dbErr);
    }

    const result = dbBanners.length > 0 ? dbBanners : INITIAL_BANNERS;

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(INITIAL_BANNERS, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id: customId, title, image, linkUrl, sortOrder, isActive } = body;

    if (!image) {
      return NextResponse.json({ error: 'Зображення є обов’язковим' }, { status: 400 });
    }

    const bannerId = customId || 'banner-' + Date.now();

    const newBannerData = {
      id: bannerId,
      title: title || '',
      image,
      linkUrl: linkUrl || '',
      sortOrder: Number(sortOrder) || 0,
      isActive: isActive ?? true,
    };

    let banner;
    try {
      banner = await prisma.banner.create({
        data: newBannerData,
      });
    } catch (dbErr) {
      console.error('Prisma banner creation failed:', dbErr);
      banner = {
        ...newBannerData,
        createdAt: new Date(),
      };
    }

    try {
      revalidatePath('/');
      revalidatePath('/admin/banners');
    } catch (revErr) {}

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}

// Bulk update order or batch update
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { banners } = body;

    if (Array.isArray(banners)) {
      for (const item of banners) {
        if (item && item.id) {
          try {
            await prisma.banner.upsert({
              where: { id: item.id },
              update: {
                sortOrder: Number(item.sortOrder) || 0,
                ...(item.isActive !== undefined ? { isActive: item.isActive } : {}),
                ...(item.title !== undefined ? { title: item.title } : {}),
                ...(item.linkUrl !== undefined ? { linkUrl: item.linkUrl } : {}),
                ...(item.image ? { image: item.image } : {}),
              },
              create: {
                id: item.id,
                title: item.title || '',
                image: item.image || '',
                linkUrl: item.linkUrl || '',
                sortOrder: Number(item.sortOrder) || 0,
                isActive: item.isActive ?? true,
              },
            });
          } catch (itemErr) {
            console.warn('Banner item reorder update warning:', itemErr);
          }
        }
      }
    }

    try {
      revalidatePath('/');
      revalidatePath('/admin/banners');
    } catch (revErr) {}

    return NextResponse.json({ success: true }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error batch updating banners:', error);
    return NextResponse.json({ error: 'Failed to reorder banners' }, { status: 500 });
  }
}
