import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Network, 
  Layers, 
  Search, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  ArrowRight, 
  Compass, 
  X, 
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  Info,
  Maximize2,
  Minimize2,
  FileText,
  User,
  Zap,
  Activity
} from 'lucide-react';
import { 
  FlowGraphData, 
  GraphNode, 
  GraphEdge, 
  ImpactAnalysisResult, 
  EdgeEvidenceDetail,
  GraphMode,
  DemoPreset,
  TimelinePoint
} from '../../agent/graph/flowGraphModel';
import { flowGraphEngine } from '../../agent/graph/flowGraphEngine';
import { FlowGraph2D } from './FlowGraph2D';
import { FlowGraph3D } from './FlowGraph3D';

export interface FlowGraphProps {
  initialGraph?: FlowGraphData;
  isCompact?: boolean;
  onTriggerPrompt?: (prompt: string) => void;
}

export const FlowGraph: React.FC<FlowGraphProps> = ({
  initialGraph,
  isCompact = false,
  onTriggerPrompt
}) => {
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('3D');
  const [activeMode, setActiveMode] = useState<GraphMode>('CONTEXT');
  const [activePreset, setActivePreset] = useState<DemoPreset>('HDFC_ANOMALY');
  const [timelinePoint, setTimelinePoint] = useState<TimelinePoint>('15:00');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Selection & Inspector State
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [impactResult, setImpactResult] = useState<ImpactAnalysisResult | null>(null);
  const [edgeEvidence, setEdgeEvidence] = useState<EdgeEvidenceDetail | null>(null);
  const [copiedAction, setCopiedAction] = useState<string | null>(null);
  const [graphVersion, setGraphVersion] = useState(0);

  // Exit fullscreen on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Load Graph from Engine
  const baseGraph = useMemo(() => {
    if (initialGraph) return initialGraph;
    return flowGraphEngine.buildPresetGraph(activePreset);
  }, [activePreset, initialGraph, graphVersion]);

  // Filtered Graph by Search & Node Type
  const filteredGraph = useMemo(() => {
    let nodes = baseGraph.nodes;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      nodes = nodes.filter(n => 
        n.label.toLowerCase().includes(q) || 
        n.type.toLowerCase().includes(q) ||
        (n.metadata && JSON.stringify(n.metadata).toLowerCase().includes(q))
      );
    }
    if (selectedTypeFilter !== 'all') {
      nodes = nodes.filter(n => n.type === selectedTypeFilter);
    }
    const nodeIds = new Set(nodes.map(n => n.id));
    const edges = baseGraph.edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
    return { ...baseGraph, nodes, edges, mode: activeMode, timelinePoint };
  }, [baseGraph, searchQuery, selectedTypeFilter, activeMode, timelinePoint]);

  // Handle Preset Change
  const handleSelectPreset = (preset: DemoPreset) => {
    setActivePreset(preset);
    flowGraphEngine.buildPresetGraph(preset);
    setSelectedNode(null);
    setSelectedEdge(null);
    setImpactResult(null);
    setEdgeEvidence(null);
    setGraphVersion(v => v + 1);
  };

  // Handle Mode Change
  const handleSelectMode = (mode: GraphMode) => {
    setActiveMode(mode);
    flowGraphEngine.setMode(mode);
    if (mode === 'IMPACT' && !impactResult && baseGraph.nodes.length > 0) {
      handleCalculateImpact(baseGraph.nodes[0].id);
    }
  };

  // Handle Timeline Scrubber
  const handleSelectTimeline = (point: TimelinePoint) => {
    setTimelinePoint(point);
    flowGraphEngine.setTimelinePoint(point);
    setGraphVersion(v => v + 1);
  };

  // Handle Node Selection
  const handleSelectNode = (node: GraphNode | null) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    setEdgeEvidence(null);
    if (node && activeMode === 'IMPACT') {
      handleCalculateImpact(node.id);
    } else {
      setImpactResult(null);
    }
  };

  // Handle Edge Selection ("Why Connection?")
  const handleSelectEdge = (edge: GraphEdge | null) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setImpactResult(null);
    if (edge) {
      const detail = flowGraphEngine.getEdgeEvidence(edge.source, edge.target);
      setEdgeEvidence(detail);
    } else {
      setEdgeEvidence(null);
    }
  };

  // Trigger "Show Impact"
  const handleCalculateImpact = (nodeId: string) => {
    const result = flowGraphEngine.calculateImpact(nodeId);
    setImpactResult(result);
  };

  // Branch Expansion & Collapsing
  const handleExpandBranch = (nodeId: string) => {
    flowGraphEngine.expandNodeBranch(nodeId);
    setGraphVersion(v => v + 1);
  };

  const handleCollapseBranch = (nodeId: string) => {
    flowGraphEngine.collapseNodeBranch(nodeId);
    setGraphVersion(v => v + 1);
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAction(label);
    setTimeout(() => setCopiedAction(null), 2000);
  };

  const handleExportMermaid = () => {
    let mermaid = '```mermaid\ngraph TD\n';
    filteredGraph.nodes.forEach(n => {
      mermaid += `  ${n.id}["${n.label} (${n.status})"]\n`;
    });
    filteredGraph.edges.forEach(e => {
      const isCausal = e.relation === 'caused' || e.relation === 'deployed_by';
      const arrow = isCausal ? '-->' : '-.->';
      mermaid += `  ${e.source} ${arrow}|${e.label || e.relation}| ${e.target}\n`;
    });
    mermaid += '```';
    handleCopyText(mermaid, 'mermaid');
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(filteredGraph, null, 2);
    handleCopyText(jsonStr, 'json');
  };

  const impactNodeIds = useMemo(() => {
    if (!impactResult) return undefined;
    const ids = new Set<string>([impactResult.targetNodeId]);
    impactResult.directImpact.forEach(n => ids.add(n.id));
    impactResult.indirectImpact.forEach(n => ids.add(n.id));
    return ids;
  }, [impactResult]);

  return (
    <div className={`relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#070b14] transition-all duration-300 ${
      isFullscreen 
        ? 'fixed inset-0 z-50 p-6 bg-[#070b14]/98 backdrop-blur-2xl' 
        : isCompact ? 'my-2 text-xs rounded-2xl border border-card-border p-3' : 'rounded-2xl border border-card-border/80 shadow-2xl p-4'
    }`}>
      
      {/* ─── 1. TOP HERO TOOLBAR (~10-15% HEIGHT) ─────────────────────────── */}
      <div className="flex flex-col gap-3 pb-3 border-b border-card-border/60 z-20 shrink-0">
        
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Brand + Presets */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0C83FD]/20 to-purple-600/20 border border-[#0C83FD]/40 flex items-center justify-center text-[#0C83FD] shadow-lg">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white text-base tracking-tight">{filteredGraph.title}</h2>
                <span className="text-[10px] font-mono font-bold bg-[#0C83FD]/20 text-[#0C83FD] border border-[#0C83FD]/40 px-2 py-0.5 rounded-full">
                  FLOWGRAPH 2.0
                </span>
                {isFullscreen && (
                  <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full animate-pulse">
                    FOCUS MODE (ESC)
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{filteredGraph.description}</p>
            </div>
          </div>

          {/* Right: Mode Switcher & Export Controls */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* 2D / 3D Mode Toggle */}
            <div className="flex items-center bg-[#0e1626] p-1 rounded-xl border border-card-border shadow-inner">
              <button
                onClick={() => setViewMode('2D')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === '2D' 
                    ? 'bg-[#0C83FD] text-white shadow-md' 
                    : 'text-text-muted hover:text-white'
                }`}
              >
                2D Canvas
              </button>
              <button
                onClick={() => setViewMode('3D')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === '3D' 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-text-muted hover:text-white'
                }`}
              >
                3D Orbit
              </button>
            </div>

            {/* Reset Layout */}
            <button
              onClick={() => {
                flowGraphEngine.resetLayout();
                handleSelectNode(null);
                setGraphVersion(v => v + 1);
              }}
              title="Reset Layout Positions"
              className="p-2 rounded-xl bg-[#0e1626] border border-card-border text-text-muted hover:text-white hover:border-[#0C83FD]/50 transition-all cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              title="Copy Structured Graph JSON"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0e1626] border border-card-border text-xs font-bold text-text-muted hover:text-white hover:border-[#0C83FD]/50 transition-all cursor-pointer shadow-sm"
            >
              {copiedAction === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAction === 'json' ? 'Copied JSON!' : 'JSON'}</span>
            </button>

            {/* Export Mermaid */}
            <button
              onClick={handleExportMermaid}
              title="Copy Mermaid DAG"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0e1626] border border-card-border text-xs font-bold text-text-muted hover:text-white hover:border-purple-400/50 transition-all cursor-pointer shadow-sm"
            >
              {copiedAction === 'mermaid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAction === 'mermaid' ? 'Copied!' : 'Mermaid'}</span>
            </button>

            {/* Full Screen Toggle */}
            <button
              onClick={() => setIsFullscreen(f => !f)}
              title={isFullscreen ? 'Exit Focus Mode (ESC)' : 'Enter Focus Mode'}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0e1626] border border-card-border text-xs font-bold text-[#0C83FD] hover:text-white hover:bg-[#0C83FD] transition-all cursor-pointer shadow-sm"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isFullscreen ? 'Exit Focus' : 'Focus Mode'}</span>
            </button>
          </div>
        </div>

        {/* Sub-Bar: Operational Modes + Presets + Timeline + Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Operational Mode Selector */}
          <div className="flex items-center bg-[#0e1626] p-1 rounded-xl border border-card-border">
            {(['CONTEXT', 'INVESTIGATION', 'IMPACT', 'TIMELINE', 'CUSTOMER'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => handleSelectMode(mode)}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeMode === mode
                    ? 'bg-[#0C83FD] text-white shadow-sm'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Scenario Presets Selector */}
          <div className="flex items-center gap-1.5 bg-[#0e1626] px-2 py-1 rounded-xl border border-card-border">
            <span className="text-[11px] text-text-muted font-bold mr-1">Presets:</span>
            {[
              { id: 'HDFC_ANOMALY', label: '🚨 HDFC Anomaly' },
              { id: 'SMART_ROUTING', label: '🔀 Smart Routing' },
              { id: 'FULL_CONTEXT', label: '🌐 Full Context' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id as DemoPreset)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  activePreset === p.id 
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50' 
                    : 'text-text-muted hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Timeline Scrubber */}
          <div className="flex items-center gap-1 bg-[#0e1626] px-2 py-1 rounded-xl border border-card-border">
            <Clock className="w-3.5 h-3.5 text-amber-400 mr-1" />
            <span className="text-[11px] text-text-muted font-bold mr-1">Time:</span>
            {(['09:00', '11:00', '13:00', '14:32', '15:00', '17:00'] as const).map(pt => (
              <button
                key={pt}
                onClick={() => handleSelectTimeline(pt)}
                className={`px-2 py-0.5 rounded-lg font-mono font-bold text-[10px] transition-all cursor-pointer ${
                  timelinePoint === pt
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                {pt}
              </button>
            ))}
          </div>

          {/* Search & Multi-Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search entities or metrics..."
                className="bg-[#0e1626] border border-card-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-[#0C83FD] w-44 md:w-52"
              />
            </div>

            <select
              value={selectedTypeFilter}
              onChange={e => setSelectedTypeFilter(e.target.value)}
              className="bg-[#0e1626] border border-card-border rounded-xl px-3 py-1.5 text-xs text-text-muted focus:outline-none focus:border-[#0C83FD] cursor-pointer"
            >
              <option value="all">All Entities ({baseGraph.nodes.length})</option>
              <option value="gateway">Gateways</option>
              <option value="deployment">Deployments</option>
              <option value="service">Services</option>
              <option value="metric">Metrics</option>
              <option value="incident">Incidents</option>
              <option value="action">Actions</option>
              <option value="customer">Customers</option>
              <option value="payment">Payments</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN GRAPH WORKSPACE (~80-85% HEIGHT) ─────────────────────── */}
      <div className="relative w-full flex-1 min-h-[600px] overflow-hidden rounded-2xl mt-3">
        {viewMode === '3D' ? (
          <FlowGraph3D
            graph={filteredGraph}
            selectedNodeId={selectedNode?.id || null}
            selectedEdge={selectedEdge ? { source: selectedEdge.source, target: selectedEdge.target } : null}
            impactNodeIds={impactNodeIds}
            onSelectNode={handleSelectNode}
            onSelectEdge={handleSelectEdge}
            onExpandBranch={handleExpandBranch}
            onCollapseBranch={handleCollapseBranch}
            onTriggerImpact={handleCalculateImpact}
            onNodeDragEnd={(id, x, y, z) => flowGraphEngine.updateNodePosition(id, x, y, z)}
            onFallbackTo2D={() => setViewMode('2D')}
          />
        ) : (
          <FlowGraph2D
            graph={filteredGraph}
            selectedNodeId={selectedNode?.id || null}
            selectedEdge={selectedEdge ? { source: selectedEdge.source, target: selectedEdge.target } : null}
            impactNodeIds={impactNodeIds}
            onSelectNode={handleSelectNode}
            onSelectEdge={handleSelectEdge}
            onExpandBranch={handleExpandBranch}
            onCollapseBranch={handleCollapseBranch}
            onTriggerImpact={handleCalculateImpact}
            onNodeDragEnd={(id, x, y) => flowGraphEngine.updateNodePosition(id, x, y)}
          />
        )}

        {/* ─── 3. FLOATING GLASS CONTEXTUAL DRAWER OVERLAY (~15% OVERLAY) ───── */}
        {(selectedNode || selectedEdge || impactResult || edgeEvidence) && (
          <div className="absolute top-4 right-4 bottom-4 w-88 md:w-96 bg-[#0c1424]/95 backdrop-blur-xl border border-card-border/90 shadow-2xl rounded-2xl p-5 overflow-y-auto custom-scrollbar z-30 flex flex-col space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-card-border/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0C83FD] animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {impactResult ? 'Impact Analysis' : edgeEvidence ? 'Relationship Evidence' : 'Entity Inspector'}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedNode(null);
                  setSelectedEdge(null);
                  setImpactResult(null);
                  setEdgeEvidence(null);
                }}
                className="p-1 rounded-lg text-text-muted hover:text-white hover:bg-card-border/50 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* A. IMPACT ANALYSIS VIEW */}
            {impactResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-300">Downstream Impact Detected</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 border border-rose-500/40">
                      CRITICAL
                    </span>
                  </div>
                  <p className="text-xs text-rose-100/90 font-medium">
                    Root entity: <strong>{impactResult.targetLabel}</strong>
                  </p>
                </div>

                {/* Key Impact Telemetry Metrics */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-[#070b14] border border-card-border">
                    <span className="text-[10px] text-text-muted uppercase font-bold block">At-Risk Revenue</span>
                    <span className="text-base font-bold text-white font-mono mt-0.5 block">
                      ₹{(impactResult.atRiskRevenueINR / 100000).toFixed(2)} Lakhs
                    </span>
                    <span className="text-[9px] text-amber-400 font-mono">[TEST FIXTURE]</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#070b14] border border-card-border">
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Dropped Checkouts</span>
                    <span className="text-base font-bold text-rose-400 font-mono mt-0.5 block">
                      {impactResult.affectedCustomersCount} Customers
                    </span>
                    <span className="text-[9px] text-text-muted">Confidence: {(impactResult.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>

                {/* Affected Services & Payment Rails */}
                <div className="space-y-2">
                  <span className="font-bold text-text-primary text-[11px] uppercase tracking-wider block">Affected Payment Rails:</span>
                  <div className="space-y-1.5">
                    {impactResult.affectedGateways.map((gw, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-[#070b14] border border-card-border text-text-muted flex items-center justify-between text-xs">
                        <span>{gw}</span>
                        <span className="text-[10px] font-mono text-rose-400 font-bold">DEGRADED</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evidence Summary Bulletins */}
                <div className="space-y-2">
                  <span className="font-bold text-text-primary text-[11px] uppercase tracking-wider block">Evidence Trace:</span>
                  <div className="space-y-1.5">
                    {impactResult.evidenceSummary.map((ev, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-[#070b14] border border-card-border text-text-muted text-[11px] leading-relaxed">
                        • {ev}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 1-Click Action Recommendation */}
                <button
                  onClick={() => {
                    if (onTriggerPrompt) {
                      onTriggerPrompt('Flow, execute the recommended safe rollback action for HDFC Netbanking.');
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Execute Recommended Hotfix Rollback</span>
                </button>
              </div>
            ) : edgeEvidence ? (
              /* B. "WHY CONNECTION?" EDGE EVIDENCE VIEW */
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300">Relationship Diagnostics</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/40">
                      {edgeEvidence.epistemicStatus}
                    </span>
                  </div>
                  <p className="text-xs text-white font-semibold">
                    {edgeEvidence.sourceNode.label} <ArrowRight className="w-3 h-3 inline mx-1 text-purple-400" /> {edgeEvidence.targetNode.label}
                  </p>
                </div>

                {/* Evidence Metrics */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-[#070b14] border border-card-border">
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Relationship Type</span>
                    <span className="text-xs font-bold text-white font-mono mt-0.5 block">{edgeEvidence.relationshipName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#070b14] border border-card-border">
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Link Confidence</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5 block">{edgeEvidence.confidencePercent}%</span>
                  </div>
                </div>

                {/* Evidence Bulletins */}
                <div className="space-y-2">
                  <span className="font-bold text-text-primary text-[11px] uppercase tracking-wider block">Observed Evidence Items:</span>
                  <div className="space-y-1.5">
                    {edgeEvidence.evidenceItems.map((item, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-[#070b14] border border-card-border text-text-muted text-[11px] leading-relaxed">
                        • {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Epistemic Non-Causality Disclaimer */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Epistemic Guarantee:</strong> Statistical correlation does strictly NOT establish causation until confirmed via post-action state verification.
                  </span>
                </div>
              </div>
            ) : selectedNode ? (
              /* C. NODE INSPECTOR VIEW */
              <div className="space-y-4 text-xs">
                {/* Node Title Header */}
                <div className="p-3.5 rounded-xl bg-[#070b14] border border-card-border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#0C83FD] uppercase tracking-wider">
                      {selectedNode.type}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      selectedNode.risk === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {selectedNode.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{selectedNode.label}</h3>
                  <p className="text-[11px] text-text-muted font-mono">ID: {selectedNode.id}</p>
                </div>

                {/* Node Metadata Key-Value List */}
                {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
                  <div className="space-y-2">
                    <span className="font-bold text-text-primary text-[11px] uppercase tracking-wider block">Telemetry Metadata:</span>
                    <div className="space-y-1.5">
                      {Object.entries(selectedNode.metadata).map(([key, val]) => (
                        <div key={key} className="p-2 rounded-lg bg-[#070b14] border border-card-border text-xs flex items-center justify-between">
                          <span className="text-text-muted capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="text-white font-mono font-semibold truncate max-w-[160px]">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Branch Operations */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleExpandBranch(selectedNode.id)}
                    className="py-2 px-3 rounded-xl bg-[#070b14] border border-card-border text-text-muted hover:text-white hover:border-[#0C83FD] font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Expand Branch</span>
                  </button>
                  <button
                    onClick={() => handleCollapseBranch(selectedNode.id)}
                    className="py-2 px-3 rounded-xl bg-[#070b14] border border-card-border text-text-muted hover:text-white hover:border-rose-500 font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Collapse Branch</span>
                  </button>
                </div>

                {/* Action: Show Impact */}
                <button
                  onClick={() => handleCalculateImpact(selectedNode.id)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Show Impact (Upstream & Downstream)</span>
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
