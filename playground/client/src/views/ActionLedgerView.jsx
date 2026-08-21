import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Search, 
  ShieldCheck, 
  User, 
  ArrowRight,
  ExternalLink,
  Terminal
} from 'lucide-react';

export const ActionLedgerView = () => {
  const [entries, setEntries] = useState([
    {
      id: 'act_172423980001',
      intentSummary: 'Daily automated payment health scan & anomaly detection',
      toolId: 'razorpay.payment.list',
      policyDecision: { riskLevel: 'LOW', requiredApproval: false, policyPassed: true },
      execution: { durationMs: 80, status: 'success' },
      verification: { isVerified: true, targetStateVerified: 'TELEMETRY_ACCUMULATED' },
      actor: { userId: 'system_agent_runner', role: 'operator', source: 'orb' },
      timestamp: Date.now() - 42 * 60 * 1000,
    },
    {
      id: 'act_172423980002',
      intentSummary: 'Root-cause payment failure correlation with deployment dep_prod_9921',
      toolId: 'engineering.incidents.query',
      policyDecision: { riskLevel: 'LOW', requiredApproval: false, policyPassed: true },
      execution: { durationMs: 45, status: 'success' },
      verification: { isVerified: true, targetStateVerified: 'INCIDENT_CORRELATED_87%' },
      actor: { userId: 'merchant_user', role: 'merchant', source: 'web' },
      timestamp: Date.now() - 30 * 60 * 1000,
    },
    {
      id: 'act_172423980003',
      intentSummary: 'Dispatched 1-Click WhatsApp payment recovery links for 2 transactions',
      toolId: 'recovery.retry_batch',
      policyDecision: { riskLevel: 'HIGH', requiredApproval: true, policyPassed: true },
      approval: { approvedBy: 'merchant_admin_user', approvedAt: Date.now() - 15 * 60 * 1000 },
      execution: { durationMs: 120, status: 'success' },
      verification: { isVerified: true, targetStateVerified: 'DISPATCHED_2_RECOVERY_LINKS' },
      actor: { userId: 'merchant_admin_user', role: 'merchant', source: 'web' },
      timestamp: Date.now() - 15 * 60 * 1000,
    }
  ]);

  const [filterQuery, setFilterQuery] = useState('');

  const fetchLedger = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/flow/activity');
      if (res.ok) {
        const data = await res.json();
        if (data.items?.length > 0) {
          setEntries(data.items);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const filtered = entries.filter(e => 
    e.intentSummary.toLowerCase().includes(filterQuery.toLowerCase()) ||
    e.toolId.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 max-w-6xl mx-auto custom-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400">
              AUDITABLE ACTION LEDGER
            </span>
            <span className="text-xs font-mono text-text-muted">Cryptographic Trace</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            "What did RazorFlow do?"
          </h1>
        </div>

        {/* Search Filter */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter action ledger..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-panel border border-card-border rounded-xl text-xs text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* Ledger Table / List */}
      <div className="space-y-3">
        {filtered.map((entry) => (
          <div 
            key={entry.id} 
            className="p-5 rounded-2xl bg-panel border border-card-border hover:border-blue-500/30 transition-all space-y-3 shadow-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h3 className="text-sm font-bold text-white font-sans">{entry.intentSummary}</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-bg text-blue-300 border border-card-border">
                  {entry.toolId}
                </span>
              </div>

              <span className="text-xs font-mono text-text-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            {/* Audit Metadata Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-bg border border-card-border">
                <div className="text-[10px] text-text-muted uppercase font-sans">Policy Level</div>
                <div className="text-white font-bold mt-0.5">{entry.policyDecision.riskLevel} RISK</div>
              </div>

              <div className="p-2.5 rounded-lg bg-bg border border-card-border">
                <div className="text-[10px] text-text-muted uppercase font-sans">Execution Duration</div>
                <div className="text-emerald-400 font-bold mt-0.5">{entry.execution.durationMs}ms ({entry.execution.status.toUpperCase()})</div>
              </div>

              <div className="p-2.5 rounded-lg bg-bg border border-card-border">
                <div className="text-[10px] text-text-muted uppercase font-sans">Target Verification</div>
                <div className="text-blue-300 font-bold mt-0.5 truncate">{entry.verification.targetStateVerified}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-bg border border-card-border">
                <div className="text-[10px] text-text-muted uppercase font-sans">Trigger Actor</div>
                <div className="text-purple-300 font-bold mt-0.5 truncate">{entry.actor.userId} ({entry.actor.source})</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
