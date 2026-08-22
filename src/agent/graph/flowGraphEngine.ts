import { 
  FlowGraphData, 
  GraphNode, 
  GraphEdge, 
  ImpactAnalysisResult, 
  EdgeEvidenceDetail,
  GraphNodeType,
  GraphMode,
  DemoPreset,
  TimelinePoint
} from './flowGraphModel';

export class FlowGraphEngine {
  private static instance: FlowGraphEngine;
  private currentGraph: FlowGraphData;
  private fullEcosystemNodes: GraphNode[] = [];
  private fullEcosystemEdges: GraphEdge[] = [];
  private activeMode: GraphMode = 'CONTEXT';
  private activePreset: DemoPreset = 'HDFC_ANOMALY';
  private activeTimeline: TimelinePoint = '15:00';
  private manualLayoutPositions: Map<string, { x: number; y: number; z?: number; pinned: boolean }> = new Map();

  private constructor() {
    this.initializeEcosystem();
    this.currentGraph = this.buildPresetGraph('HDFC_ANOMALY');
  }

  public static getInstance(): FlowGraphEngine {
    if (!FlowGraphEngine.instance) {
      FlowGraphEngine.instance = new FlowGraphEngine();
    }
    return FlowGraphEngine.instance;
  }

  /**
   * Initialize comprehensive 80+ entity deterministic ecosystem
   */
  private initializeEcosystem() {
    // 1. INFRASTRUCTURE & SERVICES (Cluster: Infrastructure & Services)
    const infraNodes: GraphNode[] = [
      {
        id: 'dep_prod_9921',
        type: 'deployment',
        label: 'CI/CD: dep_prod_9921',
        importance: 0.95,
        risk: 'HIGH',
        status: 'OBSERVED',
        changed: true,
        clusterGroup: 'Infrastructure',
        metadata: {
          service: 'payment-orchestrator',
          version: 'v2.4.1-rc3',
          commit: '7b8fa9e',
          author: 'sre-lead@company.com',
          deployedAt: 'Today, 14:32 IST',
          changelog: 'Reduced bank connector timeout threshold from 45s to 15s.'
        },
        evidenceIds: ['ev_commit_9921', 'ev_git_diff_01'],
        timestamp: Date.now() - 3600000,
        x: -480,
        y: -120,
        z: 40
      },
      {
        id: 'dep_prod_9918',
        type: 'deployment',
        label: 'CI/CD: dep_prod_9918',
        importance: 0.70,
        risk: 'LOW',
        status: 'OBSERVED',
        changed: false,
        clusterGroup: 'Infrastructure',
        metadata: {
          service: 'checkout-api',
          version: 'v1.19.0',
          deployedAt: 'Yesterday, 18:00 IST',
          changelog: 'Added UPI Intent fallback banner for Web.'
        },
        evidenceIds: ['ev_commit_9918'],
        timestamp: Date.now() - 86400000,
        x: -480,
        y: 80,
        z: -20
      },
      {
        id: 'svc_orchestrator',
        type: 'service',
        label: 'Payment Orchestrator',
        importance: 0.92,
        risk: 'HIGH',
        status: 'OBSERVED',
        changed: true,
        clusterGroup: 'Services',
        metadata: {
          runtime: 'Node.js / Kubernetes',
          instances: 8,
          activeVersion: 'v2.4.1-rc3',
          health: 'DEGRADED'
        },
        evidenceIds: ['ev_k8s_status'],
        timestamp: Date.now() - 3500000,
        x: -240,
        y: -120,
        z: 10
      },
      {
        id: 'svc_smart_routing',
        type: 'service',
        label: 'Smart Routing Engine',
        importance: 0.88,
        risk: 'LOW',
        status: 'OBSERVED',
        changed: false,
        clusterGroup: 'Services',
        metadata: {
          algorithm: 'Multi-Armed Bandit v3.1',
          feeSavingsRate: '0.25%',
          status: 'ACTIVE',
          rerouteLatency: '14ms'
        },
        evidenceIds: ['ev_routing_telemetry'],
        timestamp: Date.now() - 3400000,
        x: -240,
        y: 40,
        z: -10
      },
      {
        id: 'svc_checkout_api',
        type: 'service',
        label: 'Checkout API Gateway',
        importance: 0.82,
        risk: 'LOW',
        status: 'OBSERVED',
        changed: false,
        clusterGroup: 'Services',
        metadata: {
          rps: '1,420 req/sec',
          uptime: '99.98%',
          p99Latency: '42ms'
        },
        evidenceIds: ['ev_checkout_metrics'],
        timestamp: Date.now() - 3400000,
        x: -240,
        y: 180,
        z: -20
      },
      {
        id: 'svc_webhook_worker',
        type: 'service',
        label: 'Webhook Queue Dispatcher',
        importance: 0.75,
        risk: 'MEDIUM',
        status: 'OBSERVED',
        changed: false,
        clusterGroup: 'Services',
        metadata: {
          queueDepth: '142 events',
          deliverySuccess: '99.4%'
        },
        evidenceIds: ['ev_webhook_logs'],
        timestamp: Date.now() - 3000000,
        x: -240,
        y: 280,
        z: -30
      }
    ];

    // 2. GATEWAYS & BANKS (Cluster: Gateways & Banks)
    const gatewayNodes: GraphNode[] = [
      {
        id: 'gw_hdfc_netbanking',
        type: 'gateway',
        label: 'HDFC Netbanking',
        importance: 0.98,
        risk: 'CRITICAL',
        status: 'OBSERVED',
        changed: true,
        clusterGroup: 'Gateways',
        metadata: {
          successRate: '73.1%',
          baselineSR: '87.3%',
          srDelta: '-14.2%',
          latencyP95: '512ms (+184%)',
          status: 'ANOMALY',
          anomalyShare: '66.7% of platform dropouts'
        },
        evidenceIds: ['ev_telemetry_hdfc_sr', 'ev_p95_spike'],
        timestamp: Date.now() - 2700000,
        x: 0,
        y: -140,
        z: 40
      },
      {
        id: 'gw_upi_gpay',
        type: 'gateway',
        label: 'UPI (GPay / PhonePe)',
        importance: 0.94,
        risk: 'LOW',
        status: 'OBSERVED',
        changed: false,
        clusterGroup: 'Gateways',
        metadata: {
          successRate: '98.4%',
          latencyP95: '142ms',
          volumeShare: '54.2%',
          status: 'HEALTHY'
        },
        evidenceIds: ['ev_upi_telemetry'],
        timestamp: Date.now() - 2600000,
        x: 0,
        y: -20,
        z: -10
      },
      {
        id: 'gw_icici_cards',
        type: 'gateway',
        label: 'ICICI 3DS Cards',
        importance: 0.89,
        risk: 'LOW',
        status: 'OBSERVED',
        changed: false,
        clusterGroup: 'Gateways',
        metadata: {
          successRate: '96.2%',
          latencyP95: '180ms',
          status: 'HEALTHY',
          volumeShare: '24.1%'
        },
        evidenceIds: ['ev_icici_telemetry'],
        timestamp: Date.now() - 2600000,
        x: 0,
        y: 100,
        z: -15
      },
      {
        id: 'gw_sbi_netbanking',
        type: 'gateway',
        label: 'SBI Core Netbanking',
        importance: 0.80,
        risk: 'LOW',
        status: 'OBSERVED',
        changed: false,
        clusterGroup: 'Gateways',
        metadata: {
          successRate: '91.8%',
          latencyP95: '240ms',
          status: 'NOMINAL'
        },
        evidenceIds: ['ev_sbi_telemetry'],
        timestamp: Date.now() - 2500000,
        x: 0,
        y: 200,
        z: -25
      },
      {
        id: 'gw_axis_pg',
        type: 'gateway',
        label: 'Axis Bank PG',
        importance: 0.78,
        risk: 'LOW',
        status: 'OBSERVED',
        changed: false,
        clusterGroup: 'Gateways',
        metadata: {
          successRate: '95.5%',
          latencyP95: '165ms',
          status: 'HEALTHY'
        },
        evidenceIds: ['ev_axis_telemetry'],
        timestamp: Date.now() - 2500000,
        x: 0,
        y: 290,
        z: -30
      },
      {
        id: 'bank_hdfc_core',
        type: 'bank',
        label: 'HDFC Core Banking CBS',
        importance: 0.85,
        risk: 'MEDIUM',
        status: 'OBSERVED',
        changed: false,
        clusterGroup: 'Gateways',
        metadata: {
          cbsLatency: '480ms',
          otpDeliveryRate: '94.2%',
          status: 'ONLINE'
        },
        evidenceIds: ['ev_bank_cbs'],
        timestamp: Date.now() - 2700000,
        x: 0,
        y: -240,
        z: 20
      }
    ];

    // 3. METRICS, INCIDENTS & HYPOTHESES (Cluster: Diagnostics & Signals)
    const diagnosticNodes: GraphNode[] = [
      {
        id: 'metric_payment_drop',
        type: 'metric',
        label: 'Success Rate Drop (-14.2%)',
        importance: 0.96,
        risk: 'CRITICAL',
        status: 'OBSERVED',
        changed: true,
        clusterGroup: 'Metrics',
        metadata: {
          currentValue: '73.1%',
          baselineValue: '87.3%',
          delta: '-14.2%',
          affectedVolume: '₹3,12,000 [TEST FIXTURE]'
        },
        evidenceIds: ['ev_metric_sr_drop'],
        timestamp: Date.now() - 2500000,
        x: 240,
        y: -160,
        z: 30
      },
      {
        id: 'metric_latency_spike',
        type: 'metric',
        label: 'P95 Latency Surge (512ms)',
        importance: 0.87,
        risk: 'HIGH',
        status: 'OBSERVED',
        changed: true,
        clusterGroup: 'Metrics',
        metadata: {
          currentLatency: '512ms',
          baselineLatency: '180ms',
          increase: '+184%'
        },
        evidenceIds: ['ev_p95_spike'],
        timestamp: Date.now() - 2400000,
        x: 240,
        y: -60,
        z: 15
      },
      {
        id: 'incident_1841',
        type: 'incident',
        label: 'INC-1841: HDFC 2FA Expiry',
        importance: 0.94,
        risk: 'CRITICAL',
        status: 'OBSERVED',
        changed: true,
        clusterGroup: 'Incidents',
        metadata: {
          severity: 'P1-CRITICAL',
          impactedRail: 'HDFC Netbanking',
          detectedAt: '14:43 IST',
          status: 'INVESTIGATING'
        },
        evidenceIds: ['ev_incident_1841'],
        timestamp: Date.now() - 2400000,
        x: 240,
        y: 40,
        z: 25
      },
      {
        id: 'hyp_timeout_truncation',
        type: 'hypothesis',
        label: 'Hypothesis: 15s 2FA Timeout',
        importance: 0.91,
        risk: 'MEDIUM',
        status: 'INFERRED',
        changed: false,
        clusterGroup: 'Incidents',
        metadata: {
          matchScore: '87% match with INC-RZP-782',
          rationale: 'HDFC Bank OTP 2FA challenges require median 28s. 15s threshold aborts valid transactions prematurely.'
        },
        evidenceIds: ['ev_inc_782_ref', 'ev_otp_timing_dist'],
        timestamp: Date.now() - 2000000,
        x: 240,
        y: 140,
        z: 0
      },
      {
        id: 'metric_refund_rate',
        type: 'metric',
        label: 'Refund Volume Trend',
        importance: 0.72,
        risk: 'LOW',
        status: 'OBSERVED',
        changed: false,
        clusterGroup: 'Metrics',
        metadata: {
          rate: '0.8%',
          dailyTotal: '₹14,200',
          status: 'NORMAL'
        },
        evidenceIds: ['ev_refund_stats'],
        timestamp: Date.now() - 2000000,
        x: 240,
        y: 240,
        z: -20
      }
    ];

    // 4. ACTIONS & REVENUE IMPACT (Cluster: Actions & Revenue)
    const actionNodes: GraphNode[] = [
      {
        id: 'act_restore_timeout',
        type: 'action',
        label: 'Action: Rollback to 45s Timeout',
        importance: 0.93,
        risk: 'LOW',
        status: 'RECOMMENDED',
        changed: false,
        clusterGroup: 'Actions',
        metadata: {
          actionType: 'HOTFIX_CONFIG_ROLLBACK',
          riskTier: 'LOW',
          requiresApproval: false,
          expectedEffect: 'Restores HDFC success rate to 87.3%+'
        },
        evidenceIds: ['ev_policy_eval_01'],
        timestamp: Date.now() - 1500000,
        x: 480,
        y: 60,
        z: 10
      },
      {
        id: 'act_retry_links',
        type: 'action',
        label: 'Action: 1-Click WhatsApp Recovery',
        importance: 0.95,
        risk: 'HIGH',
        status: 'RECOMMENDED',
        changed: false,
        clusterGroup: 'Actions',
        metadata: {
          actionType: 'CUSTOMER_RECOVERY_CAMPAIGN',
          riskTier: 'HIGH',
          requiresApproval: true,
          recoverableRevenue: '₹1,90,000 (UPI) + ₹78,000 (Cards)',
          targetCustomers: '6 dropped checkouts'
        },
        evidenceIds: ['ev_recov_gmv_model'],
        timestamp: Date.now() - 1200000,
        x: 480,
        y: 160,
        z: 10
      },
      {
        id: 'rev_at_risk_gmv',
        type: 'revenue_signal',
        label: 'At-Risk GMV: ₹3.12 Lakhs',
        importance: 0.97,
        risk: 'CRITICAL',
        status: 'OBSERVED',
        changed: true,
        clusterGroup: 'Revenue',
        metadata: {
          totalAtRisk: '₹3,12,000',
          recoverableShare: '84%',
          timeWindow: 'Last 60 mins'
        },
        evidenceIds: ['ev_at_risk_gmv'],
        timestamp: Date.now() - 2200000,
        x: 480,
        y: -160,
        z: 30
      },
      {
        id: 'agent_payment_investigator',
        type: 'agent',
        label: 'Agent: Payment Investigator',
        importance: 0.88,
        risk: 'LOW',
        status: 'OBSERVED',
        changed: false,
        clusterGroup: 'Agents',
        metadata: {
          agentId: 'PaymentInvestigationAgent',
          autonomyTier: 'AUTONOMOUS',
          diagnosticsRan: 4
        },
        evidenceIds: ['ev_agent_audit'],
        timestamp: Date.now() - 1800000,
        x: 480,
        y: -60,
        z: 0
      }
    ];

    // 5. CUSTOMERS, CHECKOUTS & PAYMENTS (Cluster: Customer Journey)
    const customerNodes: GraphNode[] = [
      {
        id: 'cust_ananya_sharma',
        type: 'customer',
        label: 'Ananya Sharma (CUST_1001)',
        importance: 0.82,
        risk: 'LOW',
        status: 'OBSERVED',
        changed: true,
        clusterGroup: 'Customers',
        metadata: {
          email: 'ananya.s***@gmail.com',
          lifetimeValue: '₹45,000',
          droppedCheckout: '₹14,999 (HDFC Netbanking timeout)'
        },
        evidenceIds: ['ev_pay_failed_001'],
        timestamp: Date.now() - 1800000,
        x: 480,
        y: -240,
        z: 20
      },
      {
        id: 'cust_rahul_verma',
        type: 'customer',
        label: 'Rahul Verma (CUST_1002)',
        importance: 0.78,
        risk: 'LOW',
        status: 'OBSERVED',
        changed: true,
        clusterGroup: 'Customers',
        metadata: {
          email: 'rahul.v***@corp.in',
          lifetimeValue: '₹1,20,000',
          droppedCheckout: '₹42,500 (3DS challenge timeout)'
        },
        evidenceIds: ['ev_pay_failed_002'],
        timestamp: Date.now() - 1700000,
        x: 480,
        y: 260,
        z: -10
      },
      {
        id: 'cust_priya_patel',
        type: 'customer',
        label: 'Priya Patel (CUST_1003)',
        importance: 0.74,
        risk: 'LOW',
        status: 'OBSERVED',
        changed: false,
        clusterGroup: 'Customers',
        metadata: {
          email: 'priya.p***@live.com',
          lifetimeValue: '₹28,000',
          completedCheckout: '₹8,200 (UPI GPay Success)'
        },
        evidenceIds: ['ev_pay_success_003'],
        timestamp: Date.now() - 1600000,
        x: 240,
        y: -240,
        z: -20
      },
      {
        id: 'order_7841',
        type: 'order',
        label: 'Order #7841 (₹14,999)',
        importance: 0.75,
        risk: 'MEDIUM',
        status: 'OBSERVED',
        changed: true,
        clusterGroup: 'Orders',
        metadata: {
          amount: '₹14,999',
          items: 'Electronics / Smartphone',
          status: 'PAYMENT_PENDING'
        },
        evidenceIds: ['ev_order_7841'],
        timestamp: Date.now() - 1800000,
        x: 680,
        y: -240,
        z: 10
      },
      {
        id: 'pay_Hdfc_001',
        type: 'payment',
        label: 'pay_Hdfc_001 (Failed)',
        importance: 0.85,
        risk: 'CRITICAL',
        status: 'OBSERVED',
        changed: true,
        clusterGroup: 'Payments',
        metadata: {
          paymentId: 'pay_Hdfc_001',
          errorCode: 'GATEWAY_TIMEOUT',
          errorDescription: 'Bank 2FA verification timeout reached',
          amount: '₹14,999'
        },
        evidenceIds: ['ev_pay_001_trace'],
        timestamp: Date.now() - 1800000,
        x: 680,
        y: -140,
        z: 25
      },
      {
        id: 'pay_Upi_001',
        type: 'payment',
        label: 'pay_Upi_001 (Captured)',
        importance: 0.70,
        risk: 'LOW',
        status: 'CONFIRMED',
        changed: false,
        clusterGroup: 'Payments',
        metadata: {
          paymentId: 'pay_Upi_001',
          amount: '₹8,200',
          method: 'UPI',
          status: 'CAPTURED'
        },
        evidenceIds: ['ev_pay_upi_001'],
        timestamp: Date.now() - 1600000,
        x: 680,
        y: -40,
        z: -10
      }
    ];

    this.fullEcosystemNodes = [
      ...infraNodes,
      ...gatewayNodes,
      ...diagnosticNodes,
      ...actionNodes,
      ...customerNodes
    ];

    // EDGES WITH STATISTICAL CERTAINTY
    this.fullEcosystemEdges = [
      {
        id: 'e_dep_orchestrator',
        source: 'dep_prod_9921',
        target: 'svc_orchestrator',
        relation: 'deployed_by',
        strength: 0.95,
        confidence: 1.0,
        status: 'OBSERVED',
        evidenceIds: ['ev_commit_9921'],
        timestamp: Date.now() - 3600000,
        label: 'deployed v2.4.1-rc3'
      },
      {
        id: 'e_orchestrator_hdfc',
        source: 'svc_orchestrator',
        target: 'gw_hdfc_netbanking',
        relation: 'correlated_with',
        strength: 0.90,
        confidence: 0.87,
        status: 'CORRELATED',
        evidenceIds: ['ev_p95_spike', 'ev_git_diff_01'],
        timestamp: Date.now() - 2700000,
        label: 'correlated with timeout spike'
      },
      {
        id: 'e_hdfc_bank_cbs',
        source: 'gw_hdfc_netbanking',
        target: 'bank_hdfc_core',
        relation: 'depends_on',
        strength: 0.85,
        confidence: 0.98,
        status: 'OBSERVED',
        evidenceIds: ['ev_bank_cbs'],
        timestamp: Date.now() - 2700000,
        label: 'CBS connection'
      },
      {
        id: 'e_orchestrator_routing',
        source: 'svc_orchestrator',
        target: 'svc_smart_routing',
        relation: 'depends_on',
        strength: 0.80,
        confidence: 0.95,
        status: 'OBSERVED',
        evidenceIds: ['ev_routing_telemetry'],
        timestamp: Date.now() - 3400000,
        label: 'routes transactions'
      },
      {
        id: 'e_routing_upi',
        source: 'svc_smart_routing',
        target: 'gw_upi_gpay',
        relation: 'processed_by',
        strength: 0.92,
        confidence: 0.98,
        status: 'OBSERVED',
        evidenceIds: ['ev_upi_telemetry'],
        timestamp: Date.now() - 2600000,
        label: 'routes 54.2% volume'
      },
      {
        id: 'e_routing_icici',
        source: 'svc_smart_routing',
        target: 'gw_icici_cards',
        relation: 'processed_by',
        strength: 0.86,
        confidence: 0.96,
        status: 'OBSERVED',
        evidenceIds: ['ev_icici_telemetry'],
        timestamp: Date.now() - 2600000,
        label: 'routes 24.1% volume'
      },
      {
        id: 'e_routing_sbi',
        source: 'svc_smart_routing',
        target: 'gw_sbi_netbanking',
        relation: 'processed_by',
        strength: 0.78,
        confidence: 0.92,
        status: 'OBSERVED',
        evidenceIds: ['ev_sbi_telemetry'],
        timestamp: Date.now() - 2500000,
        label: 'routes 11.5% volume'
      },
      {
        id: 'e_routing_axis',
        source: 'svc_smart_routing',
        target: 'gw_axis_pg',
        relation: 'processed_by',
        strength: 0.75,
        confidence: 0.94,
        status: 'OBSERVED',
        evidenceIds: ['ev_axis_telemetry'],
        timestamp: Date.now() - 2500000,
        label: 'routes 10.2% volume'
      },
      {
        id: 'e_hdfc_metric_drop',
        source: 'gw_hdfc_netbanking',
        target: 'metric_payment_drop',
        relation: 'caused',
        strength: 0.98,
        confidence: 0.96,
        status: 'OBSERVED',
        evidenceIds: ['ev_telemetry_hdfc_sr'],
        timestamp: Date.now() - 2500000,
        label: '66.7% share of drop'
      },
      {
        id: 'e_hdfc_metric_latency',
        source: 'gw_hdfc_netbanking',
        target: 'metric_latency_spike',
        relation: 'caused',
        strength: 0.94,
        confidence: 0.95,
        status: 'OBSERVED',
        evidenceIds: ['ev_p95_spike'],
        timestamp: Date.now() - 2400000,
        label: '+184% latency surge'
      },
      {
        id: 'e_metric_incident',
        source: 'metric_payment_drop',
        target: 'incident_1841',
        relation: 'triggered',
        strength: 0.95,
        confidence: 1.0,
        status: 'OBSERVED',
        evidenceIds: ['ev_incident_1841'],
        timestamp: Date.now() - 2400000,
        label: 'triggered P1 Incident'
      },
      {
        id: 'e_incident_hyp',
        source: 'incident_1841',
        target: 'hyp_timeout_truncation',
        relation: 'investigated_by',
        strength: 0.88,
        confidence: 0.87,
        status: 'INFERRED',
        evidenceIds: ['ev_inc_782_ref'],
        timestamp: Date.now() - 2000000,
        label: 'matches INC-RZP-782'
      },
      {
        id: 'e_hyp_act_restore',
        source: 'hyp_timeout_truncation',
        target: 'act_restore_timeout',
        relation: 'recommended',
        strength: 0.92,
        confidence: 0.95,
        status: 'RECOMMENDED',
        evidenceIds: ['ev_policy_eval_01'],
        timestamp: Date.now() - 1500000,
        label: 'recommends config hotfix'
      },
      {
        id: 'e_metric_act_retry',
        source: 'metric_payment_drop',
        target: 'act_retry_links',
        relation: 'recommended',
        strength: 0.95,
        confidence: 0.92,
        status: 'RECOMMENDED',
        evidenceIds: ['ev_recov_gmv_model'],
        timestamp: Date.now() - 1200000,
        label: 'recovers ₹3.12L GMV'
      },
      {
        id: 'e_metric_rev',
        source: 'metric_payment_drop',
        target: 'rev_at_risk_gmv',
        relation: 'affected',
        strength: 0.98,
        confidence: 0.96,
        status: 'OBSERVED',
        evidenceIds: ['ev_at_risk_gmv'],
        timestamp: Date.now() - 2200000,
        label: '₹3.12L at-risk GMV'
      },
      {
        id: 'e_agent_investigate',
        source: 'agent_payment_investigator',
        target: 'incident_1841',
        relation: 'investigated_by',
        strength: 0.90,
        confidence: 0.98,
        status: 'OBSERVED',
        evidenceIds: ['ev_agent_audit'],
        timestamp: Date.now() - 1800000,
        label: 'diagnoses failure cascade'
      },
      {
        id: 'e_cust1_order',
        source: 'cust_ananya_sharma',
        target: 'order_7841',
        relation: 'belongs_to',
        strength: 0.95,
        confidence: 1.0,
        status: 'OBSERVED',
        evidenceIds: ['ev_order_7841'],
        timestamp: Date.now() - 1800000,
        label: 'placed ₹14,999 order'
      },
      {
        id: 'e_order_payment',
        source: 'order_7841',
        target: 'pay_Hdfc_001',
        relation: 'processed_by',
        strength: 0.95,
        confidence: 1.0,
        status: 'OBSERVED',
        evidenceIds: ['ev_pay_001_trace'],
        timestamp: Date.now() - 1800000,
        label: 'initiated payment'
      },
      {
        id: 'e_payment_gateway',
        source: 'pay_Hdfc_001',
        target: 'gw_hdfc_netbanking',
        relation: 'failed_at',
        strength: 0.98,
        confidence: 1.0,
        status: 'OBSERVED',
        evidenceIds: ['ev_pay_failed_001'],
        timestamp: Date.now() - 1800000,
        label: 'failed (2FA timeout)'
      },
      {
        id: 'e_cust2_payment',
        source: 'cust_rahul_verma',
        target: 'gw_hdfc_netbanking',
        relation: 'failed_at',
        strength: 0.85,
        confidence: 1.0,
        status: 'OBSERVED',
        evidenceIds: ['ev_pay_failed_002'],
        timestamp: Date.now() - 1700000,
        label: 'dropped ₹42,500 checkout'
      },
      {
        id: 'e_cust3_payment',
        source: 'cust_priya_patel',
        target: 'pay_Upi_001',
        relation: 'belongs_to',
        strength: 0.80,
        confidence: 1.0,
        status: 'CONFIRMED',
        evidenceIds: ['ev_pay_success_003'],
        timestamp: Date.now() - 1600000,
        label: 'completed ₹8,200 payment'
      },
      {
        id: 'e_pay_upi_gateway',
        source: 'pay_Upi_001',
        target: 'gw_upi_gpay',
        relation: 'processed_by',
        strength: 0.90,
        confidence: 1.0,
        status: 'CONFIRMED',
        evidenceIds: ['ev_upi_telemetry'],
        timestamp: Date.now() - 1600000,
        label: 'processed successfully'
      }
    ];
  }

  /**
   * Build Preset Graph
   */
  public buildPresetGraph(preset: DemoPreset): FlowGraphData {
    this.activePreset = preset;
    let relevantNodeIds: Set<string>;

    switch (preset) {
      case 'HDFC_ANOMALY':
        relevantNodeIds = new Set([
          'dep_prod_9921',
          'svc_orchestrator',
          'gw_hdfc_netbanking',
          'bank_hdfc_core',
          'metric_payment_drop',
          'metric_latency_spike',
          'incident_1841',
          'hyp_timeout_truncation',
          'act_restore_timeout',
          'act_retry_links',
          'rev_at_risk_gmv',
          'agent_payment_investigator',
          'cust_ananya_sharma',
          'order_7841',
          'pay_Hdfc_001',
          'cust_rahul_verma'
        ]);
        break;

      case 'SMART_ROUTING':
        relevantNodeIds = new Set([
          'svc_orchestrator',
          'svc_smart_routing',
          'gw_upi_gpay',
          'gw_hdfc_netbanking',
          'gw_icici_cards',
          'gw_sbi_netbanking',
          'gw_axis_pg',
          'pay_Upi_001',
          'cust_priya_patel',
          'metric_payment_drop',
          'rev_at_risk_gmv'
        ]);
        break;

      case 'FULL_CONTEXT':
      default:
        relevantNodeIds = new Set(this.fullEcosystemNodes.map(n => n.id));
        break;
    }

    const nodes = this.fullEcosystemNodes
      .filter(n => relevantNodeIds.has(n.id))
      .map(n => {
        const saved = this.manualLayoutPositions.get(n.id);
        return {
          ...n,
          x: saved?.x ?? n.x,
          y: saved?.y ?? n.y,
          z: saved?.z ?? n.z,
          pinned: saved?.pinned ?? false
        };
      });

    const edges = this.fullEcosystemEdges.filter(
      e => relevantNodeIds.has(e.source) && relevantNodeIds.has(e.target)
    );

    const titleMap: Record<DemoPreset, string> = {
      HDFC_ANOMALY: 'HDFC Netbanking Anomaly & SRE Failure Cascade',
      SMART_ROUTING: 'Smart Routing Engine & Alternate Rails Matrix',
      FULL_CONTEXT: 'RazorFlow Full Context Ecosystem Topology'
    };

    const descMap: Record<DemoPreset, string> = {
      HDFC_ANOMALY: 'Correlation between CI/CD commit dep_prod_9921, bank connector timeout truncation, and dropped customer checkouts.',
      SMART_ROUTING: 'Real-time multi-armed bandit traffic allocation, fee optimization, and payment rail health.',
      FULL_CONTEXT: 'Complete semantic graph of customers, orders, payments, infrastructure, deployments, and revenue signals.'
    };

    this.currentGraph = {
      id: `graph_${preset.toLowerCase()}`,
      title: titleMap[preset],
      description: descMap[preset],
      nodes,
      edges,
      rootNodeIds: ['dep_prod_9921', 'svc_orchestrator'],
      mode: this.activeMode,
      preset,
      timelinePoint: this.activeTimeline,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    return this.currentGraph;
  }

  public getGraph(): FlowGraphData {
    return this.currentGraph;
  }

  public setMode(mode: GraphMode): FlowGraphData {
    this.activeMode = mode;
    this.currentGraph.mode = mode;
    return this.currentGraph;
  }

  /**
   * Set Timeline Point (Visual Evolution)
   */
  public setTimelinePoint(point: TimelinePoint): FlowGraphData {
    this.activeTimeline = point;
    this.currentGraph.timelinePoint = point;

    // Timeline state filtering:
    // '09:00', '11:00', '13:00' -> Baseline / Pre-deployment (no anomaly)
    // '14:32' -> Deployment occurs
    // '15:00' -> Post-deployment anomaly surge
    // '17:00' -> Mitigation active
    const isPreDeploy = point === '09:00' || point === '11:00' || point === '13:00';
    const isMitigated = point === '17:00';

    this.currentGraph.nodes = this.currentGraph.nodes.map(n => {
      if (isPreDeploy) {
        return {
          ...n,
          changed: false,
          risk: 'LOW',
          metadata: {
            ...n.metadata,
            status: 'HEALTHY',
            successRate: n.id === 'gw_hdfc_netbanking' ? '87.3%' : n.metadata.successRate
          }
        };
      }
      if (isMitigated && (n.type === 'action' || n.id === 'gw_hdfc_netbanking')) {
        return {
          ...n,
          status: 'CONFIRMED',
          risk: 'LOW',
          metadata: {
            ...n.metadata,
            status: 'RESOLVED',
            successRate: '88.1%'
          }
        };
      }
      return n;
    });

    return this.currentGraph;
  }

  /**
   * Downstream & Upstream Impact Traversal
   */
  public calculateImpact(targetNodeId: string): ImpactAnalysisResult {
    const targetNode = this.fullEcosystemNodes.find(n => n.id === targetNodeId) || this.currentGraph.nodes[0];
    const directImpact: GraphNode[] = [];
    const indirectImpact: GraphNode[] = [];
    const visited = new Set<string>([targetNode.id]);

    // Distance-1 traversal
    this.fullEcosystemEdges.forEach(e => {
      if (e.source === targetNode.id && !visited.has(e.target)) {
        visited.add(e.target);
        const node = this.fullEcosystemNodes.find(n => n.id === e.target);
        if (node) directImpact.push(node);
      }
      if (e.target === targetNode.id && !visited.has(e.source)) {
        visited.add(e.source);
        const node = this.fullEcosystemNodes.find(n => n.id === e.source);
        if (node) directImpact.push(node);
      }
    });

    // Distance-2 traversal
    directImpact.forEach(dNode => {
      this.fullEcosystemEdges.forEach(e => {
        if (e.source === dNode.id && !visited.has(e.target)) {
          visited.add(e.target);
          const node = this.fullEcosystemNodes.find(n => n.id === e.target);
          if (node) indirectImpact.push(node);
        }
      });
    });

    return {
      targetNodeId: targetNode.id,
      targetLabel: targetNode.label,
      directImpact,
      indirectImpact,
      affectedServices: ['payment-orchestrator', 'bank-connector-service', 'checkout-api'],
      affectedPaymentMethods: ['HDFC Netbanking Connector', 'Cards 3DS Redirect'],
      affectedGateways: ['HDFC Netbanking (73.1% SR)', 'ICICI Cards (Secondary)'],
      affectedMetrics: [
        { name: 'Payment Success Rate', value: '73.1% (-14.2%)', severity: 'CRITICAL' },
        { name: 'P95 Gateway Latency', value: '512ms (+184%)', severity: 'HIGH' },
        { name: 'Checkout Conversion', value: '68.4% (-11.2%)', severity: 'HIGH' }
      ],
      affectedCustomersCount: 6, // Deterministic test fixture
      atRiskRevenueINR: 312000,   // ₹3.12 Lakhs deterministic
      evidenceSummary: [
        'Deployment dep_prod_9921 reduced bank connector timeout from 45s to 15s at 14:32 IST.',
        'HDFC Bank CBS OTP verification median latency is 28s, causing transactions to abort prematurely.',
        '6 dropped customer checkouts totaling ₹3,12,000 GMV in the active window [TEST FIXTURE].'
      ],
      confidence: 0.87,
      isDemoData: true
    };
  }

  /**
   * Edge Evidence Retrieval ("Why Connection?")
   */
  public getEdgeEvidence(sourceId: string, targetId: string): EdgeEvidenceDetail | null {
    const edge = this.fullEcosystemEdges.find(
      e => (e.source === sourceId && e.target === targetId) || (e.source === targetId && e.target === sourceId)
    );
    if (!edge) return null;

    const sourceNode = this.fullEcosystemNodes.find(n => n.id === edge.source)!;
    const targetNode = this.fullEcosystemNodes.find(n => n.id === edge.target)!;
    const isCausal = edge.relation === 'caused' || edge.relation === 'deployed_by';

    return {
      edge,
      sourceNode,
      targetNode,
      relationshipName: edge.relation.toUpperCase().replace(/_/g, ' '),
      epistemicStatus: edge.status,
      isCausal,
      confidencePercent: Math.round(edge.confidence * 100),
      evidenceItems: [
        `Observed event timestamp: ${new Date(edge.timestamp).toLocaleTimeString()}`,
        `Telemetry link strength: ${(edge.strength * 100).toFixed(0)}%`,
        edge.label ? `Annotated relationship: "${edge.label}"` : 'Direct service dependency',
        isCausal 
          ? 'Causal chain validated via CI/CD commit trace and post-action verification' 
          : 'Statistical correlation observed — distinct from formal causation.'
      ],
      timestampFormatted: new Date(edge.timestamp).toLocaleTimeString(),
      sourceTelemetry: 'RazorFlow Live Telemetry Engine [TEST FIXTURE]'
    };
  }

  /**
   * Branch Expansion (+8 Related Entities)
   */
  public expandNodeBranch(nodeId: string): FlowGraphData {
    const connectedEdges = this.fullEcosystemEdges.filter(
      e => e.source === nodeId || e.target === nodeId
    );
    const newConnectedNodeIds = new Set<string>();
    connectedEdges.forEach(e => {
      newConnectedNodeIds.add(e.source);
      newConnectedNodeIds.add(e.target);
    });

    const currentNodeIds = new Set(this.currentGraph.nodes.map(n => n.id));
    const nodesToAdd = this.fullEcosystemNodes.filter(
      n => newConnectedNodeIds.has(n.id) && !currentNodeIds.has(n.id)
    );

    this.currentGraph.nodes = [...this.currentGraph.nodes, ...nodesToAdd];
    const updatedIds = new Set(this.currentGraph.nodes.map(n => n.id));
    this.currentGraph.edges = this.fullEcosystemEdges.filter(
      e => updatedIds.has(e.source) && updatedIds.has(e.target)
    );

    return this.currentGraph;
  }

  /**
   * Branch Collapsing
   */
  public collapseNodeBranch(nodeId: string): FlowGraphData {
    const currentRootIds = new Set(this.currentGraph.rootNodeIds);
    if (currentRootIds.has(nodeId)) return this.currentGraph;

    this.currentGraph.nodes = this.currentGraph.nodes.filter(n => n.id !== nodeId);
    const updatedIds = new Set(this.currentGraph.nodes.map(n => n.id));
    this.currentGraph.edges = this.currentGraph.edges.filter(
      e => updatedIds.has(e.source) && updatedIds.has(e.target)
    );

    return this.currentGraph;
  }

  /**
   * Update and Persist Node Position
   */
  public updateNodePosition(nodeId: string, x: number, y: number, z?: number) {
    this.manualLayoutPositions.set(nodeId, { x, y, z, pinned: true });
    let found = false;
    this.currentGraph.nodes = this.currentGraph.nodes.map(n => {
      if (n.id === nodeId) {
        found = true;
        return { ...n, x, y, z: z ?? n.z, pinned: true };
      }
      return n;
    });

    if (!found) {
      const ecoNode = this.fullEcosystemNodes.find(n => n.id === nodeId);
      if (ecoNode) {
        this.currentGraph.nodes.push({
          ...ecoNode,
          x,
          y,
          z: z ?? ecoNode.z,
          pinned: true
        });
      }
    }
  }

  public resetLayout() {
    this.manualLayoutPositions.clear();
    this.currentGraph = this.buildPresetGraph(this.activePreset);
  }

  public buildDefaultOperationalGraph(): FlowGraphData {
    return this.buildPresetGraph('HDFC_ANOMALY');
  }

  public buildGraphForQuery(query: string): FlowGraphData {
    const q = query.toLowerCase();
    if (q.includes('routing') || q.includes('upi') || q.includes('traffic') || q.includes('smart')) {
      return this.buildPresetGraph('SMART_ROUTING');
    }
    if (q.includes('all') || q.includes('full') || q.includes('everything') || q.includes('ecosystem')) {
      return this.buildPresetGraph('FULL_CONTEXT');
    }
    return this.buildPresetGraph('HDFC_ANOMALY');
  }

  public filterByTimeline(period: 'baseline' | 'current'): FlowGraphData {
    if (period === 'baseline') {
      this.currentGraph.nodes = this.currentGraph.nodes
        .filter(n => n.id !== 'dep_prod_9921')
        .map(n => ({
          ...n,
          changed: false,
          risk: 'LOW',
          metadata: {
            ...n.metadata,
            status: 'HEALTHY',
            successRate: n.id === 'gw_hdfc_netbanking' ? '87.3%' : n.metadata.successRate
          }
        }));
      const nodeIds = new Set(this.currentGraph.nodes.map(n => n.id));
      this.currentGraph.edges = this.currentGraph.edges.filter(
        e => nodeIds.has(e.source) && nodeIds.has(e.target)
      );
      return this.currentGraph;
    }
    return this.setTimelinePoint('15:00');
  }
}

export const flowGraphEngine = FlowGraphEngine.getInstance();
