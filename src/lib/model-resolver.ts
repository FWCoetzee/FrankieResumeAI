import { ai } from '@/ai/genkit';

const GOOGLE_MODELS = {
  flash: ['gemini-3-flash-preview', 'gemini-flash-latest', 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest'],
  pro: ['gemini-2.5-pro', 'gemini-1.5-pro', 'gemini-1.5-pro-latest'],
};

function csv(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function configuredProviders(): string[] {
  const explicit = csv(process.env.AI_PROVIDERS).map((provider) => provider.toLowerCase());
  return explicit.length > 0 ? explicit : ['google', 'huggingface', 'ollama'];
}

/** Resolve a provider-qualified Genkit model reference and verify it accepts a small probe. */
export async function resolveWorkingModel(type: 'flash' | 'pro'): Promise<string> {
  const providers = configuredProviders();
  const candidates: string[] = [];

  for (const provider of providers) {
    if (provider === 'google') {
      candidates.push(...GOOGLE_MODELS[type].map((model) => `googleai/${model}`));
      continue;
    }

    if (provider === 'huggingface') {
      const models = csv(process.env.HUGGINGFACE_MODELS);
      candidates.push(...models.map((model) => `huggingface/${model}`));
      continue;
    }

    if (provider === 'ollama') {
      const models = csv(process.env.OLLAMA_MODELS ?? process.env.OLLAMA_MODEL ?? 'llama3.2');
      candidates.push(...models.map((model) => `ollama/${model}`));
    }
  }

  for (const modelRef of candidates) {
    try {
      await ai.generate({ model: modelRef, prompt: 'ping' });
      console.log(`[ModelResolver] Successfully resolved ${type} model to: ${modelRef}`);
      return modelRef;
    } catch (error: any) {
      const message = String(error?.message ?? error);
      if (/NOT_FOUND|404|model .* not found|unknown model/i.test(message)) {
        console.warn(`[ModelResolver] ${modelRef} unavailable, trying next candidate...`);
        continue;
      }
      throw error;
    }
  }

  throw new Error(`Could not resolve a working AI model for type '${type}'.`);
}
