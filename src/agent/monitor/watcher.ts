/**
 * RazorFlow Watch & Monitor Engine
 * 
 * Manages persistent metric watchers:
 * e.g., "Watch payment success rate" or "Watch HDFC latency"
 * 
 * When a threshold breach is detected:
 * Detect -> Notify -> Trigger Shadow Investigation (Zero unauthorized financial mutations)
 */

export interface MetricWatcher {
  id: string;
  name: string;
  metric: 'payment_success_rate' | 'gateway_latency' | 'error_spike' | 'dispute_rate' | 'refund_volume';
  baseline: string | number;
  threshold: string | number;
  windowMinutes: number;
  scope: string; // e.g. "Global", "HDFC Netbanking", "UPI"
  notificationPolicy: 'IN_APP' | 'SLACK' | 'EMAIL' | 'ALL';
  actionPolicy: 'SHADOW_INVESTIGATE_ONLY' | 'NOTIFY_ONLY';
  status: 'ACTIVE' | 'PAUSED' | 'TRIGGERED';
  createdAt: number;
  lastEvaluatedAt: number;
  triggerCount: number;
}

export class WatcherEngine {
  private static instance: WatcherEngine;
  private watchers: Map<string, MetricWatcher> = new Map();

  private constructor() {
    this.seedDefaultWatchers();
  }

  public static getInstance(): WatcherEngine {
    if (!WatcherEngine.instance) {
      WatcherEngine.instance = new WatcherEngine();
    }
    return WatcherEngine.instance;
  }

  public createWatcher(params: Omit<MetricWatcher, 'id' | 'createdAt' | 'lastEvaluatedAt' | 'triggerCount' | 'status'>): MetricWatcher {
    const watcher: MetricWatcher = {
      id: `watch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'ACTIVE',
      createdAt: Date.now(),
      lastEvaluatedAt: Date.now(),
      triggerCount: 0,
      ...params
    };
    this.watchers.set(watcher.id, watcher);
    return watcher;
  }

  public getWatchers(): MetricWatcher[] {
    return Array.from(this.watchers.values());
  }

  public evaluateAll(): { triggered: MetricWatcher[]; active: MetricWatcher[] } {
    const triggered: MetricWatcher[] = [];
    const active: MetricWatcher[] = [];

    for (const w of this.watchers.values()) {
      w.lastEvaluatedAt = Date.now();
      if (w.metric === 'payment_success_rate' && w.scope.includes('HDFC')) {
        // Active HDFC anomaly simulation
        w.status = 'TRIGGERED';
        w.triggerCount += 1;
        triggered.push(w);
      } else {
        w.status = 'ACTIVE';
        active.push(w);
      }
    }

    return { triggered, active };
  }

  private seedDefaultWatchers(): void {
    const w1: MetricWatcher = {
      id: 'watch_global_sr',
      name: 'Global Payment Success Rate Monitor',
      metric: 'payment_success_rate',
      baseline: '95.0%',
      threshold: '< 90.0%',
      windowMinutes: 15,
      scope: 'Global All Gateways',
      notificationPolicy: 'IN_APP',
      actionPolicy: 'SHADOW_INVESTIGATE_ONLY',
      status: 'ACTIVE',
      createdAt: Date.now() - 86400000,
      lastEvaluatedAt: Date.now(),
      triggerCount: 1
    };

    const w2: MetricWatcher = {
      id: 'watch_hdfc_latency',
      name: 'HDFC Connector P95 Latency Watcher',
      metric: 'gateway_latency',
      baseline: '185ms',
      threshold: '> 300ms',
      windowMinutes: 10,
      scope: 'HDFC Netbanking Connector',
      notificationPolicy: 'ALL',
      actionPolicy: 'SHADOW_INVESTIGATE_ONLY',
      status: 'ACTIVE',
      createdAt: Date.now() - 3600000,
      lastEvaluatedAt: Date.now(),
      triggerCount: 0
    };

    this.watchers.set(w1.id, w1);
    this.watchers.set(w2.id, w2);
  }
}

export const watcherEngine = WatcherEngine.getInstance();
