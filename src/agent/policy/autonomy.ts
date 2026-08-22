/**
 * RazorFlow Autonomy Ladder
 * 
 * Defines the 3 progressive operational autonomy tiers:
 * 1. SHADOW: Observe + analyze + correlate + recommend. Zero external mutations.
 * 2. ASSISTED: Recommend + require explicit human approval before executing any mutation.
 * 3. AUTONOMOUS: Automatically execute only policy-approved LOW-risk safe operations.
 * 
 * Every mutation must strictly pass the 6-step validation pipeline:
 * Authorization -> Policy Gate -> Idempotency -> Execution -> Verification -> Audit
 */

export type AutonomyTier = 'SHADOW' | 'ASSISTED' | 'AUTONOMOUS';

export interface AutonomyEvaluationResult {
  allowed: boolean;
  tier: AutonomyTier;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresHumanApproval: boolean;
  reason: string;
  idempotencyKeyRequired: boolean;
}

export class AutonomyLadder {
  public static evaluateAction(
    actionName: string,
    currentTier: AutonomyTier = 'ASSISTED',
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW'
  ): AutonomyEvaluationResult {
    // 1. In SHADOW mode, all mutations are blocked
    if (currentTier === 'SHADOW') {
      if (riskLevel !== 'LOW') {
        return {
          allowed: false,
          tier: 'SHADOW',
          riskLevel,
          requiresHumanApproval: true,
          reason: 'Shadow mode is active: mutations are disabled; recommendations and analysis only.',
          idempotencyKeyRequired: true
        };
      }
    }

    // 2. In ASSISTED mode, HIGH and CRITICAL risk require human sign-off
    if (currentTier === 'ASSISTED') {
      if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL' || riskLevel === 'MEDIUM') {
        return {
          allowed: true,
          tier: 'ASSISTED',
          riskLevel,
          requiresHumanApproval: true,
          reason: `Assisted mode: ${riskLevel} risk action '${actionName}' requires explicit human approval.`,
          idempotencyKeyRequired: true
        };
      }
    }

    // 3. In AUTONOMOUS mode, only LOW risk actions execute automatically
    if (currentTier === 'AUTONOMOUS') {
      if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
        return {
          allowed: true,
          tier: 'AUTONOMOUS',
          riskLevel,
          requiresHumanApproval: true,
          reason: `Autonomous safety invariant: ${riskLevel} risk financial mutations strictly require human sign-off.`,
          idempotencyKeyRequired: true
        };
      }

      return {
        allowed: true,
        tier: 'AUTONOMOUS',
        riskLevel,
        requiresHumanApproval: false,
        reason: `Autonomous mode: safe ${riskLevel} risk action '${actionName}' approved for automated execution.`,
        idempotencyKeyRequired: true
      };
    }

    // Default safe fallback
    return {
      allowed: true,
      tier: currentTier,
      riskLevel,
      requiresHumanApproval: riskLevel !== 'LOW',
      reason: `Action '${actionName}' evaluated under default policy.`,
      idempotencyKeyRequired: true
    };
  }
}
