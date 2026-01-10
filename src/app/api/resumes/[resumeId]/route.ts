
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

async function verifyOwnership(resumeId: number, userId: number) {
    const db = getDb();
    const res = await db.query('SELECT id FROM resumes WHERE id = $1 AND user_id = $2', [resumeId, userId]);
    return res.rows.length > 0;
}

export async function GET(request: Request, { params }: { params: { resumeId: string } }) {
    const user = await getAuthenticatedUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resumeId = parseInt(params.resumeId, 10);
    if (isNaN(resumeId)) {
        return NextResponse.json({ error: 'Invalid resume ID' }, { status: 400 });
    }

    const db = getDb();
    try {
        const userRes = await db.query('SELECT id FROM users WHERE firebase_uid = $1', [user.uid]);
        if (userRes.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const userId = userRes.rows[0].id;

        if (!(await verifyOwnership(resumeId, userId))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const resumeRes = await db.query(
            `SELECT
                r.id AS "resumeId",
                r.user_id AS "ownerId",
                r.title,
                r.template_id as "templateId",
                r.state as "status",
                r.created_at as "createdAt",
                r.updated_at as "updatedAt",
                rv.content -> 'sections' as sections,
                rv.content -> 'settings' as settings
             FROM resumes r
             JOIN resume_versions rv ON r.current_version_id = rv.id
             WHERE r.id = $1`,
            [resumeId]
        );

        if (resumeRes.rows.length === 0) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        return NextResponse.json(resumeRes.rows[0]);
    } catch (error) {
        console.error(`Failed to fetch resume ${resumeId}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


export async function DELETE(request: Request, { params }: { params: { resumeId: string } }) {
    const user = await getAuthenticatedUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const resumeId = parseInt(params.resumeId, 10);
     if (isNaN(resumeId)) {
        return NextResponse.json({ error: 'Invalid resume ID' }, { status: 400 });
    }

    const db = getDb();
    try {
        const userRes = await db.query('SELECT id FROM users WHERE firebase_uid = $1', [user.uid]);
        if (userRes.rows.length === 0) {
             return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const userId = userRes.rows[0].id;

        if (!(await verifyOwnership(resumeId, userId))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await db.query(
            'UPDATE resumes SET is_deleted = true, updated_at = NOW() WHERE id = $1',
            [resumeId]
        );

        return NextResponse.json({ message: 'Resume deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error(`Failed to delete resume ${resumeId}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
