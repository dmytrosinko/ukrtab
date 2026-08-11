import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MEMORY_PARTNERS } from '../route';
import { PartnerLogo } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolved = await params;
    const rawId = resolved.id || '';
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
      updatedPartner = await (prisma as any).partnerLogo.update({
        where: { id },
        data: updateData,
      });
    } catch (dbErr) {
      console.warn('Prisma partner DB update skipped/fallback:', dbErr);
    }

    const idx = MEMORY_PARTNERS.findIndex((p) => p.id === id);
    const memObj: PartnerLogo = {
      id,
      ...updateData,
    };

    if (idx !== -1) {
      MEMORY_PARTNERS[idx] = { ...MEMORY_PARTNERS[idx], ...memObj };
      if (!updatedPartner) updatedPartner = MEMORY_PARTNERS[idx];
    } else {
      MEMORY_PARTNERS.unshift(memObj);
      if (!updatedPartner) updatedPartner = memObj;
    }

    return NextResponse.json(updatedPartner || memObj);
  } catch (error) {
    console.error('Error updating partner logo:', error);
    return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 });
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
      await (prisma as any).partnerLogo.delete({
        where: { id },
      });
    } catch (e) {}

    const idx = MEMORY_PARTNERS.findIndex((p) => p.id === id);
    if (idx !== -1) {
      MEMORY_PARTNERS.splice(idx, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting partner logo:', error);
    return NextResponse.json({ error: 'Failed to delete partner' }, { status: 500 });
  }
}
