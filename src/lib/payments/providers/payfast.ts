import { createHash } from 'node:crypto';
import {
  PaymentProviderUnavailableError,
  type PaymentCheckout,
  type PaymentCheckoutRequest,
  type PaymentProviderAdapter,
} from '../types';

export class PayFastAdapter implements PaymentProviderAdapter {
  readonly provider = 'payfast' as const;

  isConfigured(): boolean {
    return Boolean(process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_MERCHANT_KEY);
  }

  async createCheckout(request: PaymentCheckoutRequest): Promise<PaymentCheckout> {
    if (!this.isConfigured()) throw new PaymentProviderUnavailableError(this.provider);

    const fields: Record<string, string> = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID!,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
      return_url: request.returnUrl,
      cancel_url: request.cancelUrl,
      notify_url: process.env.PAYFAST_NOTIFY_URL ?? '',
      name_first: 'Frankie',
      name_last: 'Resume AI',
      email_address: '',
      m_payment_id: `${request.resumeId}:${request.ownerHash}`,
      amount: request.amount.toFixed(2),
      item_name: 'Frankie Resume AI PDF export',
    };
    if (process.env.PAYFAST_PASSPHRASE) {
      fields.passphrase = process.env.PAYFAST_PASSPHRASE;
    }

    const signature = createHash('md5')
      .update(Object.entries(fields).filter(([, value]) => value !== '').map(([key, value]) =>
        `${key}=${encodeURIComponent(value).replace(/%20/g, '+')}`
      ).join('&'))
      .digest('hex');

    delete fields.passphrase;
    fields.signature = signature;
    const baseUrl = process.env.PAYFAST_MODE === 'live'
      ? 'https://www.payfast.co.za/eng/process'
      : 'https://sandbox.payfast.co.za/eng/process';

    return {
      provider: this.provider,
      checkoutUrl: baseUrl,
      method: 'POST',
      fields,
      providerReference: fields.m_payment_id,
    };
  }
}
