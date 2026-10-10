import test from 'node:test';
import assert from 'node:assert/strict';

import { createAnonymousSessionId, computeOwnerHash, getAnonymousSessionFromHeaders, refreshAnonymousSessionCookie } from './anonymous-session';

test('createAnonymousSessionId returns a non-empty UUID-like session', () => {
  const value = createAnonymousSessionId();
  assert.equal(typeof value, 'string');
  assert.ok(value.length > 0);
  assert.match(value, /^[0-9a-f-]{36}$/i);
});

test('computeOwnerHash is stable for the same session and secret', () => {
  const sessionId = '123e4567-e89b-12d3-a456-426614174000';
  const hashA = computeOwnerHash(sessionId);
  const hashB = computeOwnerHash(sessionId);

  assert.equal(hashA, hashB);
  assert.equal(hashA.length, 64);
});

test('getAnonymousSessionFromHeaders reads the session cookie and derives the owner hash', () => {
  const headers = new Headers({
    cookie: '__gr_session=123e4567-e89b-12d3-a456-426614174000; other=value',
  });

  const session = getAnonymousSessionFromHeaders(headers);

  assert.equal(session.sessionId, '123e4567-e89b-12d3-a456-426614174000');
  assert.equal(session.ownerHash, computeOwnerHash('123e4567-e89b-12d3-a456-426614174000'));
});

test('refreshAnonymousSessionCookie extends the cookie lifetime for active usage', () => {
  const response = new Response(JSON.stringify({ ok: true }));
  const refreshed = refreshAnonymousSessionCookie(response, '123e4567-e89b-12d3-a456-426614174000');

  const setCookie = refreshed.headers.get('Set-Cookie') ?? '';
  assert.match(setCookie, /__gr_session=/i);
  assert.match(setCookie, /Max-Age=86400/i);
});
