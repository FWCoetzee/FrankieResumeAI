import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { z } from 'zod';
import { generatedResumeSchema } from '@/lib/schema';
import { getAnonymousOwnerHashFromRequest } from '@/lib/anonymous-session';
import { touchOwnedResume, verifyOwnedActiveResume } from '@/lib/resume-owner';

// This is the input we expect from the client
const saveEditSchema = z.object({
    editedContent: generatedResumeSchema,
});

export async function POST(request: Request, { params }: { params: Promise<{ resumeId: string }> }) {
    const ownerHash = getAnonymousOwnerHashFromRequest(request);
    if (!ownerHash) {
        return NextResponse.json({ error: 'Unauthorized: No anonymous session found.' }, { status: 401 });
    }

    const { resumeId: resumeIdParam } = await params;
    const resumeId = parseInt(resumeIdParam, 10);
    if (isNaN(resumeId)) {
        return NextResponse.json({ error: 'Invalid resume ID' }, { status: 400 });
    }
    
    const body = await request.json();
    const parsed = saveEditSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid input', details: parsed.error.errors }, { status: 400 });
    }

    const { editedContent } = parsed.data;
    const db = await getDb();
    
    try {
        await db.query('BEGIN');

        if (!(await verifyOwnedActiveResume(db, resumeId, ownerHash))) {
            await db.query('ROLLBACK');
            return NextResponse.json({ error: 'Forbidden: You do not own this resume.' }, { status: 403 });
        }
        
        await touchOwnedResume(db, resumeId, ownerHash);
        const resumeRes = await db.query('SELECT current_version_id FROM resumes WHERE id = $1 AND owner_hash = $2', [resumeId, ownerHash]);
        const sourceVersionId = resumeRes.rows[0].current_version_id;

        const newVersionRes = await db.query(
            'INSERT INTO resume_versions (resume_id, content, created_from_version_id) VALUES ($1, $2, $3) RETURNING id',
            [resumeId, JSON.stringify(editedContent), sourceVersionId]
        );
        const newVersionId = newVersionRes.rows[0].id;

        await db.query(
            'UPDATE resumes SET current_version_id = $1, state = $2, updated_at = NOW() WHERE id = $3 AND owner_hash = $4',
            [newVersionId, 'USER_EDITED', resumeId, ownerHash]
        );
        
        await db.query('COMMIT');
        
        return NextResponse.json({
            message: 'Edit saved successfully.',
            newVersionId: newVersionId,
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error(`Failed to save edit for resume ${resumeId}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: `Internal Server Error: ${errorMessage}` }, { status: 500 });
    }
}
