import test from 'node:test';
import assert from 'node:assert/strict';

import { beginGeneration, createEnforcementKey, finishGeneration } from './abuse-limit';
import { getDb } from './db';

function enforcementKey(name: string): string {
  return createEnforcementKey(`owner-${name}`, '203.0.113.42', 'Milestone2Test/1.0');
}

test('createEnforcementKey anonymizes the final IPv4 octet and remains stable', () => {
  const first = createEnforcementKey('owner', '203.0.113.42', 'Browser/1.0');
  const second = createEnforcementKey('owner', '203.0.113.99', 'Browser/1.0');
  assert.equal(first, second);
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
