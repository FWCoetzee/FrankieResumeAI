
import { getDb } from '@/lib/db';
import { getAnonymousOwnerHashFromRequest } from '@/lib/anonymous-session';

/**
 * SystemVerify provides diagnostic checks to ensure the core implementation
 * stages (Anonymous Core, Anti-Abuse, AI Engine, and Payments) are functioning.
 */
export async function runSystemVerification(request: Request) {
  const results: any = {
    timestamp: new Date().toISOString(),
    phase1_anonymous_core: { status: 'pending', details: '' },
    phase2_anti_abuse: { status: 'pending', details: '' },
    phase3_ai_engine: { status: 'pending', details: '' },
    payments_infrastructure: { status: 'pending', details: '' },
  };

  try {
    const ownerHash = getAnonymousOwnerHashFromRequest(request);
    const db = await getDb();

    // --- Phase 1: Anonymous Core ---
    if (!ownerHash) {
      results.phase1_anonymous_core = { status: 'FAIL', details: 'No anonymous session cookie found in request.' };
    } else {
      const res = await db.query('SELECT count(*) FROM resumes WHERE owner_hash = $1', [ownerHash]);
      results.phase1_anonymous_core = { 
        status: 'PASS', 
        details: `Session active. Found ${res.rows[0].count} resumes for this hash.` 
      };
    }

    // --- Phase 2: Anti-Abuse ---
    // We verify if the abuse-limit utility is reachable and functional
    const { checkAnonymousGenerationLimit } = await import('@/lib/abuse-limit');
    if (ownerHash) {
      const limit = checkAnonymousGenerationLimit(ownerHash);
      results.phase2_anti_abuse = { 
        status: 'PASS', 
        details: `Rate limit check functional. Allowed: ${limit.allowed}.` 
      };
    } else {
      results.phase2_anti_abuse = { status: 'SKIP', details: 'Requires active session.' };
    }

    // --- Phase 3: AI Engine ---
    // Verify the Genkit AI configuration is loaded
    const { ai } = await import('@/ai/genkit');
    if (ai) {
      results.phase3_ai_engine = { status: 'PASS', details: 'Genkit AI instance initialized.' };
    } else {
      results.phase3_ai_engine = { status: 'FAIL', details: 'AI instance not found.' };
    }

    // --- Payments Infrastructure ---
    const paymentCheck = await db.query('SELECT count(*) FROM payments');
    results.payments_infrastructure = { 
      status: 'PASS', 
      details: `Payments table active. Total records: ${paymentCheck.rows[0].count}.` 
    };

  } catch (error: any) {
    console.error('[SystemVerify] Verification error:', error);
    return { error: error.message, results };
  }

  return { success: true, results };
}
