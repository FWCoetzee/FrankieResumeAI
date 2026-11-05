import { generatedResumeSchema, type GeneratedResumeData } from './schema';

export type ProviderErrorCategory =
  | 'authentication'
  | 'quota'
  | 'model'
  | 'timeout'
  | 'provider-or-network';

export type GenerationStage =
  | 'request'
  | 'ownership'
  | 'rate-limit'
  | 'input-validation'
  | 'provider'
  | 'output-validation'
  | 'database'
  | 'completed';

export function classifyProviderError(error: unknown): ProviderErrorCategory {
  const message = error instanceof Error ? error.message : String(error);

  if (/401|403|api key|unauthenticated|permission denied/i.test(message)) {
    return 'authentication';
  }
  if (/429|quota|resource exhausted/i.test(message)) {
    return 'quota';
  }
  if (/404|not found|model/i.test(message)) {
    return 'model';
  }
  if (/timeout|timed out|deadline exceeded|aborted/i.test(message)) {
    return 'timeout';
  }
  return 'provider-or-network';
}

export function verifyGeneratedResume(value: unknown): value is GeneratedResumeData {
  return generatedResumeSchema.safeParse(value).success;
}

export function logGenerationCheck(
  stage: GenerationStage,
  result: 'passed' | 'failed',
  details: { resumeId: number; requestId?: string },
): void {
  const request = details.requestId ? ` requestId=${details.requestId}` : '';
  console.log(
    `[AI generation] stage=${stage} result=${result} resumeId=${details.resumeId}${request}`,
  );
}
