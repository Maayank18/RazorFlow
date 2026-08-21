/**
 * Official Razorpay API Types & Entities
 * Compliant with Razorpay API specifications (v1)
 */

export interface RazorpayPayment {
  id: string; // e.g. pay_29QQoUBi66xm2f
  entity: 'payment';
  amount: number; // in paise (e.g. 50000 = ₹500.00)
  currency: 'INR' | 'USD' | 'EUR' | string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  order_id?: string;
  invoice_id?: string;
  international: boolean;
  method: 'card' | 'netbanking' | 'wallet' | 'emi' | 'upi' | 'bank_transfer';
  amount_refunded: number;
  refund_status?: 'null' | 'partial' | 'full';
  captured: boolean;
  description?: string;
  card_id?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  email: string;
  contact: string;
  notes?: Record<string, string>;
  fee?: number;
  tax?: number;
  error_code?: string;
  error_description?: string;
  error_source?: string;
  error_step?: string;
  error_reason?: string;
  created_at: number; // Unix timestamp in seconds
}

export interface RazorpayOrder {
  id: string; // e.g. order_DBJOWzybf0sJbb
  entity: 'order';
  amount: number; // in paise
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt?: string;
  offer_id?: string;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes?: Record<string, string>;
  created_at: number;
}

export interface RazorpayCustomer {
  id: string; // e.g. cust_1Aa00000000004
  entity: 'customer';
  name: string;
  contact: string;
  email: string;
  notes?: Record<string, string>;
  created_at: number;
}

export interface RazorpayRefund {
  id: string; // e.g. rfn_1Aa00000000002
  entity: 'refund';
  amount: number; // in paise
  currency: string;
  payment_id: string;
  notes?: Record<string, string>;
  receipt?: string;
  acquirer_data?: {
    arn?: string;
  };
  created_at: number;
  batch_id?: string;
  status: 'pending' | 'processed' | 'failed';
  speed_processed: 'normal' | 'optimum' | 'instant';
  speed_requested: 'normal' | 'optimum' | 'instant';
}

export interface RazorpaySettlement {
  id: string; // e.g. setl_1Aa00000000001
  entity: 'settlement';
  amount: number; // net settlement in paise
  status: 'created' | 'processed' | 'failed';
  fees: number;
  tax: number;
  utr?: string;
  created_at: number;
  settled_at?: number;
}

export interface RazorpayDispute {
  id: string; // e.g. disp_1Aa00000000001
  entity: 'dispute';
  payment_id: string;
  amount: number;
  currency: string;
  reason_code: string;
  reason_description: string;
  status: 'under_review' | 'action_required' | 'won' | 'lost' | 'closed';
  respond_by: number; // unix timestamp
  created_at: number;
  evidence?: {
    summary?: string;
    submitted_at?: number;
    documents?: string[];
  };
}

export interface RazorpayWebhookPayload {
  entity: 'event';
  account_id: string;
  event: 
    | 'payment.authorized'
    | 'payment.failed'
    | 'payment.captured'
    | 'order.paid'
    | 'refund.created'
    | 'refund.processed'
    | 'refund.failed'
    | 'dispute.created'
    | 'dispute.action_required'
    | 'settlement.processed';
  contains: string[];
  payload: {
    payment?: { entity: RazorpayPayment };
    order?: { entity: RazorpayOrder };
    refund?: { entity: RazorpayRefund };
    dispute?: { entity: RazorpayDispute };
    settlement?: { entity: RazorpaySettlement };
  };
  created_at: number;
}
