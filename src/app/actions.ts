
"use client";

import { generateResumeFromData, type GenerateResumeFromDataInput } from "@/ai/flows/generate-resume-from-data";
import { provideResumeSuggestions, type ProvideResumeSuggestionsInput } from "@/ai/flows/provide-resume-suggestions";
import { resumeSchema, type ResumeData } from "@/lib/schema";
import { getFirestore } from "firebase/firestore";
import { saveResumeDataClient } from "@/lib/client-firestore";
import { initializeFirebase } from "@/firebase";

export async function generateResumeAction(
  userId: string | null,
  data: ResumeData
): Promise<{
  error?: string;
  resume?: string;
  suggestions?: string;
}> {
  if (!userId) {
    return { error: "You must be logged in to generate a resume." };
  }

  const validation = resumeSchema.safeParse(data);
  if (!validation.success) {
    console.error("Zod validation failed:", validation.error.flatten());
    return { error: "Invalid data provided. Check the form for errors." };
  }
  
  const { jobDescription, ...resumeCoreData } = validation.data;

  const aiPayload = {
    ...resumeCoreData,
  };

  try {
    const [resumeResult, suggestionsResult] = await Promise.all([
      generateResumeFromData(aiPayload as GenerateResumeFromDataInput),
      provideResumeSuggestions({
        ...aiPayload,
        jobDescription: jobDescription || `A generic ${aiPayload.experience_level} ${aiPayload.target_job_title} role.`,
      } as ProvideResumeSuggestionsInput),
    ]);
    
    // Get firestore instance and save data on the client
    const { firestore } = initializeFirebase();
    saveResumeDataClient(firestore, userId, validation.data);
    
    const cleanedResume = resumeResult.replace(/^```html\n|```$/g, '');

    return {
      resume: cleanedResume,
      suggestions: suggestionsResult.suggestions,
    };
  } catch (error) {
    console.error("AI Generation or Firestore Error:", error);
    if (error instanceof Error) {
        return { error: `An unexpected error occurred: ${error.message}` };
    }
    return { error: "Failed to generate or save resume. Please try again." };
  }
}
