/**
 * Razorpay Refunds API Adapter
 * Official Reference: https://razorpay.com/docs/api/refunds/
 * 
 * Supports idempotent refund execution and instant/normal speed processing.
 */

import { RazorpayClient, defaultRazorpayClient } from './client';
import { RazorpayRefund } from './types';

export interface CreateRefundInput {
  payment_id: string;
  amount?: number; // In paise. If omitted, full refund is issued.
  speed?: 'normal' | 'optimum' | 'instant';
  notes?: Record<string, string>;
  receipt?: string;
  idempotencyKey?: string;
}

export class RefundsAdapter {
  constructor(private client: RazorpayClient = defaultRazorpayClient) {}

  /**
   * Create an idempotent refund for a captured payment
   */
  public async create(input: CreateRefundInput, traceId?: string): Promise<RazorpayRefund> {
    if (!input.payment_id || !input.payment_id.startsWith('pay_')) {
      throw new Error(`Invalid payment ID for refund: ${input.payment_id}`);
    }

    const idempotencyKey = input.idempotencyKey || `rf_rfn_${input.payment_id}_${input.amount || 'full'}_${Date.now()}`;

    return this.client.request<RazorpayRefund>(`/payments/${input.payment_id}/refund`, {
      method: 'POST',
      body: {
        amount: input.amount,
        speed: input.speed || 'optimum',
        notes: input.notes,
        receipt: input.receipt,
      },
      idempotencyKey,
      traceId,
    });
  }

  public async fetch(refundId: string, traceId?: string): Promise<RazorpayRefund> {
    return this.client.request<RazorpayRefund>(`/refunds/${refundId}`, {
      method: 'GET',
      traceId,
    });
  }

  public async list(traceId?: string): Promise<{ entity: 'collection'; count: number; items: RazorpayRefund[] }> {
    return this.client.request<{ entity: 'collection'; count: number; items: RazorpayRefund[] }>('/refunds', {
      method: 'GET',
      traceId,
    });
  }
}

export const refundsAdapter = new RefundsAdapter();
