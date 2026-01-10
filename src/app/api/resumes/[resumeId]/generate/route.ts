
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { z } from 'zod';
import { generateResumeFromData, type GenerateResumeFromDataInput } from '@/ai/flows/generate-resume-from-data';
import { provideResumeSuggestions, type ProvideResumeSuggestionsInput } from '@/ai/flows/provide-resume-suggestions';
import { generateCoverLetterFromData, type GenerateCoverLetterFromDataInput } from '@/ai/flows/generate-cover-letter-from-data';
import { generateLinkedInProfile, type GenerateLinkedInProfileInput } from '@/ai/flows/generate-linkedin-profile';
import { resumeSchema, type ResumeData } from '@/lib/schema';

// This is a partial schema, as the full resume data will be sent.
// We just validate that the 'sections' part exists.
const generateSchema = z.object({
    resumeData: z.object({
      title: z.string(),
      sections: z.object({}).passthrough(),
    }).passthrough(),
});


async function verifyOwnership(resumeId: number, userId: number) {
    const db = getDb();
    const res = await db.query('SELECT id FROM resumes WHERE id = $1 AND user_id = $2', [resumeId, userId]);
    return res.rows.length > 0;
}


export async function POST(request: Request, { params }: { params: { resumeId: string } }) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized: No active user session.' }, { status: 401 });
    }

    const resumeId = parseInt(params.resumeId, 10);
    if (isNaN(resumeId)) {
        return NextResponse.json({ error: 'Invalid resume ID' }, { status: 400 });
    }
    
    const body = await request.json();
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid input', details: parsed.error.errors }, { status: 400 });
    }

    const { resumeData } = parsed.data as { resumeData: ResumeData };

    const db = getDb();
    
    try {
        const userRes = await db.query('SELECT id FROM users WHERE firebase_uid = $1', [user.uid]);
        if (userRes.rows.length === 0) {
            return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
        }
        const userId = userRes.rows[0].id;
        
        if (!(await verifyOwnership(resumeId, userId))) {
            return NextResponse.json({ error: 'Forbidden: You do not own this resume.' }, { status: 403 });
        }
        
        const resumeRes = await db.query('SELECT current_version_id FROM resumes WHERE id = $1', [resumeId]);
        const sourceVersionId = resumeRes.rows[0].current_version_id;

        // This payload MUST match the GenerateResumeFromDataInput schema
        const aiPayload: GenerateResumeFromDataInput = {
            target_job_title: resumeData.title,
            resume_intent: "Tech (ATS-Optimized)", // Example value, could be dynamic in future
            experience_level: "Mid-level", // Example value
            resume_style: "Modern", // Example value
            language: "English", // Example value
            personal_info: {
                full_name: user.name || "User",
                email: user.email || "",
                phone: "", // This field can be added to user profile later
                location: "", // This field can be added to user profile later
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
                description: proj.description,
                technologies: [], // Can be extracted from description if needed in future
            })) || [],
            certifications: resumeData.sections.certifications || [],
            references: resumeData.sections.references?.map(ref => ({ name: ref.name, contact: ref.contact })) || [],
        };

        const jobDescForAI = `A generic role for a candidate with skills like ${resumeData.sections.skills?.join(', ')}.`;

        const [resumeResult, suggestionsResult, coverLetterResult, linkedInResult] = await Promise.all([
            generateResumeFromData(aiPayload),
            provideResumeSuggestions({ ...aiPayload, jobDescription: jobDescForAI } as ProvideResumeSuggestionsInput),
            generateCoverLetterFromData({ ...aiPayload, jobDescription: jobDescForAI } as GenerateCoverLetterFromDataInput),
            generateLinkedInProfile(aiPayload as GenerateLinkedInProfileInput)
        ]);

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
