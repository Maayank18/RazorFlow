import React, { useState } from 'react';
import { 
  Settings2, 
  Key, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Zap, 
  Server,
  Terminal,
  Save
} from 'lucide-react';

export const SettingsView = ({ userRole, setUserRole }) => {
  const [razorpayEnv, setRazorpayEnv] = useState('test');
  const [keyId, setKeyId] = useState('rzp_test_demo_flow_key');
  const [keySecret, setKeySecret] = useState('••••••••••••••••••••••••');
  const [webhookSecret, setWebhookSecret] = useState('rzp_test_webhook_secret_881');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 max-w-4xl mx-auto custom-scrollbar">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400">
            CONFIGURATION & CREDENTIAL VAULT
          </span>
          <span className="text-xs font-mono text-text-muted">Tenant Isolation</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
          RazorFlow System Settings
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Manage Razorpay API integrations, Test/Live environment modes, and AI orchestrator routing.
        </p>
      </div>

      {/* 1. Persona Selection */}
      <div className="p-6 rounded-2xl bg-panel border border-card-border space-y-4 shadow-md">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          Active Operating Persona
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => setUserRole('merchant')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              userRole === 'merchant'
                ? 'bg-blue-600/10 border-blue-500 shadow-sm'
                : 'bg-bg border-card-border hover:border-white/20'
            }`}
          >
            <div className="text-sm font-bold text-white flex items-center justify-between">
              <span>🏪 Merchant Operator</span>
              {userRole === 'merchant' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
            </div>
            <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
              Optimized for payment success rates, GMV pulse, chargeback defense, and recoverable revenue workflows.
            </p>
          </div>

          <div
            onClick={() => setUserRole('engineer')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              userRole === 'engineer'
                ? 'bg-purple-600/10 border-purple-500 shadow-sm'
                : 'bg-bg border-card-border hover:border-white/20'
            }`}
          >
            <div className="text-sm font-bold text-white flex items-center justify-between">
              <span>⚙️ SRE / Technical Operator</span>
              {userRole === 'engineer' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
            </div>
            <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
              Optimized for microservice telemetry, CI/CD deployment correlation, gateway latencies, and incident tracking.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Razorpay Environment & API Credentials */}
      <div className="p-6 rounded-2xl bg-panel border border-card-border space-y-5 shadow-md">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            Razorpay API Credentials (Test Mode Default)
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs">
            ● TEST MODE ACTIVE
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">Razorpay Key ID</label>
            <input
              type="text"
              value={keyId}
              onChange={(e) => setKeyId(e.target.value)}
              className="w-full px-3.5 py-2 bg-bg border border-card-border rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">Razorpay Key Secret (Server-Side Isolated)</label>
            <input
              type="password"
              value={keySecret}
              onChange={(e) => setKeySecret(e.target.value)}
              className="w-full px-3.5 py-2 bg-bg border border-card-border rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">Webhook Secret (HMAC-SHA256 Signature)</label>
            <input
              type="text"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              className="w-full px-3.5 py-2 bg-bg border border-card-border rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div className="p-3 rounded-xl bg-bg border border-card-border text-[11px] font-mono text-text-muted flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Credentials are strictly kept in server memory and never broadcast to browser renderers.</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {saved ? 'Saved Successfully!' : 'Save Credentials'}
          </button>
        </div>
      </div>
    </div>
  );
};
