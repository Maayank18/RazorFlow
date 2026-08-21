/**
 * Razorpay Integration Errors
 */

export class RazorpayApiError extends Error {
  public statusCode: number;
  public errorCode?: string;
  public errorDescription?: string;
  public errorSource?: string;
  public correlationId?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode?: string,
    errorDescription?: string,
    errorSource?: string,
    correlationId?: string
  ) {
    super(message);
    this.name = 'RazorpayApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errorDescription = errorDescription;
    this.errorSource = errorSource;
    this.correlationId = correlationId;
  }
}

export class RazorpayAuthError extends RazorpayApiError {
  constructor(message: string = 'Invalid or missing Razorpay API credentials', correlationId?: string) {
    super(message, 401, 'AUTHENTICATION_ERROR', message, 'auth_layer', correlationId);
    this.name = 'RazorpayAuthError';
  }
}

export class RazorpayRateLimitError extends RazorpayApiError {
  constructor(message: string = 'Razorpay rate limit exceeded', correlationId?: string) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', message, 'rate_limiter', correlationId);
    this.name = 'RazorpayRateLimitError';
  }
}

export class RazorpayIdempotencyError extends RazorpayApiError {
  constructor(message: string = 'Duplicate idempotent request detected with mismatched payload', correlationId?: string) {
    super(message, 409, 'IDEMPOTENCY_CONFLICT', message, 'idempotency_layer', correlationId);
    this.name = 'RazorpayIdempotencyError';
  }
}
