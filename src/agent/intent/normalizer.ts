/**
 * RazorFlow Input Normalizer
 * 
 * Takes inputs from any surface (Voice STT, Web Playground, Desktop Orb, Keyboard Shortcut)
 * and produces a single canonical RazorFlowIntent.
 */

import { RazorFlowIntent, ActionSource, PolicyRiskLevel } from '../../types/razorflow';

export interface RawInput {
  text: string;
  source?: ActionSource;
  userId?: string;
  workspaceId?: string;
  sessionId?: string;
  contextHints?: Record<string, any>;
}

export class InputNormalizer {
  /**
   * Normalize arbitrary multimodal/voice/text input into canonical RazorFlowIntent structure
   */
  public normalize(input: RawInput): RazorFlowIntent {
    const rawText = (input.text || '').trim();
    let cleaned = rawText.toLowerCase();

    // 1. Strip conversational filler and wake-word prefixes
    cleaned = cleaned.replace(/^(hey flow|flow|hey razorflow|razorflow|flo|ok flow)[,\s]+/gi, '');
    cleaned = cleaned.replace(/^(can you please|could you please|please|kindly|just|tell me|show me|find out)\s+/gi, '');
    cleaned = cleaned.replace(/[?.!]+$/g, '').trim();

    // 2. Extract key domain entities (Payment IDs, Order IDs, Error Codes)
    const entities: Record<string, any> = {};

    const payMatch = rawText.match(/\b(pay_[a-zA-Z0-9]{14,20})\b/i);
    if (payMatch) entities.paymentId = payMatch[1];

    const orderMatch = rawText.match(/\b(order_[a-zA-Z0-9]{14,20})\b/i);
    if (orderMatch) entities.orderId = orderMatch[1];

    const custMatch = rawText.match(/\b(cust_[a-zA-Z0-9]{14,20})\b/i);
    if (custMatch) entities.customerId = custMatch[1];

    const dispMatch = rawText.match(/\b(disp_[a-zA-Z0-9]{14,20})\b/i);
    if (dispMatch) entities.disputeId = dispMatch[1];

    const errorMatch = rawText.match(/\b(BAD_REQUEST_ERROR|GATEWAY_ERROR|PAYMENT_FAILED|AUTH_TIMEOUT|SERVER_ERROR)\b/i);
    if (errorMatch) entities.errorCode = errorMatch[1].toUpperCase();

    // 3. Fast Pattern Classifier
    let type: RazorFlowIntent['type'] = 'general_command';
    let riskLevel: PolicyRiskLevel = 'LOW';
    let requiresApproval = false;
    let confidence = 0.90;

    if (/^\/graph|\b(show|render|view|generate)\s+(flowgraph|context graph|investigation graph|dependency graph)\b|\bflowgraph\b/i.test(cleaned)) {
      type = 'flowgraph_query';
      confidence = 0.99;
    } else if (/^\/impact|\b(show|calculate|view)\s+impact\b|\bimpact of\b|\baffected (systems|services|customers|metrics)\b/i.test(cleaned)) {
      type = 'impact_analysis_query';
      confidence = 0.99;
    } else if (/^\/chart|\b(render|show|plot|generate)\s+chart\b|\b(success rate|failure rate|latency|refund).*(last 7 days|trend|chart|distribution|graph)\b/i.test(cleaned)) {
      type = 'chart_generation_query';
      confidence = 0.98;
    } else if (/^\/timeline|\btimeline (scrubber|view|comparison)\b/i.test(cleaned)) {
      type = 'timeline_query';
      confidence = 0.98;
    } else if (/^\/compare|what changed|what has changed|compare.*baseline|temporal.*diff|delta/i.test(cleaned)) {
      type = 'what_changed_query';
      confidence = 0.98;
    } else if (/^\/table|^\/summary|^\/briefing|what needs my attention|how is my business|business (briefing|overview|summary)|today('s)? health|pulse|gateway.*telemetry|telemetry.*chart|show.*gateway|gateway.*health|success rate.*chart|what payments|how many payments|payments (done|happened)|which gateway|performing worst|average payment|customers paid/i.test(cleaned)) {
      type = 'business_health_query';
      confidence = 0.98;
    } else if (/(create|generate|export).*(handoff|packet|brief)|engineering.*packet|handoff.*packet/i.test(cleaned)) {
      type = 'context_packet_request';
      confidence = 0.97;
    } else if (/watch.*(payment|success|rate|latency|metric|this)|monitor.*(payment|success|rate|latency)/i.test(cleaned)) {
      type = 'watch_metric_command';
      confidence = 0.96;
    } else if (/why.*(recommend|decide|suggest|do this)|decision replay|explain.*decision/i.test(cleaned)) {
      type = 'decision_replay_query';
      confidence = 0.98;
    } else if (/(continue|resume).*investigation|resume.*yesterday/i.test(cleaned)) {
      type = 'resume_investigation_query';
      confidence = 0.97;
    } else if (/deploy|github|commit|release|why.*after.*deploy|failure cascade|cascade diagram|architecture diagram|system diagram/i.test(cleaned)) {
      type = 'engineering_incident_correlation';
      confidence = 0.95;
    } else if (/investigate.*payment|something.*wrong.*payment|why.*payment.*(drop|fail|issue|spike|rate)|payment failure|refund.*(spike|unusual|increase)|investigate.*refund/i.test(cleaned)) {
      type = 'payment_investigation';
      confidence = 0.96;
    } else if (/recoverable|lost revenue|where.*losing.*(money|revenue)|revenue opportunit|revenue trend|today('s)? revenue/i.test(cleaned)) {
      type = 'revenue_opportunity_query';
      confidence = 0.95;
    } else if (/do the safe actions|execute recovery|retry.*recover|recover.*payment|process refund|create recovery workflow/i.test(cleaned)) {
      type = 'recovery_action';
      riskLevel = /refund|retry/i.test(cleaned) ? 'HIGH' : 'MEDIUM';
      requiresApproval = riskLevel === 'HIGH';
      confidence = 0.92;
    } else if (/dispute|chargeback|contest|accept dispute/i.test(cleaned)) {
      type = 'dispute_review';
      if (/accept/i.test(cleaned)) {
        riskLevel = 'CRITICAL';
        requiresApproval = true;
      }
      confidence = 0.94;
    } else if (/settlement|payout|utr|reconciliation/i.test(cleaned)) {
      type = 'settlement_audit';
      confidence = 0.95;
    } else if (/customer|who is|tell me about customer|customers with failed payments|find customer/i.test(cleaned)) {
      type = 'customer_lookup';
      confidence = 0.93;
    } else if (/what did you do|what did razorflow do|action ledger|audit log/i.test(cleaned)) {
      type = 'action_ledger_query';
      confidence = 0.99;
    } else if (/remember (this|incident)|memorize|save to memory/i.test(cleaned)) {
      type = 'memory_consolidation';
      confidence = 0.97;
    }

    const intentId = `intent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    return {
      id: intentId,
      userId: input.userId || 'user_rzp_merchant_01',
      workspaceId: input.workspaceId || 'ws_rzp_main',
      sessionId: input.sessionId || `session_${new Date().toISOString().split('T')[0]}`,
      type,
      rawQuery: rawText,
      normalizedQuery: cleaned,
      entities,
      requestedActions: [],
      confidence,
      riskLevel,
      requiresApproval,
      source: input.source || 'web',
      createdAt: Date.now(),
    };
  }
}

export const inputNormalizer = new InputNormalizer();
