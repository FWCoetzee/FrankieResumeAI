// Creator: Franklin Coetzee
// ID number: 8510305083081
// Email: salazar3593@gmail.com
// Built with AI assistance

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { deleteExpiredResumes } from '@/lib/resume-owner';
import { deleteExpiredUsageRecords } from '@/lib/abuse-limit';

export async function POST(request: Request) {
  const expectedSecret = process.env.CLEANUP_SECRET;
  const providedSecret = request.headers.get('x-cleanup-secret');

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDb();
  const deletedResumeCount = await deleteExpiredResumes(db);
  const deletedUsageRecordCount = await deleteExpiredUsageRecords(db);

  return NextResponse.json({ deletedResumeCount, deletedUsageRecordCount });
}
