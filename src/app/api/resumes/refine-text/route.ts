import { NextResponse } from 'next/server';
import { editResumeText, type EditResumeTextInput } from '@/ai/flows/edit-resume-text';
import { getAnonymousOwnerHashFromRequest } from '@/lib/anonymous-session';
import { getDb } from '@/lib/db';
import { z } from 'zod';

const refineSchema = z.object({
  resumeId: z.number(),
  payload: z.object({
    mode: z.string(),
    content: z.string(),
    targetJob: z.string().optional(),
    tone: z.string().optional(),
    length: z.string().optional(),
  }),
});

async function verifyOwnership(resumeId: number, ownerHash: string) {
  const db = await getDb();
  const res = await db.query(
    'SELECT id FROM resumes WHERE id = $1 AND owner_hash = $2 AND expires_at > NOW()',
    [resumeId, ownerHash]
  );
  return res.rows.length > 0;
}

export async function POST(request: Request) {
  const ownerHash = getAnonymousOwnerHashFromRequest(request);
  if (!ownerHash) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = refineSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
    }

    const { resumeId, payload } = parsed.data;

    if (!(await verifyOwnership(resumeId, ownerHash))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const editedText = await editResumeText(payload as EditResumeTextInput);

    return NextResponse.json({ editedText });
  } catch (error) {
    console.error('Refine Text Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
