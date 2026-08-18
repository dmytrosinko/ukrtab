import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { PartnerLogo } from '@/lib/types';

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
      name: body.name || '',
      image: body.image,
      linkUrl: body.linkUrl || '',
      sortOrder: Number(body.sortOrder) || 0,
      isActive: body.isActive ?? true,
    };

    let updatedPartner: PartnerLogo | null = null;

    try {
      updatedPartner = await prisma.partnerLogo.upsert({
        where: { id },
        update: updateData,
        create: {
          id,
          ...updateData,
        },
      });
    } catch (dbErr) {
      console.warn('Prisma partner DB update failed:', dbErr);
    }

    try {
      revalidatePath('/');
      revalidatePath('/admin/partners');
    } catch (revErr) {}

    const result = updatedPartner || {
      id,
      ...updateData,
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error updating partner logo:', error);
    return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 });
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
      await prisma.partnerLogo.deleteMany({
        where: { id },
      });
    } catch (e) {
      console.warn('Prisma partner delete failed:', e);
    }

    try {
      revalidatePath('/');
      revalidatePath('/admin/partners');
    } catch (revErr) {}

    return NextResponse.json({ success: true }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error deleting partner logo:', error);
    return NextResponse.json({ error: 'Failed to delete partner' }, { status: 500 });
  }
}


