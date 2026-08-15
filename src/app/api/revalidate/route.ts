import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const secret = request.headers.get('x-revalidation-secret');
    const expectedSecret = process.env.REVALIDATION_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Invalid or missing revalidation secret' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const paths: string[] = body.paths;

    if (!Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json(
        { error: 'Request body must include a non-empty "paths" array' },
        { status: 400 }
      );
    }

    const revalidated: string[] = [];

    for (const path of paths) {
      if (typeof path === 'string' && path.startsWith('/')) {
        revalidatePath(path);
        revalidated.push(path);
      }
    }

    return NextResponse.json({
      success: true,
      revalidated,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Revalidation API error:', error);
    return NextResponse.json(
      { error: 'Revalidation failed', message: error?.message },
      { status: 500 }
    );
  }
}
