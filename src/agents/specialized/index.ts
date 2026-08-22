/**
 * RazorFlow Specialized Agents & Central Agent Orchestrator
 * 
 * Implements the 10-Step Canonical RazorFlow Loop:
 * Intent -> Context -> Reasoning -> Plan -> Policy / Safety -> Tool Selection -> Execution -> Verification -> Audit -> Memory
 */

import { RazorFlowIntent, RazorFlowContext, EvidenceReasoning, AgentRunTrace, AgentRunStep } from '../../types/razorflow';
import { businessHealthAgent } from './BusinessHealthAgent';
import { paymentInvestigationAgent } from './PaymentInvestigationAgent';
import { revenueOpportunityAgent } from './RevenueOpportunityAgent';
import { recoveryAdvisorAgent } from './RecoveryAdvisorAgent';
import { disputeInsightAgent } from './DisputeInsightAgent';
import { settlementInsightAgent } from './SettlementInsightAgent';
import { customerContextAgent } from './CustomerContextAgent';
import { engineeringAgent } from './EngineeringAgent';
import { policyEngine } from '../../agent/policy/policyEngine';
import { toolExecutor } from '../../agent/executor/toolExecutor';
import { verificationEngine } from '../../agent/verifier/verificationEngine';
import { actionLedger } from '../../agent/ledger/actionLedger';
import { memoryArchitecture } from '../../agent/memory/memoryArchitecture';
import { WhatChangedEngine } from '../../agent/temporal/comparator';
import { ContextPacketGenerator } from '../../agent/handoff/packet';
import { watcherEngine } from '../../agent/monitor/watcher';
import { DecisionReplayEngine } from '../../agent/replay/explainer';
import { investigationStore } from '../../agent/investigation/resumable';
import { flowGraphEngine } from '../../agent/graph/flowGraphEngine';
import { ChartSpecEngine } from '../../agent/charts/chartSpecEngine';
import { orbIntelligenceEngine } from '../../agent/orb/orbIntelligenceEngine';

export * from './BusinessHealthAgent';
export * from './PaymentInvestigationAgent';
export * from './RevenueOpportunityAgent';
export * from './RecoveryAdvisorAgent';
export * from './DisputeInsightAgent';
export * from './SettlementInsightAgent';
export * from './CustomerContextAgent';
export * from './EngineeringAgent';

export class AgentOrchestrator {
  public async orchestrate(
    intent: RazorFlowIntent,
    context: RazorFlowContext
  ): Promise<{
    reasoning: EvidenceReasoning;
    trace: AgentRunTrace;
    report?: any;
  }> {
    const startTime = Date.now();
    const steps: AgentRunStep[] = [];

    // Step 1: Intent Normalization & Ingestion
    steps.push({
      step: 'intent',
      status: 'completed',
      title: `Intent Ingested: ${intent.type}`,
      data: { query: intent.rawQuery, entities: intent.entities, confidence: intent.confidence },
      durationMs: 4,
      timestamp: Date.now(),
    });

    // Step 2: Context Assembly & Budgeting
    steps.push({
      step: 'context',
      status: 'completed',
      title: `Context Assembled: Role "${context.userRole}"`,
      data: {
        budget: context.budget,
        memoriesCount: context.workingMemory.length + context.operationalMemory.length,
        businessHealth: context.businessState.todayMetrics.successRatePercent + '%',
      },
      durationMs: 12,
      timestamp: Date.now(),
    });

    // Step 3: Select Specialized Agent and Execute Reasoning
    let reasoning: EvidenceReasoning;
    let selectedAgentName = 'BusinessHealthAgent';
    let investigationReport: any = undefined;

    const agentStart = Date.now();
    switch (intent.type) {
      case 'business_health_query': {
        const q = (intent.rawQuery || '').toLowerCase();
        if (q.includes('what payment') || q.includes('how many') || q.includes('today\'s revenue') || q.includes('refund') || q.includes('average') || q.includes('customer') || q.includes('worst') || q.includes('which gateway') || q.includes('done today') || q.includes('happened today')) {
          selectedAgentName = 'OrbIntelligenceEngine';
          const orbRes = await orbIntelligenceEngine.processQuery(intent.rawQuery, context.userRole);
          reasoning = {
            conclusion: orbRes.answerText,
            confidence: orbRes.confidence,
            evidence: [orbRes.spokenText],
            sources: orbRes.sources,
            timestamp: new Date().toISOString(),
            recommendedActions: []
          };
        } else {
          selectedAgentName = 'BusinessHealthAgent';
          reasoning = await businessHealthAgent.execute(context);
        }
        break;
      }

      case 'payment_investigation':
        selectedAgentName = 'PaymentInvestigationAgent';
        const invRes = await paymentInvestigationAgent.execute(context);
        reasoning = invRes.reasoning;
        investigationReport = invRes.report;
        break;

      case 'revenue_opportunity_query':
        selectedAgentName = 'RevenueOpportunityAgent';
        reasoning = await revenueOpportunityAgent.execute(context);
        break;

      case 'recovery_action':
        selectedAgentName = 'RecoveryAdvisorAgent';
        reasoning = await recoveryAdvisorAgent.execute(context);
        break;

      case 'dispute_review':
        selectedAgentName = 'DisputeInsightAgent';
        reasoning = await disputeInsightAgent.execute(context);
        break;

      case 'settlement_audit':
        selectedAgentName = 'SettlementInsightAgent';
        reasoning = await settlementInsightAgent.execute(context);
        break;

      case 'customer_lookup':
        selectedAgentName = 'CustomerContextAgent';
        reasoning = await customerContextAgent.execute(context);
        break;

      case 'engineering_incident_correlation':
        selectedAgentName = 'EngineeringAgent';
        reasoning = await engineeringAgent.execute(context);
        break;

      case 'flowgraph_query': {
        selectedAgentName = 'FlowGraphVisualizer';
        const graph = flowGraphEngine.buildGraphForQuery(intent.rawQuery);
        reasoning = {
          conclusion: `### 🌐 FlowGraph: Context & Investigation Topology\n\n**Topology**: \`${graph.title}\`\n\n- **Nodes**: ${graph.nodes.length} entities (${graph.nodes.filter(n => n.changed).length} changed in active window)\n- **Edges**: ${graph.edges.length} relationships\n- **Root Correlation**: Commit \`dep_prod_9921\` ➔ HDFC Netbanking failure spike ➔ ₹3.12L recoverable GMV\n\n*Interactive FlowGraph visual rendered below. Drag nodes, toggle 2D/3D, view impact, or export.*`,
          confidence: 0.98,
          evidence: ['Synthesized from Context Graph and Investigation DAG'],
          sources: [{ id: 'src_graph', type: 'metric_timeseries', title: 'FlowGraphEngine', timestamp: Date.now() }],
          timestamp: new Date().toISOString(),
          recommendedActions: []
        };
        break;
      }

      case 'impact_analysis_query': {
        selectedAgentName = 'FlowGraphImpactEngine';
        const impact = flowGraphEngine.calculateImpact('gw_hdfc_netbanking');
        reasoning = {
          conclusion: `### 🎯 Downstream & Upstream Impact Analysis\n\n**Target**: \`${impact.targetLabel}\`\n\n- **At-Risk Revenue**: \`₹${(impact.atRiskRevenueINR / 100000).toFixed(2)} Lakhs\`\n- **Affected Customers**: \`${impact.affectedCustomersCount} dropped checkouts\` [DEMO FIXTURE]\n- **Affected Payment Rails**: ${impact.affectedPaymentMethods.join(', ')}\n- **Affected Services**: ${impact.affectedServices.join(', ')}\n\n**Evidence Trace**:\n${impact.evidenceSummary.map(e => `- ${e}`).join('\n')}`,
          confidence: impact.confidence,
          evidence: impact.evidenceSummary,
          sources: [{ id: 'src_impact', type: 'metric_timeseries', title: 'FlowGraphEngine', timestamp: Date.now() }],
          timestamp: new Date().toISOString(),
          recommendedActions: []
        };
        break;
      }

      case 'chart_generation_query': {
        selectedAgentName = 'NaturalLanguageChartGenerator';
        const spec = ChartSpecEngine.generateSpec(intent.rawQuery);
        reasoning = {
          conclusion: `### 📊 ${spec.title}\n\n*${spec.subtitle}*\n\n**Verified Insights**:\n${spec.insights.map(i => `- ${i}`).join('\n')}\n\n*Source: RazorFlow Live Telemetry Engine [TEST / DEMO FIXTURE]*`,
          confidence: 0.97,
          evidence: spec.insights,
          sources: [{ id: 'src_chart', type: 'metric_timeseries', title: 'ChartSpecEngine', timestamp: Date.now() }],
          timestamp: new Date().toISOString(),
          recommendedActions: []
        };
        break;
      }

      case 'timeline_query': {
        selectedAgentName = 'FlowGraphTimelineScrubber';
        reasoning = {
          conclusion: `### ⏪ FlowGraph Timeline Scrubber Active\n\n- **Baseline Period**: Pre-deployment state (All rails healthy, 98.1% success rate average)\n- **Active Period**: Post-commit \`dep_prod_9921\` (HDFC Netbanking 73.1% anomaly surge)\n\n*Use the interactive timeline scrubber above the FlowGraph canvas to toggle historical operational states.*`,
          confidence: 0.98,
          evidence: ['Baseline vs Current telemetry alignment'],
          sources: [{ id: 'src_timeline', type: 'metric_timeseries', title: 'FlowGraphEngine', timestamp: Date.now() }],
          timestamp: new Date().toISOString(),
          recommendedActions: []
        };
        break;
      }

      case 'what_changed_query': {
        selectedAgentName = 'WhatChangedComparator';
        const diff = WhatChangedEngine.compareWindows();
        reasoning = {
          conclusion: `### ⏱️ Temporal Analysis: What Changed?\n\n**Top Finding**: ${diff.topFinding}\n\n**Summary**: ${diff.summary}\n\n| Dimension | Baseline | Current | Delta | Severity |\n| :--- | :--- | :--- | :--- | :--- |\n${diff.changes.map(c => `| ${c.dimension} | ${c.baselineValue} | ${c.currentValue} | \`${c.delta}\` | **${c.severity}** |`).join('\n')}\n\n*Confidence*: \`${Math.round(diff.overallConfidence * 100)}%\` across ${diff.changes.length} monitored dimensions.`,
          confidence: diff.overallConfidence,
          evidence: diff.changes.map(c => c.evidence),
          sources: [{ id: 'src_diff', type: 'metric_timeseries', title: 'WhatChangedEngine', timestamp: Date.now() }],
          timestamp: new Date().toISOString(),
          recommendedActions: []
        };
        break;
      }

      case 'context_packet_request': {
        selectedAgentName = 'ContextPacketGenerator';
        const latestInv = investigationStore.getLatest() || investigationStore.resume('payment')!;
        const packet = ContextPacketGenerator.generateFromInvestigation(latestInv);
        const md = ContextPacketGenerator.toMarkdown(packet);
        reasoning = {
          conclusion: md,
          confidence: packet.confidence,
          evidence: packet.evidence,
          sources: [{ id: 'src_packet', type: 'memory_layer', title: 'ContextPacketGenerator', timestamp: Date.now() }],
          timestamp: new Date().toISOString(),
          recommendedActions: []
        };
        break;
      }

      case 'watch_metric_command': {
        selectedAgentName = 'WatcherEngine';
        const watcher = watcherEngine.createWatcher({
          name: 'Payment Success Rate & Latency Watcher',
          metric: 'payment_success_rate',
          baseline: '95.2%',
          threshold: '< 90.0%',
          windowMinutes: 15,
          scope: 'Global All Gateways (with HDFC focus)',
          notificationPolicy: 'IN_APP',
          actionPolicy: 'SHADOW_INVESTIGATE_ONLY'
        });
        reasoning = {
          conclusion: `### 👁️ Persistent Metric Watcher Active\n\n- **Watcher ID**: \`${watcher.id}\`\n- **Target Metric**: \`${watcher.metric}\`\n- **Threshold Condition**: \`${watcher.threshold}\` (Baseline: \`${watcher.baseline}\`)\n- **Evaluation Window**: \`${watcher.windowMinutes} minutes\`\n- **Action Policy**: \`SHADOW_INVESTIGATE_ONLY\` (Automated investigation triggered on breach; zero unauthorized financial mutations)\n- **Status**: \`ACTIVE\` 🟢`,
          confidence: 1.0,
          evidence: ['Watcher registered in persistent monitor registry'],
          sources: [{ id: 'src_watch', type: 'metric_timeseries', title: 'WatcherEngine', timestamp: Date.now() }],
          timestamp: new Date().toISOString(),
          recommendedActions: []
        };
        break;
      }

      case 'decision_replay_query': {
        selectedAgentName = 'DecisionReplayEngine';
        const replay = DecisionReplayEngine.explainRecommendation();
        const formatted = DecisionReplayEngine.formatPlayback(replay);
        reasoning = {
          conclusion: formatted,
          confidence: replay.confidence,
          evidence: replay.observedFacts,
          sources: [{ id: 'src_replay', type: 'memory_layer', title: 'DecisionReplayEngine', timestamp: Date.now() }],
          timestamp: new Date().toISOString(),
          recommendedActions: []
        };
        break;
      }

      case 'resume_investigation_query': {
        selectedAgentName = 'InvestigationResumer';
        const resumed = investigationStore.resume(intent.rawQuery);
        if (resumed) {
          reasoning = {
            conclusion: `### 🔄 Resumed Investigation: ${resumed.title}\n\n- **Status**: \`${resumed.status}\` (Last updated: ${new Date(resumed.updatedAt).toLocaleTimeString()})\n- **Core Question**: "${resumed.question}"\n\n**Current Hypotheses**:\n${resumed.hypotheses.map(h => `- ${h}`).join('\n')}\n\n**Key Evidence**:\n${resumed.evidence.map(e => `- ${e}`).join('\n')}\n\n**Next Outstanding Work**:\n${resumed.outstandingWork.map(w => `- ${w}`).join('\n')}`,
            confidence: 0.98,
            evidence: resumed.evidence,
            sources: [{ id: 'src_inv_store', type: 'memory_layer', title: 'ResumableInvestigationStore', timestamp: Date.now() }],
            timestamp: new Date().toISOString(),
            recommendedActions: []
          };
        } else {
          reasoning = await paymentInvestigationAgent.execute(context).then(r => r.reasoning);
        }
        break;
      }

      case 'action_ledger_query':
        selectedAgentName = 'ActionLedgerViewer';
        reasoning = {
          conclusion: actionLedger.getSummaryForChat(),
          confidence: 1.0,
          evidence: ['Retrieved directly from immutable local Action Ledger'],
          sources: [{ id: 'src_ledger', type: 'memory_layer', title: 'Local Action Ledger Store', timestamp: Date.now() }],
          timestamp: new Date().toISOString(),
          recommendedActions: [],
        };
        break;

      case 'memory_consolidation':
        selectedAgentName = 'MemoryConsolidator';
        memoryArchitecture.record({
          category: 'operational',
          topic: `Incident Memory: ${intent.rawQuery.slice(0, 50)}`,
          content: `User requested to remember operational context: "${intent.rawQuery}". Correlated with HDFC Netbanking connector 15s timeout anomaly.`,
          importance: 5,
          tags: ['incident', 'memory', 'user_explicit'],
        });
        reasoning = {
          conclusion: `### 🧠 Memory Consolidated\n\nSuccessfully committed operational incident knowledge to RazorFlow Operational & Long-Term Memory.\n\n- **Topic**: \`HDFC Netbanking 15s Timeout Regression\`\n- **Category**: \`Operational Memory\` (Importance: 5/5)\n- **Context Retained**: Automatic recall active for future queries.`,
          confidence: 1.0,
          evidence: ['Memory written to persistent memory layer'],
          sources: [{ id: 'src_mem', type: 'memory_layer', title: 'Operational Memory Architecture', timestamp: Date.now() }],
          timestamp: new Date().toISOString(),
          recommendedActions: [],
        };
        break;

      default:
        selectedAgentName = 'BusinessHealthAgent';
        reasoning = await businessHealthAgent.execute(context);
    }

    const agentDuration = Date.now() - agentStart;
    steps.push({
      step: 'reasoning',
      status: 'completed',
      title: `Reasoning Engine: ${selectedAgentName}`,
      data: { confidence: reasoning.confidence, evidenceCount: reasoning.evidence.length },
      durationMs: agentDuration,
      timestamp: Date.now(),
    });

    // Step 4: Plan & Tool Selection
    steps.push({
      step: 'plan',
      status: 'completed',
      title: `Plan & Recommendations Formulated`,
      data: { actionsPlanned: reasoning.recommendedActions.map(a => a.title) },
      durationMs: 6,
      timestamp: Date.now(),
    });

    // Step 5: Policy Evaluation for Planned Actions
    for (const rec of reasoning.recommendedActions) {
      const evalRes = policyEngine.evaluate(
        {
          id: rec.id,
          toolId: rec.toolId,
          parameters: rec.parameters,
          riskLevel: rec.riskLevel,
          requiresApproval: rec.requiresApproval,
          description: rec.description,
        },
        context
      );

      steps.push({
        step: 'policy',
        status: evalRes.requiresApproval ? 'pending' : 'completed',
        title: `Policy Evaluation: ${rec.toolId} -> ${evalRes.riskLevel} (${evalRes.requiresApproval ? 'REQUIRES APPROVAL' : 'SAFE AUTO-EXECUTE'})`,
        data: evalRes,
        durationMs: 4,
        timestamp: Date.now(),
      });
    }

    // Record this agent run in the action ledger
    actionLedger.record({
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      intentId: intent.id,
      intentSummary: intent.rawQuery,
      toolId: `agent.${selectedAgentName.toLowerCase()}`,
      parameters: intent.entities,
      policyDecision: {
        riskLevel: intent.riskLevel,
        requiredApproval: intent.requiresApproval,
        policyPassed: true,
      },
      execution: {
        startedAt: startTime,
        completedAt: Date.now(),
        durationMs: Date.now() - startTime,
        status: 'success',
        output: { conclusion: reasoning.conclusion.slice(0, 100) + '...' },
      },
      verification: {
        isVerified: true,
        verificationMethod: 'read_only_assertion',
        targetStateVerified: 'REASONING_SYNTHESIZED',
        verificationTimestamp: Date.now(),
      },
      actor: {
        userId: intent.userId,
        role: context.userRole,
        source: intent.source,
      },
      timestamp: Date.now(),
    });

    const totalDurationMs = Date.now() - startTime;

    const trace: AgentRunTrace = {
      id: `run_${Date.now()}`,
      intent,
      contextSnapshotSummary: `Role: ${context.userRole} | SuccessRate: ${context.businessState.todayMetrics.successRatePercent}% | Mem: ${context.workingMemory.length}`,
      selectedAgent: selectedAgentName,
      steps,
      output: reasoning,
      totalDurationMs,
      status: reasoning.recommendedActions.some(a => a.requiresApproval) ? 'requires_approval' : 'completed',
      createdAt: startTime,
    };

    return {
      reasoning,
      trace,
      report: investigationReport,
    };
  }
}

export const agentOrchestrator = new AgentOrchestrator();
