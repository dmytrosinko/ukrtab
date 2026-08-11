export const AUTH_COOKIE_NAME = 'admin_auth_token';
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  return process.env.ADMIN_JWT_SECRET || 'ukrtab_secret_admin_key_2026_super_secure';
}

function computeSignature(timestamp: string, secret: string): string {
  const input = `${timestamp}:${secret}:ukrtab_salt_2026`;
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;

  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

export function createAdminToken(): string {
  const timestamp = Date.now().toString();
  const signature = computeSignature(timestamp, getSecret());
  return `${timestamp}.${signature}`;
}

export function verifyAdminToken(token?: string | null): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Check expiration (7 days)
  const now = Date.now();
  if (now - timestamp > TOKEN_MAX_AGE_SECONDS * 1000) {
    return false;
  }

  const expectedSignature = computeSignature(timestampStr, getSecret());
  return signature === expectedSignature;
}
