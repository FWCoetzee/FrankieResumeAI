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
import { experienceLevelSchema, resumeIntentSchema, resumeStyleSchema, generatedResumeSchema, type GeneratedResumeData } from '@/lib/schema';

// The input remains the same raw data from the form.
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

// The output is now the structured, AI-enhanced resume data.
export type GenerateResumeFromDataOutput = GeneratedResumeData;

export async function generateResumeFromData(input: GenerateResumeFromDataInput): Promise<GenerateResumeFromDataOutput> {
  return generateResumeFromDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResumeFromDataPrompt',
  input: {schema: GenerateResumeFromDataInputSchema},
  output: {schema: generatedResumeSchema},
  prompt: `You are an expert resume writer AI. Your task is to take the user's raw resume data and transform it into a professional, polished, and ATS-optimized resume.

You will rewrite and enhance the provided content. For example:
- Rewrite the professional summary to be more impactful and tailored to the target job title.
- For each work experience, convert the responsibilities and achievements into a concise list of 3-5 bullet points. Start each bullet point with a strong action verb. Quantify achievements with metrics wherever possible.
- Select the most relevant skills and categorize them.

You MUST provide your output as a single, valid JSON object that strictly adheres to the provided Zod schema for the output. Do NOT add any commentary or text outside of the JSON structure.

Resume Metadata:
- Target Job Title: {{{target_job_title}}}
- Resume Intent: {{{resume_intent}}}
- Experience Level: {{{experience_level}}}
- Desired Style: {{{resume_style}}}

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

Based on all this information, generate the final, polished JSON output.`,
});

const generateResumeFromDataFlow = ai.defineFlow(
  {
    name: 'generateResumeFromDataFlow',
    inputSchema: GenerateResumeFromDataInputSchema,
    outputSchema: generatedResumeSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate a structured resume. The output was empty.");
    }
    return output;
  }
);
