import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

import { getDb } from '@/lib/db';
import { markPaymentPaid } from '@/lib/payments/store';
import type { PaymentProvider } from '@/lib/payments/types';

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function verifyPayPalWebhook(request: Request, payload: unknown): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!webhookId || !clientId || !clientSecret) return false;

  const baseUrl = process.env.PAYPAL_API_BASE_URL ??
    (process.env.PAYPAL_MODE === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com');
  const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!tokenResponse.ok) return false;
  const tokenBody = await tokenResponse.json() as { access_token?: string };
  if (!tokenBody.access_token) return false;

  const verificationResponse = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + tokenBody.access_token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: request.headers.get('paypal-auth-algo'),
      cert_url: request.headers.get('paypal-cert-url'),
      transmission_id: request.headers.get('paypal-transmission-id'),
      transmission_sig: request.headers.get('paypal-transmission-sig'),
      transmission_time: request.headers.get('paypal-transmission-time'),
      webhook_id: webhookId,
      webhook_event: payload,
    }),
  });
  if (!verificationResponse.ok) return false;
  const verification = await verificationResponse.json() as { verification_status?: string };
  return verification.verification_status === 'SUCCESS';
}

export async function POST(request: Request, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  const supported = ['paypal', 'payfast', 'yoco', 'lemonsqueezy'] as const;
  if (!supported.includes(provider as PaymentProvider)) {
    return NextResponse.json({ error: 'Unsupported provider.' }, { status: 404 });
  }

  const rawBody = await request.text();
  let payload: any;
  try {
    payload = provider === 'payfast'
      ? Object.fromEntries(new URLSearchParams(rawBody))
      : JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
  }

  let verified = false;
  let eventId = '';
  let providerReference = '';
  let amount = 0;
  let currency: 'USD' | 'ZAR' = 'USD';

  if (provider === 'yoco') {
    const signature = request.headers.get('webhook-signature') ?? request.headers.get('x-yoco-signature') ?? '';
    const secret = process.env.YOCO_WEBHOOK_SECRET ?? '';
    verified = Boolean(secret) && safeEqual(signature, createHmac('sha256', secret).update(rawBody).digest('hex'));
    eventId = String(payload.id ?? payload.payload?.id ?? createHash('sha256').update(rawBody).digest('hex'));
    providerReference = String(payload.payload?.checkoutId ?? payload.payload?.id ?? '');
    amount = Number(payload.payload?.amount ?? 0) / 100;
    currency = 'ZAR';
  } else if (provider === 'lemonsqueezy') {
    const signature = request.headers.get('x-signature') ?? '';
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? '';
    verified = Boolean(secret) && safeEqual(signature, createHmac('sha256', secret).update(rawBody).digest('hex'));
    eventId = String(payload.data?.id ?? createHash('sha256').update(rawBody).digest('hex'));
    providerReference = String(payload.meta?.custom_data?.checkoutId ?? payload.data?.id ?? '');
    amount = Number(payload.meta?.custom_data?.amount ?? payload.data?.attributes?.total ?? 0) / 100;
    currency = String(payload.data?.attributes?.currency ?? 'USD').toUpperCase() === 'ZAR' ? 'ZAR' : 'USD';
  } else if (provider === 'payfast') {
    const signature = String(payload.signature ?? '');
    const unsigned = Object.entries(payload)
      .filter(([key]) => key !== 'signature')
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value)).replace(/%20/g, '+')}`)
      .join('&');
    const passphrase = process.env.PAYFAST_PASSPHRASE;
    const signed = passphrase
      ? `${unsigned}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
      : unsigned;
    verified = safeEqual(signature, createHash('md5').update(signed).digest('hex'));
    eventId = String(payload.pf_payment_id ?? createHash('sha256').update(rawBody).digest('hex'));
    providerReference = String(payload.m_payment_id ?? '');
    amount = Number(payload.amount_gross ?? 0);
    currency = 'ZAR';
  } else {
    verified = payload.event_type?.startsWith('PAYMENT.CAPTURE.') === true &&
      await verifyPayPalWebhook(request, payload);
    eventId = String(payload.id ?? createHash('sha256').update(rawBody).digest('hex'));
    providerReference = String(payload.resource?.custom_id ?? payload.resource?.supplementary_data?.related_ids?.order_id ?? '');
    amount = Number(payload.resource?.amount?.value ?? 0);
    currency = String(payload.resource?.amount?.currency_code ?? 'USD').toUpperCase() === 'ZAR' ? 'ZAR' : 'USD';
  }

  if (!verified) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
  }
  if (!providerReference || !eventId || amount <= 0) {
    return NextResponse.json({ error: 'Incomplete payment event.' }, { status: 400 });
  }

  const db = await getDb();
  const inserted = await db.query(
    `INSERT INTO public.payment_webhook_events (id, provider, event_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (provider, event_id) DO NOTHING
     RETURNING id`,
    [randomUUID(), provider, eventId]
  );
  if (inserted.rows.length === 0) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const paid = await markPaymentPaid(db, {
    provider: provider as PaymentProvider,
    providerReference,
    amount,
    currency,
  });
  if (!paid) {
    return NextResponse.json({ error: 'Payment transaction mismatch.' }, { status: 409 });
  }
  return NextResponse.json({ received: true, transactionId: paid.transaction.id });
}
