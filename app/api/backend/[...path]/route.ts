import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { authCookieName } from '@/src/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function proxy(request: Request, pathParts: string[]) {
  const jar = await cookies();
  const sessionRaw = jar.get(authCookieName)?.value;
  const session = sessionRaw ? JSON.parse(sessionRaw) as { accessToken?: string } : null;

  const url = new URL(request.url);
  const query = url.search || '';
  const target = `${API_URL}/${pathParts.join('/')}${query}`;

  const headers = new Headers(request.headers);
  headers.delete('host');
  if (session?.accessToken) {
    headers.set('authorization', `Bearer ${session.accessToken}`);
  }

  const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer();

  const response = await fetch(target, {
    method: request.method,
    headers,
    body,
  });

  const responseBody = await response.arrayBuffer();
  const outHeaders = new Headers(response.headers);
  outHeaders.delete('content-encoding');

  return new NextResponse(responseBody, {
    status: response.status,
    headers: outHeaders,
  });
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return proxy(request, params.path);
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return proxy(request, params.path);
}

export async function PUT(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return proxy(request, params.path);
}

export async function PATCH(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return proxy(request, params.path);
}

export async function DELETE(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  return proxy(request, params.path);
}

