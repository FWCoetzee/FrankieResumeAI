import test from 'node:test';
import assert from 'node:assert/strict';

import { getDb } from './db';

test('getDb falls back to an in-memory PostgreSQL database when no env vars are configured', async () => {
  const previousEnv = { ...process.env };

  try {
    delete process.env.POSTGRES_URL;
    delete process.env.CLOUD_SQL_CONNECTION_NAME;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_NAME;

    const db = await getDb();
    const result = await db.query('SELECT 1 AS ok');

    assert.deepEqual(result.rows, [{ ok: 1 }]);
    await db.end();
  } finally {
    process.env = previousEnv;
  }
});
