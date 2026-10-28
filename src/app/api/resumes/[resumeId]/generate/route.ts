
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { z } from 'zod';
import { generateResumeFromData, type GenerateResumeFromDataInput } from '@/ai/flows/generate-resume-from-data';
import { provideResumeSuggestions, type ProvideResumeSuggestionsInput } from '@/ai/flows/provide-resume-suggestions';
import { generateCoverLetterFromData, type GenerateCoverLetterFromDataInput } from '@/ai/flows/generate-cover-letter-from-data';
import { generateLinkedInProfile, type GenerateLinkedInProfileInput } from '@/ai/flows/generate-linkedin-profile';
import { analyzeTailoring } from '@/ai/flows/analyze-tailoring';
import { type ResumeData } from '@/lib/schema';
import { getAnonymousOwnerHashFromRequest } from '@/lib/anonymous-session';
import { checkAnonymousGenerationLimit } from '@/lib/abuse-limit';

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

    const limit = checkAnonymousGenerationLimit(ownerHash);
    if (!limit.allowed) {
        return NextResponse.json(
            {
                error: 'Too many resume generation requests. Please try again later.',
                retryAfterSeconds: limit.retryAfterSeconds,
            },
            {
                status: 429,
                headers: {
                    'Retry-After': String(limit.retryAfterSeconds ?? 60),
                },
            }
        );
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
    
    try {
        if (!(await verifyOwnership(resumeId, ownerHash))) {
            return NextResponse.json({ error: 'Forbidden: You do not own this resume.' }, { status: 403 });
        }
        
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
                full_name: "User",
                email: "",
                phone: resumeData.phone || "",
                location: resumeData.location || "",
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

        const jobDescForAI = resumeData.jobDescription || `A generic role for a candidate with skills like ${resumeData.sections.skills?.join(', ')}.`;

        const [resumeResult, suggestionsResult, coverLetterResult, linkedInResult] = await Promise.all([
            generateResumeFromData(aiPayload),
            provideResumeSuggestions({ ...aiPayload, jobDescription: jobDescForAI } as ProvideResumeSuggestionsInput),
            generateCoverLetterFromData({ ...aiPayload, jobDescription: jobDescForAI } as GenerateCoverLetterFromDataInput),
            generateLinkedInProfile(aiPayload as GenerateLinkedInProfileInput)
        ]);

        const tailoringAnalysis = await analyzeTailoring({
            jobDescription: jobDescForAI,
            resume: resumeResult,
        });

        await db.query('BEGIN');

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
        
        return NextResponse.json({
            resume: resumeResult,
            suggestions: suggestionsResult.suggestions,
            coverLetter: coverLetterResult,
            linkedin: linkedInResult,
            tailoring: tailoringAnalysis,
            savedResumeId: resumeId,
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error(`Failed to generate for resume ${resumeId}:`, error);
        if (error instanceof Error) {
            return NextResponse.json({ error: `An unexpected error occurred: ${error.message}` }, { status: 500 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
