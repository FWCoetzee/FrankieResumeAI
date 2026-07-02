
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { z } from 'zod';
import { generatedResumeSchema } from '@/lib/schema';

// This is the input we expect from the client
const saveEditSchema = z.object({
    editedContent: generatedResumeSchema,
});

async function verifyOwnership(resumeId: number, userId: number) {
    const db = getDb();
    const res = await db.query('SELECT id FROM resumes WHERE id = $1 AND user_id = $2', [resumeId, userId]);
    return res.rows.length > 0;
}

export async function POST(request: Request, { params }: { params: Promise<{ resumeId: string }> }) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized: No active user session.' }, { status: 401 });
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
    const db = getDb();
    
    try {
        await db.query('BEGIN');

        const userRes = await db.query('SELECT id FROM users WHERE firebase_uid = $1', [user.uid]);
        if (userRes.rows.length === 0) {
            await db.query('ROLLBACK');
            return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
        }
        const userId = userRes.rows[0].id;
        
        if (!(await verifyOwnership(resumeId, userId))) {
            await db.query('ROLLBACK');
            return NextResponse.json({ error: 'Forbidden: You do not own this resume.' }, { status: 403 });
        }
        
        const resumeRes = await db.query('SELECT current_version_id FROM resumes WHERE id = $1', [resumeId]);
        const sourceVersionId = resumeRes.rows[0].current_version_id;

        // Create a new version with the user's edits
        const newVersionRes = await db.query(
            'INSERT INTO resume_versions (resume_id, content, created_from_version_id) VALUES ($1, $2, $3) RETURNING id',
            [resumeId, JSON.stringify(editedContent), sourceVersionId]
        );
        const newVersionId = newVersionRes.rows[0].id;

        // Update the resume to point to the new version and set state to USER_EDITED
        await db.query(
            'UPDATE resumes SET current_version_id = $1, state = $2, updated_at = NOW() WHERE id = $3',
            [newVersionId, 'USER_EDITED', resumeId]
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
