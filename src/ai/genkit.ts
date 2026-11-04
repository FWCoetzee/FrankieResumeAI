import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import openAICompatible from '@genkit-ai/compat-oai';
import { ollama } from 'genkitx-ollama';

const googleApiKey =
  process.env.GOOGLE_GENAI_API_KEY ??
  process.env.GOOGLE_API_KEY ??
  process.env.GEMINI_API_KEY;
const huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY ?? process.env.HF_TOKEN;
const huggingFaceBaseUrl = process.env.HUGGINGFACE_BASE_URL ?? 'https://router.huggingface.co/v1';
const ollamaServerAddress = process.env.OLLAMA_HOST ?? process.env.OLLAMA_SERVER_URL ?? 'http://127.0.0.1:11434';
const ollamaApiKey = process.env.OLLAMA_API_KEY;
const ollamaModels = (process.env.OLLAMA_MODELS ?? process.env.OLLAMA_MODEL ?? 'llama3.2')
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean);

export const ai = genkit({
  plugins: [
    ...(googleApiKey ? [googleAI({ apiKey: googleApiKey })] : []),
    ...(huggingFaceApiKey
      ? [openAICompatible({
          name: 'huggingface',
          apiKey: huggingFaceApiKey,
          baseURL: huggingFaceBaseUrl,
        })]
      : []),
    ...(ollamaModels.length
      ? [ollama({
          models: ollamaModels.map((name) => ({ name })),
          serverAddress: ollamaServerAddress,
          requestHeaders: ollamaApiKey
            ? { Authorization: `Bearer ${ollamaApiKey}` }
            : undefined,
        })]
      : []),
  ],
  model: 'googleai/gemini-3-flash-preview',
});
