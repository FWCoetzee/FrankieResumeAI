
import { NextResponse } from 'next/server';
import { getAnonymousOwnerHashFromRequest } from '@/lib/anonymous-session';
import { PaymentService } from '@/lib/payments';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const ownerHash = getAnonymousOwnerHashFromRequest(request);
        if (!ownerHash) {
            return NextResponse.json({ error: 'Unauthorized: No anonymous session found.' }, { status: 401 });
        }

        const body = await request.json();
        const resumeId = body.resumeId;

        if (!resumeId || typeof resumeId !== 'number') {
            return NextResponse.json({ error: 'Resume ID is required.' }, { status: 400 });
        }

        // 1. Verify Ownership
        const db = await getDb();
        const res = await db.query(
            'SELECT id FROM resumes WHERE id = $1 AND owner_hash = $2 AND expires_at > NOW()', 
            [resumeId, ownerHash]
        );

        if (res.rows.length === 0) {
            return NextResponse.json({ error: 'Forbidden: You do not own this resume.' }, { status: 403 });
        }

        // 2. Determine Region (In production, detect via IP. Here we default to INT for demo).
        // We allow the client to pass a region hint for better UX.
        const region = (body.region === 'ZA' || body.region === 'INT') ? body.region : 'INT';

        // 3. Create Checkout Session via our Strategy Layer
        const session = await PaymentService.createCheckoutSession(resumeId, region);

        return NextResponse.json({
            checkoutUrl: session.checkoutUrl,
            amount: session.amount,
            currency: session.currency
        });
    } catch (error) {
        console.error('[Checkout] Error creating payment session:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
