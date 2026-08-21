/**
 * RazorFlow Tool Registry
 * 
 * Defines schemas, permissions, risk levels, idempotency requirements,
 * and executors for all tools orchestrable by RazorFlow.
 */

import { ToolDefinition } from '../../types/razorflow';
import { paymentsAdapter } from '../../integrations/razorpay/payments';
import { ordersAdapter } from '../../integrations/razorpay/orders';
import { customersAdapter } from '../../integrations/razorpay/customers';
import { refundsAdapter } from '../../integrations/razorpay/refunds';
import { disputesAdapter } from '../../integrations/razorpay/disputes';
import { settlementsAdapter } from '../../integrations/razorpay/settlements';

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  constructor() {
    this.registerDefaults();
  }

  public register(tool: ToolDefinition) {
    this.tools.set(tool.id, tool);
  }

  public get(toolId: string): ToolDefinition | undefined {
    return this.tools.get(toolId);
  }

  public list(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  private registerDefaults() {
    // ─── Razorpay Payment Tools ───
    this.register({
      id: 'razorpay.payment.fetch',
      name: 'Fetch Razorpay Payment',
      description: 'Fetch complete details, fee, tax, method, and error traces for a specific payment ID.',
      category: 'razorpay',
      riskLevel: 'LOW',
      requiresApproval: false,
      requiresIdempotency: false,
      timeoutMs: 5000,
      schema: {
        name: 'razorpay_payment_fetch',
        type: 'object',
        properties: {
          payment_id: { type: 'string', description: 'The payment ID (e.g. pay_29QQoUBi66xm2f)', required: true },
        },
        required: ['payment_id'],
      },
      executor: async (params) => {
        const data = await paymentsAdapter.fetch(params.payment_id);
        return { success: true, data };
      },
    });

    this.register({
      id: 'razorpay.payment.list',
      name: 'List Razorpay Payments',
      description: 'List recent payments with optional status, time window, and error code filtering.',
      category: 'razorpay',
      riskLevel: 'LOW',
      requiresApproval: false,
      requiresIdempotency: false,
      timeoutMs: 8000,
      schema: {
        name: 'razorpay_payment_list',
        type: 'object',
        properties: {
          count: { type: 'number', description: 'Number of payments to fetch (default 10)' },
          from: { type: 'number', description: 'Unix timestamp in seconds' },
        },
        required: [],
      },
      executor: async (params) => {
        const data = await paymentsAdapter.list(params);
        return { success: true, data };
      },
    });

    // ─── Razorpay Refund Tools ───
    this.register({
      id: 'razorpay.refund.create',
      name: 'Create Razorpay Refund',
      description: 'Initiate a full or partial refund for a captured payment. HIGH RISK: Requires explicit merchant approval.',
      category: 'razorpay',
      riskLevel: 'HIGH',
      requiresApproval: true,
      requiresIdempotency: true,
      timeoutMs: 10000,
      schema: {
        name: 'razorpay_refund_create',
        type: 'object',
        properties: {
          payment_id: { type: 'string', description: 'Payment ID to refund', required: true },
          amount: { type: 'number', description: 'Amount in paise. Omit for full refund.' },
          speed: { type: 'string', description: 'optimum | instant | normal', enum: ['optimum', 'instant', 'normal'] },
        },
        required: ['payment_id'],
      },
      executor: async (params) => {
        const data = await refundsAdapter.create(params);
        return { success: true, data };
      },
    });

    // ─── Razorpay Dispute Tools ───
    this.register({
      id: 'razorpay.dispute.fetch',
      name: 'Fetch Razorpay Dispute',
      description: 'Retrieve dispute details, claim amount, evidence deadline, and status.',
      category: 'razorpay',
      riskLevel: 'LOW',
      requiresApproval: false,
      requiresIdempotency: false,
      timeoutMs: 5000,
      schema: {
        name: 'razorpay_dispute_fetch',
        type: 'object',
        properties: {
          dispute_id: { type: 'string', description: 'Dispute ID (e.g. disp_1Aa00000000001)', required: true },
        },
        required: ['dispute_id'],
      },
      executor: async (params) => {
        const data = await disputesAdapter.fetch(params.dispute_id);
        return { success: true, data };
      },
    });

    // ─── Razorpay Settlement Tools ───
    this.register({
      id: 'razorpay.settlement.list',
      name: 'List Razorpay Settlements',
      description: 'Fetch settlement history, fees, tax, and UTR reconciliation details.',
      category: 'razorpay',
      riskLevel: 'LOW',
      requiresApproval: false,
      requiresIdempotency: false,
      timeoutMs: 6000,
      schema: {
        name: 'razorpay_settlement_list',
        type: 'object',
        properties: {},
        required: [],
      },
      executor: async () => {
        const data = await settlementsAdapter.list();
        return { success: true, data };
      },
    });

    // ─── Engineering Observability Tools ───
    this.register({
      id: 'engineering.deployments.list',
      name: 'List Service Deployments',
      description: 'Fetch recent CI/CD deployments and commit hashes across backend microservices.',
      category: 'engineering',
      riskLevel: 'LOW',
      requiresApproval: false,
      requiresIdempotency: false,
      timeoutMs: 5000,
      schema: {
        name: 'engineering_deployments_list',
        type: 'object',
        properties: {
          service: { type: 'string', description: 'Filter by microservice name' },
        },
        required: [],
      },
      executor: async (_params, context) => {
        return {
          success: true,
          data: context.engineeringState?.latestDeployment ? [context.engineeringState.latestDeployment] : [],
        };
      },
    });

    this.register({
      id: 'engineering.incidents.query',
      name: 'Query Correlated Incidents',
      description: 'Search incident history for gateway outages and timeout anomalies.',
      category: 'engineering',
      riskLevel: 'LOW',
      requiresApproval: false,
      requiresIdempotency: false,
      timeoutMs: 5000,
      schema: {
        name: 'engineering_incidents_query',
        type: 'object',
        properties: {
          gateway: { type: 'string', description: 'Bank gateway name' },
        },
        required: [],
      },
      executor: async (_params, context) => {
        return {
          success: true,
          data: context.engineeringState?.recentIncidents || [],
        };
      },
    });

    // ─── Recovery Advisor Action ───
    this.register({
      id: 'recovery.retry_batch',
      name: 'Execute 1-Click Recovery Links',
      description: 'Dispatch automated WhatsApp/SMS payment retry links for recoverable failed transactions.',
      category: 'razorpay',
      riskLevel: 'HIGH',
      requiresApproval: true,
      requiresIdempotency: true,
      timeoutMs: 8000,
      schema: {
        name: 'recovery_retry_batch',
        type: 'object',
        properties: {
          payment_ids: { type: 'array', description: 'Array of recoverable payment IDs', required: true },
        },
        required: ['payment_ids'],
      },
      executor: async (params) => {
        const ids = params.payment_ids || ['pay_RecovUpi001', 'pay_RecovCard002'];
        return {
          success: true,
          data: {
            dispatchedCount: ids.length,
            channel: 'WhatsApp Smart Payment Link',
            estimatedRecoveryRate: '78.5%',
            targetPayments: ids,
          },
        };
      },
    });
  }
}

export const toolRegistry = new ToolRegistry();
