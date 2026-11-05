import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getDb } from '@/lib/db';
import { verifyOwnedActiveResume } from '@/lib/resume-owner';
import { getAnonymousOwnerHashFromRequest } from '@/lib/anonymous-session';
import { getPaymentProvider } from '@/lib/payments/factory';
import {
  getMarketPaymentConfig,
  inferPaymentMarket,
  isKnownPaymentProvider,
  resolvePaymentProvider,
} from '@/lib/payments/routing';
import { PaymentProviderUnavailableError } from '@/lib/payments/types';
import { createPaymentTransaction, markPaymentRedirected } from '@/lib/payments/store';

const createPaymentSchema = z.object({
  resumeId: z.number().int().positive(),
  provider: z.string().optional(),
  paymentMethod: z.enum(['card', 'gateway']).optional(),
});

export async function POST(request: Request) {
  const ownerHash = getAnonymousOwnerHashFromRequest(request);
  if (!ownerHash) {
    return NextResponse.json({ error: 'Anonymous session required.' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payment request.', details: parsed.error.flatten() }, { status: 400 });
  }

  const db = await getDb();
  if (!(await verifyOwnedActiveResume(db, parsed.data.resumeId, ownerHash))) {
    return NextResponse.json({ error: 'You do not own this resume.' }, { status: 403 });
  }

  const country = request.headers.get('cf-ipcountry') ??
    request.headers.get('x-vercel-ip-country') ??
    request.headers.get('x-country-code');
  const market = inferPaymentMarket(country);
  const marketConfig = getMarketPaymentConfig(market);
  const preferredProvider = isKnownPaymentProvider(parsed.data.provider)
    ? parsed.data.provider
    : undefined;
  const provider = resolvePaymentProvider(market, preferredProvider, parsed.data.paymentMethod ?? 'gateway');
  const adapter = getPaymentProvider(provider);

  if (!adapter.isConfigured()) {
    return NextResponse.json({
      error: `${provider} is unavailable.`,
      alternatives: marketConfig.providers.filter((candidate) => {
        if (candidate === provider) return false;
        return getPaymentProvider(candidate).isConfigured();
      }),
      amount: marketConfig.amount,
      currency: marketConfig.currency,
    }, { status: 503 });
  }

  const origin = new URL(request.url).origin;
  try {
    const transaction = await createPaymentTransaction(db, {
      resumeId: parsed.data.resumeId,
      ownerHash,
      provider,
      amount: marketConfig.amount,
      currency: marketConfig.currency,
    });
    const checkout = await adapter.createCheckout({
      resumeId: parsed.data.resumeId,
      ownerHash,
      provider,
      amount: marketConfig.amount,
      currency: marketConfig.currency,
      returnUrl: `${origin}/payment/complete`,
      cancelUrl: `${origin}/payment/cancelled`,
    });
    await markPaymentRedirected(db, transaction.id, checkout.providerReference);

    return NextResponse.json({
      transactionId: transaction.id,
      provider: checkout.provider,
      checkoutUrl: checkout.checkoutUrl,
      method: checkout.method ?? 'GET',
      fields: checkout.fields,
      providerReference: checkout.providerReference,
      amount: marketConfig.amount,
      currency: marketConfig.currency,
    });
  } catch (error) {
    if (error instanceof PaymentProviderUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error(`[payment:create] provider=${provider}`, error);
    return NextResponse.json({ error: `${provider} could not start checkout.` }, { status: 502 });
  }
}
