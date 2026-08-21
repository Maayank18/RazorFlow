import React, { useState } from 'react';
import { BookOpen, MessageSquare, ListTodo, Settings, Layout, MousePointerClick, Key, Command, Move, ChevronDown, ChevronRight } from 'lucide-react';

const AccordionSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="bg-panel border border-card-border rounded-xl overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors text-left"
      >
        <h2 className="text-xl font-bold text-text-primary flex items-center gap-3">
          <Icon className="w-5 h-5 text-accent" />
          {title}
        </h2>
        {isOpen ? <ChevronDown className="w-5 h-5 text-text-muted shrink-0" /> : <ChevronRight className="w-5 h-5 text-text-muted shrink-0" />}
      </button>
      
      {isOpen && (
        <div className="p-5 pt-0 animate-in slide-in-from-top-2 fade-in duration-300 border-t border-card-border/50">
          {children}
        </div>
      )}
    </section>
  );
};

export const DocsView = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-bg custom-scrollbar text-text-primary p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-accent" />
            RazorFlow Documentation
          </h1>
          <p className="text-text-secondary text-[15px] leading-relaxed">
            Welcome to the official RazorFlow Documentation. Explore our 10-step agentic execution loop, Policy Engine risk gates, tool registry, and Razorpay integrations.
          </p>
        </div>

        {/* 1. Core Operating Model */}
        <AccordionSection title="1. 10-Step Operational Execution Pipeline" icon={Layout} defaultOpen={true}>
          <p className="text-[14px] text-text-secondary leading-relaxed mt-2">
            RazorFlow replaces generic chatbots with a deterministic 10-step execution pipeline:
          </p>
          <div className="bg-card border border-card-border rounded-xl p-5 mt-4">
            <p className="text-[13px] text-text-muted leading-relaxed font-mono">
              Intent → Context → Reasoning → Plan → Policy → Tool Selection → Execution → Verification → Audit → Memory
            </p>
          </div>
        </AccordionSection>

        {/* 2. Slash Commands */}
        <AccordionSection title="2. Slash Commands (/)" icon={Command}>
          <p className="text-[14px] text-text-secondary leading-relaxed mt-2">
            Typing <code>/</code> in the chat input instantly opens a menu of powerful macros to execute complex workflows.
          </p>
          <div className="bg-card border border-card-border rounded-xl overflow-hidden mt-4">
            <div className="divide-y divide-card-border/50">
              <div className="p-4 hover:bg-white/5 transition-colors">
                <p className="text-[13px] font-bold text-accent mb-1">/explain</p>
                <p className="text-[13px] text-text-muted">Explains a specific concept or piece of code in extreme detail.</p>
              </div>
              <div className="p-4 hover:bg-white/5 transition-colors">
                <p className="text-[13px] font-bold text-accent mb-1">/summarize</p>
                <p className="text-[13px] text-text-muted">Condenses long blocks of text or documents into key bullet points.</p>
              </div>
              <div className="p-4 hover:bg-white/5 transition-colors">
                <p className="text-[13px] font-bold text-accent mb-1">/plan</p>
                <p className="text-[13px] text-text-muted">Forces the AI to generate a structured timeline for a specific task.</p>
              </div>
              <div className="p-4 hover:bg-white/5 transition-colors">
                <p className="text-[13px] font-bold text-accent mb-1">/brainstorm</p>
                <p className="text-[13px] text-text-muted">Generates a list of creative ideas without rigid task structures.</p>
              </div>
              <div className="p-4 hover:bg-white/5 transition-colors">
                <p className="text-[13px] font-bold text-accent mb-1">/draw</p>
                <p className="text-[13px] text-text-muted">Instructs the AI to generate a creative image or visual representation based on your prompt.</p>
              </div>
              <div className="p-4 hover:bg-white/5 transition-colors">
                <p className="text-[13px] font-bold text-accent mb-1">/diagram</p>
                <p className="text-[13px] text-text-muted">Forces the AI to map out complex architectures or workflows using a visual Mermaid diagram.</p>
              </div>
              <div className="p-4 hover:bg-white/5 transition-colors">
                <p className="text-[13px] font-bold text-accent mb-1">/table</p>
                <p className="text-[13px] text-text-muted">Ensures the AI formats its response as a structured, easy-to-read Markdown table for comparing data.</p>
              </div>
            </div>
          </div>
        </AccordionSection>

        {/* 3. Orb Controls & Shortcuts */}
        <AccordionSection title="3. Hiding, Dragging, and Managing the Orb" icon={Move}>
          <p className="text-[14px] text-text-secondary leading-relaxed mt-2">
            The Desktop Orb is designed to stay out of your way until you need it.
          </p>
          <ul className="list-disc pl-5 text-[14px] text-text-secondary space-y-3 mt-4 bg-card border border-card-border p-5 rounded-xl">
            <li><strong>Global Hotkey:</strong> Press <kbd className="bg-bg px-2 py-1 rounded text-xs border border-card-border">Ctrl+Shift+Space</kbd> from anywhere on your PC to instantly hide or show the Orb.</li>
            <li><strong>Draggable Interface:</strong> Click and drag the circular Orb icon to move it anywhere on your screen. It will automatically snap to the nearest edge.</li>
            <li><strong>Right Panel:</strong> Click the Gear icon inside the Orb to open the Right Panel. From here, you can manage API keys, change themes, or swap the underlying LLM provider.</li>
            <li><strong>History:</strong> Click the Clock icon inside the Orb to view your past chat sessions.</li>
          </ul>
        </AccordionSection>

        {/* 4. Structured Responses & Action Ledger */}
        <AccordionSection title="4. Evidence, Findings & Action Ledger" icon={MousePointerClick}>
          <p className="text-[14px] text-text-secondary leading-relaxed mt-2">
            RazorFlow returns structured findings backed by failure error codes, release correlations, and verified action entries.
          </p>
          <ul className="list-disc pl-5 text-[14px] text-text-secondary space-y-3 mt-4 bg-card border border-card-border p-5 rounded-xl">
            <li><strong>Action Ledger:</strong> Every executed or approved mutation is logged in an immutable, cryptographically verifiable audit trail.</li>
            <li><strong>Post-Action State Verification:</strong> RazorFlow directly queries external APIs after execution to verify state changes.</li>
          </ul>
        </AccordionSection>

        {/* 5. Optimizing Settings */}
        <AccordionSection title="5. Settings & Permissions" icon={Settings}>
          <p className="text-[14px] text-text-secondary leading-relaxed mt-2">
            Configure LLM providers, Test Mode Razorpay keys, and operating personas.
          </p>
          <div className="bg-card border border-card-border rounded-xl p-5 mt-4">
            <h3 className="font-semibold text-text-primary mb-3">Key Settings</h3>
            <div className="space-y-4">
              <div className="border-b border-card-border/50 pb-4">
                <p className="text-[13px] font-bold text-white mb-1">Operating Persona</p>
                <p className="text-[13px] text-text-muted">Switch between Merchant View (GMV, Success Rates, Recoveries) and Engineer View (Microservice Latency, Deployments, Incidents).</p>
              </div>
              <div className="border-b border-card-border/50 pb-4">
                <p className="text-[13px] font-bold text-white mb-1">Policy Risk Limits</p>
                <p className="text-[13px] text-text-muted">Configure risk escalation thresholds and human sign-off triggers.</p>
              </div>
            </div>
          </div>
        </AccordionSection>

        <div className="pb-10"></div>
      </div>
    </div>
  );
};
