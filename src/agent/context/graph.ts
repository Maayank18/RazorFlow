/**
 * RazorFlow Context Graph Abstraction
 * 
 * Bounded Entity-Relationship Graph that answers: "What is relevant to this problem?"
 * Instead of stuffing the entire database into the LLM context, it traverses relevant
 * entities and relationships (User, Workspace, Payment, Customer, Order, Refund,
 * Dispute, Settlement, Deployment, Incident, Metric, Document, Action).
 */

export type EntityType = 
  | 'user' 
  | 'workspace' 
  | 'payment' 
  | 'customer' 
  | 'order' 
  | 'refund' 
  | 'dispute' 
  | 'settlement' 
  | 'deployment' 
  | 'incident' 
  | 'metric' 
  | 'document' 
  | 'previous_investigation' 
  | 'action';

export type RelationType = 
  | 'BELONGS_TO'
  | 'ASSOCIATED_WITH'
  | 'TRIGGERED_BY'
  | 'FAILED_WITH'
  | 'CORRELATED_TO'
  | 'RESOLVED_BY'
  | 'AFFECTS'
  | 'PRECEDES'
  | 'EVIDENCE_FOR';

export interface GraphNode {
  id: string;
  type: EntityType;
  label: string;
  attributes: Record<string, any>;
  timestamp?: number;
  source: 'razorpay_api' | 'telemetry_stream' | 'ci_cd_pipeline' | 'incident_store' | 'audit_ledger' | 'memory_store';
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relation: RelationType;
  weight: number; // 0.0 - 1.0 relevance/confidence weight
  metadata?: Record<string, any>;
}

export interface Subgraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  rootNodeIds: string[];
  relevanceScore: number;
  extractedAt: number;
  tokenCostEstimate: number;
}

export class ContextGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private adjacency: Map<string, Set<string>> = new Map();

  constructor() {
    this.seedDefaultGraph();
  }

  public addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    if (!this.adjacency.has(node.id)) {
      this.adjacency.set(node.id, new Set());
    }
  }

  public addEdge(edge: GraphEdge): void {
    this.edges.set(edge.id, edge);
    if (!this.adjacency.has(edge.sourceId)) {
      this.adjacency.set(edge.sourceId, new Set());
    }
    this.adjacency.get(edge.sourceId)!.add(edge.id);
  }

  public getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  public getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  public getAllEdges(): GraphEdge[] {
    return Array.from(this.edges.values());
  }

  /**
   * Bounded sub-graph query: Traverses relevance from query roots up to maxDepth and maxNodes.
   * Prevents loading the entire database into context.
   */
  public queryRelevantSubgraph(params: {
    entityIds?: string[];
    entityTypes?: EntityType[];
    intent?: string;
    maxDepth?: number;
    maxNodes?: number;
  }): Subgraph {
    const maxDepth = params.maxDepth ?? 3;
    const maxNodes = params.maxNodes ?? 25;
    const targetNodeIds = new Set<string>();
    const includedEdges = new Set<GraphEdge>();
    const rootNodeIds: string[] = [];

    // Find initial seed nodes
    if (params.entityIds && params.entityIds.length > 0) {
      for (const id of params.entityIds) {
        if (this.nodes.has(id)) {
          targetNodeIds.add(id);
          rootNodeIds.push(id);
        }
      }
    }

    // If no explicit IDs, match by intent keywords & entity types
    if (targetNodeIds.size === 0) {
      const intentLower = (params.intent || '').toLowerCase();
      for (const [id, node] of this.nodes.entries()) {
        if (params.entityTypes && !params.entityTypes.includes(node.type)) {
          continue;
        }

        let isMatch = false;
        if (intentLower.includes('hdfc') && (node.label.toLowerCase().includes('hdfc') || node.attributes.gateway === 'HDFC')) {
          isMatch = true;
        } else if (intentLower.includes('payment') && (node.type === 'payment' || node.type === 'metric')) {
          isMatch = true;
        } else if (intentLower.includes('deploy') && node.type === 'deployment') {
          isMatch = true;
        } else if (intentLower.includes('revenue') && (node.type === 'metric' || node.type === 'refund')) {
          isMatch = true;
        }

        if (isMatch) {
          targetNodeIds.add(id);
          rootNodeIds.push(id);
          if (targetNodeIds.size >= 5) break;
        }
      }
    }

    // Default fallback to active payment metric if still empty
    if (targetNodeIds.size === 0) {
      const defaultRoot = 'metric_sr_global';
      if (this.nodes.has(defaultRoot)) {
        targetNodeIds.add(defaultRoot);
        rootNodeIds.push(defaultRoot);
      }
    }

    // Breadth-first traversal up to maxDepth and maxNodes
    let currentLevel = Array.from(targetNodeIds);
    for (let depth = 0; depth < maxDepth && targetNodeIds.size < maxNodes; depth++) {
      const nextLevel: string[] = [];
      for (const nodeId of currentLevel) {
        const edgeIds = this.adjacency.get(nodeId) || new Set();
        for (const edgeId of edgeIds) {
          const edge = this.edges.get(edgeId);
          if (!edge) continue;

          includedEdges.add(edge);
          if (!targetNodeIds.has(edge.targetId) && targetNodeIds.size < maxNodes) {
            targetNodeIds.add(edge.targetId);
            nextLevel.push(edge.targetId);
          }
        }
      }
      currentLevel = nextLevel;
      if (currentLevel.length === 0) break;
    }

    const nodes = Array.from(targetNodeIds).map(id => this.nodes.get(id)!).filter(Boolean);
    const edges = Array.from(includedEdges);

    // Approximate token cost estimation
    const jsonStr = JSON.stringify({ nodes, edges });
    const tokenCostEstimate = Math.ceil(jsonStr.length / 4);

    return {
      nodes,
      edges,
      rootNodeIds,
      relevanceScore: 0.94,
      extractedAt: Date.now(),
      tokenCostEstimate
    };
  }

  /**
   * Seeds realistic Razorpay entity relationships (Test Mode Fixtures)
   */
  private seedDefaultGraph(): void {
    // 1. Workspace & User
    this.addNode({
      id: 'workspace_rzp_prod',
      type: 'workspace',
      label: 'Merchant Production Workspace',
      attributes: { merchantId: 'rzp_live_merch_8819', tier: 'Enterprise', mode: 'TEST' },
      source: 'razorpay_api'
    });

    // 2. Metrics
    this.addNode({
      id: 'metric_sr_global',
      type: 'metric',
      label: 'Global Payment Success Rate',
      attributes: { current: '87.4%', baseline: '95.2%', delta: '-7.8%', anomaly: true },
      source: 'telemetry_stream'
    });
    this.addNode({
      id: 'metric_hdfc_sr',
      type: 'metric',
      label: 'HDFC Netbanking Success Rate',
      attributes: { current: '73.1%', baseline: '87.3%', delta: '-14.2%', p95Latency: '512ms', anomaly: true },
      source: 'telemetry_stream'
    });

    // 3. Payments
    this.addNode({
      id: 'pay_N9bK1pQrStUv88',
      type: 'payment',
      label: 'Failed HDFC Netbanking Payment ₹14,500',
      attributes: { amount: 1450000, currency: 'INR', status: 'failed', errorCode: 'GATEWAY_ERROR', errorDesc: 'Bank 2FA verification timeout' },
      source: 'razorpay_api'
    });
    this.addNode({
      id: 'pay_N9bK1pQrStUv89',
      type: 'payment',
      label: 'Failed HDFC Netbanking Payment ₹8,200',
      attributes: { amount: 820000, currency: 'INR', status: 'failed', errorCode: 'GATEWAY_ERROR', errorDesc: 'Connector response timeout >15000ms' },
      source: 'razorpay_api'
    });

    // 4. Customers
    this.addNode({
      id: 'cust_8821a',
      type: 'customer',
      label: 'Customer Rohan S. (Masked: ro***@gmail.com)',
      attributes: { totalVolume: '₹1.84L', lifetimeTransactions: 14, riskTier: 'LOW' },
      source: 'razorpay_api'
    });

    // 5. Deployments
    this.addNode({
      id: 'dep_prod_9921',
      type: 'deployment',
      label: 'CI/CD Release dep_prod_9921',
      attributes: { service: 'payment-orchestrator', version: 'v2.4.1-rc3', deployedAt: '42m ago', change: 'Connector timeout reduced 45s -> 15s' },
      source: 'ci_cd_pipeline'
    });

    // 6. Historical Incidents
    this.addNode({
      id: 'inc_rzp_782',
      type: 'incident',
      label: 'Historical Incident INC-RZP-782',
      attributes: { title: 'Premature 2FA challenge timeout on HDFC connectors', resolvedBy: 'Restored 45s timeout + dispatch retry webhooks', matchConfidence: 0.87 },
      source: 'incident_store'
    });

    // Edges
    this.addEdge({
      id: 'e1',
      sourceId: 'metric_sr_global',
      targetId: 'metric_hdfc_sr',
      relation: 'TRIGGERED_BY',
      weight: 0.95
    });
    this.addEdge({
      id: 'e2',
      sourceId: 'metric_hdfc_sr',
      targetId: 'pay_N9bK1pQrStUv88',
      relation: 'AFFECTS',
      weight: 0.90
    });
    this.addEdge({
      id: 'e3',
      sourceId: 'pay_N9bK1pQrStUv88',
      targetId: 'cust_8821a',
      relation: 'BELONGS_TO',
      weight: 0.85
    });
    this.addEdge({
      id: 'e4',
      sourceId: 'metric_hdfc_sr',
      targetId: 'dep_prod_9921',
      relation: 'CORRELATED_TO',
      weight: 0.92,
      metadata: { correlationScore: 0.87, windowOffsetMinutes: 42 }
    });
    this.addEdge({
      id: 'e5',
      sourceId: 'dep_prod_9921',
      targetId: 'inc_rzp_782',
      relation: 'EVIDENCE_FOR',
      weight: 0.87
    });
  }
}

export const contextGraph = new ContextGraph();
