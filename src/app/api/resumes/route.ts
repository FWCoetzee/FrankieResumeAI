
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { z } from 'zod';
import { getAnonymousOwnerHashFromRequest } from '@/lib/anonymous-session';

const createResumeSchema = z.object({
    title: z.string().min(1, 'Title is required'),
});

export async function POST(request: Request) {
    const ownerHash = getAnonymousOwnerHashFromRequest(request);
    if (!ownerHash) {
        return NextResponse.json({ error: 'Unauthorized: No anonymous session found.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createResumeSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
    }

    const { title } = parsed.data;
    const db = await getDb();

    try {
        await db.query('BEGIN');

        const resumeRes = await db.query(
            'INSERT INTO resumes (owner_hash, title, state, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL \'1 day\') RETURNING id',
            [ownerHash, title, 'DRAFT']
        );
        const resumeId = resumeRes.rows[0].id;

        const versionRes = await db.query(
            'INSERT INTO resume_versions (resume_id, content) VALUES ($1, $2) RETURNING id',
            [resumeId, JSON.stringify({ sections: {} })]
        );
        const versionId = versionRes.rows[0].id;

        await db.query('UPDATE resumes SET current_version_id = $1 WHERE id = $2', [versionId, resumeId]);

        await db.query('COMMIT');

        return NextResponse.json({ resumeId, versionId }, { status: 201 });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Failed to create resume:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const ownerHash = getAnonymousOwnerHashFromRequest(request);
    if (!ownerHash) {
        return NextResponse.json({ error: 'Unauthorized: No anonymous session found.' }, { status: 401 });
    }

    const db = await getDb();
    try {
        const resumesRes = await db.query(
            'SELECT id as "resumeId", title, template_id as "templateId", state, updated_at as "updatedAt" FROM resumes WHERE owner_hash = $1 AND is_deleted = false AND expires_at > NOW() ORDER BY updated_at DESC',
            [ownerHash]
        );

        return NextResponse.json(resumesRes.rows);
    } catch (error) {
        console.error('Failed to fetch resumes:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
