export const PAYMENT_PROVIDERS = ['paypal', 'payfast', 'yoco', 'lemonsqueezy'] as const;

export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];
export type PaymentCurrency = 'USD' | 'ZAR';
export type PaymentMarket = 'south-africa' | 'international';

export interface PaymentCheckoutRequest {
  resumeId: number;
  ownerHash: string;
  provider: PaymentProvider;
  amount: number;
  currency: PaymentCurrency;
  returnUrl: string;
  cancelUrl: string;
}

export interface PaymentCheckout {
  provider: PaymentProvider;
  checkoutUrl: string;
  method?: 'GET' | 'POST';
  fields?: Record<string, string>;
  providerReference?: string;
}

export interface PaymentProviderAdapter {
  readonly provider: PaymentProvider;
  isConfigured(): boolean;
  createCheckout(request: PaymentCheckoutRequest): Promise<PaymentCheckout>;
}

export class PaymentProviderUnavailableError extends Error {
  constructor(
    public readonly provider: PaymentProvider,
    message = `${provider} is not configured.`
  ) {
    super(message);
    this.name = 'PaymentProviderUnavailableError';
  }
}
