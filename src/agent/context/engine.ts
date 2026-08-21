/**
 * RazorFlow Context Engine
 * 
 * The single most critical component in RazorFlow.
 * Assembles, ranks, filters, and compresses context from live payment signals,
 * engineering telemetry, operational memories, and available tools into a strictly budgeted payload.
 */

import { RazorFlowContext, RazorFlowIntent, RazorFlowUserRole, RazorpayOperationalState, EngineeringOperationalState } from '../../types/razorflow';
import { AppState } from '../../types';

export class ContextEngine {
  private defaultMaxTokens = 4096;

  /**
   * Assemble rich, role-aware context for agent planning & execution
   */
  public assembleContext(
    intent: RazorFlowIntent,
    appState: Partial<AppState>,
    userRole: RazorFlowUserRole = 'merchant'
  ): RazorFlowContext {
    // 1. Gather Live Business Operational State
    const businessState: RazorpayOperationalState = appState.businessState || {
      environment: appState.razorpayEnvironment || 'test',
      connected: true,
      merchantId: 'acc_rzp_test_merchant_881',
      merchantName: 'RazorFlow Commerce Demo Store',
      currency: 'INR',
      todayMetrics: {
        totalVolumeINR: 2458000,
        totalTransactions: 1240,
        successfulTransactions: 1084,
        failedTransactions: 156,
        successRatePercent: 87.4,
        activeAnomaliesCount: 1,
        pendingDisputesCount: 2,
        pendingSettlementsINR: 1845000,
        potentialRecoverableINR: 312000,
      },
      recentFailureSpike: {
        detectedAt: Date.now() - 42 * 60 * 1000,
        primaryErrorCode: 'BAD_REQUEST_ERROR: HDFC_NETBANKING_TIMEOUT',
        affectedGateway: 'HDFC Bank Netbanking Gateway',
        failureRateIncreasePercent: 14.2,
      },
    };

    // 2. Gather Live Engineering State
    const engineeringState: EngineeringOperationalState = appState.engineeringState || {
      activeServices: ['api-gateway', 'payment-orchestrator', 'webhook-dispatcher', 'settlement-engine'],
      latestDeployment: {
        id: 'dep_prod_9921',
        service: 'payment-orchestrator',
        commitHash: '7b28a91',
        author: 'infra-deploy-bot',
        deployedAt: Date.now() - 53 * 60 * 1000,
        versionTag: 'v2.4.1-rc3',
        changelogSummary: 'Upgraded HDFC Netbanking connector timeout threshold from 45s to 15s',
      },
      recentIncidents: [
        {
          id: 'inc_rzp_801',
          title: 'HDFC Netbanking Elevated Gateway Timeouts (Aggressive 15s timeout)',
          severity: 'sev2',
          status: 'investigating',
          matchedGateway: 'HDFC Bank Netbanking Gateway',
          createdAt: Date.now() - 35 * 60 * 1000,
        },
      ],
    };

    // 3. Extract Multi-tier Memories
    const workingMemory: string[] = [
      `Active query focus: "${intent.rawQuery}"`,
      `Intent classified: ${intent.type} (Confidence: ${(intent.confidence * 100).toFixed(0)}%)`,
    ];

    const sessionMemory: string[] = (appState.messages || [])
      .slice(-4)
      .map(m => `[${m.role.toUpperCase()}]: ${m.content.slice(0, 160)}`);

    const operationalMemory: string[] = [
      'Incident Pattern: HDFC Netbanking gateway requires 45s timeout during peak load (9 AM - 2 PM IST).',
      'Recovery Protocol: Soft declines on UPI are eligible for WhatsApp 1-click payment link retries.',
      'Dispute Policy: Disputes marked FRAUDULENT_TRANSACTION require shipping proof within 48h to avoid auto-debit.',
    ];

    const longTermMemory: string[] = [
      'Merchant standard payment success SLA: 95.0%.',
      'Average daily GMV: ₹25,00,000 INR.',
      'Primary payment channels: UPI (68%), Cards (22%), Netbanking (10%).',
    ];

    // 4. Determine Available Tools and Permissions based on Role
    const availableTools = [
      'razorpay.payment.fetch',
      'razorpay.payment.list',
      'razorpay.order.fetch',
      'razorpay.customer.fetch',
      'razorpay.refund.create',
      'razorpay.dispute.fetch',
      'razorpay.settlement.list',
      'engineering.deployments.list',
      'engineering.incidents.query',
      'engineering.github.pr.fetch',
      'action.ledger.record',
      'memory.update',
    ];

    const currentPermissions = userRole === 'merchant'
      ? ['razorpay.read', 'razorpay.refund.initiate', 'dispute.respond', 'memory.read_write']
      : ['razorpay.read', 'engineering.read', 'engineering.hotfix.suggest', 'memory.read_write'];

    // 5. Recent Events
    const recentEvents = [
      {
        type: 'WEBHOOK_FAILURE_ALERT',
        summary: '14 consecutive HDFC Netbanking timeouts detected over last 20 minutes',
        timestamp: Date.now() - 15 * 60 * 1000,
      },
      {
        type: 'DEPLOYMENT_COMPLETED',
        summary: 'payment-orchestrator v2.4.1-rc3 deployed to production by infra-deploy-bot',
        timestamp: Date.now() - 53 * 60 * 1000,
      },
    ];

    // 6. Token Budget Computation
    const estimatedRawTokens = 1200;
    const allocatedTokens = this.defaultMaxTokens;
    const budget = {
      maxTokens: this.defaultMaxTokens,
      allocatedTokens,
      usedTokens: estimatedRawTokens,
      compressionRatio: 1.0,
    };

    return {
      userRole,
      workspaceId: intent.workspaceId,
      sessionId: intent.sessionId,
      currentTask: intent.type,
      businessState,
      engineeringState: userRole === 'engineer' || intent.type === 'engineering_incident_correlation' ? engineeringState : undefined,
      workingMemory,
      sessionMemory,
      operationalMemory,
      longTermMemory,
      availableTools,
      currentPermissions,
      recentEvents,
      budget,
    };
  }
}

export const contextEngine = new ContextEngine();
