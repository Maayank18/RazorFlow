import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  ShieldAlert, 
  CheckCircle2, 
  Terminal, 
  Key, 
  ArrowRight,
  Play
} from 'lucide-react';

export const ToolRegistryView = () => {
  const [tools, setTools] = useState([
    {
      id: 'razorpay.payment.fetch',
      name: 'Fetch Razorpay Payment',
      category: 'razorpay',
      riskLevel: 'LOW',
      requiresApproval: false,
      timeoutMs: 5000,
      description: 'Fetch complete details, fee, tax, method, and error traces for a specific payment ID.',
    },
    {
      id: 'razorpay.payment.list',
      name: 'List Razorpay Payments',
      category: 'razorpay',
      riskLevel: 'LOW',
      requiresApproval: false,
      timeoutMs: 8000,
      description: 'List recent payments with optional status, time window, and error code filtering.',
    },
    {
      id: 'razorpay.refund.create',
      name: 'Create Razorpay Refund',
      category: 'razorpay',
      riskLevel: 'HIGH',
      requiresApproval: true,
      timeoutMs: 10000,
      description: 'Initiate a full or partial refund for a captured payment. HIGH RISK: Requires explicit merchant approval.',
    },
    {
      id: 'razorpay.dispute.fetch',
      name: 'Fetch Razorpay Dispute',
      category: 'razorpay',
      riskLevel: 'LOW',
      requiresApproval: false,
      timeoutMs: 5000,
      description: 'Retrieve dispute details, claim amount, evidence deadline, and status.',
    },
    {
      id: 'razorpay.settlement.list',
      name: 'List Razorpay Settlements',
      category: 'razorpay',
      riskLevel: 'LOW',
      requiresApproval: false,
      timeoutMs: 6000,
      description: 'Fetch settlement history, fees, tax, and UTR reconciliation details.',
    },
    {
      id: 'recovery.retry_batch',
      name: 'Execute 1-Click Recovery Links',
      category: 'razorpay',
      riskLevel: 'HIGH',
      requiresApproval: true,
      timeoutMs: 8000,
      description: 'Dispatch automated WhatsApp/SMS payment retry links for recoverable failed transactions.',
    },
    {
      id: 'engineering.deployments.list',
      name: 'List Service Deployments',
      category: 'engineering',
      riskLevel: 'LOW',
      requiresApproval: false,
      timeoutMs: 5000,
      description: 'Fetch recent CI/CD deployments and commit hashes across backend microservices.',
    },
    {
      id: 'engineering.incidents.query',
      name: 'Query Correlated Incidents',
      category: 'engineering',
      riskLevel: 'LOW',
      requiresApproval: false,
      timeoutMs: 5000,
      description: 'Search incident history for gateway outages and timeout anomalies.',
    }
  ]);

  const fetchTools = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/flow/tools');
      if (res.ok) {
        const data = await res.json();
        if (data.items?.length > 0) setTools(data.items);
      }
    } catch {}
  };

  useEffect(() => {
    fetchTools();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 max-w-6xl mx-auto custom-scrollbar">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400">
            BOUNDED TOOL REGISTRY
          </span>
          <span className="text-xs font-mono text-text-muted">{tools.length} Registered Tools</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
          Orchestration Capabilities & Schemas
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Every tool defines typed schemas, timeout boundaries, idempotency enforcement, and risk-policy gates.
        </p>
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((t) => (
          <div key={t.id} className="p-5 rounded-2xl bg-panel border border-card-border hover:border-blue-500/30 transition-all flex flex-col justify-between space-y-4 shadow-md">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-400 bg-bg px-2 py-0.5 rounded border border-card-border">
                  {t.id}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                  {t.riskLevel} RISK {t.requiresApproval ? '• APPROVAL' : ''}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white">{t.name}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{t.description}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-card-border/50 text-[11px] font-mono text-text-muted">
              <span>Category: {t.category}</span>
              <span>Timeout: {t.timeoutMs}ms</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
