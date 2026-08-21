import React from 'react';
import { 
  Terminal, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const AgentRunsView = ({ currentTrace }) => {
  const defaultSteps = [
    { step: 'intent', title: '1. Intent Normalizer & Extraction', status: 'completed', duration: '4ms', desc: 'Normalized natural language input into canonical RazorFlowIntent' },
    { step: 'context', title: '2. Context Engine Assembly', status: 'completed', duration: '12ms', desc: 'Assembled Role, Workspace, Live Telemetry, and Operational Memory' },
    { step: 'reasoning', title: '3. Specialized Agent Reasoning', status: 'completed', duration: '145ms', desc: 'Synthesized telemetry and correlated failure codes with 87% confidence' },
    { step: 'plan', title: '4. Action Planner & Decomposition', status: 'completed', duration: '8ms', desc: 'Formulated targeted recovery & hotfix proposals' },
    { step: 'policy', title: '5. Policy Guardrails & Risk Check', status: 'completed', duration: '6ms', desc: 'Assigned risk categories (LOW auto-execute, HIGH human approval required)' },
    { step: 'tool_selection', title: '6. Tool Routing & Parameter Binding', status: 'completed', duration: '5ms', desc: 'Bound parameters for recovery.retry_batch and razorpay.dispute.fetch' },
    { step: 'execution', title: '7. Bounded Execution Layer', status: 'completed', duration: '48ms', desc: 'Executed safe bounded tool calls with idempotency keys' },
    { step: 'verification', title: '8. Post-Execution State Verification', status: 'completed', duration: '32ms', desc: 'Re-queried Razorpay APIs to confirm mutated states' },
    { step: 'audit', title: '9. Immutable Action Ledger Logging', status: 'completed', duration: '3ms', desc: 'Appended cryptographic audit entry with correlation IDs' },
    { step: 'memory', title: '10. Memory Update & Knowledge Consolidation', status: 'completed', duration: '10ms', desc: 'Committed incident resolution heuristic to Operational Memory' },
  ];

  const steps = currentTrace?.steps?.length > 0 ? currentTrace.steps : defaultSteps;

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 max-w-5xl mx-auto custom-scrollbar">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 border border-purple-500/30 text-purple-400">
            AGENT RUNTIME TRACE
          </span>
          <span className="text-xs font-mono text-text-muted">Canonical 10-Step Loop</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
          Live Agent Execution Pipeline
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Inspect deterministic orchestration, context budgets, policy evaluations, and verification steps in real-time.
        </p>
      </div>

      {/* Execution Trace Stepper */}
      <div className="space-y-4">
        {steps.map((s, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-panel border border-card-border hover:border-purple-500/30 transition-all flex items-start gap-4 shadow-md">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-mono font-bold text-xs shrink-0 mt-0.5">
              {idx + 1}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  {s.title}
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {s.duration || `${s.durationMs || 10}ms`}
                </span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">{s.desc || JSON.stringify(s.data || '')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
