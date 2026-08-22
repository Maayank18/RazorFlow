import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Settings, 
  ShieldCheck, 
  ChevronDown,
  Command
} from 'lucide-react';

export const TopBar = ({ 
  activeMenu, 
  setActiveMenu, 
  user,
  onSignOut,
  userRole,
  setUserRole
}) => {
  const [searchValue, setSearchValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      setActiveMenu('playground');
    }
  };

  return (
    <header className="h-[60px] px-6 flex items-center justify-between shrink-0 border-b border-card-border bg-panel relative z-20">
      
      {/* Left Area: Live System Pill */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>LIVE SYSTEM</span>
        </div>
      </div>

      {/* Center Area: Global Search Bar */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Ask Flow anything..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-card border border-card-border focus:border-[#0C83FD] rounded-xl pl-10 pr-12 py-2 text-xs text-text-primary placeholder-text-muted outline-none transition-all"
          />
          <div className="absolute right-3 flex items-center gap-0.5 text-[10px] font-mono text-text-muted bg-bg px-1.5 py-0.5 rounded border border-card-border">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Area: Notifications, Settings & Test Mode Dropdown */}
      <div className="flex items-center gap-3">
        
        {/* Notification Bell */}
        <button 
          onClick={() => setActiveMenu('approvals')}
          className="w-8 h-8 rounded-xl bg-card border border-card-border flex items-center justify-center text-text-muted hover:text-text-primary transition-colors relative cursor-pointer"
          title="Notifications & Approvals"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0C83FD] text-white text-[9px] font-bold flex items-center justify-center border border-card-border">
            2
          </span>
        </button>

        {/* Settings Icon */}
        <button 
          onClick={() => setActiveMenu('settings')}
          className="w-8 h-8 rounded-xl bg-card border border-card-border flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Test Mode Badge Button */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-card-border cursor-pointer hover:border-[#0C83FD]/40 transition-all">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0C83FD]" />
          <span className="text-xs font-semibold text-text-primary">Test Mode</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
          <ChevronDown className="w-3 h-3 text-text-muted" />
        </div>

      </div>
    </header>
  );
};
