'use server';

/**
 * @fileOverview Generates a professional cover letter from user-provided data using GenAI.
 *
 * - generateCoverLetterFromData - A function that generates the cover letter.
 * - GenerateCoverLetterFromDataInput - The input type for the generateCoverLetterFromData function.
 * - GenerateCoverLetterFromDataOutput - The return type for the generateCoverLetterFromData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { resolveWorkingModel } from '@/lib/model-resolver';
import { experienceLevelSchema, resumeIntentSchema, resumeStyleSchema, languageSchema } from '@/lib/schema';

// This input schema is based on the resume data, as the cover letter needs this context.
const GenerateCoverLetterFromDataInputSchema = z.object({
  jobDescription: z.string().optional(),
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
  skills: z.array(z.string()),
});

export type GenerateCoverLetterFromDataInput = z.infer<typeof GenerateCoverLetterFromDataInputSchema>;

const GenerateCoverLetterFromDataOutputSchema = z.string().describe('The generated cover letter content. Each paragraph should be separated by a newline character (\\n).');

export type GenerateCoverLetterFromDataOutput = z.infer<typeof GenerateCoverLetterFromDataOutputSchema>;

export async function generateCoverLetterFromData(input: GenerateCoverLetterFromDataInput): Promise<GenerateCoverLetterFromDataOutput> {
  return generateCoverLetterFromDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCoverLetterFromDataPrompt',
  input: {schema: GenerateCoverLetterFromDataInputSchema},
  output: { format: 'text' },
  prompt: `You are an expert career coach AI. Your task is to write a professional and compelling cover letter based on the provided resume information and target job description. The entire cover letter MUST be in the specified language: {{{language}}}.

The tone should be professional but authentic. The letter should highlight the most relevant skills and experiences from the resume that match the job description.

You MUST generate plain text. Each paragraph MUST be separated by a single newline character (\\n). Do NOT use any HTML or Markdown. NEVER add any commentary or text outside of the cover letter content itself.

Start with the user's contact information and the date. Do NOT include placeholders for a company name or address.

Job Description to target:
{{{jobDescription}}}

Resume Data:
- Candidate Name: {{{personal_info.full_name}}}
- Target Job Title: {{{target_job_title}}}
- Experience Level: {{{experience_level}}}
- Language: {{{language}}}
- Summary: {{{personal_info.summary}}}
- Relevant Experience:
{{#each work_experience}}
  - {{{job_title}}} at {{{company}}}: {{{achievements}}}
{{/each}}
- Key Skills: {{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Write a 3-4 paragraph cover letter in {{{language}}}.
- Paragraph 1: Introduction - State the position being applied for and where it was seen. Express enthusiasm.
- Paragraph 2: Body - Highlight 2-3 key experiences or skills from the resume data that directly align with the requirements in the job description. Use specific examples.
- Paragraph 3: Body - Mention a specific aspect of the company (if possible from the job description) that excites the candidate.
- Paragraph 4: Closing - Reiterate interest, express eagerness for an interview, and thank the reader.
`,
});

const generateCoverLetterFromDataFlow = ai.defineFlow(
  {
    name: 'generateCoverLetterFromDataFlow',
    inputSchema: GenerateCoverLetterFromDataInputSchema,
    outputSchema: GenerateCoverLetterFromDataOutputSchema,
  },
  async (input) => {
    async function generateWithFallback(payload: GenerateCoverLetterFromDataInput): Promise<GenerateCoverLetterFromDataOutput> {
      const primaryModel = await resolveWorkingModel('flash');
      const primaryModelId = primaryModel;
      const maxRetries = 2;
      let attempt = 0;
      let backoff = 1000;

      while (attempt <= maxRetries) {
        attempt++;
        try {
          console.log(`[LLM Router - CoverLetter] Attempt ${attempt}: Trying primary model (${primaryModel}).`);
          const response = await ai.run(
              'primaryModelGeneration',
              () => prompt(payload, { model: primaryModel })
          );
          return response.text;
        } catch (error: any) {
          const isOverloaded = error.message && (error.message.includes('429') || error.message.includes('503'));
          if (isOverloaded && attempt <= maxRetries) {
            console.warn(`[LLM Router - CoverLetter] Primary model failed (overloaded/rate-limited). Retrying in ${backoff}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoff));
            backoff *= 2;
            continue;
          }
          console.error(`[LLM Router - CoverLetter] Primary model failed permanently after ${attempt} attempt(s). Error: ${error.message}. Failing over to fallback model.`);
          break;
        }
      }

      try {
        const fallbackModel = await resolveWorkingModel('pro');
        console.log(`[LLM Router - CoverLetter] Failover: Trying fallback model (${fallbackModel}).`);
        const response = await ai.run(
            'fallbackModelGeneration',
            () => prompt(payload, { model: fallbackModel })
        );
        return response.text;
      } catch (fallbackError: any) {
        console.error(`[LLM Router - CoverLetter] FATAL: Fallback model also failed. Error: ${fallbackError.message}`);
        throw new Error("The AI service is currently unavailable. Please try again later.");
      }
    }

    return await generateWithFallback(input);
  }
);
