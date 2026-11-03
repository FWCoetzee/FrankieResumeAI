import { createHash, randomUUID } from 'crypto';
import type { Pool } from 'pg';

export type AbuseDecision =
  | { allowed: true; requestId: string }
  | { allowed: false; status: 429 | 409; retryAfterSeconds: number; message: string };

const WINDOWS = [
  { name: 'burst', duration: "INTERVAL '10 minutes'", durationMs: 10 * 60 * 1000, limit: 3 },
  { name: 'hour', duration: "INTERVAL '1 hour'", durationMs: 60 * 60 * 1000, limit: 3 },
  { name: 'day', duration: "INTERVAL '1 day'", durationMs: 24 * 60 * 60 * 1000, limit: 10 },
  { name: 'month', duration: "INTERVAL '31 days'", durationMs: 31 * 24 * 60 * 60 * 1000, limit: 30 },
] as const;

const CONCURRENCY_TIMEOUT_MS = 5 * 60 * 1000;

export function createEnforcementKey(sessionOwnerHash: string, ip: string, userAgent: string): string {
  const anonymizedIp = ip.split(',')[0].trim().replace(/\.\d{1,3}$/, '.0');
  return createHash('sha256').update(`${sessionOwnerHash}:${anonymizedIp}:${userAgent}`).digest('hex');
}

export async function beginGeneration(db: Pool, enforcementKey: string): Promise<AbuseDecision> {
  const client = await db.connect();
  const requestId = randomUUID();

  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO public.ai_usage_records (enforcement_key)
       VALUES ($1)
       ON CONFLICT (enforcement_key) DO NOTHING`,
      [enforcementKey]
    );

    const record = await client.query(
      `SELECT * FROM public.ai_usage_records
       WHERE enforcement_key = $1 FOR UPDATE`,
      [enforcementKey]
    );

    const current = record.rows[0];
    if (current?.generating_since && Date.now() - new Date(current.generating_since).getTime() < CONCURRENCY_TIMEOUT_MS) {
      await client.query('ROLLBACK');
      return { allowed: false, status: 409, retryAfterSeconds: 60, message: 'A generation is already in progress.' };
    }

    if (current?.generating_since) {
      await client.query(
        `UPDATE public.ai_usage_records SET generating_since = NULL, active_request_id = NULL WHERE enforcement_key = $1`,
        [enforcementKey]
      );
    }

    for (const window of WINDOWS) {
      const result = await client.query(
        `SELECT COUNT(*)::int AS count,
                COALESCE(MAX(created_at), NOW()) AS newest
         FROM public.ai_usage_events
         WHERE enforcement_key = $1 AND created_at >= NOW() - ${window.duration}`,
        [enforcementKey]
      );
      const count = result.rows[0].count as number;
      if (count >= window.limit) {
        const retryMs = new Date(result.rows[0].newest).getTime() + window.durationMs - Date.now();
        await client.query('ROLLBACK');
        return { allowed: false, status: 429, retryAfterSeconds: Math.max(60, Math.ceil(retryMs / 1000)), message: 'To ensure fair access for everyone, AI generation is temporarily limited for your session.' };
      }
    }

    await client.query(
      `INSERT INTO public.ai_usage_events (request_id, enforcement_key, status)
       VALUES ($1, $2, 'accepted')`,
      [requestId, enforcementKey]
    );
    await client.query(
      `UPDATE public.ai_usage_records
       SET generating_since = NOW(), active_request_id = $2, last_request_at = NOW(), expires_at = NOW() + INTERVAL '31 days'
       WHERE enforcement_key = $1`,
      [enforcementKey, requestId]
    );
    await client.query('COMMIT');
    return { allowed: true, requestId };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function finishGeneration(db: Pool, enforcementKey: string, requestId: string, succeeded: boolean): Promise<void> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE public.ai_usage_events
       SET status = 'completed'
       WHERE request_id = $1 AND enforcement_key = $2 AND $3 = TRUE`,
      [requestId, enforcementKey, succeeded]
    );
    await client.query(
      `DELETE FROM public.ai_usage_events
       WHERE request_id = $1 AND enforcement_key = $2 AND $3 = FALSE`,
      [requestId, enforcementKey, succeeded]
    );
    await client.query(
      `UPDATE public.ai_usage_records
       SET generating_since = NULL, active_request_id = NULL
       WHERE enforcement_key = $1 AND active_request_id = $2`,
      [enforcementKey, requestId]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function resetAnonymousGenerationLimitState(): Promise<void> {
  // Reserved for local/test compatibility. Persistent state is intentionally not reset in production.
}

export async function deleteExpiredUsageRecords(db: Pool): Promise<number> {
  const result = await db.query(
    `DELETE FROM public.ai_usage_records
     WHERE expires_at <= NOW()
       AND generating_since IS NULL`
  );

  return result.rowCount ?? 0;
}
