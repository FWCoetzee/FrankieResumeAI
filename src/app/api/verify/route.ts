
import { NextResponse } from 'next/server';
import { runSystemVerification } from '@/lib/system-verify';

/**
 * Internal diagnostic endpoint to verify the health and 
 * implementation status of the various project phases.
 * 
 * WARNING: In production, this route should be protected by 
 * admin authentication or removed entirely.
 */
export async function GET(request: Request) {
    try {
        const verification = await runSystemVerification(request);
        
        const isHealthy = !verification.error && 
            Object.values(verification.results).every((r: any) => r.status !== 'FAIL');

        return NextResponse.json({
            healthy: isHealthy,
            ...verification
        }, { status: isHealthy ? 200 : 500 });

    } catch (error) {
        console.error('[Verify API] Critical error:', error);
        return NextResponse.json({ 
            healthy: false, 
            error: 'Internal Server Error during verification.' 
        }, { status: 500 });
    }
}
