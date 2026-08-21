/**
 * RazorFlow Multi-Tier Memory Architecture
 * 
 * Manages:
 * - Working Memory (instant task scratchpad)
 * - Session Memory (ephemeral multi-turn context)
 * - Operational Memory (domain heuristics, incident patterns, gateway behaviors)
 * - Workspace Memory (merchant preferences, business SLAs)
 * - Long-Term Memory (consolidated knowledge across days/weeks)
 */

export interface MemoryItem {
  id: string;
  category: 'working' | 'session' | 'operational' | 'workspace' | 'long_term';
  topic: string;
  content: string;
  importance: number; // 1 to 5
  timestamp: number;
  tags: string[];
}

export class MemoryArchitecture {
  private memories: Map<string, MemoryItem> = new Map();

  constructor() {
    this.seedDefaults();
  }

  public record(item: Omit<MemoryItem, 'id' | 'timestamp'>): MemoryItem {
    const id = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const fullItem: MemoryItem = {
      ...item,
      id,
      timestamp: Date.now(),
    };
    this.memories.set(id, fullItem);
    return fullItem;
  }

  public query(category?: MemoryItem['category'], queryText?: string): MemoryItem[] {
    let list = Array.from(this.memories.values());
    if (category) {
      list = list.filter(m => m.category === category);
    }
    if (queryText) {
      const lower = queryText.toLowerCase();
      list = list.filter(m => m.topic.toLowerCase().includes(lower) || m.content.toLowerCase().includes(lower));
    }
    return list.sort((a, b) => b.importance - a.importance || b.timestamp - a.timestamp);
  }

  public getConsolidatedContext(): string[] {
    return Array.from(this.memories.values())
      .filter(m => m.importance >= 3)
      .slice(0, 8)
      .map(m => `[${m.category.toUpperCase()}] ${m.topic}: ${m.content}`);
  }

  private seedDefaults() {
    this.record({
      category: 'operational',
      topic: 'HDFC Netbanking Timeout Rule',
      content: 'HDFC Netbanking gateway requires a 45-second timeout window during peak morning hours (9 AM - 2 PM IST) to prevent false failures.',
      importance: 5,
      tags: ['hdfc', 'netbanking', 'timeouts', 'gateway'],
    });

    this.record({
      category: 'operational',
      topic: 'UPI 1-Click Recovery Link SLA',
      content: 'Soft decline UPI failures (PIN timeouts, temporary bank limits) have an average recovery rate of 78.5% when contacted via WhatsApp within 15 minutes.',
      importance: 4,
      tags: ['upi', 'recovery', 'whatsapp'],
    });

    this.record({
      category: 'workspace',
      topic: 'Merchant Success Rate SLA',
      content: 'Target payment success rate is 95.0% for domestic UPI and Card transactions. Any drop below 90% triggers automated Sev-2 anomaly investigation.',
      importance: 5,
      tags: ['sla', 'target', 'business'],
    });

    this.record({
      category: 'long_term',
      topic: 'Post-Mortem: Incident INC-RZP-782',
      content: 'Aggressive client-side connection dropping caused 22% failure spikes during gateway retry waves. Keep retry backoff exponential with jitter.',
      importance: 4,
      tags: ['postmortem', 'incident', 'resilience'],
    });
  }
}

export const memoryArchitecture = new MemoryArchitecture();
