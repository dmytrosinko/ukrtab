import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const allProducts = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const seenMap = new Map<string, string>();
    const toDeleteIds: string[] = [];

    for (const p of allProducts) {
      if (!p || !p.name) continue;

      const cleanName = p.name.trim().toLowerCase();
      const priceKey = String(p.price);
      const key = `${cleanName}_${priceKey}`;

      if (seenMap.has(key)) {
        toDeleteIds.push(p.id);
      } else {
        seenMap.set(key, p.id);
      }
    }

    if (toDeleteIds.length > 0) {
      await prisma.product.deleteMany({
        where: {
          id: { in: toDeleteIds },
        },
      });
    }

    const remainingCount = await prisma.product.count();

    return NextResponse.json({
      success: true,
      totalChecked: allProducts.length,
      duplicatesRemoved: toDeleteIds.length,
      remainingCount,
      message: `Перевірено ${allProducts.length} товарів. Видалено ${toDeleteIds.length} дублікатів. Залишилося ${remainingCount} унікальних товарів.`,
    });
  } catch (error: any) {
    console.error('Dedupe error:', error);
    return NextResponse.json(
      { error: 'Помилка видалення дублікатів:', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
