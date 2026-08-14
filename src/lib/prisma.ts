import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const globalForPrisma = global as unknown as { prismaInstance?: PrismaClient | null };

function createPrismaClient(): PrismaClient | null {
  if (globalForPrisma.prismaInstance) return globalForPrisma.prismaInstance;

  try {
    const dbUrl =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.SUPABASE_DATABASE_URL ||
      process.env.VERCEL_POSTGRES_URL;

    const client = new PrismaClient({
      datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
      log: ['error', 'warn'],
    });

    if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaInstance = client;
    return client;
  } catch (e) {
    console.error('Failed to initialize PrismaClient:', e);
    return null;
  }
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const instance = createPrismaClient();
    if (!instance) {
      throw new Error('Prisma Client is not available in this environment');
    }
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  },
});
