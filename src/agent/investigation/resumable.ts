/**
 * RazorFlow Persistent Resumable Investigation Memory Store
 * 
 * Investigations are first-class resumable entities that can be paused, resumed,
 * queried, or exported across user sessions.
 */

import { InvestigationGraph } from './investigationGraph';
import { Subgraph } from '../context/graph';

export type InvestigationStatus = 'IN_PROGRESS' | 'WAITING_APPROVAL' | 'RESOLVED' | 'ARCHIVED';

export interface ResumableInvestigation {
  id: string;
  title: string;
  question: string;
  status: InvestigationStatus;
  contextSubgraph?: Subgraph;
  investigationGraph: InvestigationGraph;
  evidence: string[];
  hypotheses: string[];
  rejectedHypotheses: string[];
  proposedActions: string[];
  executedActions: string[];
  results: string[];
  finalResolution?: string;
  outstandingWork: string[];
  createdAt: number;
  updatedAt: number;
}

export class ResumableInvestigationStore {
  private static instance: ResumableInvestigationStore;
  private investigations: Map<string, ResumableInvestigation> = new Map();

  private constructor() {
    this.seedDefaultInvestigation();
  }

  public static getInstance(): ResumableInvestigationStore {
    if (!ResumableInvestigationStore.instance) {
      ResumableInvestigationStore.instance = new ResumableInvestigationStore();
    }
    return ResumableInvestigationStore.instance;
  }

  public save(investigation: ResumableInvestigation): void {
    investigation.updatedAt = Date.now();
    this.investigations.set(investigation.id, investigation);
  }

  public get(id: string): ResumableInvestigation | undefined {
    return this.investigations.get(id);
  }

  public getAll(): ResumableInvestigation[] {
    return Array.from(this.investigations.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public getLatest(): ResumableInvestigation | undefined {
    const all = this.getAll();
    return all.length > 0 ? all[0] : undefined;
  }

  /**
   * Resumes an investigation by ID or fuzzy title match
   */
  public resume(queryText: string): ResumableInvestigation | undefined {
    const lower = queryText.toLowerCase();
    
    // Exact ID lookup
    if (this.investigations.has(queryText)) {
      return this.investigations.get(queryText);
    }

    // Title / question match
    for (const inv of this.investigations.values()) {
      if (
        lower.includes('payment') && inv.title.toLowerCase().includes('payment') ||
        lower.includes('hdfc') && inv.title.toLowerCase().includes('hdfc') ||
        lower.includes('yesterday')
      ) {
        return inv;
      }
    }

    return this.getLatest();
  }

  private seedDefaultInvestigation(): void {
    const defaultGraph = InvestigationGraph.createDefaultPaymentInvestigationGraph();
    const now = Date.now();

    const initialInv: ResumableInvestigation = {
      id: 'inv_pay_drop_hdfc',
      title: 'HDFC Netbanking Regression & Timeout Investigation',
      question: 'Why did payment success rate drop in the last hour?',
      status: 'IN_PROGRESS',
      investigationGraph: defaultGraph,
      evidence: [
        'HDFC Netbanking success rate dropped from 87.3% to 73.1% (-14.2% delta).',
        'P95 latency on HDFC connector spiked from 185ms to 512ms.',
        '66.7% of failures return GATEWAY_ERROR timeout code.',
        'CI/CD commit dep_prod_9921 reduced connector timeout to 15s.'
      ],
      hypotheses: [
        'Premature timeout threshold in dep_prod_9921 causes bank 2FA OTP challenge drops (Supported by INC-RZP-782).'
      ],
      rejectedHypotheses: [
        'NPCI UPI switch outage (Rejected: UPI success rate is nominal at 98.4%).',
        'Merchant webhook secret mismatch (Rejected: Webhook signature verification is passing 100%).'
      ],
      proposedActions: [
        'Hotfix deployment: restore bank connector timeout threshold from 15s to 45s.',
        'Dispatch 1-click WhatsApp payment retry links to ₹3,12,000 in dropped customer checkouts.'
      ],
      executedActions: [],
      results: [],
      outstandingWork: [
        'Awaiting merchant approval to trigger automated recovery dispatch.'
      ],
      createdAt: now - 3600000,
      updatedAt: now
    };

    this.investigations.set(initialInv.id, initialInv);
  }
}

export const investigationStore = ResumableInvestigationStore.getInstance();
