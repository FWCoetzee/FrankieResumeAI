'use server';

/**
 * @fileOverview Generates an HTML resume from user-provided data using GenAI.
 *
 * - generateResumeFromData - A function that generates the resume.
 * - GenerateResumeFromDataInput - The input type for the generateResumeFromData function.
 * - GenerateResumeFromDataOutput - The return type for the generateResumeFromData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { experienceLevelSchema, resumeIntentSchema, resumeStyleSchema } from '@/lib/schema';

// Updated schema based on Day 2 Blueprint
const GenerateResumeFromDataInputSchema = z.object({
  target_job_title: z.string(),
  resume_intent: resumeIntentSchema,
  experience_level: experienceLevelSchema,
  resume_style: resumeStyleSchema,
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

export type GenerateResumeFromDataInput = z.infer<typeof GenerateResumeFromDataInputSchema>;

const GenerateResumeFromDataOutputSchema = z.string().describe('The generated HTML resume.');

export type GenerateResumeFromDataOutput = z.infer<typeof GenerateResumeFromDataOutputSchema>;

export async function generateResumeFromData(input: GenerateResumeFromDataInput): Promise<GenerateResumeFromDataOutput> {
  return generateResumeFromDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResumeFromDataPrompt',
  input: {schema: GenerateResumeFromDataInputSchema},
  prompt: `You are an expert resume writer AI. Your task is to generate a professional, ATS-optimized HTML resume based on the data and preferences provided.

You MUST generate a single, complete HTML document. Include <html>, <head> with a <style> tag for professional formatting, and <body> tags.
NEVER add any commentary or text outside of the HTML document itself.

Resume Metadata:
- Target Job Title: {{{target_job_title}}}
- Resume Intent: {{{resume_intent}}}
- Experience Level: {{{experience_level}}}
- Desired Style: {{{resume_style}}}

Resume Data:
- Name: {{{personal_info.full_name}}}
- Contact: {{{personal_info.email}}}, {{{personal_info.phone}}}{{#if personal_info.location}}, {{{personal_info.location}}}{{/if}}
- Summary: {{{personal_info.summary}}}

- Skills: {{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

- Experience:
{{#each work_experience}}
  - {{{job_title}}} at {{{company}}} ({{{start_date}}} - {{{end_date}}})
    Responsibilities: {{{responsibilities}}}
    Achievements: {{{achievements}}}
{{/each}}

- Education:
{{#each education}}
  - {{{degree}}} from {{{institution}}} ({{{start_year}}} - {{{end_year}}})
{{/each}}

- Projects:
{{#each projects}}
  - {{{title}}}: {{{description}}} (Technologies: {{#each technologies}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}})
{{/each}}

- Certifications:
{{#each certifications}}
  - {{{this}}}
{{/each}}
`,
});

const generateResumeFromDataFlow = ai.defineFlow(
  {
    name: 'generateResumeFromDataFlow',
    inputSchema: GenerateResumeFromDataInputSchema,
    outputSchema: GenerateResumeFromDataOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
      prompt: prompt.render({input}).prompt!,
      model: 'googleai/gemini-1.5-flash',
    });
    return text;
  }
);
