// Creator: Franklin Coetzee
// ID number: 8510305083081
// Email: salazar3593@gmail.com
// Built with AI assistance

import { deleteNeonStorageObject, getNeonStorageObject, putNeonStorageObject } from './neon-storage';
import { getDb } from './db';
import test from 'node:test';

test('Neon services are reachable', { skip: process.env.RUN_NEON_TESTS !== 'true' }, async () => {
  const { deleteNeonStorageObject, getNeonStorageObject, putNeonStorageObject } = await import('./neon-storage');
  const { getDb } = await import('./db');

  const db = await getDb();
  const databaseResult = await db.query('SELECT NOW() AS server_time, current_database() AS database_name');
  console.log(`PostgreSQL: connected to ${databaseResult.rows[0].database_name} at ${databaseResult.rows[0].server_time}`);

  const key = `health-check/${Date.now()}.txt`;
  await putNeonStorageObject('assets', key, new TextEncoder().encode('Neon Object Storage health check'), 'text/plain');
  const downloaded = new TextDecoder().decode(await getNeonStorageObject('assets', key));
  if (downloaded !== 'Neon Object Storage health check') throw new Error('Object storage round-trip returned unexpected data.');
  await deleteNeonStorageObject('assets', key);
  console.log(`Object Storage: uploaded, downloaded, and deleted ${key}`);
});
