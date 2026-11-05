
import { getDb } from '@/lib/db';

/**
 * Deletes resumes and their associated versions that have passed their expiry date
 * or have been marked as deleted.
 * 
 * This is designed to be called by a cron job or periodically by the application
 * to ensure that temporary anonymous data does not persist indefinitely.
 */
export async function cleanupExpiredResumes(): Promise<{ deletedCount: number }> {
  const db = await getDb();
  
  try {
    // We use a transaction to ensure that the cleanup is atomic.
    // Since resume_versions has ON DELETE CASCADE, deleting from resumes
    // will automatically clean up the versions.
    await db.query('BEGIN');

    const result = await db.query(
      `DELETE FROM public.resumes 
       WHERE expires_at < NOW() OR is_deleted = true`
    );

    await db.query('COMMIT');

    return { deletedCount: result.rowCount ?? 0 };
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('[Cleanup] Failed to delete expired resumes:', error);
    throw error;
  }
}
