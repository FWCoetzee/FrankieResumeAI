
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { z } from 'zod';

const createResumeSchema = z.object({
    title: z.string().min(1, 'Title is required'),
});

export async function POST(request: Request) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized: No active user session.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createResumeSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
    }

    const { title } = parsed.data;
    const db = getDb();

    try {
        await db.query('BEGIN');

        // Find or create user in our database
        let res = await db.query('SELECT id FROM users WHERE firebase_uid = $1', [user.uid]);
        let userId;
        if (res.rows.length === 0) {
            res = await db.query(
                'INSERT INTO users (firebase_uid, email, display_name) VALUES ($1, $2, $3) RETURNING id',
                [user.uid, user.email, user.name]
            );
            userId = res.rows[0].id;
        } else {
            userId = res.rows[0].id;
        }

        // Create the resume metadata
        const resumeRes = await db.query(
            'INSERT INTO resumes (user_id, title, state) VALUES ($1, $2, $3) RETURNING id',
            [userId, title, 'DRAFT']
        );
        const resumeId = resumeRes.rows[0].id;

        // Create the initial empty version
        const versionRes = await db.query(
            'INSERT INTO resume_versions (resume_id, content) VALUES ($1, $2) RETURNING id',
            [resumeId, JSON.stringify({ sections: {} })]
        );
        const versionId = versionRes.rows[0].id;

        // Link the resume to its initial version
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
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized: No active user session.' }, { status: 401 });
    }

    const db = getDb();
    try {
        const userRes = await db.query('SELECT id FROM users WHERE firebase_uid = $1', [user.uid]);
        if (userRes.rows.length === 0) {
            return NextResponse.json([], { status: 200 }); // No user, no resumes
        }
        const userId = userRes.rows[0].id;

        // Query to get the list of resumes (metadata only)
        const resumesRes = await db.query(
            'SELECT id as "resumeId", title, template_id as "templateId", state, updated_at as "updatedAt" FROM resumes WHERE user_id = $1 AND is_deleted = false ORDER BY updated_at DESC',
            [userId]
        );

        return NextResponse.json(resumesRes.rows);
    } catch (error) {
        console.error('Failed to fetch resumes:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
