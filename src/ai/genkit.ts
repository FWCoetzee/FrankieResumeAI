import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const googleApiKey = "AIzaSyCrSRgmrB8zvY56c8EqElM4VZRe7-_IUeQ";

export const ai = genkit({
  plugins: [
    googleAI({apiKey: googleApiKey}),
  ],
  model: 'googleai/gemini-2.5-flash',
});
