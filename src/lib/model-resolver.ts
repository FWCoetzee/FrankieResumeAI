import { googleAI } from '@genkit-ai/google-genai';
import { ai } from '@/ai/genkit';

/**
 * A list of common Google AI model identifiers.
 * We include both aliases and specific versions to maximize compatibility.
 */
const MODEL_CANDIDATES = {
  flash: [
    'gemini-3',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-001',
    'gemini-pro',
  ],
  pro: [
    'gemini-2.5-pro',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro-001',
    'gemini-pro-vision',
  ],
};

/**
 * Attempts to resolve a working model from a list of candidates by 
 * performing a lightweight probe call.
 */
export async function resolveWorkingModel(type: 'flash' | 'pro'): Promise<string> {
  const candidates = MODEL_CANDIDATES[type];
  
  for (const modelId of candidates) {
    try {
      const model = googleAI.model(modelId);
      
      // Use ai.generate for a real API probe to verify model availability
      await ai.generate({
        model: model,
        prompt: 'ping',
      });
      
      console.log(`[ModelResolver] Successfully resolved ${type} model to: ${modelId}`);
      return modelId;
    } catch (e: any) {
      // We only continue if it's a 404/NOT_FOUND error. 
      if (e.message?.includes('NOT_FOUND') || e.message?.includes('404')) {
        console.warn(`[ModelResolver] Model ${modelId} not found, trying next...`);
        continue;
      }
      throw e;
    }
  }
  
  throw new Error(`Could not resolve a working Google AI model for type: ${type}`);
}
