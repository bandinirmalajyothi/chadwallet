import { getTrendingTokens } from '@/lib/birdeye';
import { NextResponse } from 'next/server';

export async function GET() {
  const tokens = await getTrendingTokens(20);
  return NextResponse.json(tokens, {
    headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' }
  });
}
