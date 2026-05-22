import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'odonto_session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get(AUTH_COOKIE)?.value;
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname === '/login') {
    const session = request.cookies.get(AUTH_COOKIE)?.value;
    if (session) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};


