import {
  PAYMENT_PROVIDERS,
  type PaymentCurrency,
  type PaymentMarket,
  type PaymentProvider,
} from './types';

export type PaymentMethod = 'card' | 'gateway';

export const PAYMENT_PRICES: Record<PaymentCurrency, number> = {
  USD: 4.99,
  ZAR: 99,
};

export function inferPaymentMarket(countryCode: string | null): PaymentMarket {
  return countryCode?.trim().toUpperCase() === 'ZA'
    ? 'south-africa'
    : 'international';
}

export function getMarketPaymentConfig(market: PaymentMarket) {
  if (market === 'south-africa') {
    return {
      currency: 'ZAR' as const,
      amount: PAYMENT_PRICES.ZAR,
      primaryProvider: 'payfast' as const,
      alternativeProviders: ['yoco'] as const,
      providers: ['payfast', 'yoco'] as const,
    };
  }

  return {
    currency: 'USD' as const,
    amount: PAYMENT_PRICES.USD,
    primaryProvider: 'paypal' as const,
    alternativeProviders: ['lemonsqueezy'] as const,
    providers: ['paypal', 'lemonsqueezy'] as const,
  };
}

export function resolvePaymentProvider(
  market: PaymentMarket,
  preferredProvider?: PaymentProvider,
  paymentMethod: PaymentMethod = 'gateway'
): PaymentProvider {
  const config = getMarketPaymentConfig(market);
  if (paymentMethod === 'card') {
    return market === 'south-africa' ? 'yoco' : 'lemonsqueezy';
  }
  if (!preferredProvider || !config.providers.some((candidate) => candidate === preferredProvider)) {
    return config.primaryProvider;
  }
  return preferredProvider;
}

export function isKnownPaymentProvider(value: unknown): value is PaymentProvider {
  return typeof value === 'string' &&
    (PAYMENT_PROVIDERS as readonly string[]).includes(value);
}
