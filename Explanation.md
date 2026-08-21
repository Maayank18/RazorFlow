# RazorFlow: System Architecture & Operational Design

This document serves as the definitive guide to RazorFlow, detailing its core features, system architecture, design decisions, and backend infrastructure.

---

## 1. Project Overview

**RazorFlow** is an autonomous, persistent, context-aware agentic work layer designed for Razorpay merchants, operations managers, and Site Reliability Engineers (SREs). It operates across dual surfaces: a persistent Desktop Orb widget and a high-density Web Control Center.

Unlike standard chatbots or generic productivity trackers, RazorFlow operates as an **operational execution layer**, connecting real-time Razorpay payment telemetry, microservice observability, policy safety gates, and human sign-offs into a deterministic 10-step execution loop:

$$\mathbf{Intent} \longrightarrow \mathbf{Context} \longrightarrow \mathbf{Reasoning} \longrightarrow \mathbf{Plan} \longrightarrow \mathbf{Policy} \longrightarrow \mathbf{Tool} \longrightarrow \mathbf{Execution} \longrightarrow \mathbf{Verification} \longrightarrow \mathbf{Audit} \longrightarrow \mathbf{Memory}$$

---

## 2. Core Subsystems

### 2.1. Dual-Surface Operations (Desktop Orb + Control Center)
- **Persistent Desktop Orb**: Built with Electron, the Orb stays docked on the desktop, displaying live operational status badges (`● IDLE`, `● INVESTIGATING`, `⚠ APPROVAL REQUIRED`).
- **RazorFlow Control Center**: A specialized web workbench featuring Overview, Investigations, Agent Runs, Approvals, Action Ledger, Context Engine, Tool Registry, and Work Memory.

### 2.2. Specialized Agent System
RazorFlow provisions 8 dedicated domain sub-agents:
1. `BusinessHealthAgent`: Executive briefings, GMV, and success rate trends.
2. `PaymentInvestigationAgent`: Failure code distributions and gateway regressions.
3. `RevenueOpportunityAgent`: Recoverable GMV scan across soft declines.
4. `RecoveryAdvisorAgent`: Automated WhatsApp/SMS 1-click retry proposals.
5. `DisputeInsightAgent`: Chargeback defense tracking and bank deadline monitoring.
6. `SettlementInsightAgent`: Payout reconciliation, gateway fees, and GST audits.
7. `CustomerContextAgent`: 360° customer profile assembly with automated PII masking.
8. `EngineeringAgent`: Correlation with CI/CD deployments and incident reports.

### 2.3. Policy Engine & Human-in-the-Loop Guardrails
- **Risk Tiers**: Actions are classified into `LOW` (read-only), `MEDIUM` (internal drafts), `HIGH` (refunds, batch recoveries), and `CRITICAL` (chargeback acceptance).
- **Approval Gateway**: High-risk financial operations are gated behind explicit human sign-off with transparent What, Why, Risk Level, and Expected Effect cards.

### 2.4. Post-Action State Verification & Action Ledger
- **Verification Engine**: After executing a tool, RazorFlow queries external endpoints to verify that the state transition actually completed.
- **Action Ledger**: Logs every operation in an immutable, cryptographically verifiable audit trail.

---

## 3. Official Razorpay Integration Layer

Located in `src/integrations/razorpay/`:
- **Typed Client (`client.ts`)**: Handles Basic Auth, exponential retry backoffs, and deterministic Test Mode simulations.
- **Domain Adapters**: Payments, Orders, Customers, Refunds (`razorpay-idempotency-key`), Settlements, and Disputes.
- **Webhook Receiver (`receiver.ts`)**: HMAC-SHA256 signature verification (`x-razorpay-signature`) with event deduplication.
- **Safety Boundary**: Clearly demarcated `● TEST MODE (NO REAL MONEY)` to prevent confusion with production financial operations.
