import { PrismaClient } from '@prisma/client';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../src/lib/store';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with full 117 Prom.ua catalog products...');

  // Seed Categories
  for (const cat of INITIAL_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        description: cat.description,
        isFeatured: cat.isFeatured,
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        description: cat.description,
        isFeatured: cat.isFeatured,
      },
    });
  }

  // Seed Products
  for (const prod of INITIAL_PRODUCTS) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {
        name: prod.name,
        slug: prod.slug,
        price: prod.price,
        oldPrice: prod.oldPrice,
        sku: prod.sku,
        status: prod.status,
        categoryId: prod.categoryId,
        description: prod.description,
        image: prod.image,
        images: prod.images,
        unit: prod.unit,
        isFeatured: prod.isFeatured,
      },
      create: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        price: prod.price,
        oldPrice: prod.oldPrice,
        sku: prod.sku,
        status: prod.status,
        categoryId: prod.categoryId,
        description: prod.description,
        image: prod.image,
        images: prod.images,
        unit: prod.unit,
        isFeatured: prod.isFeatured,
      },
    });
  }

  console.log(`Seeding complete! Successfully seeded ${INITIAL_PRODUCTS.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
