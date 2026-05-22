import { cookies } from 'next/headers';
import { UserSession } from '../types/dto';

const AUTH_COOKIE = 'odonto_session';

export async function getSession(): Promise<UserSession | null> {
  const jar = await cookies();
  const raw = jar.get(AUTH_COOKIE)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

export const authCookieName = AUTH_COOKIE;

