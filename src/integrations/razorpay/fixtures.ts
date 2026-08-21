/**
 * Razorpay Test Mode Deterministic Fixtures & Simulation State
 * 
 * Provides rich, realistic, offline/test-mode verified datasets for
 * RazorFlow's Payment Investigation, Revenue Opportunity, and Business Health agents.
 */

import { RazorpayPayment, RazorpayOrder, RazorpayCustomer, RazorpayRefund, RazorpaySettlement, RazorpayDispute } from './types';

const now = Date.now();
const nowSec = Math.floor(now / 1000);

export const MOCK_PAYMENTS: RazorpayPayment[] = [
  // ─── Recent Failure Cluster (HDFC Netbanking Timeout Spike) ───
  {
    id: 'pay_Lz98dfHdfc001',
    entity: 'payment',
    amount: 1499900, // ₹14,999.00
    currency: 'INR',
    status: 'failed',
    order_id: 'order_Ord001Hdfc',
    international: false,
    method: 'netbanking',
    bank: 'HDFC',
    amount_refunded: 0,
    captured: false,
    description: 'Enterprise Annual Tier Subscription',
    email: 'rohit.sharma@acme-corp.in',
    contact: '+919876543210',
    fee: 0,
    tax: 0,
    error_code: 'BAD_REQUEST_ERROR',
    error_description: 'Payment failed at bank gateway due to timeout (15s threshold exceeded)',
    error_source: 'bank_gateway',
    error_step: 'payment_authorization',
    error_reason: 'gateway_timeout',
    created_at: nowSec - 1800, // 30 mins ago
  },
  {
    id: 'pay_Lz98dfHdfc002',
    entity: 'payment',
    amount: 850000, // ₹8,500.00
    currency: 'INR',
    status: 'failed',
    order_id: 'order_Ord002Hdfc',
    international: false,
    method: 'netbanking',
    bank: 'HDFC',
    amount_refunded: 0,
    captured: false,
    description: 'Pro Cloud License',
    email: 'priya.nair@techscale.io',
    contact: '+919811223344',
    fee: 0,
    tax: 0,
    error_code: 'BAD_REQUEST_ERROR',
    error_description: 'Payment failed at bank gateway due to timeout (15s threshold exceeded)',
    error_source: 'bank_gateway',
    error_step: 'payment_authorization',
    error_reason: 'gateway_timeout',
    created_at: nowSec - 1650,
  },
  {
    id: 'pay_Lz98dfHdfc003',
    entity: 'payment',
    amount: 3200000, // ₹32,000.00
    currency: 'INR',
    status: 'failed',
    order_id: 'order_Ord003Hdfc',
    international: false,
    method: 'netbanking',
    bank: 'HDFC',
    amount_refunded: 0,
    captured: false,
    description: 'Infrastructure Reserved Capacity',
    email: 'karan.mehta@fintechhub.com',
    contact: '+919944556677',
    fee: 0,
    tax: 0,
    error_code: 'BAD_REQUEST_ERROR',
    error_description: 'Payment failed at bank gateway due to timeout (15s threshold exceeded)',
    error_source: 'bank_gateway',
    error_step: 'payment_authorization',
    error_reason: 'gateway_timeout',
    created_at: nowSec - 1200,
  },
  {
    id: 'pay_Lz98dfHdfc004',
    entity: 'payment',
    amount: 1950000, // ₹19,500.00
    currency: 'INR',
    status: 'failed',
    order_id: 'order_Ord004Hdfc',
    international: false,
    method: 'netbanking',
    bank: 'HDFC',
    amount_refunded: 0,
    captured: false,
    description: 'Annual Team Workspace Plan',
    email: 'ananya.deshmukh@groweasy.co',
    contact: '+919823456789',
    fee: 0,
    tax: 0,
    error_code: 'BAD_REQUEST_ERROR',
    error_description: 'Payment failed at bank gateway due to timeout (15s threshold exceeded)',
    error_source: 'bank_gateway',
    error_step: 'payment_authorization',
    error_reason: 'gateway_timeout',
    created_at: nowSec - 900,
  },

  // ─── Recoverable UPI / Card Failures (User Insufficient Funds or Soft Declines) ───
  {
    id: 'pay_RecovUpi001',
    entity: 'payment',
    amount: 450000, // ₹4,500.00
    currency: 'INR',
    status: 'failed',
    order_id: 'order_Recov001',
    international: false,
    method: 'upi',
    vpa: 'arjun.singh@okaxis',
    amount_refunded: 0,
    captured: false,
    description: 'Monthly Cloud Database Instance',
    email: 'arjun.singh@startup.in',
    contact: '+919765432109',
    fee: 0,
    tax: 0,
    error_code: 'PAYMENT_FAILED',
    error_description: 'UPI App PIN timeout. Customer is active and eligible for WhatsApp 1-click retry link.',
    error_source: 'customer',
    error_step: 'payment_authentication',
    error_reason: 'auth_timeout',
    created_at: nowSec - 3600,
  },
  {
    id: 'pay_RecovCard002',
    entity: 'payment',
    amount: 720000, // ₹7,200.00
    currency: 'INR',
    status: 'failed',
    order_id: 'order_Recov002',
    international: false,
    method: 'card',
    amount_refunded: 0,
    captured: false,
    description: 'Developer Add-on Pack',
    email: 'sneha.patel@designstudio.in',
    contact: '+919833445566',
    fee: 0,
    tax: 0,
    error_code: 'PAYMENT_FAILED',
    error_description: 'Card 3DS OTP expired. Customer retry propensity is 94%.',
    error_source: 'customer',
    error_step: 'payment_authentication',
    error_reason: 'otp_expired',
    created_at: nowSec - 4200,
  },

  // ─── Successful Captured Payments (Healthy Stream) ───
  {
    id: 'pay_SuccessCapt001',
    entity: 'payment',
    amount: 2500000, // ₹25,000.00
    currency: 'INR',
    status: 'captured',
    order_id: 'order_Succ001',
    international: false,
    method: 'upi',
    vpa: 'vikram.aditya@okhdfcbank',
    amount_refunded: 0,
    captured: true,
    description: 'Enterprise API Bundle',
    email: 'vikram@alpha-corp.com',
    contact: '+919876500001',
    fee: 50000, // ₹500.00
    tax: 9000,   // ₹90.00
    created_at: nowSec - 7200,
  },
  {
    id: 'pay_SuccessCapt002',
    entity: 'payment',
    amount: 1250000, // ₹12,500.00
    currency: 'INR',
    status: 'captured',
    order_id: 'order_Succ002',
    international: false,
    method: 'card',
    amount_refunded: 0,
    captured: true,
    description: 'Team Seats Addon (5 seats)',
    email: 'meera.joshi@novasolutions.com',
    contact: '+919876500002',
    fee: 25000,
    tax: 4500,
    created_at: nowSec - 10800,
  },
  {
    id: 'pay_SuccessCapt003',
    entity: 'payment',
    amount: 4800000, // ₹48,000.00
    currency: 'INR',
    status: 'captured',
    order_id: 'order_Succ003',
    international: false,
    method: 'netbanking',
    bank: 'ICICI',
    amount_refunded: 0,
    captured: true,
    description: 'Quarterly Infrastructure Retainer',
    email: 'siddharth@cloudmatrix.in',
    contact: '+919876500003',
    fee: 96000,
    tax: 17280,
    created_at: nowSec - 14400,
  }
];

export const MOCK_ORDERS: RazorpayOrder[] = [
  {
    id: 'order_Ord001Hdfc',
    entity: 'order',
    amount: 1499900,
    amount_paid: 0,
    amount_due: 1499900,
    currency: 'INR',
    receipt: 'rcpt_ent_001',
    status: 'attempted',
    attempts: 1,
    created_at: nowSec - 1800,
  },
  {
    id: 'order_Succ001',
    entity: 'order',
    amount: 2500000,
    amount_paid: 2500000,
    amount_due: 0,
    currency: 'INR',
    receipt: 'rcpt_api_001',
    status: 'paid',
    attempts: 1,
    created_at: nowSec - 7200,
  }
];

export const MOCK_CUSTOMERS: RazorpayCustomer[] = [
  {
    id: 'cust_RohitSharma01',
    entity: 'customer',
    name: 'Rohit Sharma',
    contact: '+919876543210',
    email: 'rohit.sharma@acme-corp.in',
    notes: {
      tier: 'Enterprise',
      ltvINR: '450000',
      accountManager: 'Aditi V.'
    },
    created_at: nowSec - 86400 * 180,
  },
  {
    id: 'cust_VikramAditya02',
    entity: 'customer',
    name: 'Vikram Aditya',
    contact: '+919876500001',
    email: 'vikram@alpha-corp.com',
    notes: {
      tier: 'Strategic',
      ltvINR: '1200000',
      accountManager: 'Rahul K.'
    },
    created_at: nowSec - 86400 * 365,
  }
];

export const MOCK_DISPUTES: RazorpayDispute[] = [
  {
    id: 'disp_Chargeback001',
    entity: 'dispute',
    payment_id: 'pay_SuccessCapt002',
    amount: 1250000, // ₹12,500.00
    currency: 'INR',
    reason_code: 'FRAUDULENT_TRANSACTION',
    reason_description: 'Cardholder claims transaction was unauthorized by card issuer',
    status: 'action_required',
    respond_by: nowSec + 86400 * 2, // 48 hours left to respond
    created_at: nowSec - 86400 * 1,
    evidence: {
      summary: 'Pending merchant invoice and delivery confirmation submission',
    }
  },
  {
    id: 'disp_Chargeback002',
    entity: 'dispute',
    payment_id: 'pay_SuccessCapt003',
    amount: 4800000, // ₹48,000.00
    currency: 'INR',
    reason_code: 'SERVICE_NOT_RENDERED',
    reason_description: 'Buyer claims SLA was breached during quarterly maintenance window',
    status: 'under_review',
    respond_by: nowSec + 86400 * 5,
    created_at: nowSec - 86400 * 2,
    evidence: {
      summary: 'Server uptime metrics and signed enterprise SLA agreement uploaded',
      submitted_at: nowSec - 86400 * 1,
      documents: ['doc_sla_agreement.pdf', 'doc_uptime_log.pdf']
    }
  }
];

export const MOCK_SETTLEMENTS: RazorpaySettlement[] = [
  {
    id: 'setl_DailyBatch001',
    entity: 'settlement',
    amount: 184500000, // ₹18,45,000.00 net
    status: 'processed',
    fees: 3690000,      // ₹36,900.00 fee
    tax: 664200,        // ₹6,642.00 GST
    utr: 'UTR_HDFC_992817263518',
    created_at: nowSec - 86400 * 1,
    settled_at: nowSec - 86400 * 1 + 3600 * 4,
  },
  {
    id: 'setl_PendingBatch002',
    entity: 'settlement',
    amount: 142000000, // ₹14,20,000.00
    status: 'created',
    fees: 2840000,
    tax: 511200,
    created_at: nowSec - 18000,
  }
];
