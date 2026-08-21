# RazorFlow - Specification & Architecture

## Product Overview
RazorFlow is a persistent context-aware agentic work layer for Razorpay business and engineering workflows.
**Dual Surfaces:** Persistent Desktop Orb & Control Center Workbench.
**Execution Pipeline:** Intent → Context → Reasoning → Plan → Policy → Tool → Execution → Verification → Audit → Memory.

## Component Map
- `Desktop Orb` (Persistent Electron widget: Missions, Commands, Status)
- `Control Center` (Workbench: Overview, Investigations, Agent Runs, Approvals, Action Ledger, Context Engine, Tool Registry, Work Memory)
- `Domain Sub-agents` (Business Health, Payment Investigation, Revenue Opportunity, Recovery Advisor, Dispute Insight, Settlement Insight, Customer Context, Engineering)

## Integrations
- Razorpay Payments, Orders, Customers, Refunds, Settlements, Disputes APIs (with Test Mode simulation boundary).
- Policy Engine with Risk-Tiered Human Sign-Offs.
- Action Ledger for cryptographically verifiable audit trails.
