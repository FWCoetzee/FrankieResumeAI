/**
 * @fileOverview A deterministic AI agent for granularly editing resume text.
 *
 * - editResumeText - A function that applies a specific transformation to a piece of text.
 * - EditResumeTextInput - The input type for the editResumeText function.
 * - EditResumeTextOutput - The return type for the editResumeText function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { resolveWorkingModel } from '@/lib/model-resolver';

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

const EditResumeTextInputSchema = z.object({
  mode: editModeSchema.describe("The editing command to apply."),
  content: z.string().describe("The text content to be edited."),
  targetJob: z.string().optional().describe("An optional job title or description to align the content with."),
  tone: toneSchema.optional().describe("The desired tone for the output text (used in 'Tone' mode)."),
  length: lengthSchema.optional().describe("The desired length for the output text (used in 'Length Control' mode)."),
});

export type EditResumeTextInput = z.infer<typeof EditResumeTextInputSchema>;

const EditResumeTextOutputSchema = z.string().describe("The edited content, with no additional commentary or explanation.");

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
    async function generateWithFallback(payload: EditResumeTextInput): Promise<EditResumeTextOutput> {
      const primaryModelId = await resolveWorkingModel('flash');
      const fallbackModelId = await resolveWorkingModel('pro');
      const maxRetries = 2;
      let attempt = 0;
      let backoff = 1000;

      while (attempt <= maxRetries) {
        attempt++;
        try {
          console.log(`[LLM Router - Edit] Attempt ${attempt}: Trying primary model (${primaryModelId}).`);
          const response = await prompt(payload, { model: primaryModelId });
          return response.text;
        } catch (error: any) {
          const isOverloaded = error.message && (error.message.includes('429') || error.message.includes('503'));
          if (isOverloaded && attempt <= maxRetries) {
            console.warn(`[LLM Router - Edit] Primary model failed (overloaded/rate-limited). Retrying in ${backoff}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoff));
            backoff *= 2;
            continue;
          }
          console.error(`[LLM Router - Edit] Primary model failed permanently after ${attempt} attempt(s). Error: ${error.message}. Failing over to fallback model.`);
          break;
        }
      }

      try {
        console.log(`[LLM Router - Edit] Failover: Trying fallback model (${fallbackModelId}).`);
        const response = await prompt(payload, { model: fallbackModelId });
        return response.text;
      } catch (fallbackError: any) {
        console.error(`[LLM Router - Edit] FATAL: Fallback model also failed. Error: ${fallbackError.message}`);
        throw new Error("The AI service is currently unavailable. Please try again later.");
      }
    }

    return await generateWithFallback(input);
  }
);
