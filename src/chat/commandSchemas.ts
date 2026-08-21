export type SlashCommandType = 
  | 'ask'
  | 'investigate'
  | 'payments'
  | 'customer'
  | 'revenue'
  | 'risk'
  | 'settlements'
  | 'refunds'
  | 'disputes'
  | 'agent'
  | 'context'
  | 'tools'
  | 'approvals'
  | 'activity'
  | 'memory'
  | 'status'
  | 'help';

export interface CommandSchema {
  command: SlashCommandType;
  description: string;
  aliases: string[];
  example: string;
}

export const COMMAND_SCHEMAS: Record<SlashCommandType, CommandSchema> = {
  'ask': {
    command: 'ask',
    description: 'Ask a direct operational or business health question.',
    aliases: ['query', 'q'],
    example: '/ask What was today’s payment volume?'
  },
  'investigate': {
    command: 'investigate',
    description: 'Trigger a multi-step root-cause investigation with evidence formulation.',
    aliases: ['inv', 'debug'],
    example: '/investigate payment drop'
  },
  'payments': {
    command: 'payments',
    description: 'Query payment success rates, volume trends, and failure codes.',
    aliases: ['pay', 'tx'],
    example: '/payments today'
  },
  'customer': {
    command: 'customer',
    description: 'Look up 360° customer profile, transactions, and failure histories.',
    aliases: ['cust', 'user'],
    example: '/customer cust_9921'
  },
  'revenue': {
    command: 'revenue',
    description: 'Scan recoverable revenue opportunities and soft decline patterns.',
    aliases: ['rev', 'recovery'],
    example: '/revenue last 7 days'
  },
  'risk': {
    command: 'risk',
    description: 'Inspect active anomalies, failure spikes, and operational risk signals.',
    aliases: ['anomalies', 'alerts'],
    example: '/risk unusual refunds'
  },
  'settlements': {
    command: 'settlements',
    description: 'Reconcile settlement payouts, gateway fees, tax, and UTR tracking.',
    aliases: ['payouts', 'recon'],
    example: '/settlements pending'
  },
  'refunds': {
    command: 'refunds',
    description: 'Inspect processed refunds or propose idempotent refund actions.',
    aliases: ['rfn'],
    example: '/refunds eligible'
  },
  'disputes': {
    command: 'disputes',
    description: 'Review chargeback deadlines, evidence defense, and exposure.',
    aliases: ['chargebacks'],
    example: '/disputes open'
  },
  'agent': {
    command: 'agent',
    description: 'Inspect specialized sub-agent states and active execution traces.',
    aliases: ['agents', 'runs'],
    example: '/agent status'
  },
  'context': {
    command: 'context',
    description: 'View active context hierarchy, business state, and token budget allocation.',
    aliases: ['ctx'],
    example: '/context current'
  },
  'tools': {
    command: 'tools',
    description: 'List registered Razorpay API, engineering, and system tool contracts.',
    aliases: ['registry'],
    example: '/tools'
  },
  'approvals': {
    command: 'approvals',
    description: 'Review pending financial and operational actions awaiting human sign-off.',
    aliases: ['appr', 'review'],
    example: '/approvals'
  },
  'activity': {
    command: 'activity',
    description: 'Query the immutable cryptographic Action Ledger audit trail.',
    aliases: ['audit', 'ledger', 'history'],
    example: '/activity today'
  },
  'memory': {
    command: 'memory',
    description: 'Query operational heuristics, merchant SLAs, and incident post-mortems.',
    aliases: ['mem', 'heuristics'],
    example: '/memory HDFC'
  },
  'status': {
    command: 'status',
    description: 'Check bank gateway status and active Razorpay Test Mode health.',
    aliases: ['health'],
    example: '/status'
  },
  'help': {
    command: 'help',
    description: 'List all available RazorFlow operational commands and workflows.',
    aliases: ['man', 'commands'],
    example: '/help'
  }
};

export const ALL_COMMANDS = Object.keys(COMMAND_SCHEMAS) as SlashCommandType[];
