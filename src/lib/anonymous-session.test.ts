import test from 'node:test';
import assert from 'node:assert/strict';

import { createAnonymousSessionId, computeOwnerHash, getAnonymousSessionFromHeaders, refreshAnonymousSessionCookie } from './anonymous-session';

const VALID_SESSION_ID = '123e4567-e89b-4d3a-a456-426614174000';

test('createAnonymousSessionId returns a non-empty UUID-like session', () => {
  const value = createAnonymousSessionId();
  assert.equal(typeof value, 'string');
  assert.ok(value.length > 0);
  assert.match(value, /^[0-9a-f-]{36}$/i);
});

test('computeOwnerHash is stable for the same session and secret', () => {
  const hashA = computeOwnerHash(VALID_SESSION_ID);
  const hashB = computeOwnerHash(VALID_SESSION_ID);

  assert.equal(hashA, hashB);
  assert.equal(hashA.length, 64);
});

test('getAnonymousSessionFromHeaders reads the session cookie and derives the owner hash', () => {
  const headers = new Headers({
    cookie: `__gr_session=${VALID_SESSION_ID}; other=value`,
  });

  const session = getAnonymousSessionFromHeaders(headers);

  assert.equal(session.sessionId, VALID_SESSION_ID);
  assert.equal(session.ownerHash, computeOwnerHash(VALID_SESSION_ID));
});

test('refreshAnonymousSessionCookie extends the cookie lifetime for active usage', () => {
  const response = new Response(JSON.stringify({ ok: true }));
  const refreshed = refreshAnonymousSessionCookie(response, VALID_SESSION_ID);

  const setCookie = refreshed.headers.get('Set-Cookie') ?? '';
  assert.match(setCookie, /__gr_session=/i);
  assert.match(setCookie, /Max-Age=86400/i);
});

test('getAnonymousSessionFromHeaders rejects malformed session IDs', () => {
  const headers = new Headers({
    cookie: '__gr_session=forged-session-id; other=value',
  });

  assert.deepEqual(getAnonymousSessionFromHeaders(headers), {});
});
