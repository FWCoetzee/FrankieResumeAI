
import { getDb } from '@/lib/db';

export type PaymentProvider = 'payfast' | 'yoco' | 'paypal' | 'lemonsqueezy';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface PaymentSession {
  sessionId: string;
  checkoutUrl: string;
  amount: number;
  currency: string;
}

/**
 * PaymentService handles the routing and orchestration of payments
 * based on regional requirements defined in the PRD.
 */
export class PaymentService {
  private static readonly REGIONAL_CONFIG = {
    'ZA': {
      primary: 'payfast',
      secondary: 'yoco',
      currency: 'ZAR',
      amount: 99.00,
    },
    'INT': {
      primary: 'paypal',
      secondary: 'lemonsqueezy',
      currency: 'USD',
      amount: 4.99,
    },
  };

  /**
   * Determines the correct payment provider based on the user's region.
   * In a real implementation, the region would be detected via IP or User Settings.
   */
  public static async getProviderForRegion(region: 'ZA' | 'INT' = 'INT'): Promise<{
    provider: PaymentProvider;
    currency: string;
    amount: number;
  }> {
    const config = this.REGIONAL_CONFIG[region];
    return {
      provider: config.primary,
      currency: config.currency,
      amount: config.amount,
    };
  }

  /**
   * Creates a payment session with the selected provider.
   * This is a simplified implementation that returns a mock checkout URL.
   * In production, this would call the provider's API to create a real session.
   */
  public static async createCheckoutSession(
    resumeId: number,
    region: 'ZA' | 'INT' = 'INT'
  ): Promise<PaymentSession> {
    const { provider, currency, amount } = await this.getProviderForRegion(region);
    
    // In production: call provider.createSession({ amount, currency, ... })
    const sessionId = `pay_${Math.random().toString(36).substring(2, 15)}`;
    const checkoutUrl = `https://mock-payment-provider.com/${provider}/checkout?session=${sessionId}&amount=${amount}&currency=${currency}`;

    return {
      sessionId,
      checkoutUrl,
      amount,
      currency,
    };
  }

  /**
   * Records a payment in the database after webhook verification.
   */
  public static async recordPayment(
    resumeId: number,
    transactionId: string,
    provider: any,
    amount: number,
    currency: string,
    status: PaymentStatus = 'completed'
  ): Promise<void> {
    const db = await getDb();
    
    try {
      await db.query('BEGIN');

      // 1. Log the transaction
      await db.query(
        'INSERT INTO public.payments (resume_id, provider, transaction_id, amount, currency, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [resumeId, provider, transactionId, amount, currency, status]
      );

      // 2. Mark the resume as paid if status is completed
      if (status === 'completed') {
        await db.query(
          'UPDATE public.resumes SET is_paid = true, updated_at = NOW() WHERE id = $1',
          [resumeId]
        );
      }

      await db.query('COMMIT');
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }
}
