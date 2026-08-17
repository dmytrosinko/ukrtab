import { GET as getGoogleFeed } from '@/app/google-feed.xml/route';

export const dynamic = 'force-dynamic';

export async function GET() {
  return getGoogleFeed();
}
