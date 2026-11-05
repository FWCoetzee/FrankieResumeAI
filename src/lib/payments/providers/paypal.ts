import {
  PaymentProviderUnavailableError,
  type PaymentCheckout,
  type PaymentCheckoutRequest,
  type PaymentProviderAdapter,
} from '../types';

export class PayPalAdapter implements PaymentProviderAdapter {
  readonly provider = 'paypal' as const;

  isConfigured(): boolean {
    return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
  }

  async createCheckout(request: PaymentCheckoutRequest): Promise<PaymentCheckout> {
    if (!this.isConfigured()) throw new PaymentProviderUnavailableError(this.provider);

    const baseUrl = process.env.PAYPAL_API_BASE_URL ??
      (process.env.PAYPAL_MODE === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com');
    const accessTokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    if (!accessTokenResponse.ok) {
      throw new Error(`PayPal authentication failed (${accessTokenResponse.status}).`);
    }
    const { access_token: accessToken } = await accessTokenResponse.json() as { access_token?: string };
    if (!accessToken) throw new Error('PayPal did not return an access token.');

    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          custom_id: `${request.resumeId}:${request.ownerHash}`,
          amount: {
            currency_code: request.currency,
            value: request.amount.toFixed(2),
          },
        }],
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: 'Frankie Resume AI',
              user_action: 'PAY_NOW',
              return_url: request.returnUrl,
              cancel_url: request.cancelUrl,
            },
          },
        },
      }),
    });
    const body = await response.json() as { id?: string; links?: Array<{ rel?: string; href?: string }>; message?: string };
    if (!response.ok) throw new Error(body.message ?? `PayPal checkout failed (${response.status}).`);

    const approvalUrl = body.links?.find((link) => link.rel === 'approve')?.href;
    if (!body.id || !approvalUrl) throw new Error('PayPal did not return an approval URL.');
    return { provider: this.provider, checkoutUrl: approvalUrl, providerReference: body.id };
  }
}
