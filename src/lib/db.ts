import { Pool } from 'pg';
import { newDb } from 'pg-mem';
import { Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector';

let poolPromise: Promise<Pool> | undefined;
let connector: Connector | undefined;

async function createMemoryPool(): Promise<Pool> {
  const memoryDb = newDb();
  const { Pool: MemoryPool } = memoryDb.adapters.createPg();
  const pool = new MemoryPool() as unknown as Pool;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.resumes (
      id BIGSERIAL PRIMARY KEY,
      owner_hash TEXT NOT NULL,
      title TEXT NOT NULL,
      template_id TEXT NOT NULL DEFAULT 'modern',
      state TEXT NOT NULL DEFAULT 'DRAFT',
      current_version_id BIGINT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      is_deleted BOOLEAN NOT NULL DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS public.resume_versions (
      id BIGSERIAL PRIMARY KEY,
      resume_id BIGINT NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
      content JSONB NOT NULL,
      created_from_version_id BIGINT REFERENCES public.resume_versions(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE public.resumes 
    ADD CONSTRAINT resumes_current_version_id_fkey 
    FOREIGN KEY (current_version_id) 
    REFERENCES public.resume_versions(id) 
    ON DELETE SET NULL;

    CREATE INDEX IF NOT EXISTS resumes_owner_active_updated_idx
      ON public.resumes (owner_hash, updated_at DESC)
      WHERE is_deleted = FALSE;

    CREATE INDEX IF NOT EXISTS resumes_expiry_idx
      ON public.resumes (expires_at);

    CREATE INDEX IF NOT EXISTS resume_versions_resume_created_idx
      ON public.resume_versions (resume_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS public.ai_usage_records (
      enforcement_key TEXT PRIMARY KEY,
      generating_since TIMESTAMPTZ,
      active_request_id TEXT,
      last_request_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '31 days'
    );

    CREATE TABLE IF NOT EXISTS public.ai_usage_events (
      request_id TEXT PRIMARY KEY,
      enforcement_key TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'accepted',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.payment_transactions (
      id TEXT PRIMARY KEY,
      idempotency_key TEXT NOT NULL UNIQUE,
      resume_id BIGINT NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
      owner_hash TEXT NOT NULL,
      provider TEXT NOT NULL,
      status TEXT NOT NULL,
      amount DECIMAL NOT NULL,
      currency TEXT NOT NULL,
      provider_reference TEXT,
      download_token_hash TEXT,
      download_token_expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS payment_transactions_active_resume_owner_idx
      ON public.payment_transactions (resume_id, owner_hash, provider)
      WHERE status IN ('created', 'redirected', 'pending_verification');

    CREATE UNIQUE INDEX IF NOT EXISTS payment_transactions_provider_reference_idx
      ON public.payment_transactions (provider, provider_reference)
      WHERE provider_reference IS NOT NULL;

    CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      event_id TEXT NOT NULL,
      transaction_id TEXT,
      received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (provider, event_id)
    );
  `);

  return pool;
}

export async function getDb(): Promise<Pool> {
  if (!poolPromise) {
    poolPromise = (async () => {
      const databaseUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
      if (databaseUrl) {
        let ssl: false | { rejectUnauthorized: boolean };
        try {
          const parsedUrl = new URL(databaseUrl);
          const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(parsedUrl.hostname);
          const explicitlyRequired = parsedUrl.searchParams.get('sslmode') === 'require';
          ssl = !isLocalHost || explicitlyRequired || process.env.POSTGRES_SSL === 'true'
            ? { rejectUnauthorized: process.env.POSTGRES_SSL_REJECT_UNAUTHORIZED === 'true' }
            : false;
        } catch {
          ssl = process.env.POSTGRES_SSL === 'true'
            ? { rejectUnauthorized: process.env.POSTGRES_SSL_REJECT_UNAUTHORIZED === 'true' }
            : false;
        }

        return new Pool({ connectionString: databaseUrl, ssl });
      }

      const instanceConnectionName = process.env.CLOUD_SQL_CONNECTION_NAME;
      const user = process.env.DB_USER;
      const password = process.env.DB_PASSWORD;
      const database = process.env.DB_NAME;

      if (!instanceConnectionName || !user || !password || !database) {
        console.warn('No Postgres environment is configured. Falling back to an in-memory PostgreSQL database for local development.');
        return createMemoryPool();
      }

      connector = new Connector();
      const connectorOptions = await connector.getOptions({
        instanceConnectionName,
        ipType: process.env.CLOUD_SQL_IP_TYPE === 'PRIVATE'
          ? IpAddressTypes.PRIVATE
          : IpAddressTypes.PUBLIC,
      });

      return new Pool({
        ...connectorOptions,
        user,
        password,
        database,
        max: 5,
      });
    })().catch((error: unknown) => {
      connector?.close();
      connector = undefined;
      // We remove the line that resets poolPromise to undefined here to prevent
      // rapid-fire recreation of pools on repeated failures. 
      // The next request will try again, but we don't want to spam the server.
      throw error;
    });
  }

  return poolPromise;
}

/**
 * Performs a lightweight health check on the database connection.
 * Returns true if the database is reachable and responding.
 */
export async function checkDbHealth(): Promise<{ ok: boolean; error?: string }> {
  try {
    const db = await getDb();
    await db.query('SELECT 1');
    return { ok: true };
  } catch (error: any) {
    console.error('[DB Health Check] Connection failed:', error);
    return { ok: false, error: error.message };
  }
}
