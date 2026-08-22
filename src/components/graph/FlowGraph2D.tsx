import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FlowGraphData, 
  GraphNode, 
  GraphEdge 
} from '../../agent/graph/flowGraphModel';
import { 
  GitCommit, 
  Server, 
  CreditCard, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  User, 
  TrendingDown, 
  Maximize2, 
  Minus, 
  Plus, 
  RotateCcw,
  Zap,
  Pin,
  Maximize,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export interface FlowGraph2DProps {
  graph: FlowGraphData;
  selectedNodeId: string | null;
  selectedEdge: { source: string; target: string } | null;
  impactNodeIds?: Set<string>;
  onSelectNode: (node: GraphNode | null) => void;
  onSelectEdge: (edge: GraphEdge | null) => void;
  onExpandBranch?: (nodeId: string) => void;
  onCollapseBranch?: (nodeId: string) => void;
  onTriggerImpact?: (nodeId: string) => void;
  onNodeDragEnd?: (nodeId: string, x: number, y: number) => void;
}

export const FlowGraph2D: React.FC<FlowGraph2DProps> = ({
  graph,
  selectedNodeId,
  selectedEdge,
  impactNodeIds,
  onSelectNode,
  onSelectEdge,
  onExpandBranch,
  onCollapseBranch,
  onTriggerImpact,
  onNodeDragEnd
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Dragging individual node state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  // Initialize node positions
  useEffect(() => {
    const posMap = new Map<string, { x: number; y: number }>();
    graph.nodes.forEach((n, idx) => {
      posMap.set(n.id, {
        x: n.x !== undefined ? n.x : (idx % 5 - 2) * 250,
        y: n.y !== undefined ? n.y : Math.floor(idx / 5 - 1) * 150
      });
    });
    setNodePositions(posMap);
  }, [graph]);

  const centerOffset = {
    x: (containerRef.current?.clientWidth || 900) / 2,
    y: (containerRef.current?.clientHeight || 640) / 2
  };

  const handleFitView = useCallback(() => {
    if (!containerRef.current || graph.nodes.length === 0) return;
    const w = containerRef.current.clientWidth || 900;
    const h = containerRef.current.clientHeight || 640;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    graph.nodes.forEach(n => {
      const pos = nodePositions.get(n.id) || { x: n.x || 0, y: n.y || 0 };
      minX = Math.min(minX, pos.x - 120);
      maxX = Math.max(maxX, pos.x + 120);
      minY = Math.min(minY, pos.y - 50);
      maxY = Math.max(maxY, pos.y + 50);
    });

    const graphWidth = maxX - minX || 900;
    const graphHeight = maxY - minY || 500;

    const scaleX = (w - 120) / graphWidth;
    const scaleY = (h - 120) / graphHeight;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.55), 1.05);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setZoom(newZoom);
    setPan({ x: -centerX * newZoom, y: -centerY * newZoom });
  }, [graph.nodes, nodePositions]);

  // Pan & Zoom handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom(prev => Math.min(Math.max(prev * zoomDelta, 0.4), 2.2));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'bg-grid-rect') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    } else if (draggingNodeId) {
      const currentPos = nodePositions.get(draggingNodeId);
      if (currentPos) {
        const newX = (e.clientX - centerOffset.x - pan.x) / zoom;
        const newY = (e.clientY - centerOffset.y - pan.y) / zoom;
        setNodePositions(prev => new Map(prev).set(draggingNodeId, { x: newX, y: newY }));
      }
    }
  };

  const handleMouseUp = () => {
    if (isPanning) setIsPanning(false);
    if (draggingNodeId) {
      const pos = nodePositions.get(draggingNodeId);
      if (pos && onNodeDragEnd) {
        onNodeDragEnd(draggingNodeId, pos.x, pos.y);
      }
      setDraggingNodeId(null);
    }
  };

  // Node Color Theme based on Status and Risk
  const getNodeStyles = (node: GraphNode) => {
    if (node.risk === 'CRITICAL' || (node.status === 'OBSERVED' && node.changed)) {
      return {
        bg: 'bg-[#1a0f1d]/95',
        border: 'border-rose-500/80',
        glow: 'shadow-[0_0_20px_rgba(244,63,94,0.35)]',
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        text: 'text-rose-200'
      };
    }
    if (node.risk === 'HIGH') {
      return {
        bg: 'bg-[#1c140d]/95',
        border: 'border-amber-500/80',
        glow: 'shadow-[0_0_16px_rgba(245,158,11,0.3)]',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        text: 'text-amber-200'
      };
    }
    if (node.type === 'action') {
      return {
        bg: 'bg-[#0d1c16]/95',
        border: 'border-emerald-500/80',
        glow: 'shadow-[0_0_16px_rgba(16,185,129,0.3)]',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        text: 'text-emerald-200'
      };
    }
    if (node.type === 'hypothesis') {
      return {
        bg: 'bg-[#181126]/95',
        border: 'border-purple-500/80',
        glow: 'shadow-[0_0_16px_rgba(168,85,247,0.3)]',
        badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        text: 'text-purple-200'
      };
    }
    return {
      bg: 'bg-[#0e1626]/95',
      border: 'border-card-border/90',
      glow: 'shadow-lg',
      badgeBg: 'bg-[#0C83FD]/20 text-[#0C83FD] border-[#0C83FD]/40',
      text: 'text-white'
    };
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'deployment': return <GitCommit className="w-3.5 h-3.5" />;
      case 'service': return <Server className="w-3.5 h-3.5" />;
      case 'gateway': return <CreditCard className="w-3.5 h-3.5" />;
      case 'metric': return <TrendingDown className="w-3.5 h-3.5" />;
      case 'hypothesis': return <Sparkles className="w-3.5 h-3.5" />;
      case 'action': return <Zap className="w-3.5 h-3.5 text-emerald-400" />;
      case 'customer': return <User className="w-3.5 h-3.5" />;
      case 'incident': return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      default: return <ShieldCheck className="w-3.5 h-3.5" />;
    }
  };

  const getPrimaryMetric = (node: GraphNode): string => {
    if (node.metadata.successRate) return `SR: ${node.metadata.successRate}`;
    if (node.metadata.currentValue) return `Delta: ${node.metadata.delta || node.metadata.currentValue}`;
    if (node.metadata.version) return node.metadata.version;
    if (node.metadata.currentLatency) return `P95: ${node.metadata.currentLatency}`;
    if (node.metadata.droppedCheckout) return node.metadata.droppedCheckout;
    if (node.metadata.matchScore) return node.metadata.matchScore;
    if (node.metadata.actionType) return node.metadata.actionType;
    return node.type.toUpperCase();
  };

  const CARD_W = 215;
  const CARD_H = 76;

  return (
    <div 
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-full h-full min-h-[620px] rounded-2xl overflow-hidden border border-card-border/80 bg-[#070b14] select-none cursor-grab active:cursor-grabbing shadow-2xl"
    >
      {/* Floating Canvas Controls */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 bg-[#0e1626]/90 backdrop-blur-md p-1 rounded-xl border border-card-border shadow-xl">
        <button
          onClick={() => setZoom(z => Math.min(z * 1.15, 2.2))}
          title="Zoom In"
          className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-card-border/60 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z * 0.85, 0.4))}
          title="Zoom Out"
          className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-card-border/60 transition-all cursor-pointer"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleFitView}
          title="Auto-Fit Canvas (F)"
          className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-card-border/60 transition-all cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(0.85);
            setPan({ x: 0, y: 0 });
          }}
          title="Reset Zoom & Pan"
          className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-card-border/60 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* SVG Canvas for Edges & Background Grid */}
      <svg className="w-full h-full absolute inset-0">
        <defs>
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
          </pattern>
          <marker id="arrow-blue" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#0C83FD" />
          </marker>
          <marker id="arrow-rose" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
          </marker>
          <marker id="arrow-purple" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#a855f7" />
          </marker>
        </defs>

        <rect id="bg-grid-rect" width="100%" height="100%" fill="url(#grid-pattern)" />

        <g transform={`translate(${centerOffset.x + pan.x}, ${centerOffset.y + pan.y}) scale(${zoom})`}>
          {/* Edges */}
          {graph.edges.map((edge, idx) => {
            const p1 = nodePositions.get(edge.source);
            const p2 = nodePositions.get(edge.target);
            if (!p1 || !p2) return null;

            const isSelected = selectedEdge && 
              ((selectedEdge.source === edge.source && selectedEdge.target === edge.target) ||
               (selectedEdge.source === edge.target && selectedEdge.target === edge.source));
            
            const isCausal = edge.relation === 'caused' || edge.relation === 'deployed_by';
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const cx = (p1.x + p2.x) / 2;
            const cy = (p1.y + p2.y) / 2 - (Math.abs(dx) > 100 ? 30 : 0);

            const pathD = `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`;
            const strokeColor = isSelected ? '#38bdf8' : (isCausal ? '#f43f5e' : (edge.status === 'CORRELATED' ? '#a855f7' : '#334155'));
            const markerId = isCausal ? 'url(#arrow-rose)' : (edge.status === 'CORRELATED' ? 'url(#arrow-purple)' : 'url(#arrow-blue)');

            return (
              <g 
                key={edge.id || `edge_${idx}`} 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEdge(edge);
                }}
                className="cursor-pointer group"
              >
                {/* Glow hit area */}
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke="transparent" 
                  strokeWidth="16" 
                />
                {/* Visible Path */}
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke={strokeColor} 
                  strokeWidth={isSelected ? 3 : 1.75} 
                  strokeDasharray={edge.status === 'CORRELATED' || edge.status === 'INFERRED' ? '5,5' : 'none'}
                  markerEnd={markerId}
                  className="transition-all duration-200 group-hover:stroke-[#38bdf8]"
                />
                {/* Center Relation Badge */}
                {edge.label && (
                  <foreignObject x={cx - 50} y={cy - 12} width="100" height="24">
                    <div className="flex items-center justify-center">
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-md border ${
                        isSelected 
                          ? 'bg-[#38bdf8]/20 text-[#38bdf8] border-[#38bdf8]/50' 
                          : 'bg-[#070b14]/90 text-text-muted border-card-border/60 group-hover:text-white'
                      }`}>
                        {edge.label}
                      </span>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* 2D Interactive HTML Nodes Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${centerOffset.x + pan.x}px, ${centerOffset.y + pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {graph.nodes.map(node => {
          const pos = nodePositions.get(node.id) || { x: 0, y: 0 };
          const isSelected = node.id === selectedNodeId;
          const isImpacted = impactNodeIds?.has(node.id);
          const styles = getNodeStyles(node);

          return (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: `${pos.x - CARD_W / 2}px`,
                top: `${pos.y - CARD_H / 2}px`,
                width: `${CARD_W}px`,
                height: `${CARD_H}px`
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setDraggingNodeId(node.id);
                onSelectNode(node);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (onExpandBranch) onExpandBranch(node.id);
              }}
              className={`pointer-events-auto rounded-2xl border ${styles.border} ${styles.bg} ${styles.glow} p-3 flex flex-col justify-between cursor-pointer transition-all select-none ${
                isSelected 
                  ? 'ring-2 ring-[#38bdf8] ring-offset-2 ring-offset-[#070b14] scale-105 z-30' 
                  : isImpacted ? 'ring-2 ring-rose-500/80 scale-102 z-20' : 'hover:border-[#38bdf8]/60 hover:scale-102 z-10'
              }`}
            >
              {/* Top Row: Icon + Label + Changed Tag */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className={`p-1 rounded-lg border ${styles.badgeBg}`}>
                    {getNodeIcon(node.type)}
                  </div>
                  <span className="text-xs font-bold text-white tracking-tight truncate" title={node.label}>
                    {node.label}
                  </span>
                </div>
                {node.changed && (
                  <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0 animate-pulse">
                    CHANGED
                  </span>
                )}
                {node.pinned && (
                  <span title="Pinned layout position" className="shrink-0 flex items-center">
                    <Pin className="w-2.5 h-2.5 text-[#0C83FD]" />
                  </span>
                )}
              </div>

              {/* Bottom Row: Status Badge + Primary Metric */}
              <div className="flex items-center justify-between text-[10px] font-medium pt-1 border-t border-card-border/40">
                <span className={`px-1.5 py-0.2 rounded font-mono font-semibold ${styles.badgeBg}`}>
                  {node.status}
                </span>
                <span className="font-mono text-text-muted truncate max-w-[110px]" title={getPrimaryMetric(node)}>
                  {getPrimaryMetric(node)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
