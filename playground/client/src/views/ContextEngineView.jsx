import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Database, 
  Sparkles, 
  Zap,
  Activity,
  HardDrive
} from 'lucide-react';

export const ContextEngineView = ({ userRole }) => {
  const [contextData, setContextData] = useState(null);

  const fetchContext = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/flow/context?role=${userRole || 'merchant'}`);
      if (res.ok) {
        const data = await res.json();
        setContextData(data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchContext();
  }, [userRole]);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 max-w-6xl mx-auto custom-scrollbar">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400">
            CONTEXT ENGINE INSPECTOR
          </span>
          <span className="text-xs font-mono text-text-muted">Dynamic Context Compression & Ranking</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
          Active Context Hierarchy & Token Budget
        </h1>
        <p className="text-xs text-text-muted mt-1">
          RazorFlow dynamically assembles, scores, and compresses operational state so models reason with exact facts.
        </p>
      </div>

      {/* Token Budget Meter */}
      <div className="p-6 rounded-2xl bg-panel border border-card-border space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-accent" />
            Context Token Budget Allocation
          </h2>
          <span className="text-xs font-mono text-emerald-400 font-bold">1,200 / 4,096 Tokens Used (29.3%)</span>
        </div>

        {/* Meter Bar */}
        <div className="w-full h-3 rounded-full bg-bg border border-card-border overflow-hidden flex">
          <div style={{ width: '12%' }} className="h-full bg-blue-500" title="Business Telemetry" />
          <div style={{ width: '8%' }} className="h-full bg-purple-500" title="Engineering State" />
          <div style={{ width: '6%' }} className="h-full bg-amber-500" title="Operational Memory" />
          <div style={{ width: '3%' }} className="h-full bg-emerald-500" title="Tool Permissions" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono pt-2">
          <div className="flex items-center gap-2 text-text-secondary">
            <span className="w-2.5 h-2.5 rounded bg-blue-500" />
            <span>Business State (480 tok)</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <span className="w-2.5 h-2.5 rounded bg-purple-500" />
            <span>Engineering State (340 tok)</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <span className="w-2.5 h-2.5 rounded bg-amber-500" />
            <span>Operational Memory (260 tok)</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span>Tool Permissions (120 tok)</span>
          </div>
        </div>
      </div>

      {/* Assembled Context Layers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Layer 1: Business State */}
        <div className="p-6 rounded-2xl bg-panel border border-card-border space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Live Business Operational Layer
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">TEST MODE</span>
          </div>

          <div className="p-4 rounded-xl bg-bg border border-card-border text-xs font-mono space-y-2 text-text-secondary">
            <div><strong>Merchant:</strong> RazorFlow Commerce Demo Store (acc_rzp_test_881)</div>
            <div><strong>Today's Volume:</strong> ₹24,58,000 INR (1,240 transactions)</div>
            <div><strong>Success Rate:</strong> 87.4% (-14.2% failure spike on HDFC Netbanking)</div>
            <div><strong>Recoverable GMV:</strong> ₹3,12,000 INR (6 transactions)</div>
          </div>
        </div>

        {/* Layer 2: Engineering Telemetry */}
        <div className="p-6 rounded-2xl bg-panel border border-card-border space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Engineering Observability Layer
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">CI/CD & SRE</span>
          </div>

          <div className="p-4 rounded-xl bg-bg border border-card-border text-xs font-mono space-y-2 text-text-secondary">
            <div><strong>Active Microservices:</strong> api-gateway, payment-orchestrator, webhook-dispatcher</div>
            <div><strong>Latest Deploy:</strong> dep_prod_9921 (payment-orchestrator v2.4.1-rc3)</div>
            <div><strong>Active Incident:</strong> INC-RZP-801 (Sev-2: HDFC Gateway Timeouts)</div>
          </div>
        </div>

        {/* Layer 3: Operational Memory */}
        <div className="p-6 rounded-2xl bg-panel border border-card-border space-y-3 shadow-md">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" />
            Operational Domain Heuristics
          </h3>

          <div className="p-4 rounded-xl bg-bg border border-card-border text-xs space-y-2 text-text-secondary leading-relaxed">
            <p>• <strong>HDFC Netbanking Rule:</strong> Gateway requires 45s threshold during peak 9 AM - 2 PM window.</p>
            <p>• <strong>UPI Recovery Protocol:</strong> WhatsApp 1-click links yield ~78.5% recovery for soft PIN timeouts.</p>
            <p>• <strong>Dispute SLA:</strong> <code>FRAUDULENT_TRANSACTION</code> requires delivery proofs within 48 hours.</p>
          </div>
        </div>

        {/* Layer 4: Tool Permissions */}
        <div className="p-6 rounded-2xl bg-panel border border-card-border space-y-3 shadow-md">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Current Persona Permissions ({userRole === 'engineer' ? 'Engineer' : 'Merchant'})
          </h3>

          <div className="p-4 rounded-xl bg-bg border border-card-border flex flex-wrap gap-2">
            <span className="px-2 py-1 rounded bg-panel border border-card-border text-[11px] font-mono text-emerald-300">razorpay.read</span>
            <span className="px-2 py-1 rounded bg-panel border border-card-border text-[11px] font-mono text-emerald-300">razorpay.refund.initiate</span>
            <span className="px-2 py-1 rounded bg-panel border border-card-border text-[11px] font-mono text-emerald-300">dispute.respond</span>
            <span className="px-2 py-1 rounded bg-panel border border-card-border text-[11px] font-mono text-emerald-300">memory.read_write</span>
            {userRole === 'engineer' && (
              <span className="px-2 py-1 rounded bg-panel border border-card-border text-[11px] font-mono text-purple-300">engineering.read</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
