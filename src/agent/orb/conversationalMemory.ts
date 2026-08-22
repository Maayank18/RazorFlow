/**
 * RazorFlow Multi-Turn Conversational Memory
 * 
 * Preserves operational context across turns so follow-up queries like:
 * "Which gateway?", "What about yesterday?", "Show it as a chart", "Make it a bar chart", "Copy it"
 * resolve seamlessly without forcing the user to repeat parameters.
 */

import { OperationalDataResult, OperationalEntity, TimeRangeExpression } from '../retrieval/operationalDataEngine';

export interface TurnContext {
  turnId: string;
  userQuery: string;
  normalizedQuery: string;
  resolvedEntity: OperationalEntity;
  resolvedTimeRange: TimeRangeExpression;
  resolvedFilters: Record<string, any>;
  resolvedDimensions: string[];
  lastResult?: OperationalDataResult;
  lastChartType?: 'bar' | 'line' | 'pie' | 'scatter' | 'table';
  lastChartSpec?: any;
  targetNodeId?: string;
  timestamp: number;
}

export class ConversationalMemoryStore {
  private static instance: ConversationalMemoryStore;
  private turns: TurnContext[] = [];
  private maxTurns = 20;

  public static getInstance(): ConversationalMemoryStore {
    if (!ConversationalMemoryStore.instance) {
      ConversationalMemoryStore.instance = new ConversationalMemoryStore();
    }
    return ConversationalMemoryStore.instance;
  }

  public recordTurn(turn: Omit<TurnContext, 'turnId' | 'timestamp'>): TurnContext {
    const newTurn: TurnContext = {
      ...turn,
      turnId: `turn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };
    this.turns.push(newTurn);
    if (this.turns.length > this.maxTurns) {
      this.turns.shift();
    }
    return newTurn;
  }

  public getLastTurn(): TurnContext | null {
    return this.turns.length > 0 ? this.turns[this.turns.length - 1] : null;
  }

  public clear(): void {
    this.turns = [];
  }

  /**
   * Resolves anaphoric references like "it", "those", "that", "yesterday", "which gateway"
   */
  public resolveContextualQuery(rawQuery: string): {
    isFollowUp: boolean;
    entity: OperationalEntity;
    timeRange: TimeRangeExpression;
    filters: Record<string, any>;
    dimensions: string[];
    requestedChartType?: 'bar' | 'line' | 'pie' | 'scatter';
    isCopyRequest: boolean;
    isInvestigationRequest: boolean;
    isRelationshipRequest: boolean;
  } {
    const q = rawQuery.toLowerCase().trim();
    const last = this.getLastTurn();

    let entity: OperationalEntity = last?.resolvedEntity || 'payments';
    let timeRange: TimeRangeExpression = last?.resolvedTimeRange || 'today';
    let filters: Record<string, any> = { ...(last?.resolvedFilters || {}) };
    let dimensions: string[] = [...(last?.resolvedDimensions || [])];
    let requestedChartType: 'bar' | 'line' | 'pie' | 'scatter' | undefined = undefined;
    let isCopyRequest = false;
    let isInvestigationRequest = false;
    let isRelationshipRequest = false;
    let isFollowUp = false;

    // Check for follow-up patterns
    const isShortQuery = q.length < 30 && (
      q === 'today?' || q === 'yesterday?' || q === 'why?' || q === 'why did it drop?' ||
      q.includes('which gateway') || q.includes('what about yesterday') ||
      q.includes('failed ones') || q.includes('show that') || q.includes('show me that') ||
      q.includes('as a chart') || q.includes('bar chart') || q.includes('pie chart') || q.includes('line graph') ||
      q === 'copy it' || q === 'copy this' || q.includes('relationship')
    );

    if (last && (isShortQuery || /^(which|what about|how about|show (it|that|this)|make it|copy (it|this)|why did (it|that)|why\?|compare with|now show)/i.test(q))) {
      isFollowUp = true;
    }

    // Follow-up: Gateway breakdown ("which gateway?", "break it down by gateway")
    if (/which gateway|by gateway|breakdown by gateway|which bank/i.test(q)) {
      isFollowUp = true;
      dimensions = ['gateway'];
    }

    // Follow-up: Time range switch ("what about yesterday?", "yesterday?", "last 7 days")
    if (/\byesterday\b/i.test(q)) {
      isFollowUp = true;
      timeRange = 'yesterday';
    } else if (/\blast 7 days\b|\bpast week\b|\blast week\b/i.test(q)) {
      isFollowUp = true;
      timeRange = 'last_7_days';
    } else if (/\btoday\b/i.test(q)) {
      timeRange = 'today';
    }

    // Follow-up: Failure filter ("failed ones?", "how many failed?")
    if (/\bfailed\b|\bfailures\b/i.test(q)) {
      filters.status = 'failed';
    }

    // Follow-up: Chart type requests
    if (/\bbar\b/i.test(q)) {
      requestedChartType = 'bar';
      isFollowUp = true;
    } else if (/\bline\b/i.test(q) || /\btrend\b/i.test(q) || /\blast 7 days\b/i.test(q)) {
      requestedChartType = 'line';
      isFollowUp = true;
    } else if (/\bpie\b/i.test(q) || /\bdistribution\b/i.test(q)) {
      requestedChartType = 'pie';
      isFollowUp = true;
    } else if (/\bscatter\b/i.test(q)) {
      requestedChartType = 'scatter';
      isFollowUp = true;
    } else if (/\b(show (it|that|this)|show me that|chart (it|this)|plot (it|this)|make (it|that) a chart)\b/i.test(q)) {
      requestedChartType = dimensions.includes('gateway') ? 'bar' : (timeRange.includes('7') ? 'line' : 'bar');
      isFollowUp = true;
    }

    // Follow-up: Copy request
    if (/^copy (it|this|that|data|table|chart)/i.test(q)) {
      isCopyRequest = true;
      isFollowUp = true;
    }

    // Follow-up: Investigation trigger ("why did it drop yesterday?", "why did it drop?", "why?")
    if (/why did (it|payments|that) (drop|fail)|why.*drop.*yesterday|why\?/i.test(q)) {
      isInvestigationRequest = true;
      isFollowUp = true;
    }

    // Follow-up: Relationship / FlowGraph trigger ("show me the relationship", "show graph")
    if (/show.*(relationship|connection|flowgraph|graph)/i.test(q)) {
      isRelationshipRequest = true;
      isFollowUp = true;
    }

    return {
      isFollowUp,
      entity,
      timeRange,
      filters,
      dimensions,
      requestedChartType,
      isCopyRequest,
      isInvestigationRequest,
      isRelationshipRequest,
    };
  }
}

export const conversationalMemory = ConversationalMemoryStore.getInstance();
