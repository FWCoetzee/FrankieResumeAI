type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

const GENERATION_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const GENERATION_LIMIT_PER_WINDOW = 5;

const generationBuckets = new Map<string, number[]>();

export function resetAnonymousGenerationLimitState() {
  generationBuckets.clear();
}

export function checkAnonymousGenerationLimit(ownerHash: string): RateLimitResult {
  const now = Date.now();
  const existing = generationBuckets.get(ownerHash) ?? [];
  const recent = existing.filter((timestamp) => now - timestamp < GENERATION_LIMIT_WINDOW_MS);

  if (recent.length >= GENERATION_LIMIT_PER_WINDOW) {
    const oldest = recent[0];
    const retryAfterMs = Math.max(0, GENERATION_LIMIT_WINDOW_MS - (now - oldest));
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  recent.push(now);
  generationBuckets.set(ownerHash, recent);

  return { allowed: true };
}
