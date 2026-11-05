
import { NextResponse } from 'next/server';
import { PaymentService, type PaymentProvider } from '@/lib/payments';

/**
 * Webhook handler for payment providers.
 * 
 * In a real implementation, this route would:
 * 1. Verify the provider's digital signature (HMAC) to prevent spoofing.
 * 2. Parse the provider-specific payload.
 * 3. Map the provider's internal ID back to our resumeId.
 */
export async function POST(request: Request) {
    try {
        const payload = await request.json();
        
        // MOCK VERIFICATION LOGIC
        // In production, this part is critical:
        // const isValid = await verifySignature(request.headers, payload, PROVIDER_SECRET);
        // if (!isValid) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });

        const { 
            resumeId, 
            transactionId, 
            provider, 
            amount, 
            currency, 
            status 
        } = payload;

        if (!resumeId || !transactionId || !provider) {
            return NextResponse.json({ error: 'Missing payment data' }, { status: 400 });
        }

        // Record the payment and mark the resume as paid
        await PaymentService.recordPayment(
            Number(resumeId),
            transactionId,
            provider as PaymentProvider,
            Number(amount),
            currency,
            status === 'success' ? 'completed' : 'failed'
        );

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('[Webhook] Error processing payment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
