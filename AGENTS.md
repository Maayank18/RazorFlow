# RazorFlow AI Agent Guidelines

This file (`AGENTS.md`) serves as the core instruction manual for any AI agents or LLM-based coding assistants operating within the RazorFlow workspace. 

When generating code, analyzing the project, or providing architectural recommendations, AI agents must adhere to the following principles:

## 1. Architectural Integrity

* **Strict Isolation**: RazorFlow relies on a clean separation between the Electron Desktop app (the "Orb") and the Control Center Workbench (the Web Dashboard). Never mix their states directly; always use the `SyncBridge` for cross-surface communication.
* **Local-First Priority**: Always prioritize `idb-keyval` for fast local reads/writes before failing over or syncing to cloud persistence.
* **10-Step Deterministic Pipeline**: All user inquiries and operations follow:
  $$\text{Intent} \to \text{Context} \to \text{Reasoning} \to \text{Plan} \to \text{Policy} \to \text{Tool} \to \text{Execution} \to \text{Verification} \to \text{Audit} \to \text{Memory}$$

## 2. Agentic Tooling & Security

* **Policy-Gated Mutations**: High-risk financial operations (refunds, batch recovery triggers, chargeback acceptances) MUST pass through the Policy Engine and require explicit human-in-the-loop sign-off.
* **Post-Action State Verification**: After every mutation, the system must independently verify the resulting state before recording the success in the Action Ledger.
* **Action Ledger Audit Trail**: All agent decisions and tool executions are cryptographically hashed and appended to an immutable audit ledger.

## 3. UI/UX & Styling Standards

* **Aesthetic Focus**: RazorFlow is designed for "Calm Operational Execution". Use muted dark backgrounds (`bg-bg`, `bg-panel`, `bg-card`) with high-contrast text (`text-text-primary`).
* **Animations**: All micro-interactions and layout changes should use `framer-motion` for smooth transitions.
* **Color Usage**: Reserve warning/danger colors (Amber/Red) strictly for real-time payment anomalies, active gateway regressions, or pending human approvals.

## 4. Technology Stack

* **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion.
* **State Management**: Zustand, IndexedDB, Firebase Adapters.
* **Desktop Wrapper**: Electron with native system tray, global hotkeys, and window docking.

## 5. Documentation & Versioning

* **Consistency**: Ensure `package.json`, `DownloadView.jsx`, and `README.md` are kept in sync during version bumps.
* **Clarity**: Write concise, impactful documentation.
