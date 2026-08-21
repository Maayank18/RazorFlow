import React, { useState } from 'react';
import { 
  Search, 
  AlertTriangle, 
  GitCommit, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight, 
  ExternalLink, 
  Sparkles,
  Play,
  RotateCcw
} from 'lucide-react';

export const InvestigationsView = ({ onTriggerAgent, onApproveAction }) => {
  const [activeTab, setActiveTab] = useState('active_case');

  const investigation = {
    id: 'inv_rzp_8849',
    title: 'Payment Failure Spike Investigation: HDFC Netbanking Anomaly',
    status: 'COMPLETED & ACTIONABLE',
    confidence: 0.87,
    startedAt: '42 mins ago',
    diagnosis: 'Premature client-side 15s timeout threshold introduced in deployment dep_prod_9921 (payment-orchestrator v2.4.1-rc3) causing premature termination of valid 2FA customer challenges.',
    signals: [
      { name: 'Payment Success Rate', status: 'critical', value: '87.4%', change: '-14.2% drop' },
      { name: 'HDFC Netbanking Error Rate', status: 'critical', value: '66.7%', change: 'Primary driver' },
      { name: 'Recent Backend Deployments', status: 'warning', value: '1 deployment', change: '53m ago (v2.4.1-rc3)' },
      { name: 'Bank Core Gateway Status', status: 'normal', value: 'HEALTHY', change: 'Latency 28.4s' },
    ],
    failureCodes: [
      { code: 'BAD_REQUEST_ERROR', count: 4, percentage: 66.7, desc: 'Gateway Timeout (15s threshold exceeded during bank OTP challenge)' },
      { code: 'AUTH_TIMEOUT', count: 1, percentage: 16.7, desc: 'UPI App PIN timeout (Customer eligible for 1-click WhatsApp retry)' },
      { code: 'PAYMENT_FAILED', count: 1, percentage: 16.7, desc: 'Card 3DS OTP expired prior to submission' },
    ],
    timeline: [
      { time: '13:17:14', title: 'CI/CD Deployment dep_prod_9921', desc: 'payment-orchestrator v2.4.1-rc3 deployed by infra-deploy-bot (timeout 45s -> 15s)', type: 'deploy' },
      { time: '13:28:40', title: 'First HDFC Timeout Spike', desc: 'pay_Lz98dfHdfc001 (₹14,999.00) timed out after 15.02s', type: 'error' },
      { time: '13:35:12', title: 'Sev-2 Incident INC-RZP-801 Created', desc: 'Automated SRE anomaly detection triggered alerts', type: 'incident' },
      { time: '13:42:00', title: 'RazorFlow Root-Cause Diagnosis Completed', desc: 'Confidence 87% | Correlated with historical INC-RZP-782', type: 'agent' },
    ],
    historicalMatch: {
      id: 'INC-RZP-782',
      title: 'Netbanking timeout threshold regression under peak morning traffic',
      similarity: '93%',
      resolution: 'Restored connector timeout threshold from 15s to 45s and enabled background polling fallback.',
    },
    actions: [
      {
        id: 'act_safe_recovery',
        title: 'Dispatch 1-Click WhatsApp Payment Recovery Links',
        desc: 'Send personalized WhatsApp retry links for 2 recoverable consumer transactions worth ₹11,700 INR.',
        risk: 'HIGH',
        requiresApproval: true,
        toolId: 'recovery.retry_batch',
        parameters: { payment_ids: ['pay_RecovUpi001', 'pay_RecovCard002'] }
      },
      {
        id: 'act_hotfix_pr',
        title: 'Suggest Hotfix PR to Restore 45s Gateway Timeout',
        desc: 'Submit automated pull request template on payment-orchestrator to eliminate HDFC drops.',
        risk: 'LOW',
        requiresApproval: false,
        toolId: 'engineering.deployments.list',
        parameters: { target: 'hotfix' }
      }
    ]
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 max-w-7xl mx-auto custom-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400">
              INVESTIGATION WORKBENCH
            </span>
            <span className="text-xs font-mono text-text-muted">Case ID: {investigation.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            {investigation.title}
          </h1>
        </div>

        <button
          onClick={() => onTriggerAgent('Flow, investigate the payment drop.')}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md self-start md:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Re-run Investigation
        </button>
      </div>

      {/* Diagnosis Hero Card */}
      <div className="p-6 rounded-2xl bg-panel border border-card-border space-y-4 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-base font-bold text-white">Agent Diagnosis & Correlation</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Confidence Score:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs">
              {(investigation.confidence * 100).toFixed(0)}% HIGH
            </span>
          </div>
        </div>

        <p className="text-sm text-text-primary leading-relaxed bg-bg/60 p-4 rounded-xl border border-card-border font-medium">
          {investigation.diagnosis}
        </p>

        {/* Signals Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {investigation.signals.map((sig, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-bg/80 border border-card-border">
              <div className="text-[11px] text-text-muted uppercase font-medium">{sig.name}</div>
              <div className={`text-base font-bold font-mono mt-1 ${sig.status === 'critical' ? 'text-rose-400' : sig.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {sig.value}
              </div>
              <div className="text-[11px] text-text-secondary mt-0.5">{sig.change}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Failure Codes & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Failure Codes Breakdown */}
        <div className="p-6 rounded-2xl bg-panel border border-card-border space-y-4 shadow-md">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Failure Code Distribution (Last 60 Minutes)
          </h3>

          <div className="space-y-3">
            {investigation.failureCodes.map((code, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-bg border border-card-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-rose-300">{code.code}</span>
                  <span className="font-mono text-xs font-bold text-white">{code.percentage}% ({code.count} payments)</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-card-border overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${code.percentage}%` }} />
                </div>
                <p className="text-xs text-text-muted">{code.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Temporal Correlation Timeline */}
        <div className="p-6 rounded-2xl bg-panel border border-card-border space-y-4 shadow-md">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Temporal Deployment Correlation
          </h3>

          <div className="space-y-4 border-l-2 border-card-border pl-4 ml-2">
            {investigation.timeline.map((evt, idx) => (
              <div key={idx} className="relative space-y-1">
                <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${evt.type === 'deploy' ? 'bg-purple-500' : evt.type === 'error' ? 'bg-rose-500' : evt.type === 'incident' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-text-muted">{evt.time}</span>
                  <span className="text-xs font-semibold text-white">{evt.title}</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{evt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="p-6 rounded-2xl bg-panel border border-card-border space-y-4 shadow-md">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Recommended Actions & Policy Boundaries
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {investigation.actions.map((act, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-bg border border-card-border flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${act.risk === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'}`}>
                    {act.risk} RISK {act.requiresApproval ? '• APPROVAL REQUIRED' : '• AUTO-SAFE'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{act.title}</h4>
                <p className="text-xs text-text-muted leading-relaxed">{act.desc}</p>
              </div>

              <button
                onClick={() => onTriggerAgent(`Execute ${act.title}`)}
                className="w-full py-2.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 hover:text-white border border-blue-500/30 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                {act.requiresApproval ? 'Review & Request Approval' : 'Execute Safe Action'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
