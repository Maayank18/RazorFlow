/**
 * Razorpay Settlements API Adapter
 * Official Reference: https://razorpay.com/docs/api/settlements/
 */

import { RazorpayClient, defaultRazorpayClient } from './client';
import { RazorpaySettlement } from './types';

export class SettlementsAdapter {
  constructor(private client: RazorpayClient = defaultRazorpayClient) {}

  public async fetch(settlementId: string, traceId?: string): Promise<RazorpaySettlement> {
    return this.client.request<RazorpaySettlement>(`/settlements/${settlementId}`, {
      method: 'GET',
      traceId,
    });
  }

  public async list(traceId?: string): Promise<{ entity: 'collection'; count: number; items: RazorpaySettlement[] }> {
    return this.client.request<{ entity: 'collection'; count: number; items: RazorpaySettlement[] }>('/settlements', {
      method: 'GET',
      traceId,
    });
  }

  public async fetchRecon(year: number, month: number, day?: number, traceId?: string): Promise<any> {
    const params = new URLSearchParams({ year: year.toString(), month: month.toString() });
    if (day) params.set('day', day.toString());
    return this.client.request(`/settlements/recon/combined?${params.toString()}`, {
      method: 'GET',
      traceId,
    });
  }
}

export const settlementsAdapter = new SettlementsAdapter();
