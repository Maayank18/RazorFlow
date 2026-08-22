import React, { useState } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Download, 
  Copy, 
  Check, 
  Layers, 
  Share2, 
  Info,
  Maximize2
} from 'lucide-react';
import { FlowChartSpec, ChartSpecEngine } from '../../agent/charts/chartSpecEngine';

export interface FlowChartProps {
  spec: FlowChartSpec;
  isCompact?: boolean;
  onExpand?: () => void;
}

export const FlowChart: React.FC<FlowChartProps> = ({
  spec,
  isCompact = false,
  onExpand
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadSVG = () => {
    const svgEl = document.getElementById(`chart-svg-${spec.id}`);
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${spec.id}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Compute Scales
  const width = isCompact ? 340 : 640;
  const height = isCompact ? 160 : 280;
  const padding = { top: 20, right: 30, bottom: 40, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Extract numerical values for min/max
  const allValues: number[] = [];
  spec.data.forEach(d => {
    spec.series.forEach(s => {
      if (typeof d[s.key] === 'number') allValues.push(d[s.key]);
    });
  });

  const minY = spec.yAxis.min !== undefined ? spec.yAxis.min : Math.min(0, ...allValues);
  const maxY = spec.yAxis.max !== undefined ? spec.yAxis.max : Math.max(...allValues, 10);
  const yRange = maxY - minY || 1;

  const getY = (val: number) => padding.top + chartH - ((val - minY) / yRange) * chartH;
  const getX = (idx: number) => padding.left + (idx / Math.max(spec.data.length - 1, 1)) * chartW;
  const getBarX = (idx: number) => padding.left + (idx / spec.data.length) * chartW + (chartW / spec.data.length) * 0.15;
  const barWidth = (chartW / spec.data.length) * 0.7;

  return (
    <div className={`p-4 rounded-2xl bg-panel border border-card-border space-y-3 ${isCompact ? 'my-2 text-xs' : 'shadow-xl'}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#0C83FD]" />
            <h4 className="font-bold text-white text-[13px] tracking-tight">{spec.title}</h4>
            {spec.isDemoData && (
              <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.2 rounded">
                TEST FIXTURE
              </span>
            )}
          </div>
          <p className="text-[11px] text-text-muted mt-0.5">{spec.subtitle}</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleCopyText(ChartSpecEngine.toInsightSummary(spec), 'insight')}
            title="Copy Insight (Slack / Docs ready)"
            className="p-1.5 rounded-lg bg-bg border border-card-border text-text-muted hover:text-white hover:border-[#0C83FD]/50 transition-all cursor-pointer"
          >
            {copied === 'insight' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => handleCopyText(ChartSpecEngine.toCSV(spec), 'csv')}
            title="Copy CSV"
            className="p-1.5 rounded-lg bg-bg border border-card-border text-text-muted hover:text-white hover:border-[#0C83FD]/50 transition-all cursor-pointer"
          >
            {copied === 'csv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDownloadSVG}
            title="Download SVG"
            className="p-1.5 rounded-lg bg-bg border border-card-border text-text-muted hover:text-white hover:border-[#0C83FD]/50 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          {onExpand && (
            <button
              onClick={onExpand}
              title="Expand Chart"
              className="p-1.5 rounded-lg bg-bg border border-card-border text-text-muted hover:text-white hover:border-[#0C83FD]/50 transition-all cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* SVG Deterministic Chart */}
      <div className="relative overflow-hidden flex justify-center bg-bg/60 p-2 rounded-xl border border-card-border/50">
        <svg
          id={`chart-svg-${spec.id}`}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ maxHeight: height }}
        >
          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const val = minY + ratio * yRange;
            const y = getY(val);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="2 2"
                  strokeWidth="0.8"
                  opacity="0.4"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  fill="#94a3b8"
                  fontSize="9"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {Math.round(val)}{spec.yAxis.unit || ''}
                </text>
              </g>
            );
          })}

          {/* Bar Chart Type */}
          {spec.type === 'bar' && spec.data.map((d, idx) => {
            const val = d[spec.series[0].key] || 0;
            const x = getBarX(idx);
            const y = getY(val);
            const barH = padding.top + chartH - y;
            const isHovered = hoveredIdx === idx;
            return (
              <g 
                key={idx} 
                onMouseEnter={() => setHoveredIdx(idx)} 
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-all"
              >
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barH, 2)}
                  rx="4"
                  fill={d.color || spec.series[0].color}
                  opacity={isHovered ? 1 : 0.85}
                />
                <text
                  x={x + barWidth / 2}
                  y={height - 12}
                  fill={isHovered ? '#ffffff' : '#94a3b8'}
                  fontSize="9"
                  textAnchor="middle"
                  fontWeight={isHovered ? '700' : '500'}
                >
                  {String(d[spec.xAxis.key]).slice(0, 10)}
                </text>
              </g>
            );
          })}

          {/* Line / Comparison / Area Chart Type */}
          {(spec.type === 'line' || spec.type === 'comparison' || spec.type === 'area') && spec.series.map((s) => {
            const points = spec.data.map((d, idx) => ({
              x: getX(idx),
              y: getY(d[s.key] || 0),
              val: d[s.key]
            }));

            const pathD = points.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

            return (
              <g key={s.key}>
                {/* Area fill */}
                {s.type === 'area' && (
                  <path
                    d={`${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`}
                    fill={s.color}
                    fillOpacity="0.15"
                  />
                )}
                {/* Stroke line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.5"
                  strokeDasharray={s.dashArray}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Data Points */}
                {points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r={hoveredIdx === idx ? 5 : 3.5}
                    fill={s.color}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                ))}
              </g>
            );
          })}

          {/* X Axis Labels for Lines */}
          {spec.type !== 'bar' && spec.data.map((d, idx) => (
            <text
              key={idx}
              x={getX(idx)}
              y={height - 12}
              fill={hoveredIdx === idx ? '#ffffff' : '#94a3b8'}
              fontSize="9"
              textAnchor="middle"
              fontWeight={hoveredIdx === idx ? '700' : '500'}
            >
              {String(d[spec.xAxis.key]).slice(0, 8)}
            </text>
          ))}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIdx !== null && (
          <div className="absolute top-3 right-3 bg-panel/95 backdrop-blur-md border border-[#0C83FD]/50 p-2 rounded-xl text-[10px] shadow-2xl pointer-events-none">
            <div className="font-bold text-white mb-1">
              {String(spec.data[hoveredIdx][spec.xAxis.key])}
            </div>
            {spec.series.map(s => (
              <div key={s.key} className="flex items-center justify-between gap-3 font-mono">
                <span className="text-text-muted">{s.name}:</span>
                <span className="font-bold text-text-primary">
                  {spec.data[hoveredIdx][s.key]}{spec.yAxis.unit || ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Series Legend */}
      <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px]">
        {spec.series.map(s => (
          <div key={s.key} className="flex items-center gap-1.5 font-medium text-text-secondary">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span>{s.name}</span>
          </div>
        ))}
      </div>

      {/* Key Insights */}
      {spec.insights && spec.insights.length > 0 && (
        <div className="p-2.5 rounded-xl bg-bg/80 border border-card-border space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0C83FD] uppercase tracking-wider">
            <Info className="w-3 h-3" />
            <span>Verified Operational Insights</span>
          </div>
          {spec.insights.map((insight, idx) => (
            <p key={idx} className="text-[11px] text-text-secondary leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-text-muted">
              {insight}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
