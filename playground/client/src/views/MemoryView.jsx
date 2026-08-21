import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Sparkles, 
  Clock, 
  Tag, 
  Search, 
  Plus, 
  CheckCircle2 
} from 'lucide-react';

export const MemoryView = () => {
  const [memories, setMemories] = useState([
    {
      id: 'mem_01',
      category: 'operational',
      topic: 'HDFC Netbanking Timeout Rule',
      content: 'HDFC Netbanking gateway requires a 45-second timeout window during peak morning hours (9 AM - 2 PM IST) to prevent false client-side failure cutoffs.',
      importance: 5,
      timestamp: Date.now() - 3600 * 1000,
      tags: ['hdfc', 'netbanking', 'timeouts', 'gateway'],
    },
    {
      id: 'mem_02',
      category: 'operational',
      topic: 'UPI 1-Click Recovery Link SLA',
      content: 'Soft decline UPI failures (PIN timeouts, temporary bank limits) have an average recovery rate of 78.5% when contacted via WhatsApp within 15 minutes.',
      importance: 4,
      timestamp: Date.now() - 86400 * 1000,
      tags: ['upi', 'recovery', 'whatsapp'],
    },
    {
      id: 'mem_03',
      category: 'workspace',
      topic: 'Merchant Success Rate SLA',
      content: 'Target payment success rate is 95.0% for domestic UPI and Card transactions. Any drop below 90% triggers automated Sev-2 anomaly investigation.',
      importance: 5,
      timestamp: Date.now() - 86400 * 3 * 1000,
      tags: ['sla', 'target', 'business'],
    },
    {
      id: 'mem_04',
      category: 'long_term',
      topic: 'Post-Mortem: Incident INC-RZP-782',
      content: 'Aggressive client-side connection dropping caused 22% failure spikes during gateway retry waves. Keep retry backoff exponential with jitter.',
      importance: 4,
      timestamp: Date.now() - 86400 * 14 * 1000,
      tags: ['postmortem', 'incident', 'resilience'],
    }
  ]);

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMemories = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/flow/memory');
      if (res.ok) {
        const data = await res.json();
        if (data.items?.length > 0) setMemories(data.items);
      }
    } catch {}
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const filtered = memories.filter(m => {
    const matchesCategory = activeCategory === 'all' || m.category === activeCategory;
    const matchesQuery = m.topic.toLowerCase().includes(searchQuery.toLowerCase()) || m.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 max-w-6xl mx-auto custom-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
              PERSISTENT MEMORY ARCHITECTURE
            </span>
            <span className="text-xs font-mono text-text-muted">{memories.length} Consolidated Memories</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            "Remember This Incident"
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Retains operational heuristics, merchant preferences, and post-mortem resolutions across sessions.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search operational memory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-panel border border-card-border rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'operational', 'workspace', 'long_term', 'working'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all capitalize ${
              activeCategory === cat
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-panel border border-card-border text-text-muted hover:text-white'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Memories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((m) => (
          <div key={m.id} className="p-5 rounded-2xl bg-panel border border-card-border hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-4 shadow-md">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {m.category.replace('_', ' ')}
                </span>
                <span className="text-xs font-mono text-text-muted">
                  Importance: {m.importance}/5
                </span>
              </div>

              <h3 className="text-sm font-bold text-white">{m.topic}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{m.content}</p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-card-border/50">
              {m.tags?.map((t, idx) => (
                <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg text-text-muted border border-card-border">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
