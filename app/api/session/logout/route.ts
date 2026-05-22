import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authCookieName } from '@/src/lib/auth';

export async function POST() {
  const jar = await cookies();
  jar.delete(authCookieName);
  return NextResponse.json({ ok: true });
}

