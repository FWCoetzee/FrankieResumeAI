import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Replace "REPLACE_WITH_YOUR_API_KEY" with your actual Google AI API key.
// You can get a key from Google AI Studio: https://aistudio.google.com/app/apikey
const apiKey = "REPLACE_WITH_YOUR_API_KEY";

export const ai = genkit({
  plugins: [googleAI({apiKey: apiKey})],
  model: 'googleai/gemini-2.5-flash',
});
