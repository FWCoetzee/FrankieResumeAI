// Creator: Franklin Coetzee
// ID number: 8510305083081
// Email: salazar3593@gmail.com
// Built with AI assistance

import type { Pool } from 'pg';

export async function verifyOwnedActiveResume(
  db: Pool,
  resumeId: number,
  ownerHash: string
): Promise<boolean> {
  const result = await db.query(
    `SELECT id
     FROM public.resumes
     WHERE id = $1
       AND owner_hash = $2
       AND is_deleted = FALSE
       AND expires_at > NOW()`,
    [resumeId, ownerHash]
  );

  return result.rows.length > 0;
}

export async function touchOwnedResume(
  db: Pool,
  resumeId: number,
  ownerHash: string
): Promise<boolean> {
  const result = await db.query(
    `UPDATE public.resumes
     SET expires_at = NOW() + INTERVAL '1 day', updated_at = NOW()
     WHERE id = $1
       AND owner_hash = $2
       AND is_deleted = FALSE
       AND expires_at > NOW()
     RETURNING id`,
    [resumeId, ownerHash]
  );

  return result.rows.length > 0;
}

export async function deleteExpiredResumes(db: Pool): Promise<number> {
  const result = await db.query(
    `DELETE FROM public.resumes
     WHERE expires_at <= NOW() OR is_deleted = TRUE`
  );

  return result.rowCount ?? 0;
}
