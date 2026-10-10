import { NextResponse, type NextRequest } from 'next/server';
import {
  ANONYMOUS_SESSION_COOKIE_NAME,
  ANONYMOUS_SESSION_TTL_SECONDS,
  computeOwnerHash,
  createAnonymousSessionId,
  getAnonymousSessionFromHeaders,
} from '@/lib/anonymous-session';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const currentSession = getAnonymousSessionFromHeaders(request.headers);

  if (!currentSession.sessionId) {
    const freshSessionId = createAnonymousSessionId();

    response.cookies.set({
      name: ANONYMOUS_SESSION_COOKIE_NAME,
      value: freshSessionId,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: ANONYMOUS_SESSION_TTL_SECONDS,
    });

    response.headers.set('X-Anonymous-Session-Owner-Hash', computeOwnerHash(freshSessionId));
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/editor/:path*', '/'],
};
