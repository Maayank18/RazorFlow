/**
 * Razorpay Dedicated Typed API Client
 * 
 * Complies with official Razorpay API standards:
 * - Basic Auth (Key ID : Key Secret)
 * - Safe server-side credential isolation (never exposed to browser)
 * - Default: Test Mode
 * - Request Correlation ID (x-razorflow-trace-id)
 * - Transient error retry with exponential backoff
 * - Test fixture fallback for resilient offline demonstration
 */

import { RazorpayApiError, RazorpayAuthError, RazorpayRateLimitError } from './errors';
import { MOCK_PAYMENTS, MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_DISPUTES, MOCK_SETTLEMENTS } from './fixtures';

export interface RazorpayClientConfig {
  keyId?: string;
  keySecret?: string;
  environment?: 'test' | 'live';
  timeoutMs?: number;
  maxRetries?: number;
}

export class RazorpayClient {
  private keyId: string;
  private keySecret: string;
  private environment: 'test' | 'live';
  private timeoutMs: number;
  private maxRetries: number;
  private baseUrl: string;

  constructor(config: RazorpayClientConfig = {}) {
    this.keyId = config.keyId || process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo_flow_key';
    this.keySecret = config.keySecret || process.env.RAZORPAY_KEY_SECRET || 'rzp_test_demo_flow_secret';
    this.environment = config.environment || 'test';
    this.timeoutMs = config.timeoutMs || 8000;
    this.maxRetries = config.maxRetries ?? 2;
    this.baseUrl = 'https://api.razorpay.com/v1';
  }

  public getEnvironment(): 'test' | 'live' {
    return this.environment;
  }

  public isUsingRealCredentials(): boolean {
    return (
      !this.keyId.includes('demo') &&
      this.keySecret.length > 8 &&
      !this.keySecret.includes('demo')
    );
  }

  /**
   * Core HTTP Request with exponential backoff, correlation tracking, and graceful fallback
   */
  public async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: any;
      headers?: Record<string, string>;
      traceId?: string;
      idempotencyKey?: string;
    } = {}
  ): Promise<T> {
    const method = options.method || 'GET';
    const traceId = options.traceId || `rf_trace_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const authHeader = 'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');

    const headers: Record<string, string> = {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'x-razorflow-trace-id': traceId,
      ...(options.idempotencyKey ? { 'X-Razorpay-Idempotency-Key': options.idempotencyKey } : {}),
      ...(options.headers || {}),
    };

    // If using dummy test credentials, return verified deterministic test fixtures
    if (!this.isUsingRealCredentials()) {
      return this.handleMockSimulation<T>(endpoint, method, options.body, options.idempotencyKey);
    }

    let attempt = 0;
    let delay = 300;

    while (attempt <= this.maxRetries) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method,
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.ok) {
          return (await response.json()) as T;
        }

        if (response.status === 401 || response.status === 403) {
          throw new RazorpayAuthError('Razorpay authentication failed. Check Key ID and Secret.', traceId);
        }

        if (response.status === 429) {
          throw new RazorpayRateLimitError('Razorpay rate limit exceeded. Retry later.', traceId);
        }

        // Retry on 5xx server errors
        if (response.status >= 500 && attempt < this.maxRetries) {
          attempt++;
          await new Promise(res => setTimeout(res, delay));
          delay *= 2;
          continue;
        }

        const errorBody: any = await response.json().catch(() => ({}));
        throw new RazorpayApiError(
          errorBody.error?.description || `Razorpay API error: ${response.statusText}`,
          response.status,
          errorBody.error?.code,
          errorBody.error?.description,
          errorBody.error?.source,
          traceId
        );
      } catch (err: any) {
        if (attempt < this.maxRetries && (err.name === 'AbortError' || err.message?.includes('network'))) {
          attempt++;
          await new Promise(res => setTimeout(res, delay));
          delay *= 2;
          continue;
        }
        throw err;
      }
    }

    throw new RazorpayApiError('Max retries exceeded for Razorpay API call', 504, 'TIMEOUT', undefined, undefined, traceId);
  }

  /**
   * Deterministic Simulation Layer for Test Mode Demo
   */
  private async handleMockSimulation<T>(
    endpoint: string,
    method: string,
    body?: any,
    idempotencyKey?: string
  ): Promise<T> {
    // Artificial low latency to simulate real network (30-60ms)
    await new Promise(r => setTimeout(r, 45));

    if (endpoint.includes('/refund')) {
      const newRefund = {
        id: `rfn_test_${Math.random().toString(36).slice(2, 9)}`,
        entity: 'refund',
        amount: body?.amount || 1499900,
        currency: 'INR',
        payment_id: body?.payment_id || 'pay_Lz98dfHdfc001',
        status: 'processed',
        speed_processed: body?.speed || 'instant',
        speed_requested: body?.speed || 'instant',
        created_at: Math.floor(Date.now() / 1000),
        notes: { idempotencyKey: idempotencyKey || 'auto_key_1' }
      };
      return newRefund as unknown as T;
    }

    if (endpoint.startsWith('/payments')) {
      if (endpoint === '/payments') {
        return { entity: 'collection', count: MOCK_PAYMENTS.length, items: MOCK_PAYMENTS } as unknown as T;
      }
      const paymentId = endpoint.replace('/payments/', '').split('/')[0];
      const match = MOCK_PAYMENTS.find(p => p.id === paymentId);
      if (match) return match as unknown as T;
      return MOCK_PAYMENTS[0] as unknown as T;
    }

    if (endpoint.startsWith('/orders')) {
      if (endpoint === '/orders' && method === 'POST') {
        const newOrder = {
          id: `order_${Math.random().toString(36).slice(2, 9)}`,
          entity: 'order',
          amount: body?.amount || 100000,
          amount_paid: 0,
          amount_due: body?.amount || 100000,
          currency: body?.currency || 'INR',
          receipt: body?.receipt || 'receipt_sim_1',
          status: 'created',
          attempts: 0,
          created_at: Math.floor(Date.now() / 1000),
        };
        return newOrder as unknown as T;
      }
      return { entity: 'collection', count: MOCK_ORDERS.length, items: MOCK_ORDERS } as unknown as T;
    }

    if (endpoint.startsWith('/customers')) {
      return { entity: 'collection', count: MOCK_CUSTOMERS.length, items: MOCK_CUSTOMERS } as unknown as T;
    }

    if (endpoint.startsWith('/disputes')) {
      return { entity: 'collection', count: MOCK_DISPUTES.length, items: MOCK_DISPUTES } as unknown as T;
    }

    if (endpoint.startsWith('/settlements')) {
      return { entity: 'collection', count: MOCK_SETTLEMENTS.length, items: MOCK_SETTLEMENTS } as unknown as T;
    }

    return { success: true } as unknown as T;
  }
}

export const defaultRazorpayClient = new RazorpayClient();
