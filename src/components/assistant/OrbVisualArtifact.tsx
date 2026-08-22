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
  FileText,
  ShieldCheck,
  Zap,
  Clock,
  Share2,
  Eye,
  Activity,
  History,
  CornerDownRight
} from 'lucide-react';
import { ContextPacketGenerator } from '../../agent/handoff/packet';
import { investigationStore } from '../../agent/investigation/resumable';
import { DecisionReplayEngine } from '../../agent/replay/explainer';
import { WhatChangedEngine } from '../../agent/temporal/comparator';
import { watcherEngine } from '../../agent/monitor/watcher';
import { FlowGraph } from '../graph/FlowGraph';
import { FlowChart } from '../charts/FlowChart';
import { ChartSpecEngine } from '../../agent/charts/chartSpecEngine';
import { flowGraphEngine } from '../../agent/graph/flowGraphEngine';

export interface OrbVisualArtifactProps {
  type: 
    | 'business_briefing' 
    | 'gateway_matrix' 
    | 'failure_cascade' 
    | 'revenue_recovery' 
    | 'architecture_diagram' 
    | 'what_changed'
    | 'context_packet'
    | 'decision_replay'
    | 'investigation_dag'
    | 'watcher_monitor'
    | 'flowgraph'
    | 'flowchart'
    | 'data_table'
    | 'stat_kpi';
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
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  const handleCopyText = (text: string, actionLabel: string = 'copied') => {
    navigator.clipboard.writeText(text);
    setCopiedAction(actionLabel);
    setTimeout(() => setCopiedAction(null), 2000);
  };

  // High-fidelity Rich Text + Plain Text Clipboard Exporter
  const handleCopyRichTable = (title: string, headers: string[], rows: (string | number)[][]) => {
    const htmlTable = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #111;">
        <h3 style="margin-bottom: 8px; color: #0c83fd; font-size: 15px; font-weight: 700;">${title}</h3>
        <table style="border-collapse: collapse; width: 100%; border: 1px solid #e2e8f0;">
          <thead>
            <tr style="background-color: #0c83fd; color: #ffffff;">
              ${headers.map(h => `<th style="padding: 10px 14px; border: 1px solid #cbd5e1; text-align: left; font-weight: 600;">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, idx) => `
              <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                ${row.map(cell => `<td style="padding: 8px 14px; border: 1px solid #e2e8f0; color: #334155;">${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p style="margin-top: 6px; font-size: 11px; color: #64748b;">Source: RazorFlow Live Telemetry Engine [TEST / DEMO FIXTURE]</p>
      </div>
    `.trim();

    const maxLens = headers.map((h, i) => Math.max(h.length, ...rows.map(r => String(r[i]).length)));
    const formatRow = (cells: (string | number)[]) => 
      '| ' + cells.map((c, i) => String(c).padEnd(maxLens[i])).join(' | ') + ' |';
    const separator = '|-' + maxLens.map(len => '-'.repeat(len)).join('-|-') + '-|';

    const plainTextTable = `### ${title}\n` +
      formatRow(headers) + '\n' +
      separator + '\n' +
      rows.map(r => formatRow(r)).join('\n') + '\n\nSource: RazorFlow Live Telemetry [TEST / DEMO FIXTURE]';

    if (typeof window !== 'undefined' && navigator.clipboard && window.ClipboardItem) {
      const htmlBlob = new Blob([htmlTable], { type: 'text/html' });
      const textBlob = new Blob([plainTextTable], { type: 'text/plain' });
      const clipboardItem = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      });
      navigator.clipboard.write([clipboardItem]).then(() => {
        setCopiedAction('table');
        setTimeout(() => setCopiedAction(null), 2000);
      }).catch(() => {
        navigator.clipboard.writeText(plainTextTable);
        setCopiedAction('table');
        setTimeout(() => setCopiedAction(null), 2000);
      });
    } else {
      navigator.clipboard.writeText(plainTextTable);
      setCopiedAction('table');
      setTimeout(() => setCopiedAction(null), 2000);
    }
  };

  // ─── 1. "What Changed?" Temporal Comparative Diff ─────────────────
  if (type === 'what_changed') {
    const diff = WhatChangedEngine.compareWindows();
    return (
      <div className="p-4 rounded-2xl bg-panel border border-[#0C83FD]/30 space-y-3.5 my-2 text-xs shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0C83FD]" />
            <span className="font-bold text-white text-[13px] tracking-tight">Temporal Diff: What Changed?</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            {diff.highestSeverity} DELTA
          </span>
        </div>

        <p className="text-[11px] text-text-secondary leading-relaxed bg-bg/50 p-2.5 rounded-xl border border-card-border">
          {diff.summary}
        </p>

        <div className="space-y-2">
          {diff.changes.map(c => (
            <div key={c.id} className="p-2.5 rounded-xl bg-bg/70 border border-card-border space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-text-primary">{c.dimension}</span>
                <span className={`font-mono font-bold text-[10px] px-1.5 py-0.2 rounded ${
                  c.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {c.delta}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-text-muted">
                <span>Baseline: <strong className="text-text-secondary">{c.baselineValue}</strong></span>
                <span>Current: <strong className="text-text-primary">{c.currentValue}</strong></span>
              </div>
              <div className="text-[9px] text-text-muted italic">Evidence: {c.evidence}</div>
            </div>
          ))}
        </div>

        {onTriggerPrompt && (
          <button
            onClick={() => onTriggerPrompt('Flow, why did RazorFlow recommend this?')}
            className="w-full py-2 rounded-xl bg-[#0C83FD]/20 hover:bg-[#0C83FD]/30 border border-[#0C83FD]/40 text-[#0C83FD] hover:text-white font-bold text-[11px] transition-all cursor-pointer text-center"
          >
            🔍 Replay Decision Reasoning (Why?)
          </button>
        )}
      </div>
    );
  }

  // ─── 2. Operational Context Packet ────────────────────────────────
  if (type === 'context_packet') {
    const latestInv = investigationStore.getLatest() || investigationStore.resume('payment')!;
    const packet = ContextPacketGenerator.generateFromInvestigation(latestInv);

    return (
      <div className="p-4 rounded-2xl bg-panel border border-purple-500/30 space-y-3.5 my-2 text-xs shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-white text-[13px] tracking-tight">Operational Context Packet</span>
          </div>
          <span className="text-[10px] font-mono text-purple-300 font-bold bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
            {Math.round(packet.confidence * 100)}% Confidence
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-bg/80 border border-card-border space-y-1">
          <div className="font-bold text-text-primary text-[11px]">{packet.title}</div>
          <div className="text-[10px] text-text-muted">{packet.summary}</div>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => handleCopyText(ContextPacketGenerator.toMarkdown(packet), 'md')}
            className="py-1.5 px-2 rounded-lg bg-bg border border-card-border hover:border-purple-400 text-[10px] font-bold text-text-secondary hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            {copiedAction === 'md' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>Markdown</span>
          </button>

          <button
            onClick={() => handleCopyText(ContextPacketGenerator.toSlack(packet), 'slack')}
            className="py-1.5 px-2 rounded-lg bg-bg border border-card-border hover:border-purple-400 text-[10px] font-bold text-text-secondary hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            {copiedAction === 'slack' ? <Check className="w-3 h-3 text-emerald-400" /> : <Send className="w-3 h-3" />}
            <span>Slack</span>
          </button>

          <button
            onClick={() => handleCopyText(ContextPacketGenerator.toGitHubIssue(packet), 'gh')}
            className="py-1.5 px-2 rounded-lg bg-bg border border-card-border hover:border-purple-400 text-[10px] font-bold text-text-secondary hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            {copiedAction === 'gh' ? <Check className="w-3 h-3 text-emerald-400" /> : <GitCommit className="w-3 h-3" />}
            <span>GitHub</span>
          </button>
        </div>

        {onTriggerPrompt && (
          <button
            onClick={() => onTriggerPrompt('Flow, watch payment success rate going forward.')}
            className="w-full py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white font-bold text-[11px] transition-all cursor-pointer text-center"
          >
            👁️ Set Persistent Watcher on This Metric
          </button>
        )}
      </div>
    );
  }

  // ─── 3. Decision Replay Breakdown ─────────────────────────────────
  if (type === 'decision_replay') {
    const replay = DecisionReplayEngine.explainRecommendation();

    return (
      <div className="p-4 rounded-2xl bg-panel border border-emerald-500/30 space-y-3 my-2 text-xs shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white text-[13px] tracking-tight">Evidence-Backed Decision Replay</span>
          </div>
          <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">
            Policy Gated
          </span>
        </div>

        <div className="space-y-2 p-2.5 rounded-xl bg-bg/80 border border-card-border font-mono text-[10px]">
          <div className="text-text-muted">1. Observed Fact:</div>
          <div className="pl-2 text-text-primary font-sans">{replay.observedFacts[0]}</div>

          <div className="text-text-muted">2. Correlation:</div>
          <div className="pl-2 text-purple-300 font-sans">{replay.correlations[0]}</div>

          <div className="text-text-muted">3. Policy Invariant:</div>
          <div className="pl-2 text-amber-300 font-sans">{replay.policyEvaluation.policyRule}</div>
        </div>

        <button
          onClick={() => handleCopyText(DecisionReplayEngine.formatPlayback(replay), 'replay')}
          className="w-full py-1.5 rounded-lg bg-bg border border-card-border text-text-muted hover:text-white text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          {copiedAction === 'replay' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copiedAction === 'replay' ? 'Copied Audit Replay!' : 'Copy Decision Metadata'}</span>
        </button>
      </div>
    );
  }

  // ─── 4. Gateway Health Matrix Infographic ──────────────────────────
  if (type === 'gateway_matrix') {
    const gateways = [
      { name: 'UPI (GPay / PhonePe)', sr: 98.4, status: 'HEALTHY', latency: '142ms', color: 'bg-emerald-500', alert: null },
      { name: 'HDFC Netbanking', sr: 73.1, status: 'ANOMALY', latency: '512ms', color: 'bg-rose-500', alert: '-14.2% drop' },
      { name: 'ICICI Cards & Netbanking', sr: 96.2, status: 'HEALTHY', latency: '180ms', color: 'bg-emerald-500', alert: null },
      { name: 'SBI Netbanking', sr: 91.8, status: 'NOMINAL', latency: '240ms', color: 'bg-sky-500', alert: null },
      { name: 'Axis Bank PG', sr: 95.5, status: 'HEALTHY', latency: '165ms', color: 'bg-emerald-500', alert: null },
    ];

    const headers = ['Gateway / Method', 'Success Rate', 'Latency (P95)', 'Status'];
    const rows = gateways.map(g => [g.name, `${g.sr}%`, g.latency, g.alert ? `${g.status} (${g.alert})` : g.status]);

    return (
      <div className="p-4 rounded-2xl bg-panel border border-card-border space-y-3.5 my-2 text-xs shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#0C83FD]" />
            <span className="font-bold text-white text-[13px] tracking-tight">Payment Gateway Telemetry</span>
          </div>
          <button
            onClick={() => handleCopyRichTable('Payment Gateway Success Rate Telemetry [TEST / DEMO FIXTURE]', headers, rows)}
            className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-bg border border-card-border text-text-muted hover:text-white hover:border-[#0C83FD]/50 transition-all cursor-pointer shadow-sm"
          >
            {copiedAction === 'table' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAction === 'table' ? 'Copied Table!' : 'Copy Table'}</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {gateways.map(gw => (
            <div key={gw.name} className="space-y-1 bg-bg/40 p-2 rounded-xl border border-card-border/40">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-text-primary flex items-center gap-1.5">
                  {gw.status === 'ANOMALY' && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                  {gw.name}
                </span>
                <div className="flex items-center gap-2.5 font-mono">
                  <span className="text-text-muted text-[10px]">{gw.latency}</span>
                  <span className={`font-bold ${gw.status === 'ANOMALY' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {gw.sr}%
                  </span>
                  {gw.alert && <span className="text-[10px] text-rose-400 font-sans font-bold bg-rose-500/10 px-1.5 py-0.2 rounded">({gw.alert})</span>}
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
            onClick={() => onTriggerPrompt('Flow, what changed?')}
            className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Compare Temporal Baseline (What Changed?)
          </button>
        )}
      </div>
    );
  }

  // ─── 5. Failure Cascade & SRE Correlation Diagram ──────────────────
  if (type === 'failure_cascade') {
    const cascadeMarkdown = `\`\`\`mermaid\ngraph TD\n` +
      `  A[CI/CD Commit dep_prod_9921] -->|Reduced timeout 45s -> 15s| B[payment-orchestrator v2.4.1-rc3]\n` +
      `  B -->|Premature timeout during 2FA| C[HDFC Netbanking 14.2% Failure Spike]\n` +
      `  C -->|Matched INC-RZP-782 87%| D[RazorFlow Mitigation: Hotfix + WhatsApp Retry Links]\n` +
      `\`\`\``;

    return (
      <div className="p-4 rounded-2xl bg-panel border border-card-border space-y-3.5 my-2 text-xs shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-white text-[13px] tracking-tight">Failure Cascade Diagram</span>
          </div>
          <button
            onClick={() => handleCopyText(cascadeMarkdown, 'mermaid')}
            className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-bg border border-card-border text-text-muted hover:text-white hover:border-purple-400/50 transition-all cursor-pointer shadow-sm"
          >
            {copiedAction === 'mermaid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAction === 'mermaid' ? 'Copied Mermaid!' : 'Copy Mermaid'}</span>
          </button>
        </div>

        <div className="space-y-2 p-3 rounded-xl bg-bg/80 border border-card-border font-mono text-[11px]">
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
          <button
            onClick={() => onTriggerPrompt('Flow, do the safe actions.')}
            className="w-full py-2.5 rounded-xl bg-[#0C83FD]/20 hover:bg-[#0C83FD]/30 border border-[#0C83FD]/40 text-[#0C83FD] hover:text-white font-bold text-[11px] transition-all text-center cursor-pointer"
          >
            🚀 Execute Safe Mitigation & Recovery
          </button>
        )}
      </div>
    );
  }

  // ─── 6. Revenue Recovery Breakdown Infographic ─────────────────────
  if (type === 'revenue_recovery') {
    const recoveryHeaders = ['Reason Category', 'Dropped Volume (INR)', 'Share of Drop', 'Recovery Probability'];
    const recoveryRows = [
      ['UPI PIN / App Timeout', '₹1,90,000', '61%', '88.5% (High)'],
      ['Card 3DS Challenge Timeout', '₹78,000', '25%', '72.0% (Medium)'],
      ['Bank Core Network Outage', '₹44,000', '14%', '54.0% (Moderate)'],
    ];

    return (
      <div className="p-4 rounded-2xl bg-panel border border-amber-500/30 bg-amber-950/10 space-y-3.5 my-2 text-xs shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-amber-300 text-[13px] tracking-tight">Recoverable Revenue Pipeline</span>
          </div>
          <button
            onClick={() => handleCopyRichTable('Recoverable Revenue Pipeline Breakdown [TEST / DEMO FIXTURE]', recoveryHeaders, recoveryRows)}
            className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-bg border border-card-border text-text-muted hover:text-white hover:border-amber-400/50 transition-all cursor-pointer shadow-sm"
          >
            {copiedAction === 'table' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAction === 'table' ? 'Copied Table!' : 'Copy Summary'}</span>
          </button>
        </div>

        <div className="flex items-baseline justify-between bg-bg/50 p-2.5 rounded-xl border border-amber-500/20">
          <div className="text-2xl font-black font-mono text-amber-400">₹3,12,000</div>
          <span className="text-[11px] text-amber-200 font-medium">6 dropped customer checkouts [DEMO FIXTURE]</span>
        </div>

        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-text-muted">UPI PIN Timeout (61%)</span>
              <span className="font-mono text-white font-semibold">₹1,90,000</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-card-border overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '61%' }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-text-muted">Card 3DS Timeout (25%)</span>
              <span className="font-mono text-white font-semibold">₹78,000</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-card-border overflow-hidden">
              <div className="h-full bg-amber-600 rounded-full" style={{ width: '25%' }} />
            </div>
          </div>
        </div>

        {onTriggerPrompt && (
          <button
            onClick={() => onTriggerPrompt('Flow, run automated recovery on all soft declines and draft payment retry links.')}
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-[0.99]"
          >
            <Send className="w-3.5 h-3.5" />
            Dispatch 1-Click WhatsApp Retry Campaign
          </button>
        )}
      </div>
    );
  }

  // ─── 7. FlowGraph Visual Topology ─────────────────────────────────
  if (type === 'flowgraph') {
    const graph = data?.graph || flowGraphEngine.getGraph();
    return (
      <div className="my-2">
        <FlowGraph initialGraph={graph} isCompact={true} onTriggerPrompt={onTriggerPrompt} />
      </div>
    );
  }

  // ─── 8. FlowChart Natural Language Chart ──────────────────────────
  if (type === 'flowchart') {
    const spec = data?.spec || ChartSpecEngine.generateSpec(data?.query || 'payment success rate last 7 days');
    return (
      <div className="my-2">
        <FlowChart spec={spec} isCompact={true} />
      </div>
    );
  }

  // ─── 9. Dynamic Data Table Artifact ──────────────────────────────
  if (type === 'data_table') {
    const headers = ['Gateway', 'Attempts', 'Success', 'Failed', 'Success Rate', 'Latency'];
    const rows = [
      ['UPI', 910, 902, 8, '99.12%', '145ms'],
      ['HDFC Netbanking', 195, 157, 38, '80.51%', '1,480ms'],
      ['ICICI Cards', 115, 111, 4, '96.52%', '290ms'],
      ['SBI Netbanking', 42, 40, 2, '95.24%', '320ms'],
      ['Axis Bank PG', 22, 21, 1, '95.45%', '310ms'],
    ];

    return (
      <div className="p-3.5 my-2 rounded-2xl bg-panel border border-card-border shadow-lg space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-3.5 h-3.5 text-[#0C83FD]" />
            <span className="font-bold text-text-primary text-[11px] uppercase tracking-wider">
              Gateway Breakdown
            </span>
          </div>
          <button
            onClick={() => handleCopyRichTable('Payment Gateway Breakdown', headers, rows)}
            className="flex items-center gap-1 text-[10px] font-semibold text-text-muted hover:text-white px-2 py-0.5 rounded bg-card-border/40 hover:bg-card-border cursor-pointer transition-all"
          >
            {copiedAction === 'Payment Gateway Breakdown' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>Copy Table</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-card-border text-text-muted font-semibold">
                <th className="py-1 px-1.5">Gateway</th>
                <th className="py-1 px-1.5 text-right">Attempts</th>
                <th className="py-1 px-1.5 text-right">Success</th>
                <th className="py-1 px-1.5 text-right">Failed</th>
                <th className="py-1 px-1.5 text-right">Rate</th>
                <th className="py-1 px-1.5 text-right">p95</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/40">
              {rows.map((r, idx) => (
                <tr key={idx} className="hover:bg-card-border/20 transition-colors">
                  <td className="py-1.5 px-1.5 font-medium text-text-primary">{r[0]}</td>
                  <td className="py-1.5 px-1.5 text-right font-mono text-text-muted">{r[1]}</td>
                  <td className="py-1.5 px-1.5 text-right font-mono text-emerald-400">{r[2]}</td>
                  <td className="py-1.5 px-1.5 text-right font-mono text-rose-400">{r[3]}</td>
                  <td className="py-1.5 px-1.5 text-right font-mono font-bold text-[#0C83FD]">{r[4]}</td>
                  <td className="py-1.5 px-1.5 text-right font-mono text-text-muted">{r[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ─── 10. Direct Stat KPI Metric Artifact ─────────────────────────
  if (type === 'stat_kpi') {
    return (
      <div className="flex items-center gap-3 my-2 p-3 rounded-2xl bg-panel border border-card-border shadow-md">
        <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
          <Activity className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Operational Summary</div>
          <div className="text-xs font-semibold text-text-primary">1,284 Attempts • ₹18.7L Collected • 95.87% Success</div>
        </div>
      </div>
    );
  }

  return null;
};
