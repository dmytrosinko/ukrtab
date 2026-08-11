import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_PARTNERS } from '@/lib/store';
import { PartnerLogo } from '@/lib/types';

export let MEMORY_PARTNERS: PartnerLogo[] = [...INITIAL_PARTNERS];

export async function GET() {
  try {
    let dbPartners: PartnerLogo[] = [];
    try {
      dbPartners = await (prisma as any).partnerLogo.findMany({
        orderBy: { sortOrder: 'asc' },
      });
    } catch (dbErr) {}

    const combined = [...dbPartners, ...MEMORY_PARTNERS, ...INITIAL_PARTNERS];
    const map = new Map<string, PartnerLogo>();

    combined.forEach((p) => {
      if (!p || !p.id) return;
      if (!map.has(p.id)) {
        map.set(p.id, p);
      }
    });

    const unique = Array.from(map.values());
    return NextResponse.json(unique);
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(MEMORY_PARTNERS);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, image, linkUrl, sortOrder, isActive } = body;

    if (!image) {
      return NextResponse.json({ error: 'Зображення є обов’язковим' }, { status: 400 });
    }

    const newPartner: PartnerLogo = {
      id: 'partner-' + Date.now(),
      name: name || '',
      image,
      linkUrl: linkUrl || '',
      sortOrder: Number(sortOrder) || 0,
      isActive: isActive ?? true,
      createdAt: new Date(),
    };

    try {
      await (prisma as any).partnerLogo.create({
        data: {
          id: newPartner.id,
          name: newPartner.name,
          image: newPartner.image,
          linkUrl: newPartner.linkUrl,
          sortOrder: newPartner.sortOrder,
          isActive: newPartner.isActive,
        },
      });
    } catch (dbErr) {
      console.warn('Prisma partner DB write skipped/fallback:', dbErr);
    }

    MEMORY_PARTNERS.unshift(newPartner);
    return NextResponse.json(newPartner, { status: 201 });
  } catch (error) {
    console.error('Error creating partner logo:', error);
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
  }
}
