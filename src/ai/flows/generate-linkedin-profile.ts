
'use server';

/**
 * @fileOverview Generates an optimized LinkedIn profile from resume data.
 *
 * - generateLinkedInProfile - A function that generates the profile sections.
 * - GenerateLinkedInProfileInput - The input type for the function.
 * - GenerateLinkedInProfileOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { experienceLevelSchema, resumeIntentSchema, resumeStyleSchema, languageSchema } from '@/lib/schema';

const GenerateLinkedInProfileInputSchema = z.object({
  target_job_title: z.string(),
  experience_level: experienceLevelSchema,
  language: languageSchema,
  personal_info: z.object({
    full_name: z.string(),
    summary: z.string().optional(),
  }),
  work_experience: z.array(
    z.object({
      job_title: z.string(),
      company: z.string(),
      responsibilities: z.string().optional(),
      achievements: z.string().optional(),
    })
  ),
  skills: z.array(z.string()),
});

export type GenerateLinkedInProfileInput = z.infer<typeof GenerateLinkedInProfileInputSchema>;

const GenerateLinkedInProfileOutputSchema = z.object({
    summary: z.string().describe("A professional, first-person summary for the LinkedIn 'About' section."),
    experience: z.array(
        z.object({
            job_title: z.string(),
            company: z.string(),
            description: z.string().describe("An optimized description for a LinkedIn experience entry, written in the first person. Should be a short paragraph followed by 2-3 key achievement bullet points.")
        })
    )
});

export type GenerateLinkedInProfileOutput = z.infer<typeof GenerateLinkedInProfileOutputSchema>;

export async function generateLinkedInProfile(input: GenerateLinkedInProfileInput): Promise<GenerateLinkedInProfileOutput> {
  return generateLinkedInProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLinkedInProfilePrompt',
  input: {schema: GenerateLinkedInProfileInputSchema},
  output: {schema: GenerateLinkedInProfileOutputSchema},
  prompt: `You are an expert career coach AI specializing in optimizing LinkedIn profiles. Your task is to transform a user's resume data into a compelling, first-person LinkedIn profile. The entire output MUST be in the specified language: {{{language}}}.

You MUST provide your output as a single, valid JSON object that strictly adheres to the provided Zod schema. Do NOT add any commentary or text outside of the JSON structure.

Key Instructions:
- **Summary ('About' section):** Write a professional but approachable summary in the first person. It should tell a story about the user's expertise and passion. End with a call to action (e.g., "I'm open to connecting..." or "Feel free to reach out...").
- **Experience Sections:** For each job, write a short paragraph in the first person describing the role, followed by a list of 2-3 key achievements as bullet points. Start bullets with a strong action verb.

Resume Data:
- Candidate Name: {{{personal_info.full_name}}}
- Target Job Title: {{{target_job_title}}}
- Experience Level: {{{experience_level}}}
- Language: {{{language}}}
- Resume Summary: {{{personal_info.summary}}}
- Work Experience:
{{#each work_experience}}
  - {{{job_title}}} at {{{company}}}:
    Responsibilities: {{{responsibilities}}}
    Achievements: {{{achievements}}}
{{/each}}
- Skills: {{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Based on this, generate the LinkedIn profile JSON in {{{language}}}.
`,
});

const generateLinkedInProfileFlow = ai.defineFlow(
  {
    name: 'generateLinkedInProfileFlow',
    inputSchema: GenerateLinkedInProfileInputSchema,
    outputSchema: GenerateLinkedInProfileOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate a LinkedIn profile. The output was empty.");
    }
    return output;
  }
);
