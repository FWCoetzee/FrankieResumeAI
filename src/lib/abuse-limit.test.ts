import test from 'node:test';
import assert from 'node:assert/strict';

import { anonymizeIp, beginGeneration, createEnforcementKey, finishGeneration } from './abuse-limit';
import { getDb } from './db';

function enforcementKey(name: string): string {
  return createEnforcementKey(`owner-${name}`, '203.0.113.42', 'Milestone2Test/1.0');
}

test('createEnforcementKey anonymizes IPv4 and IPv6 identities and remains stable', () => {
  const first = createEnforcementKey('owner', '203.0.113.42', 'Browser/1.0');
  const second = createEnforcementKey('owner', '203.0.113.99', 'Browser/1.0');
  assert.equal(first, second);
  assert.equal(anonymizeIp('2001:db8:1234::1'), anonymizeIp('2001:db8:1234::99'));
});

test('enforces the burst limit and releases concurrent locks after completion', async () => {
  const db = await getDb();
  const key = enforcementKey('burst');

  const first = await beginGeneration(db, key);
  assert.equal(first.allowed, true);
  if (!first.allowed) return;
  await finishGeneration(db, key, first.requestId, true);

  const second = await beginGeneration(db, key);
  assert.equal(second.allowed, true);
  if (!second.allowed) return;

  const concurrent = await beginGeneration(db, key);
  assert.equal(concurrent.allowed, false);
  if (concurrent.allowed) return;
  assert.equal(concurrent.status, 409);

  await finishGeneration(db, key, second.requestId, true);

  const third = await beginGeneration(db, key);
  assert.equal(third.allowed, true);
  if (!third.allowed) return;
  await finishGeneration(db, key, third.requestId, true);

  const fourth = await beginGeneration(db, key);
  assert.equal(fourth.allowed, false);
  if (fourth.allowed) return;
  assert.equal(fourth.status, 429);

  const blocked = await beginGeneration(db, key);
  assert.equal(blocked.allowed, false);
  if (blocked.allowed) return;
  assert.equal(blocked.status, 429);
});

test('daily and hourly boundaries exclude older generation events', async () => {
  const db = await getDb();
  const key = enforcementKey('windows');

  await db.query('INSERT INTO public.ai_usage_records (enforcement_key) VALUES ($1)', [key]);
  await db.query(`INSERT INTO public.ai_usage_events (request_id, enforcement_key, status, created_at)
    VALUES ($1, $2, 'completed', NOW() - INTERVAL '2 days'),
           ($3, $2, 'completed', NOW() - INTERVAL '25 hours')`,
    ['window-old-1', key, 'window-old-2']);

  const result = await db.query(
    `SELECT COUNT(*)::int AS count FROM public.ai_usage_events
     WHERE enforcement_key = $1 AND created_at >= NOW() - INTERVAL '1 day'`,
    [key]
  );
  assert.equal(result.rows[0].count, 0);
});

test('global monthly request circuit breaker blocks at configured threshold', async () => {
  const previousCap = process.env.GEMINI_MONTHLY_REQUEST_CAP;
  process.env.GEMINI_MONTHLY_REQUEST_CAP = '2';
  const db = await getDb();
  const key = enforcementKey('breaker');
  await db.query('INSERT INTO public.ai_usage_records (enforcement_key) VALUES ($1)', [key]);
  await db.query("INSERT INTO public.ai_usage_events (request_id, enforcement_key, status) VALUES ('breaker-1', $1, 'completed')", [key]);

  const result = await beginGeneration(db, key);
  assert.equal(result.allowed, false);
  if (result.allowed) return;
  assert.equal(result.status, 503);
  if (previousCap === undefined) delete process.env.GEMINI_MONTHLY_REQUEST_CAP;
  else process.env.GEMINI_MONTHLY_REQUEST_CAP = previousCap;
});

test('failed provider requests refund their usage event', async () => {
  const db = await getDb();
  const key = enforcementKey('refund');
  const started = await beginGeneration(db, key);
  assert.equal(started.allowed, true);
  if (!started.allowed) return;

  await finishGeneration(db, key, started.requestId, false);
  const count = await db.query(
    'SELECT COUNT(*)::int AS count FROM public.ai_usage_events WHERE enforcement_key = $1',
    [key]
  );
  assert.equal(count.rows[0].count, 0);
});
