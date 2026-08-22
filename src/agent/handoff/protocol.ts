/**
 * RazorFlow Structured Agent Handoff Protocol
 * 
 * Defines typed inter-agent delegation contracts:
 * e.g., BusinessHealthAgent -> PaymentInvestigationAgent -> EngineeringAgent
 * 
 * Enforces structured payload transfer without blind full-context duplication.
 */

export type SpecializedAgentId = 
  | 'BusinessHealthAgent'
  | 'PaymentInvestigationAgent'
  | 'EngineeringAgent'
  | 'RevenueOpportunityAgent'
  | 'RecoveryAdvisorAgent'
  | 'DisputeInsightAgent'
  | 'SettlementInsightAgent'
  | 'CustomerContextAgent';

export interface AgentHandoffPayload {
  handoffId: string;
  traceId: string;
  timestamp: number;
  fromAgent: SpecializedAgentId;
  toAgent: SpecializedAgentId;
  reason: string;
  contextSummary: string;
  filteredEvidence: string[];
  previousFindings: Record<string, any>;
  requestedTask: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class AgentHandoffManager {
  private static handoffHistory: AgentHandoffPayload[] = [];

  public static createHandoff(params: Omit<AgentHandoffPayload, 'handoffId' | 'timestamp'>): AgentHandoffPayload {
    const payload: AgentHandoffPayload = {
      handoffId: `hoff_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      ...params
    };

    AgentHandoffManager.handoffHistory.push(payload);
    return payload;
  }

  public static getHistory(): AgentHandoffPayload[] {
    return [...AgentHandoffManager.handoffHistory];
  }

  public static getLatestHandoff(): AgentHandoffPayload | undefined {
    return AgentHandoffManager.handoffHistory.length > 0 
      ? AgentHandoffManager.handoffHistory[AgentHandoffManager.handoffHistory.length - 1]
      : undefined;
  }
}
