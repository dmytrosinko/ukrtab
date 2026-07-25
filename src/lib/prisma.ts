import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  try {
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const tmpDir = process.platform === 'win32' ? path.join(process.cwd(), 'prisma') : '/tmp';
    const tmpPath = path.join(tmpDir, 'dev.db');

    if (fs.existsSync(dbPath) && fs.existsSync(tmpDir) && dbPath !== tmpPath && (!fs.existsSync(tmpPath) || fs.statSync(tmpPath).size === 0)) {
      fs.copyFileSync(dbPath, tmpPath);
    }
    process.env.DATABASE_URL = `file:${tmpPath}`;
  } catch (e) {
    console.error('Failed to prepare SQLite database:', e);
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
