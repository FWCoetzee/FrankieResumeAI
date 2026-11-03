import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAnonymousOwnerHashFromRequest } from '@/lib/anonymous-session';
import { touchOwnedResume, verifyOwnedActiveResume } from '@/lib/resume-owner';

export async function GET(request: Request, { params }: { params: Promise<{ resumeId: string }> }) {
    const ownerHash = getAnonymousOwnerHashFromRequest(request);
    if (!ownerHash) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resumeId: resumeIdParam } = await params;
    const resumeId = parseInt(resumeIdParam, 10);
    if (isNaN(resumeId)) {
        return NextResponse.json({ error: 'Invalid resume ID' }, { status: 400 });
    }

    const db = await getDb();
    try {
        if (!(await verifyOwnedActiveResume(db, resumeId, ownerHash))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        await touchOwnedResume(db, resumeId, ownerHash);

        const resumeRes = await db.query(
            `SELECT
                r.id AS "resumeId",
                r.owner_hash AS "ownerHash",
                r.title,
                r.template_id as "templateId",
                r.state as "status",
                r.created_at as "createdAt",
                r.updated_at as "updatedAt",
                rv.content as sections,
                rv.content -> 'settings' as settings
             FROM resumes r
             JOIN resume_versions rv ON r.current_version_id = rv.id
             WHERE r.id = $1`,
            [resumeId]
        );

        if (resumeRes.rows.length === 0) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        const resume = resumeRes.rows[0];
        return NextResponse.json({
            resumeId: resume.resumeId,
            ownerId: resume.ownerHash,
            title: resume.title,
            templateId: resume.templateId,
            status: resume.status,
            createdAt: resume.createdAt,
            updatedAt: resume.updatedAt,
            sections: resume.sections,
            settings: resume.settings,
        });
    } catch (error) {
        console.error(`Failed to fetch resume ${resumeId}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ resumeId: string }> }) {
    const ownerHash = getAnonymousOwnerHashFromRequest(request);
    if (!ownerHash) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resumeId: resumeIdParam } = await params;
    const resumeId = parseInt(resumeIdParam, 10);
    if (isNaN(resumeId)) {
        return NextResponse.json({ error: 'Invalid resume ID' }, { status: 400 });
    }

    const db = await getDb();
    try {
        if (!(await verifyOwnedActiveResume(db, resumeId, ownerHash))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await db.query(
            'UPDATE resumes SET is_deleted = true, updated_at = NOW() WHERE id = $1 AND owner_hash = $2',
            [resumeId, ownerHash]
        );

        return NextResponse.json({ message: 'Resume deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error(`Failed to delete resume ${resumeId}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
