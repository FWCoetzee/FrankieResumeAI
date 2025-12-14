
"use client";

import { generateResumeFromData, type GenerateResumeFromDataInput, type GenerateResumeFromDataOutput } from "@/ai/flows/generate-resume-from-data";
import { provideResumeSuggestions, type ProvideResumeSuggestionsInput } from "@/ai/flows/provide-resume-suggestions";
import { generateCoverLetterFromData, type GenerateCoverLetterFromDataInput } from "@/ai/flows/generate-cover-letter-from-data";
import { generateLinkedInProfile, type GenerateLinkedInProfileInput, type GenerateLinkedInProfileOutput } from "@/ai/flows/generate-linkedin-profile";
import { type ResumeData } from "@/lib/schema";
import { saveOrUpdateResumeDataClient } from "@/lib/client-firestore";

// This function now expects the full ResumeData object, including metadata like ownerId.
export async function generateResumeAction(
  userId: string | null,
  resumeData: ResumeData
): Promise<{
  error?: string;
  resume?: GenerateResumeFromDataOutput;
  suggestions?: string;
  coverLetter?: string;
  linkedin?: GenerateLinkedInProfileOutput;
}> {
  if (!userId) {
    return { error: "You must be logged in to generate a resume." };
  }

  // The AI flows require a different data structure than our new resumeSchema.
  // We need to map the data from our new structure to the old structure the AI expects.
  // This is a temporary measure until the AI flows are updated.
  const aiPayload = {
    target_job_title: resumeData.title,
    // These fields are no longer in our new model but are required by the AI flows.
    // We provide sensible defaults.
    resume_intent: "Tech (ATS-Optimized)",
    experience_level: "Mid-level",
    resume_style: "Modern",
    language: "English",
    personal_info: {
      full_name: "User", // This data is now in the /users collection, not on the resume object
      email: "",
      phone: "",
      location: "",
      summary: resumeData.sections.summary.content,
    },
    work_experience: resumeData.sections.experience.map(exp => ({
        job_title: exp.role,
        company: exp.company,
        start_date: exp.startDate,
        end_date: exp.endDate || undefined,
        responsibilities: exp.bullets.join('\n'),
        achievements: '',
    })),
    education: [],
    skills: resumeData.sections.skills,
    projects: [],
    certifications: [],
  };

  const jobDescForAI = `A generic role for a candidate with skills like ${resumeData.sections.skills.join(', ')}.`;

  try {
    const [resumeResult, coverLetterResult, linkedInResult] = await Promise.all([
      generateResumeFromData(aiPayload as unknown as GenerateResumeFromDataInput),
      generateCoverLetterFromData({
        ...aiPayload,
        jobDescription: jobDescForAI,
      } as unknown as GenerateCoverLetterFromDataInput),
      generateLinkedInProfile(aiPayload as unknown as GenerateLinkedInProfileInput)
    ]);
    
    // Save the complete resume data to Firestore.
    // The resumeId is now part of the resumeData object.
    saveOrUpdateResumeDataClient(userId, resumeData);
    
    return {
      resume: resumeResult,
      suggestions: "<p>AI suggestions will be available here after the initial generation. You can use the AI Editor to refine your content now.</p>", // Provide a default placeholder
      coverLetter: coverLetterResult,
      linkedin: linkedInResult,
    };
  } catch (error) {
    console.error("AI Generation or Firestore Error:", error);
    if (error instanceof Error) {
        return { error: `An unexpected error occurred: ${error.message}` };
    }
    return { error: "Failed to generate or save resume. Please try again." };
  }
}
