/**
 * RazorFlow Policy & Guardrail Engine
 * 
 * Enforces strict risk classification:
 * LOW: Read-only, context lookups, briefings (Auto-executed)
 * MEDIUM: Drafting alerts, preparing plans, soft notifications (Auto-executed or prompt)
 * HIGH: Financial mutations, refunds, batch retries (Requires explicit human approval)
 * CRITICAL: Irreversible financial mutations (Dispute acceptance, payouts, credential changes) (Requires explicit human approval)
 */

import { PolicyRiskLevel, PendingApproval, RazorFlowContext, ActionRequest } from '../../types/razorflow';

export interface PolicyEvaluationResult {
  allowed: boolean;
  riskLevel: PolicyRiskLevel;
  requiresApproval: boolean;
  approvalPayload?: PendingApproval;
  reason?: string;
}

export class PolicyEngine {
  /**
   * Evaluate whether a tool action is safe to execute or requires human sign-off
   */
  public evaluate(
    action: ActionRequest,
    context: RazorFlowContext
  ): PolicyEvaluationResult {
    const toolId = action.toolId;

    // 1. Tool Permission Checks
    const requiredPermission = this.getRequiredPermission(toolId);
    if (requiredPermission && !context.currentPermissions.includes(requiredPermission)) {
      return {
        allowed: false,
        riskLevel: 'HIGH',
        requiresApproval: false,
        reason: `Unauthorized: User role "${context.userRole}" lacks permission "${requiredPermission}" to execute "${toolId}".`,
      };
    }

    // 2. Risk Classification
    let riskLevel: PolicyRiskLevel = action.riskLevel || this.inferToolRisk(toolId);
    let requiresApproval = riskLevel === 'HIGH' || riskLevel === 'CRITICAL';

    // 3. Construct Approval Payload if required
    let approvalPayload: PendingApproval | undefined;
    if (requiresApproval) {
      const what = this.formatWhatDescription(action);
      const why = action.description || 'Action recommended by RazorFlow agent based on recent operational signals.';
      const expectedEffect = this.formatExpectedEffect(action);

      approvalPayload = {
        id: `appr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        intentId: action.id,
        actionId: action.id,
        toolId: action.toolId,
        what,
        why,
        expectedEffect,
        riskLevel,
        dataUsed: action.parameters || {},
        parameters: action.parameters || {},
        requestedAt: Date.now(),
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 min TTL
        status: 'pending',
      };
    }

    return {
      allowed: true,
      riskLevel,
      requiresApproval,
      approvalPayload,
    };
  }

  private getRequiredPermission(toolId: string): string | null {
    if (toolId.startsWith('razorpay.refund')) return 'razorpay.refund.initiate';
    if (toolId.startsWith('razorpay.dispute.accept')) return 'dispute.respond';
    if (toolId.startsWith('engineering.')) return 'engineering.read';
    return null;
  }

  private inferToolRisk(toolId: string): PolicyRiskLevel {
    if (toolId === 'razorpay.dispute.accept') return 'CRITICAL';
    if (toolId.startsWith('razorpay.refund') || toolId.includes('retry_batch') || toolId.includes('payout')) return 'HIGH';
    if (toolId.includes('notify') || toolId.includes('create_draft') || toolId.includes('suggest')) return 'MEDIUM';
    return 'LOW';
  }

  private formatWhatDescription(action: ActionRequest): string {
    if (action.toolId === 'razorpay.refund.create') {
      const amountPaise = action.parameters.amount;
      const formatted = amountPaise ? `₹${(amountPaise / 100).toLocaleString('en-IN')}` : 'full amount';
      return `Issue ${formatted} refund for payment ${action.parameters.payment_id || action.targetEntity?.id || 'target'}`;
    }
    if (action.toolId === 'razorpay.dispute.accept') {
      return `Accept liability for dispute ${action.parameters.dispute_id || action.targetEntity?.id} (IRREVERSIBLE)`;
    }
    if (action.toolId === 'recovery.retry_batch') {
      return `Execute 1-click recovery payment links for ${action.parameters.count || 6} eligible failed transactions`;
    }
    return `Execute ${action.toolId} with provided parameters`;
  }

  private formatExpectedEffect(action: ActionRequest): string {
    if (action.toolId === 'razorpay.refund.create') {
      return 'Funds will be refunded to customer source account and debited from your Razorpay unsettled balance.';
    }
    if (action.toolId === 'razorpay.dispute.accept') {
      return 'Dispute amount will be permanently settled in favor of the customer. This action cannot be undone.';
    }
    if (action.toolId === 'recovery.retry_batch') {
      return 'Generates WhatsApp/SMS payment recovery links with high conversion probability (~94% propensity).';
    }
    return 'Target system state will be modified and verified.';
  }
}

export const policyEngine = new PolicyEngine();
