import {
  PaymentProviderUnavailableError,
  type PaymentCheckout,
  type PaymentCheckoutRequest,
  type PaymentProviderAdapter,
} from '../types';

export class YocoAdapter implements PaymentProviderAdapter {
  readonly provider = 'yoco' as const;

  isConfigured(): boolean {
    return Boolean(process.env.YOCO_SECRET_KEY);
  }

  async createCheckout(request: PaymentCheckoutRequest): Promise<PaymentCheckout> {
    if (!this.isConfigured()) throw new PaymentProviderUnavailableError(this.provider);

    const response = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(request.amount * 100),
        currency: request.currency,
        successUrl: request.returnUrl,
        cancelUrl: request.cancelUrl,
        metadata: {
          resumeId: request.resumeId,
          ownerHash: request.ownerHash,
        },
      }),
    });
    const body = await response.json() as { id?: string; redirectUrl?: string; message?: string };
    if (!response.ok) throw new Error(body.message ?? `Yoco checkout failed (${response.status}).`);
    if (!body.id || !body.redirectUrl) throw new Error('Yoco did not return a checkout URL.');
    return { provider: this.provider, checkoutUrl: body.redirectUrl, providerReference: body.id };
  }
}
