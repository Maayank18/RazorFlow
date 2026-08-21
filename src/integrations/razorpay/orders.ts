/**
 * Razorpay Orders API Adapter
 * Official Reference: https://razorpay.com/docs/api/orders/
 */

import { RazorpayClient, defaultRazorpayClient } from './client';
import { RazorpayOrder, RazorpayPayment } from './types';

export interface CreateOrderInput {
  amount: number; // in paise
  currency: string;
  receipt?: string;
  notes?: Record<string, string>;
  partial_payment?: boolean;
}

export class OrdersAdapter {
  constructor(private client: RazorpayClient = defaultRazorpayClient) {}

  public async create(input: CreateOrderInput, traceId?: string): Promise<RazorpayOrder> {
    return this.client.request<RazorpayOrder>('/orders', {
      method: 'POST',
      body: input,
      traceId,
    });
  }

  public async fetch(orderId: string, traceId?: string): Promise<RazorpayOrder> {
    return this.client.request<RazorpayOrder>(`/orders/${orderId}`, {
      method: 'GET',
      traceId,
    });
  }

  public async fetchPayments(orderId: string, traceId?: string): Promise<{
    entity: 'collection';
    count: number;
    items: RazorpayPayment[];
  }> {
    return this.client.request<{ entity: 'collection'; count: number; items: RazorpayPayment[] }>(
      `/orders/${orderId}/payments`,
      { method: 'GET', traceId }
    );
  }

  public async list(traceId?: string): Promise<{ entity: 'collection'; count: number; items: RazorpayOrder[] }> {
    return this.client.request<{ entity: 'collection'; count: number; items: RazorpayOrder[] }>('/orders', {
      method: 'GET',
      traceId,
    });
  }
}

export const ordersAdapter = new OrdersAdapter();
