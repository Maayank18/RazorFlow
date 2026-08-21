/**
 * Razorpay Customers API Adapter
 * Official Reference: https://razorpay.com/docs/api/customers/
 */

import { RazorpayClient, defaultRazorpayClient } from './client';
import { RazorpayCustomer } from './types';

export class CustomersAdapter {
  constructor(private client: RazorpayClient = defaultRazorpayClient) {}

  public async fetch(customerId: string, traceId?: string): Promise<RazorpayCustomer> {
    return this.client.request<RazorpayCustomer>(`/customers/${customerId}`, {
      method: 'GET',
      traceId,
    });
  }

  public async list(traceId?: string): Promise<{ entity: 'collection'; count: number; items: RazorpayCustomer[] }> {
    return this.client.request<{ entity: 'collection'; count: number; items: RazorpayCustomer[] }>('/customers', {
      method: 'GET',
      traceId,
    });
  }

  public async create(data: { name: string; contact: string; email: string; notes?: Record<string, string> }, traceId?: string): Promise<RazorpayCustomer> {
    return this.client.request<RazorpayCustomer>('/customers', {
      method: 'POST',
      body: data,
      traceId,
    });
  }
}

export const customersAdapter = new CustomersAdapter();
