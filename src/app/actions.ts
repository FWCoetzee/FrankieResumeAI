"use server";

import { generateResumeFromData, type GenerateResumeFromDataInput } from "@/ai/flows/generate-resume-from-data";
import { provideResumeSuggestions } from "@/ai/flows/provide-resume-suggestions";
import { resumeSchema, type ResumeData } from "@/lib/schema";

export async function generateResumeAction(data: ResumeData): Promise<{
  error?: string;
  resume?: string;
  suggestions?: string;
}> {
  const validation = resumeSchema.safeParse(data);
  if (!validation.success) {
    return { error: "Invalid data provided." };
  }

  const { jobDescription, ...resumeData } = validation.data;

  const aiPayload: GenerateResumeFromDataInput = {
    ...resumeData,
    skills: resumeData.skills.map((s) => s.value),
    experience: resumeData.experience.map(e => ({...e, endDate: e.endDate || 'Present'})),
    education: resumeData.education.map(e => ({...e, endDate: e.endDate || 'Present', description: e.description || ''})),
  };

  try {
    const [resumeResult, suggestionsResult] = await Promise.all([
      generateResumeFromData(aiPayload),
      provideResumeSuggestions({
        resumeData: JSON.stringify(validation.data), // Pass the original validated data as JSON
        jobDescription: jobDescription || "A generic software developer role.",
      }),
    ]);
    
    // Clean up markdown ```html ... ``` from the output if it exists
    const cleanedResume = resumeResult.replace(/^```html\n|```$/g, '');

    return {
      resume: cleanedResume,
      suggestions: suggestionsResult.suggestions,
    };
  } catch (error) {
    console.error(error);
    return { error: "Failed to generate resume. Please try again." };
  }
}
