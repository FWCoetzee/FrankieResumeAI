'use server';

/**
 * @fileOverview A resume enhancement suggestions AI agent.
 *
 * - provideResumeSuggestions - A function that provides suggestions for improving the resume content.
 * - ProvideResumeSuggestionsInput - The input type for the provideResumeSuggestions function.
 * - ProvideResumeSuggestionsOutput - The return type for the provideResumeSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideResumeSuggestionsInputSchema = z.object({
  resumeData: z.string().describe('The resume data in JSON format.'),
  jobDescription: z.string().describe('The job description for the target job.'),
});
export type ProvideResumeSuggestionsInput = z.infer<typeof ProvideResumeSuggestionsInputSchema>;

const ProvideResumeSuggestionsOutputSchema = z.object({
  suggestions: z.string().describe('Suggestions for improving the resume content.'),
});
export type ProvideResumeSuggestionsOutput = z.infer<typeof ProvideResumeSuggestionsOutputSchema>;

export async function provideResumeSuggestions(input: ProvideResumeSuggestionsInput): Promise<ProvideResumeSuggestionsOutput> {
  return provideResumeSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideResumeSuggestionsPrompt',
  input: {schema: ProvideResumeSuggestionsInputSchema},
  output: {schema: ProvideResumeSuggestionsOutputSchema},
  prompt: `You are a resume expert. Provide suggestions for improving the resume content based on the following resume data and job description.\n\nResume Data: {{{resumeData}}}\n\nJob Description: {{{jobDescription}}}\n\nSuggestions:`,
});

const provideResumeSuggestionsFlow = ai.defineFlow(
  {
    name: 'provideResumeSuggestionsFlow',
    inputSchema: ProvideResumeSuggestionsInputSchema,
    outputSchema: ProvideResumeSuggestionsOutputSchema,
  },
  async input => {
    const llmResponse = await ai.generate({
      prompt: prompt(input),
      model: 'googleai/gemini-2.5-flash'
    });
    const output = llmResponse.output();
    if (!output) {
      throw new Error('No output from AI');
    }
    return output;
  }
);
