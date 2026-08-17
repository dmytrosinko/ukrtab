import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { INITIAL_PARTNERS } from '@/lib/store';
import { PartnerLogo } from '@/lib/types';

export async function GET() {
  try {
    let dbPartners: PartnerLogo[] = [];

    try {
      dbPartners = await prisma.partnerLogo.findMany({
        orderBy: { sortOrder: 'asc' },
      });

      // If DB is completely empty on initial run, seed with initial partners once
      if (dbPartners.length === 0 && INITIAL_PARTNERS.length > 0) {
        for (const p of INITIAL_PARTNERS) {
          try {
            await prisma.partnerLogo.create({
              data: {
                id: p.id,
                name: p.name || '',
                image: p.image,
                linkUrl: p.linkUrl || '',
                sortOrder: p.sortOrder || 0,
                isActive: p.isActive ?? true,
              },
            });
          } catch (seedErr) {}
        }

        dbPartners = await prisma.partnerLogo.findMany({
          orderBy: { sortOrder: 'asc' },
        });
      }
    } catch (dbErr) {
      console.warn('Prisma partner fetch notice:', dbErr);
    }

    if (dbPartners.length > 0) {
      return NextResponse.json(dbPartners);
    }

    return NextResponse.json(INITIAL_PARTNERS);
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(INITIAL_PARTNERS);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id: customId, name, image, linkUrl, sortOrder, isActive } = body;

    if (!image) {
      return NextResponse.json({ error: 'Зображення є обов’язковим' }, { status: 400 });
    }

    const partnerId = customId || 'partner-' + Date.now();

    const newPartnerData = {
      id: partnerId,
      name: name || '',
      image,
      linkUrl: linkUrl || '',
      sortOrder: Number(sortOrder) || 0,
      isActive: isActive ?? true,
    };

    let partner;
    try {
      partner = await prisma.partnerLogo.create({
        data: newPartnerData,
      });
    } catch (dbErr) {
      console.error('Prisma partner creation failed:', dbErr);
      partner = {
        ...newPartnerData,
        createdAt: new Date(),
      };
    }

    try {
      revalidatePath('/');
    } catch (revErr) {}

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    console.error('Error creating partner logo:', error);
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
  }
}
