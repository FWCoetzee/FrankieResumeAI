export const ANONYMOUS_SESSION_COOKIE_NAME = '__gr_session';
export const ANONYMOUS_SESSION_TTL_SECONDS = 60 * 60 * 24;

const ANONYMOUS_SESSION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createStableHash(input: string): number {
  let hash = 2166136261;

  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    hash ^= code;
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function createAnonymousSessionId(): string {
  if (typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.random() * 16 | 0;
    const value = character === 'x' ? random : (random & 0x3 | 0x8);
    return value.toString(16);
  });
}

export function computeOwnerHash(sessionId: string): string {
  const secret = process.env.ANONYMOUS_SESSION_SECRET;
  
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('ANONYMOUS_SESSION_SECRET environment variable is required in production.');
  }

  const finalSecret = secret ?? 'frankie-resume-ai-dev-secret';
  const combined = `${sessionId}:${finalSecret}`;
  let seed = createStableHash(combined);
  let output = '';

  for (let i = 0; i < 8; i += 1) {
    seed = Math.imul(seed ^ (i + 1), 16777619) >>> 0;
    output += seed.toString(16).padStart(8, '0');
  }

  return output;
}

export function getAnonymousSessionFromHeaders(headers: Headers): {
  sessionId?: string;
  ownerHash?: string;
} {
  const cookieHeader = headers.get('cookie') ?? '';

  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name !== ANONYMOUS_SESSION_COOKIE_NAME) {
      continue;
    }

    const rawSessionId = decodeURIComponent(rest.join('=') ?? '');
    if (!rawSessionId) {
      return {};
    }

    if (!ANONYMOUS_SESSION_ID_PATTERN.test(rawSessionId)) {
      return {};
    }

    return {
      sessionId: rawSessionId,
      ownerHash: computeOwnerHash(rawSessionId),
    };
  }

  return {};
}

export function getAnonymousSessionFromRequest(request: Request): {
  sessionId?: string;
  ownerHash?: string;
} {
  return getAnonymousSessionFromHeaders(request.headers);
}

export function getAnonymousOwnerHashFromRequest(request: Request): string | null {
  return getAnonymousSessionFromRequest(request).ownerHash ?? null;
}

/**
 * Validates that the current request has a valid anonymous session.
 * Throws an error if the session is missing or invalid.
 */
export async function validateAnonymousSession(request: Request) {
  const session = getAnonymousSessionFromRequest(request);
  if (!session.ownerHash) {
    throw new Error('Invalid or missing anonymous session.');
  }
  return session;
}

export function attachAnonymousSessionCookie(response: Response, sessionId: string): Response {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieValue = `${ANONYMOUS_SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ANONYMOUS_SESSION_TTL_SECONDS}; ${isProduction ? 'Secure;' : ''}`;
  response.headers.append('Set-Cookie', cookieValue);
  return response;
}

export function refreshAnonymousSessionCookie(response: Response, sessionId: string): Response {
  return attachAnonymousSessionCookie(response, sessionId);
}
