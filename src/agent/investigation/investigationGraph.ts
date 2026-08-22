/**
 * RazorFlow Investigation Graph DAG
 * 
 * First-Class Directed Acyclic Graph representing the deterministic diagnostic flow:
 * Observation -> Signal -> Correlation -> Hypothesis -> Evidence -> Recommendation
 * 
 * Epistemic Certainty Tiers:
 * - OBSERVED: Verified factual measurement from Razorpay APIs or telemetry.
 * - CORRELATED: Statistical or temporal alignment between independent events.
 * - INFERRED: Derived reasoning or pattern match from historical incident corpus.
 * - RECOMMENDED: Actionable proposal evaluated against safety policy.
 */

export type EpistemicStatus = 'OBSERVED' | 'CORRELATED' | 'INFERRED' | 'RECOMMENDED';

export type InvestigationNodeType = 
  | 'observation'
  | 'signal'
  | 'correlation'
  | 'hypothesis'
  | 'evidence'
  | 'recommendation';

export interface InvestigationNode {
  id: string;
  type: InvestigationNodeType;
  title: string;
  description: string;
  status: EpistemicStatus;
  confidence: number; // 0.0 - 1.0
  source: string; // e.g. "Razorpay Telemetry P95 Stream", "Commit dep_prod_9921", "INC-RZP-782"
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface InvestigationEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  relationship: 'TRIGGERS' | 'CORRELATES_WITH' | 'SUPPORTS' | 'PROVES' | 'MITIGATES';
  isCausal: boolean; // Explicit distinction: true = proven causal link, false = statistical correlation
  confidence: number;
}

export class InvestigationGraph {
  public id: string;
  public title: string;
  public createdAt: number;
  private nodes: Map<string, InvestigationNode> = new Map();
  private edges: InvestigationEdge[] = [];

  constructor(id?: string, title?: string) {
    this.id = id || `inv_graph_${Date.now()}`;
    this.title = title || 'Payment Failure Investigation';
    this.createdAt = Date.now();
  }

  public addNode(node: InvestigationNode): this {
    this.nodes.set(node.id, node);
    return this;
  }

  public addEdge(edge: InvestigationEdge): this {
    this.edges.push(edge);
    return this;
  }

  public getNode(id: string): InvestigationNode | undefined {
    return this.nodes.get(id);
  }

  public getNodes(): InvestigationNode[] {
    return Array.from(this.nodes.values());
  }

  public getEdges(): InvestigationEdge[] {
    return [...this.edges];
  }

  /**
   * Generates a clean, shareable ASCII / Mermaid representation of the graph
   */
  public toMermaid(): string {
    const lines = ['graph TD'];
    for (const node of this.nodes.values()) {
      const label = `${node.status}: ${node.title} (${Math.round(node.confidence * 100)}%)`;
      lines.push(`  ${node.id}["${label}"]`);
    }
    for (const edge of this.edges) {
      const relationLabel = edge.isCausal ? `[CAUSAL] ${edge.relationship}` : `[CORRELATION] ${edge.relationship}`;
      lines.push(`  ${edge.fromNodeId} -->|${relationLabel}| ${edge.toNodeId}`);
    }
    return lines.join('\n');
  }

  /**
   * Factory: Builds the canonical Payment Anomaly Investigation Graph
   */
  public static createDefaultPaymentInvestigationGraph(): InvestigationGraph {
    const graph = new InvestigationGraph('inv_hdfc_regression', 'HDFC Netbanking Regression Diagnostic');
    const now = Date.now();

    // 1. Observation (Factual measurement)
    graph.addNode({
      id: 'node_obs_1',
      type: 'observation',
      title: 'Payment Success Rate Drop',
      description: 'Overall merchant checkout success rate dropped by 7.8% over the past 45 minutes.',
      status: 'OBSERVED',
      confidence: 1.0,
      source: 'Razorpay Live Telemetry Engine',
      timestamp: now - 2700000
    });

    // 2. Signal (Isolated sub-metric)
    graph.addNode({
      id: 'node_sig_1',
      type: 'signal',
      title: 'HDFC Netbanking Isolated Anomaly',
      description: 'HDFC Netbanking SR dropped by 14.2% (down to 73.1%) while UPI remained nominal at 98.4%.',
      status: 'OBSERVED',
      confidence: 0.98,
      source: 'Gateway Telemetry Matrix',
      timestamp: now - 2400000
    });

    // 3. Correlation (Temporal alignment)
    graph.addNode({
      id: 'node_corr_1',
      type: 'correlation',
      title: 'CI/CD Deployment dep_prod_9921',
      description: 'Deployment dep_prod_9921 (payment-orchestrator v2.4.1-rc3) rolled out 42m ago, reducing connector timeouts from 45s to 15s.',
      status: 'CORRELATED',
      confidence: 0.91,
      source: 'CI/CD Deployment Audit Stream',
      timestamp: now - 2520000
    });

    // 4. Evidence (Incident match)
    graph.addNode({
      id: 'node_evi_1',
      type: 'evidence',
      title: 'Historical Incident Match (INC-RZP-782)',
      description: 'Incident INC-RZP-782 matched with 87% signature similarity: bank 2FA OTP submission requires >15s during peak load.',
      status: 'INFERRED',
      confidence: 0.87,
      source: 'Operational Memory Incident Store',
      timestamp: now - 1800000
    });

    // 5. Hypothesis (Root cause candidate)
    graph.addNode({
      id: 'node_hyp_1',
      type: 'hypothesis',
      title: 'Premature 2FA Challenge Termination',
      description: 'Valid customer 2FA authentication challenges are terminated prematurely at 15s before bank OTP gateway responds.',
      status: 'INFERRED',
      confidence: 0.89,
      source: 'PaymentInvestigationAgent Reasoning',
      timestamp: now - 1200000
    });

    // 6. Recommendation (Actionable safe mitigation)
    graph.addNode({
      id: 'node_rec_1',
      type: 'recommendation',
      title: 'Safe Mitigation & Revenue Recovery',
      description: 'Rollback connector timeout threshold to 45s and dispatch 1-click WhatsApp retry links to dropped checkouts.',
      status: 'RECOMMENDED',
      confidence: 0.95,
      source: 'PolicyEngine & RecoveryAdvisorAgent',
      timestamp: now - 600000
    });

    // Edges
    graph.addEdge({
      id: 'edge_1',
      fromNodeId: 'node_obs_1',
      toNodeId: 'node_sig_1',
      relationship: 'TRIGGERS',
      isCausal: true,
      confidence: 0.98
    });
    graph.addEdge({
      id: 'edge_2',
      fromNodeId: 'node_sig_1',
      toNodeId: 'node_corr_1',
      relationship: 'CORRELATES_WITH',
      isCausal: false, // Temporal correlation, not yet proven causal alone
      confidence: 0.91
    });
    graph.addEdge({
      id: 'edge_3',
      fromNodeId: 'node_corr_1',
      toNodeId: 'node_evi_1',
      relationship: 'SUPPORTS',
      isCausal: false,
      confidence: 0.87
    });
    graph.addEdge({
      id: 'edge_4',
      fromNodeId: 'node_evi_1',
      toNodeId: 'node_hyp_1',
      relationship: 'PROVES',
      isCausal: true,
      confidence: 0.89
    });
    graph.addEdge({
      id: 'edge_5',
      fromNodeId: 'node_hyp_1',
      toNodeId: 'node_rec_1',
      relationship: 'MITIGATES',
      isCausal: true,
      confidence: 0.95
    });

    return graph;
  }
}
