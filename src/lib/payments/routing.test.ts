import assert from 'node:assert/strict';
import test from 'node:test';

import { getMarketPaymentConfig, inferPaymentMarket, resolvePaymentProvider } from './routing';

test('routes South African visitors through PayFast with Yoco alternative', () => {
  const market = inferPaymentMarket('ZA');
  const config = getMarketPaymentConfig(market);

  assert.equal(config.currency, 'ZAR');
  assert.equal(config.amount, 99);
  assert.equal(resolvePaymentProvider(market), 'payfast');
  assert.deepEqual(config.providers, ['payfast', 'yoco']);
});

test('routes international visitors through PayPal with Lemon Squeezy alternative', () => {
  const market = inferPaymentMarket('US');
  const config = getMarketPaymentConfig(market);

  assert.equal(config.currency, 'USD');
  assert.equal(config.amount, 4.99);
  assert.equal(resolvePaymentProvider(market), 'paypal');
  assert.deepEqual(config.providers, ['paypal', 'lemonsqueezy']);
});

test('respects a provider choice only when it is valid for the market', () => {
  assert.equal(resolvePaymentProvider('south-africa', 'yoco'), 'yoco');
  assert.equal(resolvePaymentProvider('south-africa', 'paypal'), 'payfast');
});

test('routes card payments through the hosted card gateways', () => {
  assert.equal(resolvePaymentProvider('south-africa', undefined, 'card'), 'yoco');
  assert.equal(resolvePaymentProvider('international', undefined, 'card'), 'lemonsqueezy');
});
