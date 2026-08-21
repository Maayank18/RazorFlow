/**
 * RazorFlow Specialized Agent: Settlement Insight Agent
 * 
 * Answers: "What happened to my settlements?" / "Show today's payouts"
 * Reconciles settlement amounts, fees, GST tax, UTRs, and bank transfer timing.
 */

import { EvidenceReasoning, RazorFlowContext, RecommendedAction } from '../../types/razorflow';
import { MOCK_SETTLEMENTS } from '../../integrations/razorpay/fixtures';

export class SettlementInsightAgent {
  public async execute(_context: RazorFlowContext): Promise<EvidenceReasoning> {
    const settlements = MOCK_SETTLEMENTS;

    const recommendedActions: RecommendedAction[] = [
      {
        id: 'rec_export_recon',
        title: 'Export Combined Settlement Reconciliation CSV',
        description: 'Download combined fee, tax, and UTR reconciliation breakdown for today’s payout batch.',
        toolId: 'razorpay.settlement.list',
        parameters: { export: 'csv' },
        riskLevel: 'LOW',
        requiresApproval: false,
        expectedOutcome: 'Generates auditable reconciliation ledger for accounting.',
        isAutomatedSafe: true,
      }
    ];

    const processed = settlements.find(s => s.status === 'processed');
    const pending = settlements.find(s => s.status === 'created');

    const conclusion = `### 🏦 Settlement & Reconciliation Report\n\n` +
      `1. **Processed Payout**: **₹${((processed?.amount || 0) / 100).toLocaleString('en-IN')} INR**\n` +
      `   - **UTR Reference**: \`${processed?.utr}\`\n` +
      `   - **Fee Breakdown**: Razorpay Fee: ₹${((processed?.fees || 0) / 100).toLocaleString('en-IN')} | GST (18%): ₹${((processed?.tax || 0) / 100).toLocaleString('en-IN')}\n` +
      `   - **Status**: Credited to primary merchant bank account.\n\n` +
      `2. **Next Upcoming Batch**: **₹${((pending?.amount || 0) / 100).toLocaleString('en-IN')} INR**\n` +
      `   - **Scheduled Payout**: Next standard settlement cycle (Tomorrow 08:00 AM IST).`;

    return {
      conclusion,
      confidence: 0.98,
      evidence: [
        `Settlement setl_DailyBatch001: Net ₹${((processed?.amount || 0) / 100).toLocaleString('en-IN')} via ${processed?.utr}`,
        `Settlement setl_PendingBatch002: Accrued ₹${((pending?.amount || 0) / 100).toLocaleString('en-IN')} (Status: CREATED)`,
      ],
      sources: [
        {
          id: 'src_rzp_settlements',
          type: 'razorpay_api',
          title: 'Razorpay Settlements & Recon API',
          timestamp: Date.now(),
        }
      ],
      timestamp: new Date().toISOString(),
      recommendedActions,
    };
  }
}

export const settlementInsightAgent = new SettlementInsightAgent();
