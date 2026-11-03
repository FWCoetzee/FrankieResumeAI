'use server';

/**
 * @fileOverview Refines and structures resume data using GenAI.
 *
 * - generateResumeFromData - A function that takes raw user input and returns structured, AI-enhanced resume data.
 * - GenerateResumeFromDataInput - The input type for the generateResumeFromData function.
 * - GenerateResumeFromDataOutput - The return type for the generateResumeFromData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { resolveWorkingModel } from '@/lib/model-resolver';
import { experienceLevelSchema, resumeIntentSchema, resumeStyleSchema, generatedResumeSchema, type GeneratedResumeData, languageSchema } from '@/lib/schema';

// The input remains the same raw data from the form.
const GenerateResumeFromDataInputSchema = z.object({
  target_job_title: z.string(),
  resume_intent: resumeIntentSchema,
  experience_level: experienceLevelSchema,
  resume_style: resumeStyleSchema,
  language: languageSchema,
  personal_info: z.object({
    full_name: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string().optional(),
    summary: z.string().optional(),
  }),
  work_experience: z.array(
    z.object({
      job_title: z.string(),
      company: z.string(),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
      responsibilities: z.string().optional(),
      achievements: z.string().optional(),
    })
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      start_year: z.string().optional(),
      end_year: z.string().optional(),
    })
  ),
  skills: z.array(z.string()),
  projects: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      technologies: z.array(z.string()),
    })
  ),
  certifications: z.array(z.string()),
  references: z.array(z.object({ name: z.string(), contact: z.string() })),
});

export type GenerateResumeFromDataInput = z.infer<typeof GenerateResumeFromDataInputSchema>;

// The output is now the structured, AI-enhanced resume data.
export type GenerateResumeFromDataOutput = GeneratedResumeData;

export async function generateResumeFromData(input: GenerateResumeFromDataInput): Promise<GenerateResumeFromDataOutput> {
  return generateResumeFromDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResumeFromDataPrompt',
  input: {schema: GenerateResumeFromDataInputSchema},
  output: {schema: generatedResumeSchema},
  prompt: `You are an expert resume writer AI. Your task is to take the user's raw resume data and transform it into a professional, polished, and ATS-optimized resume. You MUST generate the entire resume in the specified language: {{{language}}}.

You will rewrite and enhance the provided content. For example:
- Rewrite the professional summary to be more impactful and tailored to the target job title.
- For each work experience, convert the responsibilities and achievements into a concise list of 3-5 bullet points. Start each bullet point with a strong action verb. Quantify achievements with metrics wherever possible.
- Select the most relevant skills and categorize them.
- Rewrite project descriptions to be concise and achievement-oriented.
- Format references professionally.
- You MUST also provide translations for the main section headings of the resume in the specified language.

You MUST provide your output as a single, valid JSON object that strictly adheres to the provided Zod schema for the output. Do NOT add any commentary or text outside of the JSON structure.

Resume Metadata:
- Target Job Title: {{{target_job_title}}}
- Resume Intent: {{{resume_intent}}}
- Experience Level: {{{experience_level}}}
- Desired Style: {{{resume_style}}}
- Language: {{{language}}}

Raw Resume Data:
- Name: {{{personal_info.full_name}}}
- Contact: {{{personal_info.email}}}, {{{personal_info.phone}}}{{#if personal_info.location}}, {{{personal_info.location}}}{{/if}}
- Original Summary: {{{personal_info.summary}}}
- Original Experience:
{{#each work_experience}}
  - {{{job_title}}} at {{{company}}}
    Responsibilities: {{{responsibilities}}}
    Achievements: {{{achievements}}}
{{/each}}
- Original Education:
{{#each education}}
  - {{{degree}}} from {{{institution}}}
{{/each}}
- Original Skills: {{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Original Projects:
{{#each projects}}
  - {{{title}}}: {{{description}}}
{{/each}}
- Original Certifications:
{{#each certifications}}
  - {{{this}}}
{{/each}}
- Original References:
{{#each references}}
  - {{{name}}}: {{{contact}}}
{{/each}}

Based on all this information, generate the final, polished JSON output in the requested language ({{{language}}}).`,
});

const generateResumeFromDataFlow = ai.defineFlow(
  {
    name: 'generateResumeFromDataFlow',
    inputSchema: GenerateResumeFromDataInputSchema,
    outputSchema: generatedResumeSchema,
  },
  async (input) => {
    /**
     * Generates a resume with a fallback mechanism.
     * It first tries the primary, faster model (gemini-2.5-flash).
     * If it fails due to overload or rate limiting, it retries with exponential backoff.
     * If all retries fail, it falls back to a more powerful secondary model (gemini-1.5-pro).
     * @param payload The input data for the resume generation prompt.
     * @returns The generated and validated resume data.
     */
    async function generateWithFallback(payload: GenerateResumeFromDataInput): Promise<GeneratedResumeData> {
      const primaryModel = await resolveWorkingModel('flash');
      const primaryModelId = primaryModel;
      const fallbackModel = await resolveWorkingModel('pro');
      const fallbackModelId = fallbackModel;
      const maxRetries = 2;
      let attempt = 0;
      let backoff = 1000; // Initial backoff in ms

      while (attempt <= maxRetries) {
        attempt++;
        try {
          console.log(`[LLM Router] Attempt ${attempt}: Trying primary model (${primaryModel}).`);
          const startTime = Date.now();
          
          const {output} = await ai.run(
              'primaryModelGeneration',
              () => prompt(payload, { model: primaryModel })
          );
          
          const latency = Date.now() - startTime;
          console.log(`[LLM Router] Primary model success. Latency: ${latency}ms.`);

          if (!output) {
            throw new Error("Primary model returned empty output.");
          }
          
          // Validate output against schema
          const validation = generatedResumeSchema.safeParse(output);
          if (!validation.success) {
              console.error("[LLM Router] Primary model output failed Zod validation.", validation.error);
              // For future: Could attempt to repair the JSON here or just failover.
              throw new Error("Invalid output schema from primary model.");
          }

          return validation.data;

        } catch (error: any) {
          const isOverloaded = error.message && (error.message.includes('429') || error.message.includes('503'));
          
          if (isOverloaded && attempt <= maxRetries) {
            console.warn(`[LLM Router] Primary model failed (overloaded/rate-limited). Retrying in ${backoff}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoff));
            backoff *= 2; // Exponential backoff
            continue; // Retry the loop
          }

          console.error(`[LLM Router] Primary model failed permanently after ${attempt} attempt(s). Error: ${error.message}. Failing over to fallback model.`);
          break; // Exit loop to proceed to fallback
        }
      }

      // If the loop completes without returning, it means the primary model failed.
      // Now, try the fallback model.
      try {
        console.log(`[LLM Router] Failover: Trying fallback model (${fallbackModel}).`);
        const startTime = Date.now();
        
        const {output} = await ai.run(
            'fallbackModelGeneration',
            () => prompt(payload, { model: fallbackModel })
        );
        
        const latency = Date.now() - startTime;
        console.log(`[LLM Router] Fallback model success. Latency: ${latency}ms.`);

        if (!output) {
          throw new Error("Fallback model returned empty output.");
        }
        
        // Validate fallback output against schema
        const validation = generatedResumeSchema.safeParse(output);
        if (!validation.success) {
            console.error("[LLM Router] Fallback model output failed Zod validation.", validation.error);
            // If the fallback also fails validation, we have a bigger problem.
            throw new Error("Invalid output schema from fallback model.");
        }

        return validation.data;
      } catch (fallbackError: any) {
        console.error(`[LLM Router] FATAL: Fallback model also failed. Error: ${fallbackError.message}`);
        // This is a hard failure. The user will see an error.
        throw new Error("The AI service is currently unavailable. Please try again later.");
      }
    }

    return await generateWithFallback(input);
  }
);

/*
### Suggestions for Future Improvements ###

1.  **More LLMs**: The `generateWithFallback` function can be extended into a "chain of responsibility".
    Instead of a primary and a single fallback, we could have a list of models to try in order:
    `const modelsToTry = [ 'gemini-2.5-flash', 'gemini-1.5-pro', 'gpt-4o-mini', 'claude-3.5-sonnet' ]`.
    The function would iterate through this list until one succeeds. This would require adding the respective Genkit plugins.

2.  **Cost-Based Routing**: The model list could be an array of objects `{ name: '...', costPerToken: 0.001 }`.
    The router could dynamically choose the cheapest model that is currently available and meets a certain quality bar,
    or allow users to select a "Quality vs. Speed/Cost" preference.

3.  **A/B Testing**: We could randomly route a small percentage of traffic (e.g., 5%) to a new or different model
    to compare its performance, cost, and output quality against our primary model. This can be done by adding a
    `if (Math.random() < 0.05) { useTestModel() }` block in the router logic. The results, latency, and user feedback
    can be logged for analysis.
*/
