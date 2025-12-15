
"use client";

import { generateResumeFromData, type GenerateResumeFromDataInput, type GenerateResumeFromDataOutput } from "@/ai/flows/generate-resume-from-data";
import { provideResumeSuggestions, type ProvideResumeSuggestionsInput, type ProvideResumeSuggestionsOutput } from "@/ai/flows/provide-resume-suggestions";
import { generateCoverLetterFromData, type GenerateCoverLetterFromDataInput } from "@/ai/flows/generate-cover-letter-from-data";
import { generateLinkedInProfile, type GenerateLinkedInProfileInput, type GenerateLinkedInProfileOutput } from "@/ai/flows/generate-linkedin-profile";
import type { ResumeData, ResumeFormData } from "@/lib/schema";
import { saveOrUpdateResumeDataClient } from "@/lib/client-firestore";
import { v4 as uuidv4 } from "uuid";

// This function now expects the form data directly and the user ID.
export async function generateResumeAction(
  userId: string,
  userName: string | null,
  userEmail: string | null,
  formData: ResumeFormData,
  resumeId?: string // Pass existing resumeId if updating
): Promise<{
  error?: string;
  resume?: GenerateResumeFromDataOutput;
  suggestions?: string;
  coverLetter?: string;
  linkedin?: GenerateLinkedInProfileOutput;
  savedResumeId?: string;
}> {

  // This payload is a simplified version that directly uses form data.
  // The AI flows are designed to handle this structure.
  const aiPayload = {
    target_job_title: formData.title,
    // Provide sensible defaults for fields not in the simplified form.
    resume_intent: "Tech (ATS-Optimized)",
    experience_level: "Mid-level",
    resume_style: "Modern",
    language: "English",
    personal_info: {
      full_name: userName || "User", // This data would ideally come from the user's profile
      email: userEmail || "",
      phone: "",
      location: "",
      summary: formData.sections.summary?.content || "",
    },
    work_experience: formData.sections.experience.map(exp => ({
        job_title: exp.role,
        company: exp.company,
        start_date: exp.startDate,
        end_date: exp.endDate || undefined,
        responsibilities: exp.bullets?.join('\n') || '',
        achievements: '',
    })),
    education: [],
    skills: formData.sections.skills || [],
    projects: [],
    certifications: [],
  };

  const jobDescForAI = `A generic role for a candidate with skills like ${formData.sections.skills?.join(', ')}.`;

  try {
    const [resumeResult, suggestionsResult, coverLetterResult, linkedInResult] = await Promise.all([
      generateResumeFromData(aiPayload as unknown as GenerateResumeFromDataInput),
      provideResumeSuggestions({
        ...aiPayload,
        jobDescription: jobDescForAI,
      } as unknown as ProvideResumeSuggestionsInput),
      generateCoverLetterFromData({
        ...aiPayload,
        jobDescription: jobDescForAI,
      } as unknown as GenerateCoverLetterFromDataInput),
      generateLinkedInProfile(aiPayload as unknown as GenerateLinkedInProfileInput)
    ]);
    
    // Construct the full ResumeData object just before saving.
    const finalResumeId = resumeId || uuidv4();
    const resumeToSave: ResumeData & { userName: string | null; userEmail: string | null } = {
        resumeId: finalResumeId,
        ownerId: userId,
        title: formData.title,
        templateId: formData.templateId,
        status: 'draft',
        userName,
        userEmail,
        sections: {
            summary: {
                content: formData.sections.summary?.content || '',
                lastEdited: new Date().toISOString(),
            },
            experience: (formData.sections.experience || []).map((exp, index) => ({
                id: exp.id || uuidv4(),
                role: exp.role,
                company: exp.company,
                startDate: exp.startDate ? new Date(exp.startDate).toISOString() : new Date().toISOString(),
                endDate: exp.endDate && exp.endDate !== 'Present' ? new Date(exp.endDate).toISOString() : null,
                bullets: exp.bullets || [],
                order: index,
            })),
            education: [],
            skills: formData.sections.skills || [],
        },
        settings: { fontSize: 10, spacing: 'normal' },
        isDeleted: false,
    };

    saveOrUpdateResumeDataClient(userId, resumeToSave);
    
    return {
      resume: resumeResult,
      suggestions: suggestionsResult.suggestions,
      coverLetter: coverLetterResult,
      linkedin: linkedInResult,
      savedResumeId: finalResumeId,
    };
  } catch (error) {
    console.error("AI Generation or Firestore Error:", error);
    if (error instanceof Error) {
        return { error: `An unexpected error occurred: ${error.message}` };
    }
    return { error: "Failed to generate or save resume. Please try again." };
  }
}
