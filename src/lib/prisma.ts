import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const globalForPrisma = global as unknown as { prismaInstance?: PrismaClient | null };

function createPrismaClient(): PrismaClient | null {
  if (globalForPrisma.prismaInstance) return globalForPrisma.prismaInstance;

  try {
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
      const tmpDir = process.platform === 'win32' ? path.join(process.cwd(), 'prisma') : '/tmp';
      const tmpPath = path.join(tmpDir, 'dev.db');

      if (fs.existsSync(dbPath) && fs.existsSync(tmpDir) && dbPath !== tmpPath) {
        try {
          if (!fs.existsSync(tmpPath) || fs.statSync(tmpPath).size === 0) {
            fs.copyFileSync(dbPath, tmpPath);
          }
        } catch (e) {}
      }
      process.env.DATABASE_URL = `file:${tmpPath}`;
    }

    const client = new PrismaClient({ log: ['error', 'warn'] });
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
