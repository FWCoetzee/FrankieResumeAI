import assert from 'node:assert/strict';
import test from 'node:test';

import { getDb } from '../db';
import {
  createPaymentTransaction,
  markPaymentRedirected,
  markPaymentPaid,
  paymentIdempotencyKey,
} from './store';

async function createResume(ownerHash: string, title: string): Promise<number> {
  const db = await getDb();
  const result = await db.query<{ id: number }>(
    `INSERT INTO public.resumes (owner_hash, title, template_id, expires_at)
     VALUES ($1, $2, 'modern', NOW() + INTERVAL '1 day') RETURNING id`,
    [ownerHash, title]
  );
  return Number(result.rows[0].id);
}

test('creates one active transaction for the same payment inputs', async () => {
  const db = await getDb();
  const ownerHash = 'payment-owner-test';
  const resumeId = await createResume(ownerHash, 'Payment test');
  const input = { resumeId, ownerHash, provider: 'paypal' as const, amount: 4.99, currency: 'USD' as const };

  const first = await createPaymentTransaction(db, input);
  const second = await createPaymentTransaction(db, input);

  assert.equal(second.id, first.id);
  assert.equal(
    paymentIdempotencyKey(resumeId, ownerHash, 'paypal', 4.99, 'USD'),
    paymentIdempotencyKey(resumeId, ownerHash, 'paypal', 4.99, 'USD')
  );
});

test('marks a transaction redirected and records the provider reference', async () => {
  const db = await getDb();
  const ownerHash = 'payment-owner-redirected';
  const resumeId = await createResume(ownerHash, 'Redirect payment test');
  const transaction = await createPaymentTransaction(db, {
    resumeId, ownerHash, provider: 'yoco', amount: 99, currency: 'ZAR',
  });
  const redirected = await markPaymentRedirected(db, transaction.id, 'checkout_reference');

  assert.equal(redirected.status, 'redirected');
  assert.equal(redirected.provider_reference, 'checkout_reference');
});

test('marks a matching payment paid with an issued download token', async () => {
  const db = await getDb();
  const ownerHash = 'payment-owner-paid';
  const resumeId = await createResume(ownerHash, 'Paid payment test');
  const transaction = await createPaymentTransaction(db, {
    resumeId, ownerHash, provider: 'paypal', amount: 4.99, currency: 'USD',
  });
  await markPaymentRedirected(db, transaction.id, 'paypal-payment-reference');

  const paid = await markPaymentPaid(db, {
    provider: 'paypal',
    providerReference: 'paypal-payment-reference',
    amount: 4.99,
    currency: 'USD',
  });

  assert.ok(paid);
  assert.equal(paid.transaction.status, 'paid');
  assert.match(paid.downloadToken, /^[A-Za-z0-9_-]+$/);
});
