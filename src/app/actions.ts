
"use client";

import { generateResumeFromData, type GenerateResumeFromDataInput, type GenerateResumeFromDataOutput } from "@/ai/flows/generate-resume-from-data";
import { provideResumeSuggestions, type ProvideResumeSuggestionsInput } from "@/ai/flows/provide-resume-suggestions";
import { generateCoverLetterFromData, type GenerateCoverLetterFromDataInput } from "@/ai/flows/generate-cover-letter-from-data";
import { resumeFormSchema, type ResumeFormData } from "@/lib/schema";
import { getFirestore } from "firebase/firestore";
import { saveOrUpdateResumeDataClient } from "@/lib/client-firestore";
import { initializeFirebase } from "@/firebase";

export async function generateResumeAction(
  userId: string | null,
  resumeId: string | null, // Added to know if we are updating
  data: ResumeFormData
): Promise<{
  error?: string;
  resume?: GenerateResumeFromDataOutput;
  suggestions?: string;
  coverLetter?: string;
}> {
  if (!userId) {
    return { error: "You must be logged in to generate a resume." };
  }

  const validation = resumeFormSchema.safeParse(data);
  if (!validation.success) {
    console.error("Zod validation failed:", validation.error.flatten());
    return { error: "Invalid data provided. Check the form for errors." };
  }
  
  const { jobDescription, ...resumeCoreData } = validation.data;

  const aiPayload = {
    ...resumeCoreData,
  };
  
  const jobDescForAI = jobDescription || `A generic ${aiPayload.experience_level} ${aiPayload.target_job_title} role.`;

  try {
    const [resumeResult, suggestionsResult, coverLetterResult] = await Promise.all([
      generateResumeFromData(aiPayload as GenerateResumeFromDataInput),
      provideResumeSuggestions({
        ...aiPayload,
        jobDescription: jobDescForAI,
      } as ProvideResumeSuggestionsInput),
      generateCoverLetterFromData({
        ...aiPayload,
        jobDescription: jobDescForAI,
      } as GenerateCoverLetterFromDataInput)
    ]);
    
    // Get firestore instance and save data on the client
    const { firestore } = initializeFirebase();
    saveOrUpdateResumeDataClient(firestore, userId, resumeId, validation.data);
    
    return {
      resume: resumeResult,
      suggestions: suggestionsResult.suggestions,
      coverLetter: coverLetterResult,
    };
  } catch (error) {
    console.error("AI Generation or Firestore Error:", error);
    if (error instanceof Error) {
        return { error: `An unexpected error occurred: ${error.message}` };
    }
    return { error: "Failed to generate or save resume. Please try again." };
  }
}
