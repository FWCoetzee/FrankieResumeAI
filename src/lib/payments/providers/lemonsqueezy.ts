import {
  PaymentProviderUnavailableError,
  type PaymentCheckout,
  type PaymentCheckoutRequest,
  type PaymentProviderAdapter,
} from '../types';

export class LemonSqueezyAdapter implements PaymentProviderAdapter {
  readonly provider = 'lemonsqueezy' as const;

  isConfigured(): boolean {
    return Boolean(process.env.LEMONSQUEEZY_API_KEY && process.env.LEMONSQUEEZY_STORE_ID && process.env.LEMONSQUEEZY_VARIANT_ID);
  }

  async createCheckout(request: PaymentCheckoutRequest): Promise<PaymentCheckout> {
    if (!this.isConfigured()) throw new PaymentProviderUnavailableError(this.provider);

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              custom: {
                resumeId: request.resumeId,
                ownerHash: request.ownerHash,
              },
            },
          },
          relationships: {
            store: { data: { type: 'stores', id: process.env.LEMONSQUEEZY_STORE_ID } },
            variant: { data: { type: 'variants', id: process.env.LEMONSQUEEZY_VARIANT_ID } },
          },
        },
      }),
    });
    const body = await response.json() as {
      data?: { id?: string; attributes?: { url?: string } };
      errors?: Array<{ detail?: string }>;
    };
    if (!response.ok) throw new Error(body.errors?.[0]?.detail ?? `Lemon Squeezy checkout failed (${response.status}).`);
    const id = body.data?.id;
    const checkoutUrl = body.data?.attributes?.url;
    if (!id || !checkoutUrl) throw new Error('Lemon Squeezy did not return a checkout URL.');
    return { provider: this.provider, checkoutUrl, providerReference: id };
  }
}
