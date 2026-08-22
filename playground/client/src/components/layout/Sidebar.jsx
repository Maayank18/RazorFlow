import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Cpu, 
  ShieldCheck, 
  FileText, 
  Database, 
  Wrench, 
  Settings, 
  Moon, 
  Sun, 
  HelpCircle,
  ChevronDown,
  Building,
  Sparkles,
  BookOpen,
  Layers
} from 'lucide-react';

export const Sidebar = ({ 
  isLeftPanelOpen, 
  activeMenu, 
  setActiveMenu, 
  user, 
  onSignOut,
  theme,
  toggleTheme
}) => {
  const [isMerchantDropdownOpen, setIsMerchantDropdownOpen] = useState(false);

  const workspaceNav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'flowgraph', label: 'FlowGraph', icon: Layers },
    { id: 'investigations', label: 'Investigations', icon: Search },
    { id: 'agent_runs', label: 'Agent Traces', icon: Cpu },
  ];

  const governanceNav = [
    { id: 'approvals', label: 'Approvals', icon: ShieldCheck, badge: '2' },
    { id: 'activity', label: 'Action Ledger', icon: FileText },
    { id: 'context', label: 'Context Engine', icon: Layers },
    { id: 'tools', label: 'Tool Registry', icon: Wrench },
    { id: 'memory', label: 'Memory Store', icon: Database },
  ];

  const configNav = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'manual', label: 'User Manual', icon: BookOpen },
  ];

  return (
    <aside className={`bg-panel border-r border-card-border flex flex-col shrink-0 transition-all duration-300 relative z-30 ${isLeftPanelOpen ? 'w-[240px]' : 'w-0 overflow-hidden opacity-0'}`}>
      
      {/* Brand Header */}
      <div className="p-4 pb-3 space-y-3">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveMenu('overview')}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0">
            <img src="/razorflow-logo.png" alt="RazorFlow" className="w-7 h-7 object-contain drop-shadow-[0_0_10px_rgba(12,131,253,0.5)]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-text-primary tracking-tight text-sm leading-tight">RazorFlow</span>
            <span className="text-[10px] text-text-muted font-medium">Agentic Work Layer</span>
          </div>
        </div>

        {/* Merchant Selector Badge */}
        <div className="p-2.5 rounded-xl bg-card border border-card-border flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-bg flex items-center justify-center text-text-muted shrink-0">
              <Building className="w-3.5 h-3.5 text-[#0C83FD]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate leading-tight">Merchant Hub</p>
              <p className="text-[10px] text-emerald-500 font-medium">● Test Mode</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-4 custom-scrollbar">
        
        {/* Workspace Section */}
        <div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 px-2">WORKSPACE</p>
          <nav className="space-y-0.5">
            {workspaceNav.map(item => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'text-white bg-[#0C83FD] font-semibold shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-card-border/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-text-muted'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Governance Section */}
        <div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 px-2">GOVERNANCE & ENGINE</p>
          <nav className="space-y-0.5">
            {governanceNav.map(item => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'text-white bg-[#0C83FD] font-semibold shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-card-border/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-text-muted'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`w-4 h-4 rounded-full text-white font-bold text-[9px] flex items-center justify-center shadow-sm ${
                      isActive ? 'bg-white/20' : 'bg-rose-500'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Configuration Section */}
        <div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 px-2">CONFIGURATION</p>
          <nav className="space-y-0.5">
            {configNav.map(item => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'text-white bg-[#0C83FD] font-semibold shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-card-border/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-text-muted'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

      </div>

      {/* Footer Area: User Profile Card & Dynamic Theme Switcher */}
      <div className="p-3 border-t border-card-border space-y-2 bg-card/60">
        <div className="flex items-center justify-between p-2 rounded-xl bg-panel border border-card-border">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-[#0C83FD] flex items-center justify-center text-white font-bold text-[10px] shrink-0">
              MG
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate leading-tight">Mayank Garg</p>
              <p className="text-[10px] text-text-muted truncate">Workspace Admin</p>
            </div>
          </div>
        </div>

        {/* Dynamic Light / Dark Theme Switcher */}
        <div className="flex items-center justify-between px-1 text-text-muted">
          <button 
            onClick={toggleTheme} 
            className="flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-lg hover:bg-card-border/50 hover:text-text-primary transition-all cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#0C83FD]" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
          
          <button 
            onClick={() => setActiveMenu('manual')}
            className="p-1 rounded-lg hover:bg-card-border/50 hover:text-text-primary transition-all cursor-pointer"
            title="Help & User Manual"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </aside>
  );
};
