import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { Banner } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolved = params instanceof Promise ? await params : params;
    const rawId = resolved?.id || '';
    const id = decodeURIComponent(rawId);
    const body = await request.json();

    const updateData = {
      title: body.title !== undefined ? body.title : '',
      image: body.image,
      linkUrl: body.linkUrl !== undefined ? body.linkUrl : '',
      sortOrder: Number(body.sortOrder) || 0,
      isActive: body.isActive ?? true,
    };

    let updatedBanner: Banner | null = null;

    try {
      updatedBanner = await prisma.banner.upsert({
        where: { id },
        update: updateData,
        create: {
          id,
          ...updateData,
        },
      });
    } catch (dbErr) {
      console.warn('Prisma banner DB update failed:', dbErr);
    }

    try {
      revalidatePath('/');
      revalidatePath('/admin/banners');
    } catch (revErr) {}

    const result = updatedBanner || {
      id,
      ...updateData,
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolved = params instanceof Promise ? await params : params;
    const rawId = resolved?.id || '';
    const id = decodeURIComponent(rawId);

    try {
      await prisma.banner.deleteMany({
        where: { id },
      });
    } catch (e) {
      console.warn('Prisma banner delete failed:', e);
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
    console.error('Error deleting banner:', error);
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
