import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Loader2, GripVertical, ExternalLink, Activity, Filter, FilterX, Settings, X, Maximize2, MoreVertical, Clock, History, Calendar, Play, Pause, Square, BarChart2, Plus, Paperclip, Camera, Mic, MicOff, Globe, Send, Copy, Check, Paintbrush, Sparkles, AlertTriangle, Layers, Cpu, Building, RefreshCw, ArrowRight } from 'lucide-react';
import { RazorpayIcon } from '../common/RazorpayIcon';
import { AILogger } from '../../ai/observability/logger';
import { UploadManager } from '../../ui/uploads/UploadManager';
import { IngestionService } from '../../ingestion';
import { summarizer } from '../../memory/summarizer';
import { AppState, Message, Attachment } from '../../types';
import { generateWorkspaceSummary } from '../../lib/summary';
import { ReflectionService } from '../../lib/reflection';
import { generateAIResponse } from '../../lib/ai';
import { resolveCommandIntent, executeRoutedCommand } from '../../agent/flowRouter';
import { COMMAND_SCHEMAS, ALL_COMMANDS } from '../../chat/commandSchemas';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { inputNormalizer } from '../../agent/intent/normalizer';
import { contextEngine } from '../../agent/context/engine';
import { agentOrchestrator } from '../../agents/specialized';
import { OrbVisualArtifact } from './OrbVisualArtifact';

import { ExplainabilityService } from '../../lib/explainability';
import { getGlobalSortedTasks } from '../../lib/time';

const Toggle = React.memo(({ active, onClick }: { active: boolean, onClick: () => void }) => (
  <button 
    type="button"
    onClick={onClick}
    className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent shrink-0 ${active ? 'bg-accent' : 'bg-card-border hover:bg-text-muted/30'}`}
    aria-pressed={active}
  >
    <div className={`absolute top-[2px] w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${active ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}></div>
  </button>
));
Toggle.displayName = 'Toggle';

export function ChatPanel({ 
  state, 
  setState, 
  generateId,
  isCanvasOpen,
  onToggleCanvas,
  initialPrompt,
  onClearInitialPrompt
}: { 
  state: AppState; 
  setState: any; 
  generateId: any;
  isCanvasOpen?: boolean;
  onToggleCanvas?: () => void;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [draftContext, setDraftContext] = useState(state.settings.aiConfig.customChatContext || '');
  const [isContextSaved, setIsContextSaved] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const isElectronEnv = typeof window !== 'undefined' && !!window.electronAPI;

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.chat-input-menu-container')) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const [orbRole, setOrbRole] = useState<'merchant' | 'engineer'>('merchant');

  const executePromptWithPipeline = async (promptText: string) => {
    setIsTyping(true);
    try {
      // 1. Check canonical fintech intent first
      const rzpIntent = inputNormalizer.normalize({ text: promptText });
      if (rzpIntent.type !== 'general_command' && rzpIntent.confidence >= 0.6) {
        const context = contextEngine.assembleContext(rzpIntent, {}, orbRole);
        const orchestratorResult = await agentOrchestrator.orchestrate(rzpIntent, context);
        
        let artifactType: any = undefined;
        if (rzpIntent.type === 'business_health_query') {
          artifactType = 'gateway_matrix';
        } else if (rzpIntent.type === 'payment_investigation' || rzpIntent.type === 'engineering_incident_correlation') {
          artifactType = 'failure_cascade';
        } else if (rzpIntent.type === 'revenue_opportunity_query' || rzpIntent.type === 'recovery_action') {
          artifactType = 'revenue_recovery';
        }

        const aiMsg: Message = {
          id: generateId(),
          role: 'assistant',
          content: orchestratorResult.reasoning.conclusion,
          timestamp: Date.now(),
          artifactType
        } as any;

        setState((prev: AppState) => ({
          ...prev,
          messages: [...prev.messages, aiMsg]
        }));
        setIsTyping(false);
        return;
      }

      // 2. Check OS / Browser command routing
      const intent = await resolveCommandIntent(promptText);
      if (intent.intent === 'browser_action' || intent.intent === 'os_action' || intent.intent === 'razorflow_control' || intent.intent === 'floatgpt_control') {
        const flowResult = await executeRoutedCommand(intent, promptText);
        const aiMsg: Message = { id: generateId(), role: 'assistant', content: flowResult.message, timestamp: Date.now() };
        setState((prev: AppState) => ({
          ...prev,
          messages: [...prev.messages, aiMsg]
        }));
        setIsTyping(false);
        return;
      }

      // 3. Fallback to standard AI LLM generation
      const data = await generateAIResponse(state, promptText, undefined, false, undefined, isThinkingMode);
      let contentText = data?.message || data?.conclusion || (typeof data === 'string' ? data : '');
      if (typeof contentText === 'object') {
        contentText = contentText.message || contentText.conclusion || JSON.stringify(contentText);
      }
      if (typeof contentText === 'string' && contentText.trim().startsWith('{') && contentText.includes('"message"')) {
        try {
          const parsed = JSON.parse(contentText);
          if (parsed.message) contentText = parsed.message;
        } catch(e) {}
      }

      // Check if visualization is requested
      let artifactType: any = undefined;
      const lowerPrompt = promptText.toLowerCase();
      if (/gateway|telemetry|chart|success rate/i.test(lowerPrompt)) {
        artifactType = 'gateway_matrix';
      } else if (/cascade|diagram|architecture|sre/i.test(lowerPrompt)) {
        artifactType = 'failure_cascade';
      } else if (/recover|soft decline|revenue opportunity/i.test(lowerPrompt)) {
        artifactType = 'revenue_recovery';
      }

      const aiMsg: Message = { 
        id: generateId(), 
        role: 'assistant', 
        content: contentText || 'Operational query processed successfully.', 
        timestamp: Date.now(),
        artifactType
      } as any;

      setState((prev: AppState) => ({
        ...prev,
        messages: [...prev.messages, aiMsg]
      }));
      setIsTyping(false);
    } catch (err: any) {
      console.error('Agent execution error:', err);
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    const userMsg: Message = { id: generateId(), role: 'user', content: promptText, timestamp: Date.now() };
    setState((prev: AppState) => ({ ...prev, messages: [...prev.messages, userMsg] }));
    executePromptWithPipeline(promptText);
  };

  // Handle incoming initialPrompt from Missions / quick action triggers
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() && !isTyping) {
      const promptToRun = initialPrompt;
      if (onClearInitialPrompt) onClearInitialPrompt();
      
      const userMsg: Message = { id: generateId(), role: 'user', content: promptToRun, timestamp: Date.now() };
      const newMessages = [...state.messages, userMsg];
      setState((prev: AppState) => ({ ...prev, messages: newMessages }));
      executePromptWithPipeline(promptToRun);
    }
  }, [initialPrompt]);

  // ─── Feature 2: Web Speech API (Voice-to-Text) ──────────────
  const hasSpeechRecognition = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const toggleVoiceInput = useCallback(() => {
    if (!hasSpeechRecognition) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      setInput(prev => {
        // Replace any previous interim with the latest
        const base = finalTranscript || prev;
        return (base + interim).trim();
      });
    };

    recognition.onerror = (event: any) => {
      console.error('[RazorFlow] Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript.trim()) {
        setInput(finalTranscript.trim());
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, hasSpeechRecognition]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
    };
  }, []);

  // ─── Feature 4: Desktop Screenshot ──────────────────────────
  const handleScreenshot = useCallback(async () => {
    if (!isElectronEnv || !window.electronAPI?.captureScreenshot) return;
    setIsCapturing(true);
    try {
      const dataUrl = await window.electronAPI.captureScreenshot();
      if (dataUrl) {
        setAttachments(prev => [...prev, {
          name: `screenshot-${Date.now()}.png`,
          mimeType: 'image/png',
          data: dataUrl,
        }]);
      }
    } catch (err) {
      console.error('[RazorFlow] Screenshot failed:', err);
    } finally {
      setIsCapturing(false);
    }
  }, [isElectronEnv]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    // Instead of local attachments, ingest them centrally for multimodal context
    for (const file of files) {
      await IngestionService.ingestFile(file);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const viewingSessionId = state.viewingSessionId || null;

  const activeMessages = viewingSessionId 
    ? state.pastSessions?.find(s => s.id === viewingSessionId)?.messages || []
    : state.messages || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessages, isTyping]);

  const updateAiSetting = (key: keyof typeof state.settings.aiConfig, value: any) => {
    setState((prev: AppState) => ({
      ...prev,
      settings: {
        ...prev.settings,
        aiConfig: {
          ...prev.settings.aiConfig,
          [key]: value
        }
      }
    }));
  };

  const handleSaveContext = () => {
    updateAiSetting('customChatContext', draftContext);
    setIsContextSaved(true);
    setTimeout(() => setIsContextSaved(false), 2000);
  };

  const isPlanMode = state.settings.aiConfig.isPlanMode !== false;

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const currentInput = input;
    const currentAttachments = attachments.length > 0 ? [...attachments] : undefined;
    const userMsg: Message = { id: generateId(), role: 'user', content: currentInput, timestamp: Date.now(), attachments: currentAttachments, usedWebSearch: useWebSearch };
    
    const newMessages = [...state.messages, userMsg];
    setState((prev: AppState) => ({ ...prev, messages: newMessages }));
    
    setInput('');
    setAttachments([]);
    await executePromptWithPipeline(currentInput);
  };

  const [showCommands, setShowCommands] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Clean Compact Mode Switcher */}
      {!viewingSessionId && (
        <div className="shrink-0 px-3 py-1.5 border-b border-card-border/60 bg-bg-secondary/40 flex items-center justify-center">
          <div className="flex items-center bg-bg/80 p-0.5 rounded-lg border border-card-border/60 text-[10px]">
            <button
              type="button"
              onClick={() => setOrbRole('merchant')}
              className={`px-3 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                orbRole === 'merchant'
                  ? 'bg-[#0C83FD] text-white shadow-sm font-bold'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              Merchant
            </button>
            <button
              type="button"
              onClick={() => setOrbRole('engineer')}
              className={`px-3 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                orbRole === 'engineer'
                  ? 'bg-purple-600 text-white shadow-sm font-bold'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              Developer
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4" ref={scrollRef}>
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-accent/20 border border-accent/50 text-accent px-3 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-widest shadow-lg shadow-accent/10 backdrop-blur-sm transition-all animate-in fade-in slide-in-from-top-2">
            {toastMessage}
          </div>
        )}

        {/* Initial empty state message & quick visual chips */}
        {(!activeMessages || activeMessages.length === 0) && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-card border border-card-border flex items-center justify-center shrink-0 overflow-hidden p-1">
                <img src="/razorflow-logo.png" alt="RazorFlow" className="w-full h-full object-contain" />
              </div>
              <div className="bg-panel border border-card-border rounded-xl rounded-tl-none p-3 text-xs text-text-muted leading-relaxed">
                {viewingSessionId ? 'No messages in this session.' : 'I am your floating operational assistant. You can generate live gateway charts, SRE failure cascade diagrams, or recovery campaigns.'}
              </div>
            </div>

            {!viewingSessionId && (
              <div className="grid grid-cols-2 gap-2 pl-10 pr-2">
                <button
                  type="button"
                  onClick={() => handleQuickPrompt('Flow, show payment gateway telemetry chart.')}
                  className="p-2.5 rounded-xl bg-bg border border-card-border hover:border-[#0C83FD]/50 hover:bg-[#0C83FD]/5 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 font-bold text-white text-[11px] group-hover:text-[#0C83FD]">
                    <BarChart2 className="w-3.5 h-3.5 text-[#0C83FD]" />
                    <span>Gateway Chart</span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5">Live success rates & latency</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPrompt('Flow, why did payment failures increase after the latest deployment?')}
                  className="p-2.5 rounded-xl bg-bg border border-card-border hover:border-purple-500/50 hover:bg-purple-500/5 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 font-bold text-white text-[11px] group-hover:text-purple-300">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" />
                    <span>Cascade Diagram</span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5">Correlate dep_prod_9921</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPrompt('Where am I losing potential revenue?')}
                  className="p-2.5 rounded-xl bg-bg border border-card-border hover:border-amber-500/50 hover:bg-amber-500/5 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 font-bold text-white text-[11px] group-hover:text-amber-300">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Recovery Breakdown</span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5">Recover ₹312k soft declines</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPrompt('Flow, tell me what needs my attention today.')}
                  className="p-2.5 rounded-xl bg-bg border border-card-border hover:border-emerald-500/50 hover:bg-emerald-500/5 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 font-bold text-white text-[11px] group-hover:text-emerald-300">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Daily Briefing</span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5">Prioritized business pulse</p>
                </button>
              </div>
            )}
          </div>
        )}

        {(activeMessages || []).map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-card border border-card-border flex items-center justify-center shrink-0 overflow-hidden p-1">
                <img src="/razorflow-logo.png" alt="RazorFlow" className="w-full h-full object-contain" />
              </div>
            )}
            <div className={`p-3 text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap ${
              msg.role === 'user' 
                ? 'bg-accent text-white rounded-xl rounded-tr-none' 
                : 'bg-panel border border-card-border text-text-muted rounded-xl rounded-tl-none'
            }`}>
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {msg.attachments.map((att, i) => (
                    <div key={i} className="w-16 h-16 rounded overflow-hidden border border-white/20 bg-black/10 flex items-center justify-center">
                       {att.mimeType.startsWith('image/') ? (
                         <img src={att.data} alt="attachment" className="w-full h-full object-cover" />
                       ) : (
                         <Paperclip className="w-6 h-6 opacity-50" />
                       )}
                    </div>
                  ))}
                </div>
              )}
              {msg.role === 'assistant' ? (
                <div className="relative group/msg space-y-2">
                  <MarkdownRenderer content={msg.content} />
                  {(msg as any).artifactType && (
                    <OrbVisualArtifact 
                      type={(msg as any).artifactType} 
                      userRole={orbRole} 
                      onTriggerPrompt={(p) => handleQuickPrompt(p)} 
                    />
                  )}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(msg.content);
                      const el = document.getElementById(`copy-msg-${msg.id}`);
                      if (el) {
                        el.innerHTML = '<svg class="w-3.5 h-3.5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                        setTimeout(() => {
                           el.innerHTML = '<svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                        }, 2000);
                      }
                    }}
                    className="absolute -top-3 -right-3 p-1.5 bg-card border border-card-border rounded-lg text-text-muted opacity-0 group-hover/msg:opacity-100 transition-opacity hover:text-accent shadow-sm cursor-pointer"
                    title="Copy Response"
                    id={`copy-msg-${msg.id}`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-card border border-card-border flex items-center justify-center shrink-0">
              <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
            </div>
          </div>
        )}
      </div>
      
      <div className="px-3">
        <UploadManager />
      </div>
      
      <div className="flex flex-col bg-bg-secondary border-t border-card-border mt-2">
        {attachments.length > 0 && (
          <div className="px-3 py-2 border-b border-card-border/50 flex gap-2 overflow-x-auto">
            {attachments.map((att, i) => (
              <div key={i} className="relative w-12 h-12 rounded-lg bg-card border border-card-border flex items-center justify-center shrink-0 overflow-hidden group">
                {att.mimeType.startsWith('image/') ? (
                  <img src={att.data} alt={att.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Paperclip className="w-4 h-4 text-text-muted" />
                    <span className="text-[8px] text-text-muted truncate w-full text-center px-1">{att.name}</span>
                  </div>
                )}
                <button 
                  type="button" 
                  onClick={() => removeAttachment(i)}
                  className="absolute top-0 right-0 bg-danger/80 text-white p-0.5 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="p-3 relative">
          {/* Command Suggestions Popup */}
          {input.startsWith('/') && !input.includes(' ') && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-card border border-card-border rounded-xl shadow-2xl shadow-black/80 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 backdrop-blur-xl">
              <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-1.5 flex flex-col gap-0.5">
                {ALL_COMMANDS.filter(cmd => `/${cmd}`.startsWith(input.toLowerCase())).map(cmd => (
                  <button
                    key={cmd}
                    type="button"
                    onClick={() => {
                      setInput(`/${cmd} `);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent/10 rounded-lg transition-all group text-left"
                  >
                    <div className="flex-shrink-0 bg-bg group-hover:bg-accent/20 px-2 py-1 rounded-md text-[11px] font-bold text-accent transition-colors border border-card-border group-hover:border-accent/30 shadow-sm">
                      /{cmd}
                    </div>
                    <span className="text-[11px] text-text-muted group-hover:text-text-primary truncate transition-colors">
                      {COMMAND_SCHEMAS[cmd].description}
                    </span>
                  </button>
                ))}
                {ALL_COMMANDS.filter(cmd => `/${cmd}`.startsWith(input.toLowerCase())).length === 0 && (
                  <div className="px-3 py-4 text-center text-[11px] text-text-muted italic bg-bg/50 rounded-lg">No matching commands found.</div>
                )}
              </div>
            </div>
          )}
          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              type="file" 
              multiple 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*,application/pdf,text/plain,audio/*"
            />
            {/* Tools Menu */}
            <div className="relative chat-input-menu-container flex items-center">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                disabled={isTyping || viewingSessionId !== null}
                className={`p-2 shrink-0 transition-colors border rounded-lg disabled:opacity-50 ${isMenuOpen ? 'bg-card border-text-muted text-text-primary' : 'bg-card border-card-border text-text-muted hover:text-text-primary'}`}
                title="More options"
              >
                <Plus className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-45' : ''}`} />
              </button>
              
              {isMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 bg-panel border border-card-border rounded-xl shadow-2xl p-2 flex flex-col gap-1 min-w-[210px] animate-in fade-in slide-in-from-bottom-2 z-50 text-xs">
                  <div className="text-[10px] font-bold text-text-muted px-2 py-1 uppercase tracking-wider">
                    Visual Analytics & Tools
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleQuickPrompt('Flow, show payment gateway telemetry chart.');
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-card-border/60 text-text-primary text-left transition-colors cursor-pointer"
                  >
                    <BarChart2 className="w-4 h-4 text-[#0C83FD]" />
                    <span>Gateway Telemetry Chart</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleQuickPrompt('Flow, why did payment failures increase after the latest deployment?');
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-card-border/60 text-text-primary text-left transition-colors cursor-pointer"
                  >
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span>Failure Cascade Diagram</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleQuickPrompt('Where am I losing potential revenue?');
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-card-border/60 text-text-primary text-left transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-amber-400" />
                    <span>Revenue Recovery Infographic</span>
                  </button>

                  <div className="h-px bg-card-border/60 my-1" />

                  <div className="flex items-center gap-1 px-1">
                    <button 
                      type="button"
                      onClick={() => { fileInputRef.current?.click(); setIsMenuOpen(false); }}
                      disabled={isTyping || viewingSessionId !== null}
                      className="p-2 text-text-muted hover:bg-card-border hover:text-text-primary transition-colors rounded-lg flex items-center justify-center disabled:opacity-50"
                      title="Attach media/file"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        if (onToggleCanvas) onToggleCanvas();
                        setIsMenuOpen(false);
                      }}
                      disabled={isTyping || viewingSessionId !== null}
                      className={`p-2 transition-colors rounded-lg flex items-center justify-center disabled:opacity-50 ${isCanvasOpen ? 'bg-accent/20 text-accent hover:bg-accent/30' : 'text-text-muted hover:bg-card-border hover:text-text-primary'}`}
                      title="Toggle Screen Canvas / Annotator"
                    >
                      <Paintbrush className="w-4 h-4" />
                    </button>
                    {hasSpeechRecognition && (
                      <button 
                        type="button"
                        onClick={() => { toggleVoiceInput(); setIsMenuOpen(false); }}
                        disabled={isTyping || viewingSessionId !== null}
                        className={`p-2 transition-colors rounded-lg flex items-center justify-center disabled:opacity-50 ${isListening ? 'bg-danger/20 text-danger hover:bg-danger/30 animate-pulse' : 'text-text-muted hover:bg-card-border hover:text-text-primary'}`}
                        title={isListening ? 'Stop listening' : 'Voice input'}
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    )}
                    {isElectronEnv && window.electronAPI?.captureScreenshot && (
                      <button 
                        type="button"
                        onClick={() => { handleScreenshot(); setIsMenuOpen(false); }}
                        disabled={isTyping || isCapturing || viewingSessionId !== null}
                        className={`p-2 transition-colors rounded-lg flex items-center justify-center disabled:opacity-50 ${isCapturing ? 'bg-accent/20 text-accent hover:bg-accent/30 animate-pulse' : 'text-text-muted hover:bg-card-border hover:text-text-primary'}`}
                        title="Capture screenshot"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Floating Slash Command Palette */}
            {input.startsWith('/') && (
              <div className="absolute bottom-full left-0 mb-2 w-full max-h-56 overflow-y-auto bg-panel border border-card-border rounded-xl shadow-2xl z-50 p-1.5 space-y-1 custom-scrollbar text-xs">
                <div className="text-[10px] font-bold text-text-muted px-2 py-1 uppercase tracking-wider">
                  RazorFlow Operational Commands
                </div>
                {[
                  { cmd: '/briefing', desc: 'Deliver prioritized daily business health briefing', query: 'Flow, tell me what needs my attention today.' },
                  { cmd: '/gateways', desc: 'Display live payment gateway telemetry and charts', query: 'Flow, show payment gateway telemetry chart.' },
                  { cmd: '/investigate', desc: 'Deep root-cause failure investigation with diagnostic match', query: 'Flow, investigate the payment drop.' },
                  { cmd: '/revenue', desc: 'Scan recoverable revenue & draft 1-click retry links', query: 'Where am I losing potential revenue?' },
                  { cmd: '/cascade', desc: 'Generate SRE failure cascade & CI/CD commit correlation diagram', query: 'Flow, why did payment failures increase after the latest deployment?' },
                  { cmd: '/ledger', desc: 'Query immutable Action Ledger audit trail playback', query: 'What did RazorFlow do?' },
                  { cmd: '/memory', desc: 'Consolidate operational incident into long-term memory', query: 'Flow, remember this incident in operational memory.' },
                ]
                  .filter(c => c.cmd.toLowerCase().includes(input.toLowerCase().trim()))
                  .map(c => (
                    <button
                      key={c.cmd}
                      type="button"
                      onClick={() => {
                        setInput('');
                        handleQuickPrompt(c.query);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-card-border/60 flex items-center justify-between transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#0C83FD] group-hover:text-white">{c.cmd}</span>
                        <span className="text-[11px] text-text-muted group-hover:text-text-primary">{c.desc}</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 group-hover:text-[#0C83FD] transition-all" />
                    </button>
                  ))}
              </div>
            )}

            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isTyping || viewingSessionId !== null}
              placeholder={viewingSessionId ? "History is read-only" : (isListening ? "🎤 Listening..." : "Type / for operational commands or ask Flow anything...")}
              className="flex-1 min-w-0 bg-card border border-card-border focus:border-accent focus:ring-accent rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 disabled:opacity-50 transition-colors placeholder-text-secondary"
            />
            <button 
              type="submit"
              disabled={isTyping || (!input.trim() && attachments.length === 0) || viewingSessionId !== null}
              className="shrink-0 border border-card-border bg-card-border hover:bg-accent hover:text-white hover:border-accent text-text-muted rounded-lg px-3 py-2 transition-colors flex items-center justify-center disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
