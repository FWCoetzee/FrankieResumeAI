import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { z } from 'zod';
import {
    generateResumeFromData,
    GenerateResumeFromDataInputSchema,
    type GenerateResumeFromDataInput,
} from '@/ai/flows/generate-resume-from-data';
import { type ResumeData } from '@/lib/schema';
import { getAnonymousOwnerHashFromRequest } from '@/lib/anonymous-session';
import { beginGeneration, createEnforcementKey, finishGeneration, getClientIp } from '@/lib/abuse-limit';
import {
    classifyProviderError,
    logGenerationCheck,
    verifyGeneratedResume,
} from '@/lib/generation-verification';

// This is a partial schema, as the full resume data will be sent.
// We just validate that the 'sections' part exists.
const generateSchema = z.object({
    resumeData: z.object({
      title: z.string(),
      sections: z.object({}).passthrough(),
    }).passthrough(),
});


async function verifyOwnership(resumeId: number, ownerHash: string) {
    const db = await getDb();
    const res = await db.query('SELECT id FROM resumes WHERE id = $1 AND owner_hash = $2 AND expires_at > NOW()', [resumeId, ownerHash]);
    return res.rows.length > 0;
}


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
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid input', details: parsed.error.errors }, { status: 400 });
    }

    const { resumeData } = parsed.data as { resumeData: ResumeData };

    const db = await getDb();
    if (!(await verifyOwnership(resumeId, ownerHash))) {
        logGenerationCheck('ownership', 'failed', { resumeId });
        return NextResponse.json({ error: 'Forbidden: You do not own this resume.' }, { status: 403 });
    }
    logGenerationCheck('ownership', 'passed', { resumeId });

    const enforcementKey = createEnforcementKey(ownerHash, getClientIp(request.headers), request.headers.get('user-agent') ?? 'unknown');
    const limit = await beginGeneration(db, enforcementKey);
    if (!limit.allowed) {
        logGenerationCheck('rate-limit', 'failed', { resumeId });
        return NextResponse.json(
            { error: limit.message, retryAfterSeconds: limit.retryAfterSeconds },
            { status: limit.status, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
        );
    }
    logGenerationCheck('rate-limit', 'passed', { resumeId, requestId: limit.requestId });

    let transactionStarted = false;
    let providerCompleted = false;
    try {
        const resumeRes = await db.query('SELECT current_version_id FROM resumes WHERE id = $1', [resumeId]);
        const sourceVersionId = resumeRes.rows[0].current_version_id;

        // This payload MUST match the GenerateResumeFromDataInput schema
        const aiPayload: GenerateResumeFromDataInput = {
            target_job_title: resumeData.title,
            resume_intent: "Tech (ATS-Optimized)", // TODO: Capture this from the user
            experience_level: "Mid-level", // TODO: Capture this from the user
            resume_style: "Modern", // TODO: Capture this from the user
            language: "English", // TODO: Capture this from the user
            personal_info: {
                full_name: resumeData.fullName || "",
                email: resumeData.email || "",
                phone: resumeData.phone || "",
                location: resumeData.location || "",
                website: resumeData.website || "",
                summary: resumeData.sections.summary?.content || "",
            },
            work_experience: resumeData.sections.experience?.map(exp => ({
                job_title: exp.role,
                company: exp.company,
                start_date: exp.startDate,
                end_date: exp.endDate || undefined,
                responsibilities: exp.bullets?.join('\n') || '',
                achievements: exp.bullets?.join('\n') || '',
            })) || [],
            education: resumeData.sections.education?.map(edu => ({
                degree: edu.degree,
                institution: edu.institution,
                start_year: edu.startYear,
                end_year: edu.endYear,
            })) || [],
            skills: resumeData.sections.skills || [],
            projects: resumeData.sections.projects?.map(proj => ({
                title: proj.title,
                description: proj.description || '',
                technologies: [], // Can be extracted from description if needed in future
            })) || [],
            certifications: resumeData.sections.certifications || [],
            references: resumeData.sections.references?.map(ref => ({ name: ref.name, contact: ref.contact })) || [],
        };

        const parsedPayload = GenerateResumeFromDataInputSchema.safeParse(aiPayload);
        if (!parsedPayload.success) {
            await finishGeneration(db, enforcementKey, limit.requestId, false);
            logGenerationCheck('input-validation', 'failed', { resumeId, requestId: limit.requestId });
            return NextResponse.json(
                { error: 'Resume data exceeds the supported generation limits.', details: parsedPayload.error.flatten() },
                { status: 400 }
            );
        }
        logGenerationCheck('input-validation', 'passed', { resumeId, requestId: limit.requestId });

        const resumeResult = await generateResumeFromData(aiPayload);
        logGenerationCheck('provider', 'passed', { resumeId, requestId: limit.requestId });
        providerCompleted = true;

        if (!verifyGeneratedResume(resumeResult)) {
            await finishGeneration(db, enforcementKey, limit.requestId, false);
            logGenerationCheck('output-validation', 'failed', { resumeId, requestId: limit.requestId });
            return NextResponse.json(
                { error: 'The AI provider returned an invalid resume. Please try again.' },
                { status: 502 }
            );
        }
        logGenerationCheck('output-validation', 'passed', { resumeId, requestId: limit.requestId });

        await db.query('BEGIN');
        transactionStarted = true;

        const newVersionRes = await db.query(
            'INSERT INTO resume_versions (resume_id, content, created_from_version_id) VALUES ($1, $2, $3) RETURNING id',
            [resumeId, JSON.stringify(resumeResult), sourceVersionId]
        );
        const newVersionId = newVersionRes.rows[0].id;

        await db.query(
            'UPDATE resumes SET current_version_id = $1, state = $2, updated_at = NOW() WHERE id = $3',
            [newVersionId, 'AI_GENERATED', resumeId]
        );
        
        await db.query('COMMIT');
        transactionStarted = false;

        await finishGeneration(db, enforcementKey, limit.requestId, true);
        logGenerationCheck('database', 'passed', { resumeId, requestId: limit.requestId });
        logGenerationCheck('completed', 'passed', { resumeId, requestId: limit.requestId });
        
        return NextResponse.json({
            resume: resumeResult,
            savedResumeId: resumeId,
        });

    } catch (error) {
        await finishGeneration(db, enforcementKey, limit.requestId, false);
        if (transactionStarted) {
            await db.query('ROLLBACK');
        }
        const providerMessage = error instanceof Error ? error.message : String(error);
        const providerCategory = classifyProviderError(providerMessage);
        logGenerationCheck(providerCompleted ? 'database' : 'provider', 'failed', { resumeId, requestId: limit.requestId });
        console.error(`[AI generation] category=${providerCategory} resumeId=${resumeId} requestId=${limit.requestId}`);
        return NextResponse.json(
            { error: 'AI generation is temporarily unavailable. Please try again shortly.' },
            { status: 503 }
        );
    }
}
