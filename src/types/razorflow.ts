/**
 * RazorFlow Domain Types & Contracts
 * 
 * Canonical schemas for the Persistent Context-Aware Agentic Work Layer for Razorpay.
 */

// ─── User Roles & Workspace ──────────────────────────────────────
export type RazorFlowUserRole = 'merchant' | 'engineer' | 'operator' | 'admin';

export type RazorpayEnvironment = 'test' | 'live';

export type PolicyRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ActionSource = 'voice' | 'text' | 'web' | 'shortcut' | 'orb' | 'webhook';

// ─── Canonical Intent Model ──────────────────────────────────────
export interface ActionRequest {
  id: string;
  toolId: string;
  parameters: Record<string, any>;
  riskLevel: PolicyRiskLevel;
  requiresApproval: boolean;
  description: string;
  targetEntity?: {
    type: 'payment' | 'order' | 'refund' | 'dispute' | 'settlement' | 'customer' | 'github_issue' | 'deployment';
    id: string;
  };
}

export interface RazorFlowIntent {
  id: string;
  userId: string;
  workspaceId: string;
  sessionId: string;
  type: 
    | 'business_health_query'
    | 'payment_investigation'
    | 'revenue_opportunity_query'
    | 'recovery_action'
    | 'dispute_review'
    | 'settlement_audit'
    | 'customer_lookup'
    | 'engineering_incident_correlation'
    | 'action_ledger_query'
    | 'memory_consolidation'
    | 'what_changed_query'
    | 'context_packet_request'
    | 'watch_metric_command'
    | 'decision_replay_query'
    | 'resume_investigation_query'
    | 'flowgraph_query'
    | 'impact_analysis_query'
    | 'chart_generation_query'
    | 'timeline_query'
    | 'general_command'
    | 'direct_tool_execution';
  rawQuery: string;
  normalizedQuery: string;
  entities: {
    paymentId?: string;
    orderId?: string;
    customerId?: string;
    disputeId?: string;
    settlementId?: string;
    issueId?: string;
    timeframe?: string;
    errorCode?: string;
    actor?: string;
    [key: string]: any;
  };
  requestedActions: ActionRequest[];
  confidence: number;
  riskLevel: PolicyRiskLevel;
  requiresApproval: boolean;
  source: ActionSource;
  createdAt: number;
}

// ─── Evidence-First Reasoning ────────────────────────────────────
export interface EvidenceSource {
  id: string;
  type: 'razorpay_api' | 'webhook_event' | 'github_deployment' | 'incident_log' | 'metric_timeseries' | 'memory_layer';
  title: string;
  uri?: string;
  dataSnapshot?: any;
  timestamp: number;
}

export interface EvidenceReasoning {
  conclusion: string;
  confidence: number; // 0.0 to 1.0
  evidence: string[];
  sources: EvidenceSource[];
  timestamp: string;
  recommendedActions: RecommendedAction[];
  modeledImpact?: {
    potentialRecoverableRevenueINR?: number;
    atRiskRevenueINR?: number;
    affectedTransactionsCount?: number;
    confidenceInterval?: string;
  };
}

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  toolId: string;
  parameters: Record<string, any>;
  riskLevel: PolicyRiskLevel;
  requiresApproval: boolean;
  expectedOutcome: string;
  isAutomatedSafe: boolean;
}

// ─── Context Engine Contracts ────────────────────────────────────
export interface ContextBudget {
  maxTokens: number;
  allocatedTokens: number;
  usedTokens: number;
  compressionRatio: number;
}

export interface RazorpayOperationalState {
  environment: RazorpayEnvironment;
  connected: boolean;
  merchantId: string;
  merchantName: string;
  currency: string;
  todayMetrics: {
    totalVolumeINR: number;
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    successRatePercent: number;
    activeAnomaliesCount: number;
    pendingDisputesCount: number;
    pendingSettlementsINR: number;
    potentialRecoverableINR: number;
  };
  recentFailureSpike?: {
    detectedAt: number;
    primaryErrorCode: string;
    affectedGateway: string;
    failureRateIncreasePercent: number;
  };
}

export interface EngineeringOperationalState {
  activeServices: string[];
  latestDeployment?: {
    id: string;
    service: string;
    commitHash: string;
    author: string;
    deployedAt: number;
    versionTag: string;
    changelogSummary: string;
  };
  recentIncidents: Array<{
    id: string;
    title: string;
    severity: 'sev1' | 'sev2' | 'sev3' | 'sev4';
    status: 'open' | 'investigating' | 'mitigated' | 'resolved';
    matchedGateway?: string;
    createdAt: number;
  }>;
}

export interface RazorFlowContext {
  userRole: RazorFlowUserRole;
  workspaceId: string;
  sessionId: string;
  currentTask?: string;
  businessState: RazorpayOperationalState;
  engineeringState?: EngineeringOperationalState;
  workingMemory: string[];
  sessionMemory: string[];
  operationalMemory: string[];
  longTermMemory: string[];
  availableTools: string[];
  currentPermissions: string[];
  recentEvents: Array<{ type: string; summary: string; timestamp: number }>;
  budget: ContextBudget;
}

// ─── Policy Engine & Approvals ───────────────────────────────────
export interface PendingApproval {
  id: string;
  intentId: string;
  actionId: string;
  toolId: string;
  what: string;
  why: string;
  expectedEffect: string;
  riskLevel: PolicyRiskLevel;
  dataUsed: Record<string, any>;
  parameters: Record<string, any>;
  requestedAt: number;
  expiresAt: number;
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';
  resolvedAt?: number;
  resolvedBy?: string;
  executionResult?: any;
}

// ─── Verification & Action Ledger ────────────────────────────────
export interface ActionVerification {
  isVerified: boolean;
  verificationMethod: 'api_status_check' | 'idempotent_recheck' | 'state_diff' | 'read_only_assertion';
  targetStateVerified: string;
  verificationTimestamp: number;
  rawVerificationResponse?: any;
}

export interface ActionLedgerEntry {
  id: string;
  intentId: string;
  intentSummary: string;
  toolId: string;
  parameters: Record<string, any>;
  policyDecision: {
    riskLevel: PolicyRiskLevel;
    requiredApproval: boolean;
    approvalId?: string;
    policyPassed: boolean;
  };
  approval?: {
    approvedBy: string;
    approvedAt: number;
  };
  execution: {
    startedAt: number;
    completedAt: number;
    durationMs: number;
    status: 'success' | 'failed' | 'timeout' | 'rejected';
    output: any;
    error?: string;
    idempotencyKey?: string;
  };
  verification: ActionVerification;
  actor: {
    userId: string;
    role: RazorFlowUserRole;
    source: ActionSource;
  };
  timestamp: number;
}

// ─── Investigation Report ────────────────────────────────────────
export interface InvestigationSignal {
  name: string;
  status: 'normal' | 'warning' | 'critical' | 'informational';
  value: string | number;
  details: string;
}

export interface InvestigationReport {
  id: string;
  targetQuestion: string;
  status: 'active' | 'completed' | 'needs_approval';
  startedAt: number;
  completedAt?: number;
  signals: InvestigationSignal[];
  failureCodeBreakdown: Array<{ code: string; count: number; percentage: number; description: string }>;
  timelineCorrelations: Array<{ timestamp: number; event: string; type: 'payment_drop' | 'deployment' | 'incident' | 'traffic_spike' }>;
  historicalIncidentMatches: Array<{ incidentId: string; title: string; similarityScore: number; resolution: string }>;
  findings: string[];
  confidence: number;
  diagnosis: string;
  recommendedActions: RecommendedAction[];
  pendingApprovals: PendingApproval[];
}

// ─── Agent Run Trace ─────────────────────────────────────────────
export interface AgentRunStep {
  step: 'intent' | 'context' | 'reasoning' | 'plan' | 'policy' | 'tool_selection' | 'execution' | 'verification' | 'audit' | 'memory';
  status: 'pending' | 'running' | 'completed' | 'skipped' | 'failed';
  title: string;
  data: any;
  durationMs?: number;
  timestamp: number;
}

export interface AgentRunTrace {
  id: string;
  intent: RazorFlowIntent;
  contextSnapshotSummary: string;
  selectedAgent: string;
  steps: AgentRunStep[];
  output?: EvidenceReasoning;
  totalDurationMs: number;
  status: 'running' | 'completed' | 'requires_approval' | 'failed';
  createdAt: number;
}

// ─── Tool Registry Contracts ─────────────────────────────────────
export interface ToolSchema {
  name: string;
  type: 'object';
  properties: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description: string;
    required?: boolean;
    enum?: string[];
  }>;
  required: string[];
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: 'razorpay' | 'engineering' | 'system' | 'communication' | 'analysis';
  riskLevel: PolicyRiskLevel;
  requiresApproval: boolean;
  requiresIdempotency: boolean;
  timeoutMs: number;
  schema: ToolSchema;
  executor: (params: any, context: RazorFlowContext) => Promise<{ success: boolean; data: any; error?: string }>;
}
