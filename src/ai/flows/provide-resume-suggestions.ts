
'use server';

/**
 * @fileOverview A resume enhancement suggestions AI agent.
 *
 * - provideResumeSuggestions - A function that provides suggestions for improving the resume content.
 * - ProvideResumeSuggestionsInput - The input type for the provideResumeSuggestions function.
 * - ProvideResumeSuggestionsOutput - The return type for the provideResumeSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';
import { experienceLevelSchema, resumeIntentSchema, resumeStyleSchema, languageSchema } from '@/lib/schema';

// Input schema now matches the new data model
const ProvideResumeSuggestionsInputSchema = z.object({
  jobDescription: z.string().describe('The job description for the target job.'),
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
});


export type ProvideResumeSuggestionsInput = z.infer<typeof ProvideResumeSuggestionsInputSchema>;

const ProvideResumeSuggestionsOutputSchema = z.object({
  suggestions: z.string().describe('A block of simple HTML content with actionable suggestions. Use only <p>, <ul>, <li>, and <strong> tags. Do not include any CSS classes or styles.'),
});
export type ProvideResumeSuggestionsOutput = z.infer<typeof ProvideResumeSuggestionsOutputSchema>;

export async function provideResumeSuggestions(input: ProvideResumeSuggestionsInput): Promise<ProvideResumeSuggestionsOutput> {
  return provideResumeSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideResumeSuggestionsPrompt',
  input: {schema: ProvideResumeSuggestionsInputSchema},
  output: {schema: ProvideResumeSuggestionsOutputSchema},
  prompt: `You are an AI resume optimization expert. Your task is to provide actionable suggestions to improve a resume based on a target job description and other metadata. The entire output must be in {{{language}}}.

Analyze the provided Job Description and Resume Data.

Job Description:
{{{jobDescription}}}

Resume Data:
- Target Role: {{{target_job_title}}}
- Experience Level: {{{experience_level}}}
- Resume Intent: {{{resume_intent}}}
- Language: {{{language}}}
- Name: {{{personal_info.full_name}}}
- Summary: {{{personal_info.summary}}}
- Skills: {{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Experience:
{{#each work_experience}}
  - {{{job_title}}} at {{{company}}}: Achievements - {{{achievements}}}
{{/each}}
- Education:
{{#each education}}
  - {{{degree}}} from {{{institution}}}
{{/each}}
- Projects:
{{#each projects}}
  - {{{title}}}
{{/each}}

You MUST provide your output as a single, valid JSON object that adheres to the following Zod schema. Do NOT add any commentary or text outside of the JSON structure.

ALWAYS respond in this exact format:
{
  "suggestions": "Your HTML content with suggestions here. Use only <p>, <ul>, <li> and <strong> tags. Do NOT use any TailwindCSS classes or any other styling. The response must be in {{{language}}}."
}
`,
});

const provideResumeSuggestionsFlow = ai.defineFlow(
  {
    name: 'provideResumeSuggestionsFlow',
    inputSchema: ProvideResumeSuggestionsInputSchema,
    outputSchema: ProvideResumeSuggestionsOutputSchema,
  },
  async input => {
    async function generateWithFallback(payload: ProvideResumeSuggestionsInput): Promise<ProvideResumeSuggestionsOutput> {
      const primaryModel = googleAI.model('gemini-2.5-flash');
      const fallbackModel = googleAI.model('gemini-1.5-pro-preview-0514');
      const maxRetries = 2;
      let attempt = 0;
      let backoff = 1000;

      while (attempt <= maxRetries) {
        attempt++;
        try {
          console.log(`[LLM Router - Suggestions] Attempt ${attempt}: Trying primary model (${primaryModel.name}).`);
          const {output} = await ai.run(
              'primaryModelGeneration',
              () => prompt(payload, { model: primaryModel })
          );
          if (!output) throw new Error("Primary model returned empty output.");
          return output;
        } catch (error: any) {
          const isOverloaded = error.message && (error.message.includes('429') || error.message.includes('503'));
          if (isOverloaded && attempt <= maxRetries) {
            console.warn(`[LLM Router - Suggestions] Primary model failed (overloaded/rate-limited). Retrying in ${backoff}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoff));
            backoff *= 2;
            continue;
          }
          console.error(`[LLM Router - Suggestions] Primary model failed permanently after ${attempt} attempt(s). Error: ${error.message}. Failing over to fallback model.`);
          break;
        }
      }

      try {
        console.log(`[LLM Router - Suggestions] Failover: Trying fallback model (${fallbackModel.name}).`);
        const {output} = await ai.run(
            'fallbackModelGeneration',
            () => prompt(payload, { model: fallbackModel })
        );
        if (!output) throw new Error("Fallback model returned empty output.");
        return output;
      } catch (fallbackError: any) {
        console.error(`[LLM Router - Suggestions] FATAL: Fallback model also failed. Error: ${fallbackError.message}`);
        throw new Error("The AI service is currently unavailable. Please try again later.");
      }
    }

    return await generateWithFallback(input);
  }
);
