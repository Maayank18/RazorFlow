/**
 * Razorpay Payments API Adapter
 * Official Reference: https://razorpay.com/docs/api/payments/
 */

import { RazorpayClient, defaultRazorpayClient } from './client';
import { RazorpayPayment } from './types';

export interface ListPaymentsOptions {
  from?: number; // timestamp in seconds
  to?: number;
  count?: number;
  skip?: number;
  expand?: string[];
}

export class PaymentsAdapter {
  constructor(private client: RazorpayClient = defaultRazorpayClient) {}

  /**
   * Fetch a payment by its unique ID (pay_...)
   */
  public async fetch(paymentId: string, traceId?: string): Promise<RazorpayPayment> {
    if (!paymentId || !paymentId.startsWith('pay_')) {
      throw new Error(`Invalid Razorpay payment ID format: "${paymentId}". Must begin with pay_`);
    }
    return this.client.request<RazorpayPayment>(`/payments/${paymentId}`, {
      method: 'GET',
      traceId,
    });
  }

  /**
   * List all payments with optional filtering
   */
  public async list(options: ListPaymentsOptions = {}, traceId?: string): Promise<{
    entity: 'collection';
    count: number;
    items: RazorpayPayment[];
  }> {
    const params = new URLSearchParams();
    if (options.from) params.set('from', options.from.toString());
    if (options.to) params.set('to', options.to.toString());
    if (options.count) params.set('count', options.count.toString());
    if (options.skip) params.set('skip', options.skip.toString());

    const qs = params.toString();
    const endpoint = `/payments${qs ? `?${qs}` : ''}`;
    return this.client.request<{ entity: 'collection'; count: number; items: RazorpayPayment[] }>(endpoint, {
      method: 'GET',
      traceId,
    });
  }

  /**
   * Capture an authorized payment
   */
  public async capture(paymentId: string, amount: number, currency: string = 'INR', traceId?: string): Promise<RazorpayPayment> {
    return this.client.request<RazorpayPayment>(`/payments/${paymentId}/capture`, {
      method: 'POST',
      body: { amount, currency },
      traceId,
    });
  }
}

export const paymentsAdapter = new PaymentsAdapter();
