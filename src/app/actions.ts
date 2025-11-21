"use server";

import { generateResumeFromData, type GenerateResumeFromDataInput } from "@/ai/flows/generate-resume-from-data";
import { provideResumeSuggestions } from "@/ai/flows/provide-resume-suggestions";
import { resumeSchema, type ResumeData } from "@/lib/schema";

// This action is temporarily simplified for Day 2.
// It validates the data and returns a "mock" successful response.
// The actual AI call is disabled to focus on the input system.
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
  
  console.log("Data successfully validated. Ready for AI generation (currently disabled).");

  // For Day 2, we are focusing on input collection. 
  // We will return a mock response and re-enable the AI calls on Day 3.
  const mockResume = `
    <html>
      <head><style>body {font-family: sans-serif;}</style></head>
      <body>
        <h1>${validation.data.personal_info.full_name}</h1>
        <p>This is a placeholder resume. AI generation is currently disabled while we focus on building the input system.</p>
        <h2>Review Data:</h2>
        <pre>${JSON.stringify(validation.data, null, 2)}</pre>
      </body>
    </html>
  `;
  
  const mockSuggestions = `
    <h3 class='font-bold text-lg mb-2'>AI Suggestions (Placeholder)</h3>
    <p>The AI suggestion engine is currently disabled.</p>
    <ul>
      <li>On Day 3, we will re-enable this to provide suggestions based on your target job description.</li>
    </ul>
  `;

  return {
    resume: mockResume,
    suggestions: mockSuggestions,
  };

  /*
  // DAY 3 - We will re-enable this section.

  const { jobDescription, ...resumeCoreData } = validation.data;

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
        jobDescription: jobDescription || "A generic software developer role.",
      }),
    ]);
    
    const cleanedResume = resumeResult.replace(/^```html\n|```$/g, '');

    return {
      resume: cleanedResume,
      suggestions: suggestionsResult.suggestions,
    };
  } catch (error) {
    console.error(error);
    return { error: "Failed to generate resume. Please try again." };
  }
  */
}
