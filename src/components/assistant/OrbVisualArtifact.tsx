import React, { useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  Copy, 
  Check, 
  Send, 
  Cpu, 
  GitCommit, 
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  BarChart2,
  FileText
} from 'lucide-react';

export interface OrbVisualArtifactProps {
  type: 'business_briefing' | 'gateway_matrix' | 'failure_cascade' | 'revenue_recovery' | 'architecture_diagram';
  data?: any;
  userRole?: 'merchant' | 'engineer';
  onTriggerPrompt?: (prompt: string) => void;
}

export const OrbVisualArtifact: React.FC<OrbVisualArtifactProps> = ({
  type,
  data,
  userRole = 'merchant',
  onTriggerPrompt
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── 1. Gateway Health Matrix Infographic ──────────────────────────
  if (type === 'gateway_matrix') {
    const gateways = [
      { name: 'UPI (GPay / PhonePe)', sr: 98.4, status: 'healthy', latency: '142ms', color: 'bg-emerald-500' },
      { name: 'HDFC Netbanking', sr: 73.1, status: 'anomaly', latency: '512ms', color: 'bg-rose-500', alert: '-14.2% drop' },
      { name: 'ICICI Cards & Netbanking', sr: 96.2, status: 'healthy', latency: '180ms', color: 'bg-emerald-500' },
      { name: 'SBI Netbanking', sr: 91.8, status: 'nominal', latency: '240ms', color: 'bg-sky-500' },
      { name: 'Axis Bank PG', sr: 95.5, status: 'healthy', latency: '165ms', color: 'bg-emerald-500' },
    ];

    const markdownExport = `### Payment Gateway Success Rate Telemetry\n` +
      `| Gateway | Success Rate | Latency | Status |\n` +
      `| :--- | :--- | :--- | :--- |\n` +
      gateways.map(g => `| ${g.name} | ${g.sr}% | ${g.latency} | ${g.status.toUpperCase()} |`).join('\n');

    return (
      <div className="p-3.5 rounded-2xl bg-panel border border-card-border space-y-3 my-2 text-xs shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-3.5 h-3.5 text-[#0C83FD]" />
            <span className="font-bold text-white tracking-tight">Gateway Health Telemetry</span>
          </div>
          <button
            onClick={() => handleCopyMarkdown(markdownExport)}
            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-bg border border-card-border text-text-muted hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy Table'}</span>
          </button>
        </div>

        <div className="space-y-2">
          {gateways.map(gw => (
            <div key={gw.name} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-text-primary flex items-center gap-1.5">
                  {gw.status === 'anomaly' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                  {gw.name}
                </span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-text-muted text-[10px]">{gw.latency}</span>
                  <span className={`font-bold ${gw.status === 'anomaly' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {gw.sr}%
                  </span>
                  {gw.alert && <span className="text-[9px] text-rose-400 font-sans font-bold">({gw.alert})</span>}
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-card-border/60 overflow-hidden">
                <div className={`h-full rounded-full ${gw.color}`} style={{ width: `${gw.sr}%` }} />
              </div>
            </div>
          ))}
        </div>

        {onTriggerPrompt && (
          <button
            onClick={() => onTriggerPrompt('Flow, investigate the payment drop.')}
            className="w-full py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 text-rose-300 hover:text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Investigate HDFC Regression (87% Match)
          </button>
        )}
      </div>
    );
  }

  // ─── 2. Failure Cascade & SRE Correlation Diagram ──────────────────
  if (type === 'failure_cascade') {
    const cascadeMarkdown = `\`\`\`mermaid\ngraph TD\n` +
      `  A[CI/CD Commit dep_prod_9921] -->|Reduced timeout 45s -> 15s| B[payment-orchestrator v2.4.1-rc3]\n` +
      `  B -->|Premature timeout during 2FA| C[HDFC Netbanking 14.2% Failure Spike]\n` +
      `  C -->|Matched INC-RZP-782 87%| D[RazorFlow Mitigation: Hotfix + WhatsApp Retry Links]\n` +
      `\`\`\``;

    return (
      <div className="p-3.5 rounded-2xl bg-panel border border-card-border space-y-3 my-2 text-xs shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-bold text-white tracking-tight">Failure Cascade Diagram</span>
          </div>
          <button
            onClick={() => handleCopyMarkdown(cascadeMarkdown)}
            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-bg border border-card-border text-text-muted hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy Mermaid'}</span>
          </button>
        </div>

        {/* Visual Cascade Nodes */}
        <div className="space-y-2 p-2.5 rounded-xl bg-bg/80 border border-card-border font-mono text-[11px]">
          <div className="flex items-center gap-2 text-purple-300">
            <GitCommit className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="font-bold">dep_prod_9921</span>
            <span className="text-[10px] text-text-muted font-sans font-normal">(payment-orchestrator v2.4.1-rc3)</span>
          </div>
          <div className="pl-4 text-[10px] text-text-muted font-sans">
            ↳ Reduced bank connector timeout threshold from 45s to 15s.
          </div>

          <div className="h-px bg-card-border my-1" />

          <div className="flex items-center gap-2 text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="font-bold">HDFC Netbanking 66.7% Timeout Spike</span>
          </div>
          <div className="pl-4 text-[10px] text-text-muted font-sans">
            ↳ Valid 2FA customer challenges terminated before bank OTP submission.
          </div>

          <div className="h-px bg-card-border my-1" />

          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-bold">Recommended Mitigation (87% Match)</span>
          </div>
          <div className="pl-4 text-[10px] text-text-muted font-sans">
            ↳ Restore 45s timeout + Dispatch WhatsApp retry links to dropped checkouts.
          </div>
        </div>

        {onTriggerPrompt && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onTriggerPrompt('Flow, do the safe actions.')}
              className="py-1.5 rounded-lg bg-[#0C83FD]/20 hover:bg-[#0C83FD]/30 border border-[#0C83FD]/40 text-[#0C83FD] hover:text-white font-bold text-[10px] transition-all text-center cursor-pointer"
            >
              🚀 Execute Safe Mitigation
            </button>
            <button
              onClick={() => onTriggerPrompt('What did RazorFlow do?')}
              className="py-1.5 rounded-lg bg-bg border border-card-border text-text-muted hover:text-white font-medium text-[10px] transition-all text-center cursor-pointer"
            >
              📜 Query Action Ledger
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── 3. Revenue Recovery Breakdown Infographic ─────────────────────
  if (type === 'revenue_recovery') {
    const recoveryMarkdown = `### Recoverable Revenue Opportunity Breakdown\n` +
      `- Total Recoverable: ₹3,12,000 INR across 6 soft declines\n` +
      `- UPI App PIN Expiry: ₹1,90,000 INR (61%)\n` +
      `- Card 3DS Timeout: ₹78,000 INR (25%)\n` +
      `- Bank Core Outage: ₹44,000 INR (14%)\n` +
      `- Modeled Recovery Rate: 78.2% (~₹2,44,000 INR recoverable)`;

    return (
      <div className="p-3.5 rounded-2xl bg-panel border border-amber-500/30 bg-amber-950/10 space-y-3 my-2 text-xs shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-amber-300 tracking-tight">Recoverable Revenue Pipeline</span>
          </div>
          <button
            onClick={() => handleCopyMarkdown(recoveryMarkdown)}
            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-bg border border-card-border text-text-muted hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="text-xl font-black font-mono text-amber-400">₹3,12,000</div>
          <span className="text-[10px] text-text-muted">6 eligible dropped checkouts</span>
        </div>

        {/* Breakdown bars */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-text-muted">UPI PIN Timeout (61%)</span>
            <span className="font-mono text-white font-semibold">₹1,90,000</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-card-border overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '61%' }} />
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-text-muted">Card 3DS Timeout (25%)</span>
            <span className="font-mono text-white font-semibold">₹78,000</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-card-border overflow-hidden">
            <div className="h-full bg-amber-600 rounded-full" style={{ width: '25%' }} />
          </div>
        </div>

        {onTriggerPrompt && (
          <button
            onClick={() => onTriggerPrompt('Flow, run automated recovery on all soft declines and draft payment retry links.')}
            className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Send className="w-3 h-3" />
            Dispatch 1-Click WhatsApp Retry Campaign
          </button>
        )}
      </div>
    );
  }

  return null;
};
