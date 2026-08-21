# RazorFlow Architecture & Operational System Design

RazorFlow is an **autonomous, persistent, context-aware agentic work layer** designed for business operators, merchant teams, and site reliability engineers operating on Razorpay infrastructure.

---

## 1. System Architecture

```
                                    ┌───────────────────────┐
                                    │    USER INTERFACE     │
                                    │  Desktop Orb / Web CC │
                                    └───────────┬───────────┘
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │   INPUT NORMALIZER    │
                                    │ Text / Voice / Action │
                                    └───────────┬───────────┘
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │    CONTEXT ENGINE     │
                                    │ Role, State & Memory  │
                                    └───────────┬───────────┘
                                                │
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                SPECIALIZED AGENT RUNTIME                               │
├─────────────────────┬──────────────────────┬────────────────────┬──────────────────────┤
│ BusinessHealthAgent │ PaymentInvestAgent   │ RevenueOppAgent    │ RecoveryAdvisorAgent │
├─────────────────────┼──────────────────────┼────────────────────┼──────────────────────┤
│ DisputeInsightAgent │ SettlementAgent      │ CustomerContext    │ EngineeringAgent     │
└─────────────────────┴──────────────────────┴────────────────────┴──────────────────────┘
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │     POLICY ENGINE     │
                                    │  LOW/MED/HIGH/CRITICAL │
                                    └───────────┬───────────┘
                                                │
                          ┌─────────────────────┴─────────────────────┐
                          │                                           │
                    [LOW / MEDIUM]                               [HIGH / CRITICAL]
                          │                                           │
                          ▼                                           ▼
              ┌───────────────────────┐                   ┌───────────────────────┐
              │     TOOL EXECUTOR     │                   │  APPROVALS GATEWAY    │
              │  Idempotent Execution │                   │  Human-in-the-Loop    │
              └───────────┬───────────┘                   └───────────┬───────────┘
                          │                                           │
                          ▼                                           │ (Signed Off)
              ┌───────────────────────┐                               │
              │  VERIFICATION ENGINE  │◄──────────────────────────────┘
              │ Direct External Check │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │     ACTION LEDGER     │
              │ Immutable Audit Trail │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  OPERATIONAL MEMORY   │
              │ Heuristics & Learnings│
              └───────────────────────┘
```

---

## 2. Core Operational Workflow

1. **Intent Normalization (`src/agent/intent/normalizer.ts`)**:
   - Ingests raw natural language, voice transcription, desktop shortcut, or webhook alert.
   - Maps to canonical `RazorFlowIntent` (`business_health_query`, `payment_investigation`, `revenue_opportunity_query`, `recovery_action`, `dispute_review`, `settlement_audit`, `customer_lookup`, `engineering_incident_correlation`, `action_ledger_query`, `memory_consolidation`).

2. **Context Engine & Token Budgeting (`src/agent/context/engine.ts`)**:
   - Dynamically selects and compresses:
     - Operating Persona (`merchant` vs `engineer`)
     - Business Telemetry (GMV, Success Rate, Failure Spikes, Recoverable GMV, Disputes, Settlements)
     - Engineering Telemetry (Microservices, Latencies, Deployments, Incidents)
     - Operational Heuristics (e.g. HDFC 45s morning gateway rule, WhatsApp SLA)
     - Active Tool Schemas and Permissions
   - Strictly limits token payload under $4,096$ tokens.

3. **Specialized Agent Reasoning (`src/agents/specialized/`)**:
   - Dispatches intent to domain sub-agents.
   - Computes failure code distributions, correlates release timestamps with anomaly curves, and matches historical incident post-mortems with explicit confidence scores ($87\%$).

4. **Policy Engine & Risk Boundaries (`src/agent/policy/policyEngine.ts`)**:
   - Classifies proposals into risk tiers:
     - `LOW`: Read-only queries (auto-executes).
     - `MEDIUM`: Internal state updates and draft plans (auto-executes with log notification).
     - `HIGH`: Financial mutations, refunds, and batch recovery links (requires operator sign-off).
     - `CRITICAL`: Irreversible chargeback acceptances and payout routing (requires multi-step sign-off).

5. **Tool Execution Layer (`src/agent/executor/toolExecutor.ts`)**:
   - Enforces execution timeout racing (5,000ms limit).
   - Validates `idempotencyKey` to guarantee zero duplicate financial mutations.

6. **Post-Action State Verification (`src/agent/verifier/verificationEngine.ts`)**:
   - Re-queries the target Razorpay API or external endpoint to verify that the mutated state (e.g. `refund.status === 'processed'`) actually took effect.

7. **Immutable Action Ledger (`src/agent/ledger/actionLedger.ts`)**:
   - Logs full execution telemetry, correlation IDs (`x-razorflow-trace-id`), actor IDs, and verification badges.
   - Queryable via `/api/flow/activity` and natural language (*"What did RazorFlow do?"*).

8. **Multi-Tier Work Memory (`src/agent/memory/memoryArchitecture.ts`)**:
   - Retains operational heuristics and post-mortem incident resolutions across simulated session boundaries.

---

## 3. Official Razorpay Integration Layer

* **Typed Client (`src/integrations/razorpay/client.ts`)**: Dedicated API wrapper handling Basic Auth, timeout boundaries, transient 5xx exponential backoffs, and deterministic Test Mode simulation fallback.
* **Domain Adapters**:
  - `payments.ts`: Payments collection, status query, capture.
  - `orders.ts`: Order generation, payment association.
  - `customers.ts`: Customer lookups, PII masked profile queries.
  - `refunds.ts`: Idempotent refund generation (`razorpay-idempotency-key`).
  - `settlements.ts`: Read-only settlement payouts, fees, GST, and UTR tracking.
  - `disputes.ts`: Chargeback tracking and evidence submission.
* **Webhook Receiver (`src/integrations/razorpay/webhooks/receiver.ts`)**:
  - HMAC-SHA256 signature verification (`x-razorpay-signature`).
  - Bounded deduplication cache (10,000 unique events).
  - Domain event translation (`payment.failed` $\rightarrow$ `PaymentFailureEvent`).
