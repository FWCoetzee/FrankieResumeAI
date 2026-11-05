import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { Pool } from 'pg';

import type { PaymentCurrency, PaymentProvider } from './types';

export type PaymentTransactionStatus =
  | 'created' | 'redirected' | 'pending_verification' | 'paid' | 'exported'
  | 'cancelled' | 'failed' | 'expired' | 'paid_export_failed';

export interface PaymentTransaction {
  id: string;
  resume_id: string;
  owner_hash: string;
  provider: PaymentProvider;
  status: PaymentTransactionStatus;
  amount: string;
  currency: PaymentCurrency;
  provider_reference: string | null;
  created_at: Date;
  updated_at: Date;
  expires_at: Date;
}

export function paymentIdempotencyKey(
  resumeId: number,
  ownerHash: string,
  provider: PaymentProvider,
  amount: number,
  currency: PaymentCurrency
): string {
  return createHash('sha256')
    .update(`${resumeId}:${ownerHash}:${provider}:${amount.toFixed(2)}:${currency}`)
    .digest('hex');
}

export async function createPaymentTransaction(
  db: Pick<Pool, 'query'>,
  input: {
    resumeId: number;
    ownerHash: string;
    provider: PaymentProvider;
    amount: number;
    currency: PaymentCurrency;
  }
): Promise<PaymentTransaction> {
  const idempotencyKey = paymentIdempotencyKey(
    input.resumeId, input.ownerHash, input.provider, input.amount, input.currency
  );
  const existing = await db.query<PaymentTransaction>(
    `SELECT * FROM public.payment_transactions
     WHERE idempotency_key = $1
       AND status IN ('created', 'redirected', 'pending_verification') LIMIT 1`,
    [idempotencyKey]
  );
  if (existing.rows[0]) return existing.rows[0];

  const result = await db.query<PaymentTransaction>(
    `INSERT INTO public.payment_transactions
      (id, idempotency_key, resume_id, owner_hash, provider, status, amount, currency, expires_at)
     VALUES ($1, $2, $3, $4, $5, 'created', $6, $7, NOW() + INTERVAL '30 minutes')
     ON CONFLICT (idempotency_key) DO UPDATE SET updated_at = NOW()
     RETURNING *`,
    [randomUUID(), idempotencyKey, input.resumeId, input.ownerHash, input.provider,
      input.amount.toFixed(2), input.currency]
  );
  return result.rows[0];
}

export async function markPaymentRedirected(
  db: Pick<Pool, 'query'>,
  transactionId: string,
  providerReference?: string
): Promise<PaymentTransaction> {
  const result = await db.query<PaymentTransaction>(
    `UPDATE public.payment_transactions
     SET status = 'redirected',
         provider_reference = COALESCE($2, provider_reference),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [transactionId, providerReference ?? null]
  );
  if (!result.rows[0]) throw new Error('Payment transaction not found.');
  return result.rows[0];
}

export async function markPaymentPaid(
  db: Pick<Pool, 'query'>,
  input: {
    provider: PaymentProvider;
    providerReference: string;
    amount: number;
    currency: PaymentCurrency;
  }
): Promise<{ transaction: PaymentTransaction; downloadToken: string } | null> {
  const downloadToken = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(downloadToken).digest('hex');
  const result = await db.query<PaymentTransaction>(
    `UPDATE public.payment_transactions
     SET status = 'paid',
         download_token_hash = COALESCE(download_token_hash, $2),
         download_token_expires_at = COALESCE(download_token_expires_at, NOW() + INTERVAL '15 minutes'),
         updated_at = NOW()
     WHERE provider = $1
       AND provider_reference = $3
       AND amount = $4
       AND currency = $5
       AND status IN ('created', 'redirected', 'pending_verification', 'paid')
     RETURNING *`,
    [input.provider, tokenHash, input.providerReference, input.amount.toFixed(2), input.currency]
  );
  if (!result.rows[0]) return null;
  return { transaction: result.rows[0], downloadToken };
}
