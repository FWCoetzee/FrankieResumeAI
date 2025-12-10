
'use server';

/**
 * @fileOverview A deterministic AI agent for granularly editing resume text.
 *
 * - editResumeText - A function that applies a specific transformation to a piece of text.
 * - EditResumeTextInput - The input type for the editResumeText function.
 * - EditResumeTextOutput - The return type for the editResumeText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const editModeSchema = z.enum([
  "Rewrite", "Strengthen", "Shorten", "Expand", 
  "Bullet Conversion", "Paragraph", "Job-Align", 
  "Tone", "Grammar Fix", "Achievement", "Summarize", "Length Control"
]);

const toneSchema = z.enum([
  "Professional", "Formal", "Modern", "Confident", 
  "Simple", "Executive", "Technical", "Friendly", "Minimalistic"
]);

const lengthSchema = z.enum(["short", "medium", "long"]);

export const EditResumeTextInputSchema = z.object({
  mode: editModeSchema.describe("The editing command to apply."),
  content: z.string().describe("The text content to be edited."),
  targetJob: z.string().optional().describe("An optional job title or description to align the content with."),
  tone: toneSchema.optional().describe("The desired tone for the output text (used in 'Tone' mode)."),
  length: lengthSchema.optional().describe("The desired length for the output text (used in 'Length Control' mode)."),
});

export type EditResumeTextInput = z.infer<typeof EditResumeTextInputSchema>;

export const EditResumeTextOutputSchema = z.string().describe("The edited content, with no additional commentary or explanation.");

export type EditResumeTextOutput = z.infer<typeof EditResumeTextOutputSchema>;

export async function editResumeText(input: EditResumeTextInput): Promise<EditResumeTextOutput> {
  return editResumeTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'editResumeTextPrompt',
  input: {schema: EditResumeTextInputSchema},
  output: { format: 'text' },
  prompt: `You are ResumeEditorAI, a highly structured and deterministic résumé-editing engine. Your job is to take user-provided text and apply a precise transformation based on the selected editing command. You must follow all rules with absolute accuracy.

Your transformations must always be:
- ATS-compatible
- Clear and professional
- Grammatically correct
- Focused on impact and measurable achievements
- Free of clichés and empty phrases like "responsible for".

Mode: {{{mode}}}
{{#if targetJob}}Target Job: {{{targetJob}}}{{/if}}
{{#if tone}}Tone: {{{tone}}}{{/if}}
{{#if length}}Length: {{{length}}}{{/if}}
Content:
{{{content}}}

Based *only* on the mode and content provided, produce the edited text. Do NOT include any labels, headers, or commentary. Just deliver the final text.
`,
});

const editResumeTextFlow = ai.defineFlow(
  {
    name: 'editResumeTextFlow',
    inputSchema: EditResumeTextInputSchema,
    outputSchema: EditResumeTextOutputSchema,
  },
  async (input) => {
    const response = await prompt(input);
    return response.text;
  }
);
