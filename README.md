# RazorFlow

<div align="center">
  <h3><b>Persistent Context-Aware Agentic Work Layer for Razorpay</b></h3>
  <p><i>Open Track AI Prototype for Autonomous Merchant & Engineering Operations</i></p>
  <p>
    <img src="https://img.shields.io/badge/environment-●%20TEST%20MODE-emerald?style=for-the-badge" alt="Environment" />
    <img src="https://img.shields.io/badge/tests-44%2F44%20passing-brightgreen?style=for-the-badge" alt="Tests" />
    <img src="https://img.shields.io/badge/architecture-10--step%20agentic%20loop-blue?style=for-the-badge" alt="Architecture" />
    <img src="https://img.shields.io/badge/platform-Web%20|%20Electron%20Desktop-lightgrey?style=for-the-badge" alt="Platform" />
  </p>
</div>

---

## 1. What is RazorFlow?

**RazorFlow** is a persistent, context-aware agentic work layer designed for Razorpay merchants, operations leaders, and engineering teams. Rather than serving as another chatbot or standalone dashboard, RazorFlow acts as an **autonomous operational execution layer** that connects Razorpay payment telemetry, microservice observability, policy guardrails, and human sign-offs.

It solves the operational gap between **observing an anomaly** and **safely resolving it** by continuously maintaining context across daily business briefings, root-cause payment failure investigations, recoverable revenue workflows, and auditable action ledgers.

---

## 2. The Core 10-Step Execution Loop

Every operational interaction in RazorFlow passes through a canonical, deterministic execution pipeline:

```
Intent
  ↓  (Input Normalizer: text, voice STT, desktop orb)
Context
  ↓  (Context Engine: Role, Workspace, Live Telemetry, Heuristics, Token Budget)
Reasoning
  ↓  (Specialized Sub-Agents: Evidence formulation, failure code breakdown, timeline match)
Plan
  ↓  (Action Proposal: Targeted tools, parameters, expected effects)
Policy & Safety
  ↓  (Policy Engine: LOW, MEDIUM, HIGH, CRITICAL risk classification)
Tool Selection
  ↓  (Tool Registry: Schema validation, timeout race, idempotency key)
Execution
  ↓  (Tool Executor: Razorpay API / recovery dispatch with exponential retry backoff)
Verification
  ↓  (Verification Engine: Direct post-action state check against external APIs)
Audit
  ↓  (Action Ledger: Immutable cryptographic audit trail with correlation IDs)
Memory
     (Multi-Tier Memory Architecture: Working, Operational, Session & Long-Term)
```

---

## 3. Specialized Agent System

RazorFlow provisions 8 dedicated sub-agents tailored to fintech operations:

| Agent | Purpose | Primary Triggers |
| :--- | :--- | :--- |
| **BusinessHealthAgent** | Synthesizes GMV, success rates, failure spikes, recoverable revenue, disputes, and settlements into a daily executive briefing. | *"Flow, tell me what needs my attention today."* |
| **PaymentInvestigationAgent** | Isolates bank gateway failure spikes, analyzes failure codes, correlates with recent releases, and matches historical post-mortems with exact confidence scores. | *"Why did payment success rate drop?"*, *"Investigate payment drop."* |
| **RevenueOpportunityAgent** | Scans soft-declined UPI orders and card 3DS drop-offs to model recoverable GMV. | *"Where am I losing potential revenue?"* |
| **RecoveryAdvisorAgent** | Formulates 1-click WhatsApp/SMS recovery retry proposals with estimated recovery values. | *"Do the safe actions."*, *"Execute recovery."* |
| **DisputeInsightAgent** | Monitors chargeback deadlines and evidence requirements, gating irreversible dispute acceptance behind `CRITICAL` approval. | *"What disputes are open?"* |
| **SettlementInsightAgent** | Reconciles payouts, gateway fees, GST, and UTR tracking across payment batches. | *"Audit settlement payouts."* |
| **CustomerContextAgent** | Assembles 360-degree customer payment histories with automated PII masking. | *"Who is customer cust_9921?"* |
| **EngineeringAgent** | Correlates payment anomalies with CI/CD deployment logs (`dep_prod_9921`) and historical SRE incident reports (`INC-RZP-782`). | *"Why did failures increase after latest deploy?"* |

---

## 4. Razorpay Integration & Webhook Layer

Located in `src/integrations/razorpay/`:
* **API Client (`client.ts`)**: Typed client supporting Basic Auth, exponential retry backoff on 5xx errors, correlation header forwarding (`x-razorflow-trace-id`), and deterministic Test Mode simulation fallback.
* **Domain Adapters**: Payments, Orders, Customers, Idempotent Refunds (`razorpay-idempotency-key`), Settlements, and Disputes.
* **Webhook Receiver (`webhooks/receiver.ts`)**: Verifies HMAC-SHA256 signatures (`x-razorpay-signature`), deduplicates events using bounded event caches, and translates raw webhooks into typed domain events (`PaymentFailureEvent`).
* **Deterministic Fixtures (`fixtures.ts`)**: Built-in test datasets reflecting HDFC Netbanking gateway failure spikes, recoverable UPI/Card transactions, chargebacks, and settlements.

---

## 5. Policy Engine & Human-in-the-Loop Guardrails

RazorFlow strictly enforces that **no high-risk financial mutation occurs without explicit operator authorization**:

| Risk Level | Policy Behavior | Allowed Tools |
| :--- | :--- | :--- |
| **LOW** | Auto-executes immediately | `razorpay.payment.list`, `razorpay.dispute.fetch`, `engineering.deployments.list` |
| **MEDIUM** | Auto-executes with log notification | `action.ledger.query`, `memory.update` |
| **HIGH** | Requires explicit Human Sign-Off | `razorpay.refund.create`, `recovery.retry_batch` |
| **CRITICAL** | Requires strict confirmation & multi-step approval | `razorpay.dispute.accept` |

All pending approvals surface in the **Approvals Center** with complete transparency into **What, Why, Expected Effect, Risk Level, and Data Used**.

---

## 6. Multi-Tier Memory Architecture

* **Working Memory**: Ephemeral state for active multi-step reasoning.
* **Session Memory**: Context retained during the active session.
* **Operational Memory**: Merchant-specific operational heuristics (e.g. HDFC 45s morning timeout rule, WhatsApp recovery SLA).
* **Workspace Memory**: Business targets (e.g., target 95% SLA, escalation thresholds).
* **Long-Term Memory**: Post-mortem resolutions and historical incident knowledge base.

---

## 7. Dual Surface: Desktop Orb + Control Center

* **Desktop Orb (`src/components/FloatingAssistant.tsx`)**: Lightweight, persistent desktop widget displaying active mission status (e.g., `● INVESTIGATING: Payment Drop`), approval badges, and voice/quick command entry.
* **Control Center (`playground/client/`)**: Full operational workbench featuring:
  1. **Overview**: Live business signals, success rate pulse, and anomaly alerts.
  2. **Investigations**: Root-cause diagnostic workbench with failure breakdown tables and timeline correlation.
  3. **Agent Runs**: 10-step runtime trace inspector.
  4. **Approvals**: Action review queue for gated operations.
  5. **Action Ledger**: Cryptographically verifiable audit log.
  6. **Context Engine**: Context hierarchy inspector & token budget meter.
  7. **Tool Registry**: Registered tools, schemas, and risk policies.
  8. **Memory**: Operational heuristics and post-mortem memory explorer.
  9. **Settings**: Operating persona switcher (`merchant` vs `engineer`), Test Mode API keys, and webhook secrets.

---

## 8. Local Setup & Quickstart

### Prerequisites
* Node.js (v20+ recommended)
* npm (v10+)

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/MayankGarg2004/RazorFlow.git
cd RazorFlow

# 2. Install root and playground dependencies
npm install
cd playground/client && npm install && cd ../..
```

### Environment Configuration
Create a `.env` file in the root directory (defaults operate in Test Mode simulation if empty):
```env
RAZORFLOW_PORT=3000
RAZORPAY_KEY_ID=rzp_test_demo_flow_key
RAZORPAY_KEY_SECRET=rzp_test_demo_flow_secret
RAZORPAY_WEBHOOK_SECRET=rzp_test_webhook_secret_881
```

### Running Locally
```bash
# Run both Backend Server and Control Center Playground:
npm run dev

# Or run Desktop Electron Orb:
npm run dev:desktop
```

---

## 9. Running Verification & Automated Tests

RazorFlow includes an end-to-end verification suite testing all 8 phases of the architecture:

```bash
# Run automated test suite:
npm run test:razorflow

# Run TypeScript typechecker:
npm run lint
```

**Test Results**:
```
===============================================================
  🎯 TEST RESULTS: 44/44 TESTS PASSED (100%)
  🎉 RAZORFLOW PRODUCTION AGENTIC WORK LAYER FULLY VERIFIED!
===============================================================
```

---

## 10. Primary Demo Walkthrough

1. **Daily Business Briefing**:
   - Query: *"Flow, tell me what needs my attention today."*
   - RazorFlow returns a structured briefing highlighting the HDFC payment drop, recoverable GMV, and upcoming dispute deadlines.
2. **Root-Cause Investigation**:
   - Query: *"Investigate the payment drop."*
   - RazorFlow isolates 15s gateway timeouts, correlates with release `dep_prod_9921`, and matches historical incident `INC-RZP-782` with 87% confidence.
3. **Safe Action Sign-Off**:
   - Query: *"Do the safe actions."*
   - RazorFlow triggers `HIGH` risk policy gate, presents the approval card in the UI, and issues recovery links upon human authorization.
4. **Action Ledger Playback**:
   - Query: *"What did RazorFlow do?"*
   - RazorFlow queries the immutable Action Ledger and outputs the exact verified execution log.
5. **Memory Consolidation**:
   - Query: *"Remember this incident in operational memory."*
   - RazorFlow saves the 45-second timeout rule to Operational Memory for future sessions.

---

## 11. Known Limitations & Production Roadmap

* **Single-Node In-Memory Storage**: Current pending approvals and idempotency caches reside in memory and `idb-keyval`. Production multi-pod scaling requires external Redis and PostgreSQL with Row-Level Security (RLS).
* **Live Bank Integration**: Default configuration operates strictly in `● TEST MODE (NO REAL MONEY)`. Live production transfers require merchant KYC and production Razorpay credentials.
* **Vector Embeddings**: Memory retrieval uses keyword/category metadata filtering; semantic search via `pgvector`/Pinecone is on the post-hackathon roadmap.

---

## License

MIT License — Built for the RazorFlow Open Track Prototype.
