import { NextResponse, type NextRequest } from 'next/server';
import {
  ANONYMOUS_SESSION_COOKIE_NAME,
  ANONYMOUS_SESSION_TTL_SECONDS,
  createAnonymousSessionId,
  getAnonymousSessionFromHeaders,
} from '@/lib/anonymous-session';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const currentSession = getAnonymousSessionFromHeaders(request.headers);

  // Protect Admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // In a full implementation, this would check for an admin session cookie or header.
    // For this MVP, we ensure it's at least matched by the middleware.
    // The actual authorization happens at the API level via CLEANUP_SECRET.
  }

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
  } else {
    response.cookies.set({
      name: ANONYMOUS_SESSION_COOKIE_NAME,
      value: currentSession.sessionId,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: ANONYMOUS_SESSION_TTL_SECONDS,
    });
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/editor/:path*', '/admin/:path*', '/'],
};
