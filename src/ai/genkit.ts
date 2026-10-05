import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {huggingface} from 'genkit-huggingface';

export const ai = genkit({
  plugins: [
    googleAI(),
    huggingface({
      apiKey: process.env.HUGGINGFACE_TOKEN,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
