import { UserSession } from '../types/dto';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
  isFormData?: boolean;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, payload: unknown) {
    super(typeof payload === 'object' && payload && 'message' in (payload as Record<string, unknown>) ? String((payload as Record<string, unknown>).message) : `Request failed: ${status}`);
    this.status = status;
    this.payload = payload;
  }
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      ...(options.isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers ?? {}),
    },
    body: options.body
      ? options.isFormData
        ? (options.body as BodyInit)
        : JSON.stringify(options.body)
      : undefined,
    cache: 'no-store',
  });

  const text = await response.text();
  const payload = text ? safeJson(text) : null;

  if (!response.ok) {
    throw new ApiError(response.status, payload);
  }

  return payload as T;
}

function safeJson(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return { message: raw };
  }
}

export async function loginRequest(email: string, password: string) {
  return apiFetch<{ accessToken: string; user: { id: string; name: string; email: string; role: UserSession['role']; tenantSlug?: string | null } }>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}
