import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = verifyAdminToken(token);

  return NextResponse.json({ authenticated: isAuthenticated });
}
