import express from "express";
import path from "path";
import dotenv from "dotenv";
import { generateAIResponse } from "./src/lib/ai";
import { inputNormalizer } from "./src/agent/intent/normalizer";
import { contextEngine } from "./src/agent/context/engine";
import { agentOrchestrator } from "./src/agents/specialized";
import { actionLedger } from "./src/agent/ledger/actionLedger";
import { toolRegistry } from "./src/agent/tools/registry";
import { toolExecutor } from "./src/agent/executor/toolExecutor";
import { verificationEngine } from "./src/agent/verifier/verificationEngine";
import { memoryArchitecture } from "./src/agent/memory/memoryArchitecture";
import { webhookReceiver } from "./src/integrations/razorpay/webhooks/receiver";
import { defaultRazorpayClient } from "./src/integrations/razorpay/client";
import { MOCK_PAYMENTS, MOCK_DISPUTES, MOCK_SETTLEMENTS } from "./src/integrations/razorpay/fixtures";
import { PendingApproval } from "./src/types/razorflow";

dotenv.config();

// In-memory pending approvals store
const pendingApprovalsStore: Map<string, PendingApproval> = new Map();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.RAZORFLOW_PORT || process.env.FLOATGPT_PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-razorflow-trace-id, x-razorpay-signature");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ─── 1. Canonical Intent Endpoint ──────────────────────────────
  app.post("/api/flow/intent", (req, res) => {
    try {
      const { text, source, userId, workspaceId, sessionId } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Missing required field 'text'" });
      }

      const intent = inputNormalizer.normalize({
        text,
        source: source || 'web',
        userId,
        workspaceId,
        sessionId,
      });

      return res.json(intent);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ─── 2. Agent Run Orchestration (10-Step Canonical Loop) ───────
  app.post("/api/flow/run", async (req, res) => {
    try {
      const { prompt, state, userRole, source } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // Step 1: Normalize Intent
      const intent = inputNormalizer.normalize({
        text: prompt,
        source: source || 'web',
        userId: state?.userId || 'user_rzp_merchant_01',
        workspaceId: state?.workspaceId || 'ws_rzp_main',
      });

      // Step 2: Assemble Context
      const role = userRole || state?.userRole || 'merchant';
      const context = contextEngine.assembleContext(intent, state || {}, role);

      // Step 3-10: Execute Agent Orchestration
      const { reasoning, trace, report } = await agentOrchestrator.orchestrate(intent, context);

      // Extract pending approvals if any actions require high-risk signoff
      const pendingList: PendingApproval[] = [];
      for (const rec of reasoning.recommendedActions) {
        if (rec.requiresApproval) {
          const approvalId = `appr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          const approval: PendingApproval = {
            id: approvalId,
            intentId: intent.id,
            actionId: rec.id,
            toolId: rec.toolId,
            what: rec.title,
            why: rec.description,
            expectedEffect: rec.expectedOutcome,
            riskLevel: rec.riskLevel,
            dataUsed: rec.parameters,
            parameters: rec.parameters,
            requestedAt: Date.now(),
            expiresAt: Date.now() + 15 * 60 * 1000,
            status: 'pending',
          };
          pendingApprovalsStore.set(approvalId, approval);
          pendingList.push(approval);
        }
      }

      return res.json({
        intent,
        reasoning,
        trace,
        report,
        pendingApprovals: pendingList,
      });
    } catch (err: any) {
      console.error("[Agent Runner Error]:", err);
      return res.status(500).json({ error: err.message || "Failed to execute agent run" });
    }
  });

  // ─── 3. Action Approval Handler ────────────────────────────────
  app.post("/api/flow/approval/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { decision, actorId } = req.body; // 'approve' | 'reject'

      const approval = pendingApprovalsStore.get(id);
      if (!approval) {
        return res.status(404).json({ error: `Pending approval "${id}" not found or expired.` });
      }

      if (decision === 'reject') {
        approval.status = 'rejected';
        approval.resolvedAt = Date.now();
        approval.resolvedBy = actorId || 'user_manual_reject';

        actionLedger.record({
          id: `act_${Date.now()}`,
          intentId: approval.intentId,
          intentSummary: `Rejected: ${approval.what}`,
          toolId: approval.toolId,
          parameters: approval.parameters,
          policyDecision: {
            riskLevel: approval.riskLevel,
            requiredApproval: true,
            approvalId: approval.id,
            policyPassed: false,
          },
          execution: {
            startedAt: Date.now(),
            completedAt: Date.now(),
            durationMs: 0,
            status: 'rejected',
            output: { message: 'Rejected by operator' },
          },
          verification: {
            isVerified: true,
            verificationMethod: 'read_only_assertion',
            targetStateVerified: 'ACTION_ABORTED_BY_USER',
            verificationTimestamp: Date.now(),
          },
          actor: {
            userId: actorId || 'merchant_user',
            role: 'merchant',
            source: 'web',
          },
          timestamp: Date.now(),
        });

        return res.json({ success: true, status: 'rejected', message: 'Action rejected and recorded in ledger.' });
      }

      // If approved -> Execute Tool
      const execResult = await toolExecutor.execute({
        toolId: approval.toolId,
        parameters: approval.parameters,
        context: contextEngine.assembleContext(
          inputNormalizer.normalize({ text: approval.what }),
          {},
          'merchant'
        ),
        idempotencyKey: `appr_exec_${approval.id}`,
      });

      // Post-action verification
      const verification = await verificationEngine.verify(approval.toolId, execResult.data);

      approval.status = execResult.success ? 'executed' : 'failed';
      approval.resolvedAt = Date.now();
      approval.resolvedBy = actorId || 'merchant_user';
      approval.executionResult = execResult.data;

      // Log to Action Ledger
      actionLedger.record({
        id: `act_${Date.now()}`,
        intentId: approval.intentId,
        intentSummary: approval.what,
        toolId: approval.toolId,
        parameters: approval.parameters,
        policyDecision: {
          riskLevel: approval.riskLevel,
          requiredApproval: true,
          approvalId: approval.id,
          policyPassed: true,
        },
        approval: {
          approvedBy: actorId || 'merchant_user',
          approvedAt: Date.now(),
        },
        execution: {
          startedAt: Date.now() - execResult.durationMs,
          completedAt: Date.now(),
          durationMs: execResult.durationMs,
          status: execResult.success ? 'success' : 'failed',
          output: execResult.data,
          error: execResult.error,
        },
        verification,
        actor: {
          userId: actorId || 'merchant_user',
          role: 'merchant',
          source: 'web',
        },
        timestamp: Date.now(),
      });

      return res.json({
        success: execResult.success,
        status: approval.status,
        executionResult: execResult.data,
        verification,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ─── 4. Action Ledger Query Endpoint ───────────────────────────
  app.get("/api/flow/activity", (req, res) => {
    const limit = Number(req.query.limit) || 50;
    const entries = actionLedger.query({ limit });
    return res.json({ count: entries.length, items: entries });
  });

  // ─── 5. Context & Tools Inspection Endpoints ───────────────────
  app.get("/api/flow/tools", (_req, res) => {
    const tools = toolRegistry.list().map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      riskLevel: t.riskLevel,
      requiresApproval: t.requiresApproval,
      requiresIdempotency: t.requiresIdempotency,
      timeoutMs: t.timeoutMs,
      schema: t.schema,
    }));
    return res.json({ count: tools.length, items: tools });
  });

  app.get("/api/flow/memory", (_req, res) => {
    const memories = memoryArchitecture.query();
    return res.json({ count: memories.length, items: memories });
  });

  app.get("/api/flow/context", (req, res) => {
    const role = (req.query.role as any) || 'merchant';
    const sampleIntent = inputNormalizer.normalize({ text: "Briefing context check" });
    const ctx = contextEngine.assembleContext(sampleIntent, {}, role);
    return res.json(ctx);
  });

  // ─── 6. Razorpay Live/Test Health & Webhook Receivers ──────────
  app.get("/api/razorpay/health", (_req, res) => {
    return res.json({
      environment: defaultRazorpayClient.getEnvironment(),
      modeBadge: "● TEST MODE",
      isLiveCredentialsConfigured: defaultRazorpayClient.isUsingRealCredentials(),
      gatewayStatus: "HEALTHY",
      activeBankTimeouts: ["HDFC_NETBANKING"],
      timestamp: Date.now(),
    });
  });

  app.get("/api/razorpay/metrics", (_req, res) => {
    return res.json({
      totalVolumeINR: 2458000,
      totalTransactions: 1240,
      successfulTransactions: 1084,
      failedTransactions: 156,
      successRatePercent: 87.4,
      activeAnomaliesCount: 1,
      pendingDisputesCount: MOCK_DISPUTES.length,
      pendingSettlementsINR: 1845000,
      potentialRecoverableINR: 312000,
      recentPayments: MOCK_PAYMENTS.slice(0, 10),
      recentSettlements: MOCK_SETTLEMENTS,
      recentDisputes: MOCK_DISPUTES,
    });
  });

  app.post("/api/razorpay/webhooks", (req, res) => {
    try {
      const signature = (req.headers['x-razorpay-signature'] as string) || 'test_mock_signature';
      const rawBody = JSON.stringify(req.body);
      const result = webhookReceiver.process(rawBody, signature, req.body);

      if (!result.isValid) {
        return res.status(400).json({ error: result.error });
      }

      return res.json({
        received: true,
        isDuplicate: result.isDuplicate,
        domainEvent: result.domainEvent,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ─── 7. Backward Compatible AI Intelligence Endpoint ───────────
  app.post("/api/intelligence", async (req, res) => {
    try {
      const { prompt, state, isPlayground } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // Check if prompt is a RazorFlow agent query
      const intent = inputNormalizer.normalize({
        text: prompt,
        source: isPlayground ? 'web' : 'orb',
      });

      if (intent.type !== 'general_command') {
        const context = contextEngine.assembleContext(intent, state || {}, state?.userRole || 'merchant');
        const { reasoning } = await agentOrchestrator.orchestrate(intent, context);
        return res.json({
          message: reasoning.conclusion,
          evidence: reasoning.evidence,
          confidence: reasoning.confidence,
          recommendedActions: reasoning.recommendedActions,
        });
      }

      const parsed = await generateAIResponse(state, prompt, undefined, false);
      return res.json(parsed);
    } catch (error: any) {
      console.log(`Backend AI Error:`, error.message);
      return res.json({ message: error.message || "Failed to generate response." });
    }
  });

  // ─── 8. Download Proxies & Static Server ───────────────────────
  const RELEASE_TAG = 'v2.0.0';
  const GITHUB_RELEASE_BASE = `https://github.com/MayankGarg2004/RazorFlow/releases/download/${RELEASE_TAG}`;

  app.get("/api/download/:os", async (req, res) => {
    try {
      const { os } = req.params;
      let url = "";
      let filename = "";

      if (os === "win") {
        url = `${GITHUB_RELEASE_BASE}/RazorFlow_Windows.zip`;
        filename = "RazorFlow_Windows.zip";
      } else if (os === "mac") {
        url = `${GITHUB_RELEASE_BASE}/RazorFlow-2.0.0.dmg`;
        filename = "RazorFlow-2.0.0.dmg";
      } else {
        return res.status(400).json({ error: "Invalid OS. Use 'win' or 'mac'." });
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Asset not found: ${response.statusText}`);
      }

      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "application/octet-stream");

      const { Readable } = require('stream');
      // @ts-ignore
      Readable.fromWeb(response.body).pipe(res);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = __dirname;
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  🚀 RazorFlow Agentic Work Layer running on port ${PORT}`);
    console.log(`  ● TEST MODE (Default - Deterministic Verified Sandbox)`);
    console.log(`======================================================\n`);
  });
}

startServer();
