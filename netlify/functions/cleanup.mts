import { deleteExpiredUsageRecords } from '../../src/lib/abuse-limit';
import { deleteExpiredResumes } from '../../src/lib/resume-owner';
import { getDb } from '../../src/lib/db';

export default async function cleanup() {
  const db = await getDb();

  const deletedResumeCount = await deleteExpiredResumes(db);
  const deletedUsageRecordCount = await deleteExpiredUsageRecords(db);

  console.log('Cleanup complete', {
    deletedResumeCount,
    deletedUsageRecordCount,
  });
}

export const config = {
  schedule: '@daily',
};