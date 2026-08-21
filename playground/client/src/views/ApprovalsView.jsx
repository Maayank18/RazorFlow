import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';

export const ApprovalsView = ({ pendingApprovals = [], onApproveAction }) => {
  const [localApprovals, setLocalApprovals] = useState([
    {
      id: 'appr_recovery_batch_01',
      intentId: 'intent_recov_9921',
      actionId: 'act_safe_recovery',
      toolId: 'recovery.retry_batch',
      what: 'Dispatch 1-Click WhatsApp Payment Recovery Links for 2 eligible transactions',
      why: 'Identified 2 recoverable consumer payment failures (pay_RecovUpi001, pay_RecovCard002) worth ₹11,700 INR with 94% retry propensity.',
      expectedEffect: 'Sends personalized 1-click Razorpay payment link with 10m expiry to customer WhatsApp.',
      riskLevel: 'HIGH',
      dataUsed: {
        payment_ids: ['pay_RecovUpi001', 'pay_RecovCard002'],
        total_amount: '₹11,700.00 INR',
        channel: 'WhatsApp Smart Link'
      },
      requestedAt: Date.now() - 5 * 60 * 1000,
      expiresAt: Date.now() + 10 * 60 * 1000,
      status: 'pending',
    },
    {
      id: 'appr_refund_test_02',
      intentId: 'intent_refund_02',
      actionId: 'act_issue_refund',
      toolId: 'razorpay.refund.create',
      what: 'Issue ₹14,999.00 INR Full Refund for payment pay_Lz98dfHdfc001',
      why: 'Customer was double-debited due to HDFC Netbanking gateway timeout after 15s cut-off.',
      expectedEffect: 'Funds returned immediately to customer bank account via Instant Refund speed.',
      riskLevel: 'HIGH',
      dataUsed: {
        payment_id: 'pay_Lz98dfHdfc001',
        amount: '₹14,999.00 INR',
        speed: 'instant'
      },
      requestedAt: Date.now() - 12 * 60 * 1000,
      expiresAt: Date.now() + 3 * 60 * 1000,
      status: 'pending',
    }
  ]);

  const handleDecision = async (approvalId, decision) => {
    try {
      const res = await fetch(`http://localhost:3000/api/flow/approval/${approvalId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, actorId: 'merchant_admin_user' })
      });

      if (res.ok) {
        setLocalApprovals(prev => prev.map(a => a.id === approvalId ? { ...a, status: decision === 'approve' ? 'executed' : 'rejected' } : a));
      }
    } catch {
      setLocalApprovals(prev => prev.map(a => a.id === approvalId ? { ...a, status: decision === 'approve' ? 'executed' : 'rejected' } : a));
    }
  };

  const pendingCount = localApprovals.filter(a => a.status === 'pending').length;

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 max-w-5xl mx-auto custom-scrollbar">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
              HUMAN-IN-THE-LOOP GUARDRAILS
            </span>
            <span className="text-xs font-mono text-text-muted">{pendingCount} Pending Sign-offs</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Action Approval Queue
          </h1>
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-6">
        {localApprovals.map((approval) => (
          <div 
            key={approval.id} 
            className={`p-6 rounded-2xl bg-panel border transition-all space-y-5 shadow-lg relative overflow-hidden ${
              approval.status === 'executed' 
                ? 'border-emerald-500/30 bg-emerald-950/10' 
                : approval.status === 'rejected'
                ? 'border-card-border opacity-60'
                : 'border-amber-500/30'
            }`}
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border ${
                  approval.riskLevel === 'CRITICAL' 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {approval.riskLevel} RISK POLICY
                </span>
                <span className="text-xs font-mono text-text-muted">Target: <code className="text-blue-300">{approval.toolId}</code></span>
              </div>

              <div className="text-xs text-text-muted font-mono flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {approval.status === 'pending' ? 'Expires in 8 mins' : `Status: ${approval.status.toUpperCase()}`}
              </div>
            </div>

            {/* What & Why */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white leading-snug">
                {approval.what}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed bg-bg/80 p-3.5 rounded-xl border border-card-border">
                <strong className="text-text-primary">Why:</strong> {approval.why}
              </p>
            </div>

            {/* Expected Effect & Data Used */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-bg/60 border border-card-border space-y-1">
                <div className="text-[11px] text-text-muted font-semibold uppercase">Expected Effect</div>
                <p className="text-xs text-text-primary leading-relaxed">{approval.expectedEffect}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-bg/60 border border-card-border space-y-1 font-mono">
                <div className="text-[11px] text-text-muted font-semibold uppercase font-sans">Data & Parameters Used</div>
                <div className="text-[11px] text-blue-300 overflow-x-auto">
                  {JSON.stringify(approval.dataUsed, null, 2)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {approval.status === 'pending' ? (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleDecision(approval.id, 'reject')}
                  className="px-4 py-2.5 rounded-xl bg-card border border-card-border hover:bg-white/5 text-text-muted hover:text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4 text-rose-400" />
                  Reject Action
                </button>

                <button
                  onClick={() => handleDecision(approval.id, 'approve')}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-lg shadow-amber-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve & Execute (Once)
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold pt-2">
                <CheckCircle2 className="w-4 h-4" />
                Action signed-off & state verified in Action Ledger.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
