import React, { useState } from 'react';
import { 
  Network, 
  BarChart2
} from 'lucide-react';
import { FlowGraph } from '../../../../src/components/graph/FlowGraph';
import { FlowChart } from '../../../../src/components/charts/FlowChart';
import { ChartSpecEngine } from '../../../../src/agent/charts/chartSpecEngine';

export const FlowGraphView = () => {
  const [activeTab, setActiveTab] = useState('graph'); // 'graph' | 'charts'
  const [chartQuery, setChartQuery] = useState('payment success rate last 7 days');

  const chartSpec = ChartSpecEngine.generateSpec(chartQuery);

  return (
    <div className="flex-1 h-full w-full overflow-y-auto custom-scrollbar flex flex-col p-4 md:p-6 space-y-4 bg-bg text-text-primary">
      {/* Top Header Bar with Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0C83FD]/20 border border-[#0C83FD]/40 flex items-center justify-center text-[#0C83FD] shadow-md">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary tracking-tight">FlowGraph 2.0 Workspace</h1>
            <p className="text-xs text-text-muted">
              Spatial Relationship Intelligence & Epistemic Context DAGs
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-panel p-1 rounded-xl border border-card-border shadow-sm">
          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'graph' ? 'bg-[#0C83FD] text-white shadow-md' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Operational Graph</span>
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'charts' ? 'bg-[#0C83FD] text-white shadow-md' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Telemetry Charts</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      {activeTab === 'graph' ? (
        <div className="w-full flex-1 min-h-[660px] flex flex-col pb-4">
          <FlowGraph />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pb-6">
          {/* Natural Language Chart Selector */}
          <div className="p-4 rounded-2xl bg-panel border border-card-border space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Select Telemetry Chart Specification
              </span>
              <span className="text-[10px] font-mono text-text-muted">Deterministic Spec Generator</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Payment Success Rate (Last 7 Days)', q: 'payment success rate last 7 days' },
                { label: 'Failures by Gateway', q: 'failures by gateway' },
                { label: 'Latency Before vs After Deployment', q: 'HDFC latency before and after deployment' },
                { label: 'Gross Revenue vs Refunds', q: 'refund volume vs revenue' },
              ].map(item => (
                <button
                  key={item.q}
                  onClick={() => setChartQuery(item.q)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    chartQuery === item.q
                      ? 'bg-[#0C83FD]/20 text-[#0C83FD] border-[#0C83FD]/50 font-bold'
                      : 'bg-bg border-card-border text-text-muted hover:text-text-primary'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Render FlowChart Component */}
          <FlowChart spec={chartSpec} />
        </div>
      )}
    </div>
  );
};
