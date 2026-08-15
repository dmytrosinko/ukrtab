import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prismaInstance?: PrismaClient };

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prismaInstance) {
    return globalForPrisma.prismaInstance;
  }

  const dbUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.SUPABASE_DATABASE_URL ||
    process.env.VERCEL_POSTGRES_URL;

  const client = new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  globalForPrisma.prismaInstance = client;
  return client;
}

export const prisma = getPrismaClient();
