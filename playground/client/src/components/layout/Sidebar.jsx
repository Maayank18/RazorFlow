import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Cpu, 
  CreditCard, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  FileCheck2, 
  Database, 
  Wrench, 
  Settings, 
  Moon, 
  Sun, 
  HelpCircle,
  ChevronDown,
  Building,
  Sparkles,
  ChevronRight
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
    { id: 'investigations', label: 'Investigations', icon: Search },
    { id: 'agents', label: 'Agents', icon: Cpu },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'revenue', label: 'Revenue', icon: TrendingUp },
    { id: 'risk', label: 'Risk & Anomalies', icon: AlertTriangle },
  ];

  const governanceNav = [
    { id: 'approvals', label: 'Approvals', icon: ShieldCheck, badge: '2' },
    { id: 'activity', label: 'Activity & Audit', icon: FileText },
    { id: 'ledger', label: 'Action Ledger', icon: FileCheck2 },
    { id: 'memory', label: 'Memory', icon: Database },
    { id: 'tools', label: 'Tools', icon: Wrench },
  ];

  const handleNavClick = (id) => {
    if (id === 'agents') {
      setActiveMenu('agent_runs');
    } else if (id === 'ledger') {
      setActiveMenu('activity');
    } else if (id === 'payments' || id === 'customers' || id === 'revenue' || id === 'risk') {
      setActiveMenu('overview');
    } else {
      setActiveMenu(id);
    }
  };

  return (
    <aside className={`bg-[#0E131F] dark:bg-[#0B0F19] border-r border-white/[0.06] flex flex-col shrink-0 transition-all duration-300 relative z-30 ${isLeftPanelOpen ? 'w-[250px]' : 'w-0 overflow-hidden opacity-0'}`}>
      
      {/* Brand Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveMenu('overview')}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
            <img src="/razorflow-logo.png" alt="RazorFlow" className="w-8 h-8 object-contain drop-shadow-[0_0_12px_rgba(12,131,253,0.6)]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white tracking-tight text-base leading-tight">RazorFlow</span>
            <span className="text-[11px] text-[#8E9BAE] font-medium">Agentic Work Layer</span>
          </div>
        </div>

        {/* Merchant Selector Dropdown Card */}
        <div className="mt-4 relative">
          <button 
            onClick={() => setIsMerchantDropdownOpen(!isMerchantDropdownOpen)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#141A28] border border-white/[0.06] hover:border-white/20 transition-all text-left group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-[#1B2337] flex items-center justify-center text-[#8E9BAE] group-hover:text-white shrink-0">
                <Building className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">Merchant Hub</p>
                <p className="text-[10px] text-emerald-400 font-medium">Test Mode</p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#8E9BAE] shrink-0" />
          </button>
        </div>

        {/* Primary App Button: Control Center */}
        <div className="mt-2.5">
          <button
            onClick={() => setActiveMenu('overview')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'overview'
                ? 'bg-gradient-to-r from-purple-900/60 to-purple-800/30 text-purple-200 border border-purple-500/30 shadow-sm'
                : 'text-[#8E9BAE] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className={`w-4 h-4 ${activeMenu === 'overview' ? 'text-purple-400' : 'text-[#8E9BAE]'}`} />
              <span>Control Center</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 ${activeMenu === 'overview' ? 'text-purple-400' : 'text-[#8E9BAE]'}`} />
          </button>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-5 custom-scrollbar">
        
        {/* Workspace Section */}
        <div>
          <p className="text-[10px] font-bold text-[#5A6882] uppercase tracking-wider mb-1.5 px-2">WORKSPACE</p>
          <nav className="space-y-0.5">
            {workspaceNav.map(item => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id || (item.id === 'agents' && activeMenu === 'agent_runs');
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'text-white bg-white/[0.08] font-semibold'
                      : 'text-[#8E9BAE] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-400' : 'text-[#8E9BAE]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Governance Section */}
        <div>
          <p className="text-[10px] font-bold text-[#5A6882] uppercase tracking-wider mb-1.5 px-2">GOVERNANCE</p>
          <nav className="space-y-0.5">
            {governanceNav.map(item => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id || (item.id === 'ledger' && activeMenu === 'activity');
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'text-white bg-white/[0.08] font-semibold'
                      : 'text-[#8E9BAE] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-400' : 'text-[#8E9BAE]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="w-4 h-4 rounded-full bg-purple-600 text-white font-bold text-[9px] flex items-center justify-center shadow-sm">
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
          <p className="text-[10px] font-bold text-[#5A6882] uppercase tracking-wider mb-1.5 px-2">CONFIGURATION</p>
          <nav className="space-y-0.5">
            <button
              onClick={() => setActiveMenu('settings')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeMenu === 'settings'
                  ? 'text-white bg-white/[0.08] font-semibold'
                  : 'text-[#8E9BAE] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Settings className={`w-3.5 h-3.5 ${activeMenu === 'settings' ? 'text-purple-400' : 'text-[#8E9BAE]'}`} />
              <span>Settings</span>
            </button>
          </nav>
        </div>

      </div>

      {/* Footer Area: User Profile Card & Theme/Help Controls */}
      <div className="p-3.5 border-t border-white/[0.06] space-y-3 bg-[#0B0F19]/60">
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#141A28] border border-white/[0.06]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-[11px] shrink-0">
              MG
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight">Mayank Garg</p>
              <p className="text-[10px] text-[#8E9BAE] truncate">Workspace Admin</p>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#8E9BAE] shrink-0" />
        </div>

        {/* Theme and Help Controls */}
        <div className="flex items-center justify-between px-2 pt-1 text-[#8E9BAE]">
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="hover:text-white transition-colors" title="Toggle Theme">
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button onClick={toggleTheme} className="hover:text-white transition-colors">
              <Sun className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>
          <button className="hover:text-white transition-colors">
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </aside>
  );
};
