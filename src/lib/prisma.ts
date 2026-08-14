import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const getDbUrl = (): string | undefined => {
  const candidates = [
    process.env.POSTGRES_PRISMA_URL,
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
  ];
  for (const url of candidates) {
    if (url && typeof url === 'string' && url.trim().length > 0) {
      const trimmed = url.trim();
      if (
        trimmed.startsWith('postgresql://') ||
        trimmed.startsWith('postgres://') ||
        trimmed.startsWith('prisma://')
      ) {
        return trimmed;
      }
    }
  }
  return undefined;
};

const dbUrl = getDbUrl();

export const isDbConfigured = Boolean(dbUrl);

export const prisma =
  globalForPrisma.prisma ??
  (dbUrl
    ? new PrismaClient({
        datasources: { db: { url: dbUrl } },
        log: ['error', 'warn'],
      })
    : (new Proxy({} as any, {
        get(_target, _prop) {
          return new Proxy(() => Promise.resolve([]), {
            get(_t, method) {
              if (method === 'then' || method === 'catch' || method === 'finally') return undefined;
              return () => Promise.resolve([]);
            },
          });
        },
      }) as PrismaClient));

if (process.env.NODE_ENV !== 'production' && dbUrl) {
  globalForPrisma.prisma = prisma;
}

