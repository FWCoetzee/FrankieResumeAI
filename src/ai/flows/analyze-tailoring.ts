/**
 * @fileOverview Analyzes how a generated resume was tailored to a specific job description.
 *
 * - analyzeTailoring - A function that takes a job description and the final resume, and returns a list of strategic matching points.
 */

'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';
import { resolveWorkingModel } from '@/lib/model-resolver';
import { type GeneratedResumeData } from '@/lib/schema';

const TailoringPointSchema = z.object({
  requirement: z.string().describe("The specific skill, experience, or keyword required by the job description."),
  implementation: z.string().describe("How this requirement was addressed or highlighted in the generated resume."),
});

const TailoringAnalysisSchema = z.array(TailoringPointSchema).describe("A list of matching points between the job and the resume.");

export type TailoringAnalysis = z.infer<typeof TailoringAnalysisSchema>;

export async function analyzeTailoring(input: {
  jobDescription: string;
  resume: GeneratedResumeData;
}): Promise<TailoringAnalysis> {
  return analyzeTailoringFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTailoringPrompt',
  input: {
    jobDescription: z.string(),
    resume: z.any(), // Using any as GeneratedResumeData is a complex Zod schema
  },
  output: { schema: TailoringAnalysisSchema },
  prompt: `You are a Resume Strategy Analyst. Your goal is to provide transparency to the user by explaining exactly HOW you tailored their resume to a specific job description.

You must identify the most important requirements from the job description and map them to specific implementation details in the generated resume.

Job Description:
{{{jobDescription}}}

Generated Resume:
{{{resume}}}

Provide a list of 5-8 high-impact matching points. For each point:
1. Identify a critical requirement from the job description.
2. Explain exactly where and how that requirement was addressed in the resume (e.g., "Emphasized your use of Next.js in the 'E-commerce' project to match the requirement for modern frontend frameworks").

Be specific, strategic, and transparent. Focus on keywords, quantified achievements, and structural choices.`,
});

const analyzeTailoringFlow = ai.defineFlow(
  {
    name: 'analyzeTailoringFlow',
    inputSchema: z.object({
      jobDescription: z.string(),
      resume: z.any(),
    }),
    outputSchema: TailoringAnalysisSchema,
  },
  async (input) => {
    try {
      const modelId = await resolveWorkingModel('flash');
      const response = await ai.run(
        'analyzeTailoringGeneration',
        () => prompt(input, { model: googleAI.model(modelId) })
      );
      return response.text;
    } catch (error) {
      console.error('Tailoring Analysis Error:', error);
      throw new Error('Failed to analyze resume tailoring.');
    }
  }
);
