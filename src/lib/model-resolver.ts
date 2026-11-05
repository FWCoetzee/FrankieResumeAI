const GOOGLE_MODELS = {
  flash: ['gemini-3.6-flash', 'gemini-flash-lite-latest', 'gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-3-flash-preview'],
  pro: ['gemini-3.1-pro-preview', 'gemini-pro-latest'],
  gemma: ['gemma-4-26b-a4b-it', 'gemma-4-31b-it'],
};

function csv(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function configuredProviders(): string[] {
  const explicit = csv(process.env.AI_PROVIDERS).map((provider) => provider.toLowerCase());
  return explicit.length > 0 ? explicit.filter(provider => provider === 'google') : ['google'];
}

const resolvedModels = new Map<'flash' | 'pro' | 'gemma', Promise<string>>();

/** Resolve the preferred configured model without spending a generation request on probing. */
export async function resolveWorkingModel(type: 'flash' | 'pro' | 'gemma'): Promise<string> {
  const cached = resolvedModels.get(type);
  if (cached) return cached;

  const resolution = resolveModel(type);
  resolvedModels.set(type, resolution);
  return resolution;
}

async function resolveModel(type: 'flash' | 'pro' | 'gemma'): Promise<string> {
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

  if (candidates.length === 0) {
    throw new Error(`No AI provider is configured for type '${type}'.`);
  }

  console.log(`[ModelResolver] Using ${type} model: ${candidates[0]}`);
  return candidates[0];
}
