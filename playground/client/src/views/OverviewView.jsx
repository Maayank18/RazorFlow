import React, { useState } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  RefreshCw, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  UserCheck, 
  BarChart3, 
  FilePlus, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const OverviewView = ({ onTriggerAgent }) => {
  const [commandInput, setCommandInput] = useState('');

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    onTriggerAgent(commandInput.trim());
    setCommandInput('');
  };

  const handleSuggestionClick = (text) => {
    onTriggerAgent(text);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto custom-scrollbar bg-bg text-text-primary">
      
      {/* ─── Hero Section: Greeting & 3D Layer Graphic ────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden rounded-2xl bg-panel border border-card-border p-6 md:p-8 shadow-sm">
        <div className="space-y-1.5 z-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary flex items-center gap-2.5">
            Good morning, Mayank <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs md:text-sm text-text-muted">
            Here's your operational overview for today.
          </p>
        </div>

        {/* 3D Isometric Layer Graphic */}
        <div className="relative w-48 h-24 md:w-56 md:h-28 shrink-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-40 h-40 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Top floating rhomboid layer */}
            <div className="w-28 h-12 rounded-xl bg-gradient-to-tr from-purple-600/60 to-[#0C83FD]/70 border border-purple-400/40 shadow-xl shadow-purple-600/30 transform -rotate-12 skew-x-12 flex items-center justify-center backdrop-blur-sm -mb-5 z-20">
              <img src="/razorflow-logo.png" alt="RazorFlow" className="w-6 h-6 object-contain transform rotate-12 -skew-x-12 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </div>
            {/* Middle layer */}
            <div className="w-32 h-12 rounded-xl bg-gradient-to-tr from-purple-900/40 to-blue-900/40 border border-card-border shadow-lg transform -rotate-12 skew-x-12 -mb-5 z-10 opacity-70" />
            {/* Bottom layer */}
            <div className="w-36 h-12 rounded-xl bg-gradient-to-tr from-purple-950/30 to-blue-950/30 border border-card-border/60 transform -rotate-12 skew-x-12 opacity-40" />
          </div>
        </div>
      </div>

      {/* ─── 4 Top KPI Cards with Custom Sparklines ───────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Payment Success Rate */}
        <div className="p-5 rounded-2xl bg-panel border border-card-border hover:border-accent/40 transition-all space-y-3 shadow-sm">
          <div className="flex items-center gap-2.5 text-text-muted">
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold">Payment Success Rate</span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-text-primary tracking-tight">98.42%</div>
              <div className="text-[11px] font-medium text-rose-400 mt-0.5">
                ↓ 0.8% <span className="text-text-muted font-normal">vs yesterday</span>
              </div>
            </div>

            {/* Sparkline (Purple) */}
            <div className="w-20 h-9">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 80 30" fill="none">
                <path
                  d="M0 20 Q 15 25, 25 15 T 45 18 T 65 10 T 80 14"
                  stroke="#A855F7"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* KPI 2: Net Revenue (Today) */}
        <div className="p-5 rounded-2xl bg-panel border border-card-border hover:border-accent/40 transition-all space-y-3 shadow-sm">
          <div className="flex items-center gap-2.5 text-text-muted">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold">Net Revenue (Today)</span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-text-primary tracking-tight">₹47.3L</div>
              <div className="text-[11px] font-medium text-emerald-500 mt-0.5">
                ↑ 9.7% <span className="text-text-muted font-normal">vs yesterday</span>
              </div>
            </div>

            {/* Sparkline (Emerald) */}
            <div className="w-20 h-9">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 80 30" fill="none">
                <path
                  d="M0 24 Q 18 18, 30 22 T 55 12 T 70 8 T 80 5"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* KPI 3: Refund Volume (Today) */}
        <div className="p-5 rounded-2xl bg-panel border border-card-border hover:border-accent/40 transition-all space-y-3 shadow-sm">
          <div className="flex items-center gap-2.5 text-text-muted">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold">Refund Volume (Today)</span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-text-primary tracking-tight">₹1.24L</div>
              <div className="text-[11px] font-medium text-emerald-500 mt-0.5">
                ↑ 8.3% <span className="text-text-muted font-normal">vs yesterday</span>
              </div>
            </div>

            {/* Sparkline (Orange) */}
            <div className="w-20 h-9">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 80 30" fill="none">
                <path
                  d="M0 25 Q 16 22, 28 26 T 50 14 T 66 18 T 80 8"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* KPI 4: Failed Payments (Today) */}
        <div className="p-5 rounded-2xl bg-panel border border-card-border hover:border-accent/40 transition-all space-y-3 shadow-sm">
          <div className="flex items-center gap-2.5 text-text-muted">
            <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold">Failed Payments (Today)</span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-text-primary tracking-tight">1,245</div>
              <div className="text-[11px] font-medium text-rose-400 mt-0.5">
                ↑ 5.2% <span className="text-text-muted font-normal">vs yesterday</span>
              </div>
            </div>

            {/* Sparkline (Red) */}
            <div className="w-20 h-9">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 80 30" fill="none">
                <path
                  d="M0 25 Q 15 28, 30 20 T 50 24 T 65 14 T 80 10"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

      </div>

      {/* ─── Middle Row Bento Grid (3-Column Layout) ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Column 1: Needs Your Attention (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary">Needs Your Attention</h2>
            <button 
              onClick={() => onTriggerAgent('Flow, show all pending items needing attention.')}
              className="text-xs text-[#0C83FD] hover:text-[#0265D2] font-medium cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {/* Attention Item 1 */}
            <div 
              onClick={() => onTriggerAgent('Flow, investigate why payment success rate dropped by 0.8% in the last 2 hours.')}
              className="p-4 rounded-2xl bg-panel border border-card-border hover:border-accent/40 transition-all cursor-pointer group space-y-1.5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0">
                    <AlertTriangle className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-semibold text-text-primary group-hover:text-[#0C83FD] transition-colors">
                    Payment success rate dropped by 0.8%
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-text-muted">10m ago</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/20">
                    High
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
              <p className="text-[11px] text-text-muted pl-7 leading-relaxed">
                UPI payments failing more than usual in the last 2 hours.
              </p>
            </div>

            {/* Attention Item 2 */}
            <div 
              onClick={() => onTriggerAgent('Flow, analyze the 8.3% increase in refund volume.')}
              className="p-4 rounded-2xl bg-panel border border-card-border hover:border-accent/40 transition-all cursor-pointer group space-y-1.5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                    <AlertTriangle className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-semibold text-text-primary group-hover:text-[#0C83FD] transition-colors">
                    Refund volume increased by 8.3%
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-text-muted">35m ago</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-600 border border-amber-500/20">
                    Medium
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
              <p className="text-[11px] text-text-muted pl-7 leading-relaxed">
                Higher than usual refund rate detected.
              </p>
            </div>

            {/* Attention Item 3 */}
            <div 
              onClick={() => onTriggerAgent('Flow, review the 3 pending chargeback disputes.')}
              className="p-4 rounded-2xl bg-panel border border-card-border hover:border-accent/40 transition-all cursor-pointer group space-y-1.5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                    <Info className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-semibold text-text-primary group-hover:text-[#0C83FD] transition-colors">
                    3 disputes require your review
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-text-muted">1h ago</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/15 text-blue-600 border border-blue-500/20">
                    Medium
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
              <p className="text-[11px] text-text-muted pl-7 leading-relaxed">
                High value disputes pending resolution.
              </p>
            </div>
          </div>
        </div>

        {/* Column 2: Active Investigations (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary">Active Investigations</h2>
            <button 
              onClick={() => onTriggerAgent('Flow, list all ongoing active investigations.')}
              className="text-xs text-[#0C83FD] hover:text-[#0265D2] font-medium cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {/* Investigation Card 1: Multi-Step Progress */}
            <div 
              onClick={() => onTriggerAgent('Flow, open investigation on UPI payment failures.')}
              className="p-4 rounded-2xl bg-panel border border-card-border hover:border-accent/40 transition-all cursor-pointer space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">UPI Payment Failures</h3>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      Investigating • 3 sources • <span className="text-rose-500 font-semibold">High Priority</span>
                    </p>
                  </div>
                </div>

                {/* Mini Sparkline */}
                <div className="w-14 h-6">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 60 20" fill="none">
                    <path d="M0 15 Q 12 18, 20 8 T 40 14 T 60 5" stroke="#A855F7" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>

              {/* Progress Stepper Bar */}
              <div className="pt-2 border-t border-card-border">
                <div className="relative flex items-center justify-between text-[10px] text-text-muted">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center gap-1 z-10">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[9px] font-bold">✓</div>
                    <span className="text-[9px] text-text-muted">Collecting</span>
                  </div>
                  <div className="flex-1 h-[2px] bg-[#0C83FD] -mt-3.5" />

                  {/* Step 2 (Active) */}
                  <div className="flex flex-col items-center gap-1 z-10">
                    <div className="w-4 h-4 rounded-full bg-[#0C83FD] text-white flex items-center justify-center text-[9px] font-bold animate-pulse">●</div>
                    <span className="text-[9px] text-[#0C83FD] font-semibold">Analyzing</span>
                  </div>
                  <div className="flex-1 h-[2px] bg-card-border -mt-3.5" />

                  {/* Step 3 */}
                  <div className="flex flex-col items-center gap-1 z-10">
                    <div className="w-4 h-4 rounded-full bg-card border border-card-border text-text-muted flex items-center justify-center text-[9px] font-bold">3</div>
                    <span className="text-[9px] text-text-muted">Resolving</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Investigation Card 2 */}
            <div 
              onClick={() => onTriggerAgent('Flow, open investigation on refund volume spikes.')}
              className="p-4 rounded-2xl bg-panel border border-card-border hover:border-accent/40 transition-all cursor-pointer space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">Refund Spike Analysis</h3>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      Collecting data • 1 source • <span className="text-amber-500 font-semibold">Medium Priority</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Stepper Bar */}
              <div className="pt-2 border-t border-card-border">
                <div className="relative flex items-center justify-between text-[10px] text-text-muted">
                  <div className="flex flex-col items-center gap-1 z-10">
                    <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-bold animate-pulse">●</div>
                    <span className="text-[9px] text-amber-500 font-semibold">Collecting</span>
                  </div>
                  <div className="flex-1 h-[2px] bg-card-border -mt-3.5" />
                  <div className="flex flex-col items-center gap-1 z-10">
                    <div className="w-4 h-4 rounded-full bg-card border border-card-border text-text-muted flex items-center justify-center text-[9px] font-bold">2</div>
                    <span className="text-[9px] text-text-muted">Analyzing</span>
                  </div>
                  <div className="flex-1 h-[2px] bg-card-border -mt-3.5" />
                  <div className="flex flex-col items-center gap-1 z-10">
                    <div className="w-4 h-4 rounded-full bg-card border border-card-border text-text-muted flex items-center justify-center text-[9px] font-bold">3</div>
                    <span className="text-[9px] text-text-muted">Resolving</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Flow Command Box & Agentic Pipeline Stepper (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Flow Command Box */}
          <div className="p-4 rounded-2xl bg-panel border border-card-border space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-text-primary">Flow Command</h2>
              <span className="text-[10px] font-mono text-text-muted bg-card px-1.5 py-0.5 rounded border border-card-border">
                ⌘ /
              </span>
            </div>

            {/* Input form */}
            <form onSubmit={handleCommandSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask Flow anything..."
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                className="w-full bg-card border border-card-border focus:border-[#0C83FD] rounded-xl pl-3.5 pr-10 py-2 text-xs text-text-primary placeholder-text-muted outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 w-7 h-7 rounded-lg bg-[#0C83FD] hover:bg-[#0265D2] text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Suggested Prompts */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Suggested for you</p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSuggestionClick('Why did payment success drop?')}
                  className="p-2 rounded-lg bg-card hover:bg-panel-hover border border-card-border text-[10px] text-text-secondary hover:text-text-primary text-left leading-tight transition-all cursor-pointer"
                >
                  Why did payment success drop?
                </button>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick("Show today's revenue trend")}
                  className="p-2 rounded-lg bg-card hover:bg-panel-hover border border-card-border text-[10px] text-text-secondary hover:text-text-primary text-left leading-tight transition-all cursor-pointer"
                >
                  Show today's revenue trend
                </button>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick('Investigate unusual refunds')}
                  className="p-2 rounded-lg bg-card hover:bg-panel-hover border border-card-border text-[10px] text-text-secondary hover:text-text-primary text-left leading-tight transition-all cursor-pointer"
                >
                  Investigate unusual refunds
                </button>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick('Find customers with failed payments')}
                  className="p-2 rounded-lg bg-card hover:bg-panel-hover border border-card-border text-[10px] text-text-secondary hover:text-text-primary text-left leading-tight transition-all cursor-pointer"
                >
                  Find customers with failed payments
                </button>
              </div>
            </div>
          </div>

          {/* Agentic Pipeline (Vertical Stepper) */}
          <div className="p-4 rounded-2xl bg-panel border border-card-border space-y-2.5 shadow-sm">
            <h2 className="text-xs font-bold text-text-primary mb-2">Agentic Pipeline</h2>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 font-mono text-[9px] font-bold flex items-center justify-center">1</span>
                  <span className="text-text-muted">Intent Recognized</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 font-mono text-[9px] font-bold flex items-center justify-center">2</span>
                  <span className="text-text-muted">Collecting Context</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#0C83FD] text-white font-mono text-[9px] font-bold flex items-center justify-center">3</span>
                  <span className="text-text-primary font-semibold">Analyzing & Reasoning</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#0C83FD] animate-pulse" />
              </div>

              <div className="flex items-center justify-between text-text-muted">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-card border border-card-border text-text-muted font-mono text-[9px] flex items-center justify-center">4</span>
                  <span>Generating Recommendations</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-text-muted">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-card border border-card-border text-text-muted font-mono text-[9px] flex items-center justify-center">5</span>
                  <span>Awaiting Approval</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-text-muted">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-card border border-card-border text-text-muted font-mono text-[9px] flex items-center justify-center">6</span>
                  <span>Executing Action</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-text-muted">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-card border border-card-border text-text-muted font-mono text-[9px] flex items-center justify-center">7</span>
                  <span>Verifying Results</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ─── Bottom Row: Quick Actions (5 Cards) ──────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-text-primary">Quick Actions</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          
          {/* Action 1: Investigate */}
          <div
            onClick={() => onTriggerAgent('Flow, investigate payment failures and soft declines.')}
            className="p-4 rounded-2xl bg-panel border border-card-border hover:border-[#0C83FD] hover:bg-panel-hover transition-all cursor-pointer group flex flex-col justify-between space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Search className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-[#0C83FD] group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-primary">Investigate</h3>
              <p className="text-[10px] text-text-muted mt-0.5">Payment failures</p>
            </div>
          </div>

          {/* Action 2: Show */}
          <div
            onClick={() => onTriggerAgent('Flow, show top failing banks and payment methods.')}
            className="p-4 rounded-2xl bg-panel border border-card-border hover:border-emerald-500 hover:bg-panel-hover transition-all cursor-pointer group flex flex-col justify-between space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Building2 className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-primary">Show</h3>
              <p className="text-[10px] text-text-muted mt-0.5">Top failing banks</p>
            </div>
          </div>

          {/* Action 3: Search */}
          <div
            onClick={() => onTriggerAgent('Flow, search customer issues and dropped checkouts.')}
            className="p-4 rounded-2xl bg-panel border border-card-border hover:border-[#0C83FD] hover:bg-panel-hover transition-all cursor-pointer group flex flex-col justify-between space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <UserCheck className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-[#0C83FD] group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-primary">Search</h3>
              <p className="text-[10px] text-text-muted mt-0.5">Customer issues</p>
            </div>
          </div>

          {/* Action 4: Compare */}
          <div
            onClick={() => onTriggerAgent('Flow, compare payment success rate trends across gateways.')}
            className="p-4 rounded-2xl bg-panel border border-card-border hover:border-amber-500 hover:bg-panel-hover transition-all cursor-pointer group flex flex-col justify-between space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <BarChart3 className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-primary">Compare</h3>
              <p className="text-[10px] text-text-muted mt-0.5">Success rate trends</p>
            </div>
          </div>

          {/* Action 5: Create */}
          <div
            onClick={() => onTriggerAgent('Flow, create a 1-click automated payment recovery workflow.')}
            className="p-4 rounded-2xl bg-panel border border-card-border hover:border-purple-500 hover:bg-panel-hover transition-all cursor-pointer group flex flex-col justify-between space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <FilePlus className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-primary">Create</h3>
              <p className="text-[10px] text-text-muted mt-0.5">Recovery workflow</p>
            </div>
          </div>

        </div>
      </div>

      {/* ─── Bottom Footer Banner ────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 pt-4 text-xs text-text-muted">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-emerald-500 font-semibold">Test Mode Active</span>
        <span>•</span>
        <span>No real money is involved</span>
      </div>

    </div>
  );
};
