import React, { useState } from 'react';
import { AppState } from '../../types';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  PlayCircle, 
  Sparkles, 
  RefreshCw, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Send,
  Building,
  BarChart2,
  FileText
} from 'lucide-react';

export function HomePanel({ 
  state, 
  setState,
  onTriggerPrompt
}: { 
  state: AppState; 
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onTriggerPrompt?: (prompt: string) => void;
}) {
  const [activePersona, setActivePersona] = useState<'merchant' | 'sre'>('merchant');

  const metrics = state.businessState?.todayMetrics || {
    totalVolumeINR: 2458000,
    totalTransactions: 1240,
    successfulTransactions: 1084,
    failedTransactions: 156,
    successRatePercent: 87.4,
    activeAnomaliesCount: 1,
    pendingDisputesCount: 2,
    pendingSettlementsINR: 1845000,
    potentialRecoverableINR: 312000,
  };

  const handleAction = (text: string) => {
    if (onTriggerPrompt) {
      onTriggerPrompt(text);
    }
  };

  const gateways = [
    { name: 'UPI (GPay / PhonePe)', sr: 98.4, status: 'healthy', color: 'bg-emerald-500' },
    { name: 'HDFC Netbanking', sr: 73.1, status: 'anomaly', color: 'bg-rose-500', alert: '-14.2%' },
    { name: 'ICICI Cards', sr: 96.2, status: 'healthy', color: 'bg-emerald-500' },
    { name: 'SBI Netbanking', sr: 91.8, status: 'nominal', color: 'bg-sky-500' },
    { name: 'Axis Bank', sr: 95.5, status: 'healthy', color: 'bg-emerald-500' },
  ];

  return (
    <div className="flex flex-col gap-3.5 p-4 overflow-y-auto max-h-full custom-scrollbar text-text-primary">
      
      {/* Top Header Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-panel to-panel border border-[#0C83FD]/20 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/razorflow-logo.png" alt="RazorFlow" className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(12,131,253,0.5)]" />
            <div>
              <div className="text-xs font-bold text-white tracking-tight">RazorFlow Missions</div>
              <div className="text-[10px] text-text-muted">Autonomous Operational Layer</div>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            ● TEST MODE
          </span>
        </div>

        {/* Dual Persona Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-bg/80 p-0.5 rounded-xl border border-card-border/60">
          <button
            onClick={() => setActivePersona('merchant')}
            className={`py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
              activePersona === 'merchant'
                ? 'bg-[#0C83FD] text-white shadow-sm'
                : 'text-text-muted hover:text-white'
            }`}
          >
            🏪 Merchant Mode
          </button>
          <button
            onClick={() => setActivePersona('sre')}
            className={`py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
              activePersona === 'sre'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-text-muted hover:text-white'
            }`}
          >
            ⚙️ Developer / SRE
          </button>
        </div>
      </div>

      {/* 2 Primary KPI Highlights */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-xl bg-bg border border-rose-500/20 bg-rose-950/10 space-y-0.5">
          <div className="text-[10px] text-rose-300 uppercase font-bold tracking-wider">Payment Success Rate</div>
          <div className="text-xl font-bold font-mono text-rose-400">{metrics.successRatePercent}%</div>
          <div className="text-[10px] text-rose-400/90 font-medium">↓ 7.8% drop alert</div>
        </div>

        <div className="p-3 rounded-xl bg-bg border border-amber-500/20 bg-amber-950/10 space-y-0.5">
          <div className="text-[10px] text-amber-300 uppercase font-bold tracking-wider">Recoverable GMV</div>
          <div className="text-xl font-bold font-mono text-amber-400">₹{(metrics.potentialRecoverableINR / 1000).toFixed(0)}k</div>
          <div className="text-[10px] text-amber-300/90 font-medium">6 soft declines eligible</div>
        </div>
      </div>

      {/* Mission 1: High-Priority Incident Investigation */}
      <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold font-mono flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-400" /> ANOMALY DETECTED
          </span>
          <span className="text-[10px] text-text-muted">42m ago</span>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white leading-tight">HDFC Netbanking 14.2% Success Drop</h4>
          <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
            {activePersona === 'merchant'
              ? 'Elevated timeouts on high-value checkouts. ₹312k in GMV affected.'
              : 'Isolated timeout spike correlating with deployment dep_prod_9921 (87% confidence).'}
          </p>
        </div>

        <button
          onClick={() => handleAction('Flow, investigate the payment drop.')}
          className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-[0.99]"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          Investigate Root Cause
        </button>
      </div>

      {/* Mission 2: 1-Click Revenue Recovery Campaign */}
      <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 text-amber-400" /> Smart Revenue Recovery
          </span>
          <span className="text-[10px] text-amber-400 font-mono font-bold">₹3,12,000</span>
        </div>

        <p className="text-[11px] text-text-muted leading-relaxed">
          6 customers encountered soft declines. Send automated WhatsApp payment retry links.
        </p>

        <button
          onClick={() => handleAction('Flow, run automated recovery on all soft declines and draft payment retry links.')}
          className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-[0.99]"
        >
          <Send className="w-3.5 h-3.5" />
          Dispatch 1-Click Recovery Links
        </button>
      </div>

      {/* Live Gateway Telemetry Matrix */}
      <div className="p-3.5 rounded-xl bg-bg border border-card-border space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <BarChart2 className="w-3 h-3 text-[#0C83FD]" /> Gateway Success Rates
          </span>
          <span className="text-[9px] font-mono text-emerald-400 font-bold">LIVE TELEMETRY</span>
        </div>

        <div className="space-y-2">
          {gateways.map(gw => (
            <div key={gw.name} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-text-primary flex items-center gap-1">
                  {gw.status === 'anomaly' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                  {gw.name}
                </span>
                <span className={`font-mono font-bold text-xs ${gw.status === 'anomaly' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {gw.sr}% {gw.alert && <span className="text-[9px]">({gw.alert})</span>}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-card-border overflow-hidden">
                <div className={`h-full rounded-full ${gw.color}`} style={{ width: `${gw.sr}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Quick Actions Grid */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Quick Operational Triggers</span>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAction('Flow, tell me what needs my attention today.')}
            className="p-2.5 rounded-xl bg-bg border border-card-border hover:border-card-border/80 hover:bg-white/[0.02] text-left transition-all group cursor-pointer"
          >
            <div className="text-[11px] font-bold text-white group-hover:text-[#0C83FD] flex items-center justify-between">
              <span>Daily Briefing</span>
              <ArrowRight className="w-3 h-3 text-text-muted group-hover:text-[#0C83FD] group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[10px] text-text-muted mt-0.5">Priority focus & status</p>
          </button>

          <button
            onClick={() => handleAction('Where am I losing potential revenue?')}
            className="p-2.5 rounded-xl bg-bg border border-card-border hover:border-amber-500/30 hover:bg-white/[0.02] text-left transition-all group cursor-pointer"
          >
            <div className="text-[11px] font-bold text-white group-hover:text-amber-300 flex items-center justify-between">
              <span>Revenue Scan</span>
              <ArrowRight className="w-3 h-3 text-text-muted group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[10px] text-text-muted mt-0.5">Find checkout dropoffs</p>
          </button>

          <button
            onClick={() => handleAction('Flow, why did payment failures increase after the latest deployment?')}
            className="p-2.5 rounded-xl bg-bg border border-card-border hover:border-purple-500/30 hover:bg-white/[0.02] text-left transition-all group cursor-pointer"
          >
            <div className="text-[11px] font-bold text-white group-hover:text-purple-300 flex items-center justify-between">
              <span>SRE Commit Log</span>
              <ArrowRight className="w-3 h-3 text-text-muted group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[10px] text-text-muted mt-0.5">Correlate dep_prod_9921</p>
          </button>

          <button
            onClick={() => handleAction('What did RazorFlow do?')}
            className="p-2.5 rounded-xl bg-bg border border-card-border hover:border-emerald-500/30 hover:bg-white/[0.02] text-left transition-all group cursor-pointer"
          >
            <div className="text-[11px] font-bold text-white group-hover:text-emerald-300 flex items-center justify-between">
              <span>Action Ledger</span>
              <ArrowRight className="w-3 h-3 text-text-muted group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[10px] text-text-muted mt-0.5">Immutable audit trail</p>
          </button>
        </div>
      </div>

    </div>
  );
}
