/**
 * RazorFlow FlowGraph 2.0 Model
 * 
 * Renderer-independent graph data model representing RazorFlow's
 * Context Graph, Investigation Graph, and Operational Telemetry.
 * 
 * Epistemic Certainty Principles:
 * - OBSERVED: Verified factual data from Razorpay API / live telemetry.
 * - CORRELATED: Systemic or statistical temporal alignment between events.
 * - INFERRED: Derived reasoning or historical pattern match.
 * - RECOMMENDED: Evaluated proposal against safety policies.
 * - CONFIRMED: Verified state transition post-execution.
 * 
 * Invariant: Correlation does NOT imply causation.
 */

export type GraphNodeType = 
  | 'payment'
  | 'order'
  | 'customer'
  | 'gateway'
  | 'bank'
  | 'payment_method'
  | 'transaction'
  | 'refund'
  | 'dispute'
  | 'settlement'
  | 'metric'
  | 'incident'
  | 'service'
  | 'deployment'
  | 'git_commit'
  | 'pull_request'
  | 'agent'
  | 'investigation'
  | 'action'
  | 'revenue_signal'
  | 'checkout'
  | 'webhook'
  | 'error_code'
  | 'hypothesis'
  | 'evidence';

export type EpistemicStatus = 'OBSERVED' | 'CORRELATED' | 'INFERRED' | 'RECOMMENDED' | 'CONFIRMED';

export type PolicyRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type GraphRelationshipType = 
  | 'processed_by'
  | 'belongs_to'
  | 'routed_through'
  | 'failed_at'
  | 'correlated_with'
  | 'affected'
  | 'depends_on'
  | 'deployed_by'
  | 'triggered'
  | 'investigated_by'
  | 'recommended'
  | 'executed'
  | 'verified_by'
  | 'caused'
  | 'related_to';

export type GraphMode = 
  | 'CONTEXT'
  | 'INVESTIGATION'
  | 'IMPACT'
  | 'TIMELINE'
  | 'CUSTOMER';

export type DemoPreset = 
  | 'FULL_CONTEXT'
  | 'HDFC_ANOMALY'
  | 'SMART_ROUTING';

export type TimelinePoint = 
  | '09:00'
  | '11:00'
  | '13:00'
  | '14:32'
  | '15:00'
  | '17:00';

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  importance: number; // 0.0 to 1.0 (influences node size and prominence)
  risk: PolicyRiskLevel;
  status: EpistemicStatus;
  changed: boolean; // Indicates whether this node changed in active temporal window
  metadata: Record<string, any>;
  evidenceIds: string[];
  timestamp: number;
  // Layout coordinates (spatial 3D + 2D)
  x?: number;
  y?: number;
  z?: number;
  pinned?: boolean;
  clusterGroup?: string;
  collapsed?: boolean;
  childCount?: number;
  hidden?: boolean;
}

export interface GraphEdge {
  id?: string;
  source: string; // Node ID
  target: string; // Node ID
  relation: GraphRelationshipType;
  strength: number; // 0.0 to 1.0 (influences edge thickness)
  confidence: number; // 0.0 to 1.0 (influences edge styling/dashes)
  status: EpistemicStatus;
  evidenceIds: string[];
  timestamp: number;
  label?: string;
  metadata?: Record<string, any>;
  hidden?: boolean;
}

export interface FlowGraphData {
  id: string;
  title: string;
  description: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  rootNodeIds: string[];
  mode?: GraphMode;
  preset?: DemoPreset;
  timelinePoint?: TimelinePoint;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

export interface ImpactAnalysisResult {
  targetNodeId: string;
  targetLabel: string;
  directImpact: GraphNode[];
  indirectImpact: GraphNode[];
  affectedServices: string[];
  affectedPaymentMethods: string[];
  affectedGateways: string[];
  affectedMetrics: Array<{ name: string; value: string; severity: string }>;
  affectedCustomersCount: number;
  atRiskRevenueINR: number;
  evidenceSummary: string[];
  confidence: number;
  isDemoData: boolean;
}

export interface EdgeEvidenceDetail {
  edge: GraphEdge;
  sourceNode: GraphNode;
  targetNode: GraphNode;
  relationshipName: string;
  epistemicStatus: EpistemicStatus;
  isCausal: boolean;
  confidencePercent: number;
  evidenceItems: string[];
  timestampFormatted: string;
  sourceTelemetry: string;
}
