import type { PaymentProvider, PaymentProviderAdapter } from './types';
import { LemonSqueezyAdapter } from './providers/lemonsqueezy';
import { PayFastAdapter } from './providers/payfast';
import { PayPalAdapter } from './providers/paypal';
import { YocoAdapter } from './providers/yoco';

const providers = new Map<PaymentProvider, PaymentProviderAdapter>([
  ['paypal', new PayPalAdapter()],
  ['payfast', new PayFastAdapter()],
  ['yoco', new YocoAdapter()],
  ['lemonsqueezy', new LemonSqueezyAdapter()],
]);

export function getPaymentProvider(provider: PaymentProvider): PaymentProviderAdapter {
  const adapter = providers.get(provider);
  if (!adapter) {
    throw new Error(`Unsupported payment provider: ${provider}`);
  }
  return adapter;
}
