import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { MEMORY_PRODUCTS } from '../route';

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { creates = [], updates = [], deletes = [] } = body;

    if (!Array.isArray(creates) && !Array.isArray(updates) && !Array.isArray(deletes)) {
      return NextResponse.json(
        { error: 'Body must contain creates, updates, or deletes array' },
        { status: 400 }
      );
    }

    let createdCount = 0;
    let updatedCount = 0;
    let deletedCount = 0;
    const errors: string[] = [];

    // 1. Process Deletions
    if (Array.isArray(deletes) && deletes.length > 0) {
      for (const id of deletes) {
        if (!id) continue;
        try {
          // Delete from Prisma DB
          try {
            await prisma.product.deleteMany({
              where: {
                OR: [{ id: String(id) }, { slug: String(id) }],
              },
            });
          } catch (dbErr: any) {
            console.warn(`Prisma delete failed for ${id}:`, dbErr?.message);
          }

          // Delete from MEMORY_PRODUCTS
          const memIdx = MEMORY_PRODUCTS.findIndex((p) => p.id === id || p.slug === id);
          if (memIdx !== -1) {
            MEMORY_PRODUCTS.splice(memIdx, 1);
          }
          deletedCount++;
        } catch (e: any) {
          errors.push(`Failed to delete ${id}: ${e?.message}`);
        }
      }
    }

    // 2. Process Updates
    if (Array.isArray(updates) && updates.length > 0) {
      for (const item of updates) {
        if (!item || (!item.id && !item.slug)) continue;
        const targetId = String(item.id || item.slug);

        try {
          const updateData: any = {};
          if (item.name !== undefined) updateData.name = String(item.name).trim();
          if (item.price !== undefined) updateData.price = parseFloat(item.price) || 0;
          if (item.oldPrice !== undefined) {
            updateData.oldPrice = item.oldPrice !== null && item.oldPrice !== '' ? parseFloat(item.oldPrice) : null;
          }
          if (item.sku !== undefined) updateData.sku = item.sku ? String(item.sku).trim() : null;
          if (item.status !== undefined) updateData.status = String(item.status);
          if (item.categoryId !== undefined) {
            updateData.categoryId = item.categoryId && item.categoryId !== 'cat-other' ? String(item.categoryId) : null;
          }
          if (item.description !== undefined) updateData.description = String(item.description);
          if (item.image !== undefined) updateData.image = String(item.image);
          if (item.images !== undefined) {
            updateData.images = typeof item.images === 'string' ? item.images : JSON.stringify(item.images);
          }
          if (item.unit !== undefined) updateData.unit = String(item.unit);
          if (item.isFeatured !== undefined) updateData.isFeatured = Boolean(item.isFeatured);

          try {
            await prisma.product.updateMany({
              where: {
                OR: [{ id: targetId }, { slug: targetId }],
              },
              data: updateData,
            });
          } catch (dbErr: any) {
            console.warn(`Prisma update failed for ${targetId}:`, dbErr?.message);
          }

          // Update MEMORY_PRODUCTS
          const memIdx = MEMORY_PRODUCTS.findIndex((p) => p.id === targetId || p.slug === targetId);
          if (memIdx !== -1) {
            MEMORY_PRODUCTS[memIdx] = {
              ...MEMORY_PRODUCTS[memIdx],
              ...updateData,
              updatedAt: new Date(),
            };
          }
          updatedCount++;
        } catch (e: any) {
          errors.push(`Failed to update ${targetId}: ${e?.message}`);
        }
      }
    }

    // 3. Process Creates
    if (Array.isArray(creates) && creates.length > 0) {
      for (const item of creates) {
        if (!item || !item.name) continue;
        try {
          const safeName = String(item.name).trim();
          const safePrice = parseFloat(item.price) || 100;
          const defaultImage =
            item.image || 'https://images.prom.ua/4296986097_w297_h200_magnitni-nalipki-na.jpg';

          const generatedSlug =
            item.slug ||
            safeName
              .toLowerCase()
              .replace(/[^a-z0-9а-яіїєґ]+/gi, '-')
              .replace(/^-+|-+$/g, '') +
              '-' +
              Date.now().toString().slice(-4) +
              Math.floor(Math.random() * 100);

          let validCategoryId = null;
          if (item.categoryId && item.categoryId !== 'cat-other') {
            validCategoryId = String(item.categoryId);
          }

          const productId = item.id || 'p-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

          const newProductData = {
            id: productId,
            name: safeName,
            slug: generatedSlug,
            price: safePrice,
            oldPrice: item.oldPrice ? parseFloat(item.oldPrice) : null,
            sku: item.sku ? String(item.sku).trim() : null,
            status: item.status || 'В наявності',
            categoryId: validCategoryId,
            description: item.description ? String(item.description) : null,
            image: defaultImage,
            images: item.images
              ? typeof item.images === 'string'
                ? item.images
                : JSON.stringify(item.images)
              : JSON.stringify([defaultImage]),
            unit: item.unit || 'шт.',
            isFeatured: Boolean(item.isFeatured),
          };

          try {
            await prisma.product.create({
              data: newProductData,
            });
          } catch (dbErr: any) {
            console.warn('Prisma create failed in batch, saving in-memory:', dbErr?.message);
          }

          MEMORY_PRODUCTS.unshift({
            ...newProductData,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any);

          createdCount++;
        } catch (e: any) {
          errors.push(`Failed to create ${item.name}: ${e?.message}`);
        }
      }
    }

    // Trigger on-demand revalidation only ONCE for the entire batch
    const totalOperations = createdCount + updatedCount + deletedCount;
    if (totalOperations > 0) {
      try {
        revalidatePath('/');
        revalidatePath('/catalog');
      } catch (revErr) {
        console.warn('Batch revalidation warning:', revErr);
      }
    }

    return NextResponse.json({
      success: true,
      createdCount,
      updatedCount,
      deletedCount,
      totalOperations,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Batch products API error:', error);
    return NextResponse.json(
      { error: 'Batch operation failed', details: error?.message },
      { status: 500 }
    );
  }
}
