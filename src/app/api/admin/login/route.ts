import { NextResponse } from 'next/server';
import { createAdminToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const validUsername = (process.env.ADMIN_USERNAME || 'admin').replace(/^["']|["']$/g, '').trim();
    const validPassword = (process.env.ADMIN_PASSWORD || 'admin123').replace(/^["']|["']$/g, '').trim();

    if (username === validUsername && password === validPassword) {
      const token = createAdminToken();
      const response = NextResponse.json({ success: true, message: 'Авторизація успішна' });

      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Невірний логін або пароль' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Помилка при авторизації' },
      { status: 500 }
    );
  }
}
