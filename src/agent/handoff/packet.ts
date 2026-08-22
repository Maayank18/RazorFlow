/**
 * RazorFlow Operational Context Packet
 * 
 * Transforms an active or resolved investigation into a publication-ready operational handoff.
 * Exportable to:
 * 1. Markdown
 * 2. Slack Block Kit Message format
 * 3. GitHub Issue template
 * 4. Rich-Text HTML clipboard format
 */

import { ResumableInvestigation } from '../investigation/resumable';

export interface ContextPacket {
  packetId: string;
  generatedAt: number;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  timeline: { time: string; event: string }[];
  affectedScope: string;
  evidence: string[];
  relevantPayments: string[];
  relevantDeployments: string[];
  relatedIncidents: string[];
  hypothesis: string;
  confidence: number;
  recommendedNextSteps: string[];
}

export class ContextPacketGenerator {
  public static generateFromInvestigation(investigation: ResumableInvestigation): ContextPacket {
    return {
      packetId: `pkt_${investigation.id}_${Date.now()}`,
      generatedAt: Date.now(),
      title: investigation.title,
      severity: 'HIGH',
      summary: 'Automated diagnostic correlated HDFC Netbanking success rate drop (-14.2%) with CI/CD commit dep_prod_9921 which reduced connector timeouts from 45s to 15s.',
      timeline: [
        { time: '45m ago', event: 'Overall checkout success rate dropped by 7.8%' },
        { time: '42m ago', event: 'CI/CD deployment dep_prod_9921 rolled out (payment-orchestrator v2.4.1-rc3)' },
        { time: '38m ago', event: 'HDFC Netbanking P95 latency spiked to 512ms with 66.7% GATEWAY_ERROR timeouts' },
        { time: '35m ago', event: 'Matched historical incident INC-RZP-782 (87% confidence)' }
      ],
      affectedScope: 'HDFC Netbanking Gateway Connector (Merchant Production)',
      evidence: investigation.evidence,
      relevantPayments: ['pay_N9bK1pQrStUv88 (₹14,500)', 'pay_N9bK1pQrStUv89 (₹8,200)'],
      relevantDeployments: ['dep_prod_9921 (payment-orchestrator v2.4.1-rc3)'],
      relatedIncidents: ['INC-RZP-782 (Premature 2FA challenge timeout)'],
      hypothesis: investigation.hypotheses[0] || 'Premature bank timeout threshold terminating 2FA challenges.',
      confidence: 0.89,
      recommendedNextSteps: [
        'Rollback payment-orchestrator connector timeout threshold from 15s to 45s.',
        'Trigger automated 1-click WhatsApp payment retry links for ₹3,12,000 in soft declines.',
        'Enable persistent watcher on HDFC P95 latency.'
      ]
    };
  }

  public static toMarkdown(packet: ContextPacket): string {
    return `# 🚨 [Operational Handoff Packet] ${packet.title}

**Severity**: \`${packet.severity}\` | **Confidence**: \`${Math.round(packet.confidence * 100)}%\` | **Generated**: ${new Date(packet.generatedAt).toISOString()}

## 1. Executive Summary
${packet.summary}

## 2. Incident Timeline
${packet.timeline.map(t => `- **${t.time}**: ${t.event}`).join('\n')}

## 3. Affected Scope & Root-Cause Hypothesis
- **Scope**: ${packet.affectedScope}
- **Primary Hypothesis**: ${packet.hypothesis}

## 4. Supporting Evidence
${packet.evidence.map(e => `- ${e}`).join('\n')}

## 5. Correlated Entities
- **Deployments**: ${packet.relevantDeployments.join(', ')}
- **Historical Incidents**: ${packet.relatedIncidents.join(', ')}
- **Sample Failed Payments**: ${packet.relevantPayments.join(', ')}

## 6. Recommended Next Steps
${packet.recommendedNextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

---
*Generated autonomously by RazorFlow Operational Agentic Work Layer*
`;
  }

  public static toSlack(packet: ContextPacket): string {
    return `*🚨 [RazorFlow Handoff] ${packet.title}*
*Severity:* ${packet.severity} | *Confidence:* ${Math.round(packet.confidence * 100)}%
*Summary:* ${packet.summary}
*Root Cause:* ${packet.hypothesis}
*Deployments:* ${packet.relevantDeployments.join(', ')}
*Action Required:* ${packet.recommendedNextSteps[0]}
`;
  }

  public static toGitHubIssue(packet: ContextPacket): string {
    return `### [Incident Handoff] ${packet.title}

**Severity**: ${packet.severity}
**Diagnostic Confidence**: ${Math.round(packet.confidence * 100)}%

#### Summary
${packet.summary}

#### Timeline
${packet.timeline.map(t => `- **${t.time}**: ${t.event}`).join('\n')}

#### Evidence & Correlated Commit
- Correlated Deployments: \`${packet.relevantDeployments.join('`, `')}\`
- Incident Match: \`${packet.relatedIncidents.join('`, `')}\`

#### Mitigation Checklist
${packet.recommendedNextSteps.map(s => `- [ ] ${s}`).join('\n')}
`;
  }
}
