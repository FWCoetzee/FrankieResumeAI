"use server";

import { generateResumeFromData, type GenerateResumeFromDataInput } from "@/ai/flows/generate-resume-from-data";
import { provideResumeSuggestions, type ProvideResumeSuggestionsInput } from "@/ai/flows/provide-resume-suggestions";
import { resumeSchema, type ResumeData } from "@/lib/schema";

export async function generateResumeAction(data: ResumeData): Promise<{
  error?: string;
  resume?: string;
  suggestions?: string;
}> {
  const validation = resumeSchema.safeParse(data);
  if (!validation.success) {
    // Log the detailed validation error for debugging
    console.error("Zod validation failed:", validation.error.flatten());
    return { error: "Invalid data provided. Check the form for errors." };
  }
  
  const { jobDescription, ...resumeCoreData } = validation.data;

  // This payload is now shared between both flows.
  const aiPayload = {
    ...resumeCoreData,
    skills: resumeCoreData.skills.map((s) => s.value),
    projects: resumeCoreData.projects.map(p => ({
      ...p,
      technologies: p.technologies.map(t => t.value)
    })),
    certifications: resumeCoreData.certifications.map(c => c.value),
  };

  try {
    const [resumeResult, suggestionsResult] = await Promise.all([
      generateResumeFromData(aiPayload),
      provideResumeSuggestions({
        ...aiPayload,
        jobDescription: jobDescription || `A generic ${aiPayload.experience_level} ${aiPayload.target_job_title} role.`,
      }),
    ]);
    
    // The AI might sometimes wrap the HTML in markdown backticks.
    // This removes them to ensure clean rendering.
    const cleanedResume = resumeResult.replace(/^```html\n|```$/g, '');

    return {
      resume: cleanedResume,
      suggestions: suggestionsResult.suggestions,
    };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return { error: "Failed to generate resume. The AI model may be temporarily unavailable. Please try again." };
  }
}
