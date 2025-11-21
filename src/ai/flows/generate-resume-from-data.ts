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

const GenerateResumeFromDataInputSchema = z.object({
  name: z.string().describe('The full name of the resume owner.'),
  email: z.string().email().describe('The email address of the resume owner.'),
  phone: z.string().describe('The phone number of the resume owner.'),
  linkedin: z.string().describe('The LinkedIn profile URL of the resume owner.'),
  github: z.string().describe('The GitHub profile URL of the resume owner.'),
  skills: z.array(z.string()).describe('A list of skills the resume owner possesses.'),
  experience: z.array(
    z.object({
      title: z.string().describe('The job title.'),
      company: z.string().describe('The company name.'),
      startDate: z.string().describe('The start date of the job.'),
      endDate: z.string().describe('The end date of the job.'),
      description: z.string().describe('A description of the job responsibilities.'),
    })
  ).describe('A list of work experiences.'),
  education: z.array(
    z.object({
      institution: z.string().describe('The name of the educational institution.'),
      degree: z.string().describe('The degree obtained.'),
      startDate: z.string().describe('The start date of the education.'),
      endDate: z.string().describe('The end date of the education.'),
      description: z.string().describe('A description of the education details.'),
    })
  ).describe('A list of education experiences.'),
  projects: z.array(
    z.object({
      name: z.string().describe('The name of the project.'),
      description: z.string().describe('A description of the project.'),
    })
  ).describe('A list of personal projects.'),
  additionalSections: z.array(
    z.object({
      title: z.string().describe('Title of the additional section'),
      content: z.string().describe('Content of the additional section'),
    })
  ).describe('Additional sections to be added in the resume'),
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
  prompt: `You are an expert resume writer AI. Your task is to generate a professional, ATS-optimized HTML resume based on the data provided.

Generate a single, complete HTML document. Include <html>, <head> with a <style> tag for formatting, and <body> tags.
Do not add any commentary or text outside of the HTML document itself.

Resume Data:
Name: {{{name}}}
Email: {{{email}}}
Phone: {{{phone}}}
LinkedIn: {{{linkedin}}}
GitHub: {{{github}}}

Skills: {{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Experience:
{{#each experience}}
- Title: {{{title}}}
  Company: {{{company}}}
  Dates: {{{startDate}}} - {{{endDate}}}
  Description: {{{description}}}
{{/each}}

Education:
{{#each education}}
- Institution: {{{institution}}}
  Degree: {{{degree}}}
  Dates: {{{startDate}}} - {{{endDate}}}
  Description: {{{description}}}
{{/each}}

Projects:
{{#each projects}}
- Name: {{{name}}}
  Description: {{{description}}}
{{/each}}

Additional Sections:
{{#each additionalSections}}
- Title: {{{title}}}
  Content: {{{content}}}
{{/each}}
`,
});

const generateResumeFromDataFlow = ai.defineFlow(
  {
    name: 'generateResumeFromDataFlow',
    inputSchema: GenerateResumeFromDataInputSchema,
    outputSchema: GenerateResumeFromDataOutputSchema,
  },
  async input => {
    const response = await ai.generate({
      prompt: prompt.render({input}).prompt!,
      model: 'googleai/gemini-1.5-flash',
    });
    return response.text;
  }
);
