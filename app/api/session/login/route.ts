import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { loginRequest } from '@/src/lib/api';
import { authCookieName } from '@/src/lib/auth';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email: string; password: string };
    const login = await loginRequest(body.email, body.password);

    const value = JSON.stringify({
      sub: login.user.id,
      name: login.user.name,
      email: login.user.email,
      role: login.user.role,
      accessToken: login.accessToken,
    });

    const jar = await cookies();
    jar.set(authCookieName, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ message }, { status: 401 });
  }
}

