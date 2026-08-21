/**
 * Razorpay Disputes API Adapter
 * Official Reference: https://razorpay.com/docs/api/disputes/
 * 
 * Note: Razorpay documents dispute acceptance as an IRREVERSIBLE action.
 * Any mutation must pass through the CRITICAL policy engine with explicit user approval.
 */

import { RazorpayClient, defaultRazorpayClient } from './client';
import { RazorpayDispute } from './types';

export class DisputesAdapter {
  constructor(private client: RazorpayClient = defaultRazorpayClient) {}

  public async fetch(disputeId: string, traceId?: string): Promise<RazorpayDispute> {
    return this.client.request<RazorpayDispute>(`/disputes/${disputeId}`, {
      method: 'GET',
      traceId,
    });
  }

  public async list(traceId?: string): Promise<{ entity: 'collection'; count: number; items: RazorpayDispute[] }> {
    return this.client.request<{ entity: 'collection'; count: number; items: RazorpayDispute[] }>('/disputes', {
      method: 'GET',
      traceId,
    });
  }

  /**
   * Submit contest evidence for a dispute
   */
  public async contest(disputeId: string, evidenceSummary: string, traceId?: string): Promise<RazorpayDispute> {
    return this.client.request<RazorpayDispute>(`/disputes/${disputeId}/contest`, {
      method: 'PATCH',
      body: { summary: evidenceSummary },
      traceId,
    });
  }

  /**
   * Accept a dispute (IRREVERSIBLE - Critical Risk)
   */
  public async accept(disputeId: string, traceId?: string): Promise<RazorpayDispute> {
    return this.client.request<RazorpayDispute>(`/disputes/${disputeId}/accept`, {
      method: 'POST',
      traceId,
    });
  }
}

export const disputesAdapter = new DisputesAdapter();
