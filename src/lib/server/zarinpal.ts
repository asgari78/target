const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID!;
const ZARINPAL_SANDBOX = process.env.ZARINPAL_SANDBOX === 'true';
const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

if (!ZARINPAL_MERCHANT_ID || !NEXT_PUBLIC_SITE_URL) {
  throw new Error('Missing Zarinpal or site URL environment variables');
}

const ZARINPAL_BASE_URL = ZARINPAL_SANDBOX
  ? 'https://sandbox.zarinpal.com/pg/v4/payment'
  : 'https://api.zarinpal.com/pg/v4/payment';

export interface ZarinpalRequestResponse {
  data?: {
    authority: string;
    fee: number;
    fee_type: string;
  };
  errors?: {
    code: number;
    message: string;
    validations?: Record<string, string[]>;
  };
}

export interface ZarinpalVerifyResponse {
  data?: {
    ref_id: number;
    fee: number;
    fee_type: string;
    card_pan: string;
    card_hash: string;
  };
  errors?: {
    code: number;
    message: string;
    validations?: Record<string, string[]>;
  };
}

export interface PaymentRequestParams {
  amount: number;
  description: string;
  callbackUrl: string;
  metadata?: {
    mobile?: string;
    email?: string;
    orderId?: string;
    courseId?: string;
    registrationType?: string;
    paymentMode?: string;
  };
}

export interface PaymentVerifyParams {
  amount: number;
  authority: string;
}

function buildCallbackUrl(path: string): string {
  return `${NEXT_PUBLIC_SITE_URL}${path}`;
}

export async function requestPayment(params: PaymentRequestParams): Promise<ZarinpalRequestResponse> {
  const body = {
    merchant_id: ZARINPAL_MERCHANT_ID,
    amount: params.amount,
    description: params.description,
    callback_url: buildCallbackUrl(params.callbackUrl),
    metadata: params.metadata,
  };

  const response = await fetch(`${ZARINPAL_BASE_URL}/request.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Zarinpal request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function verifyPayment(params: PaymentVerifyParams): Promise<ZarinpalVerifyResponse> {
  const body = {
    merchant_id: ZARINPAL_MERCHANT_ID,
    amount: params.amount,
    authority: params.authority,
  };

  const response = await fetch(`${ZARINPAL_BASE_URL}/verify.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Zarinpal verify failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export function getPaymentUrl(authority: string): string {
  const base = ZARINPAL_SANDBOX
    ? 'https://sandbox.zarinpal.com/pg/StartPay'
    : 'https://www.zarinpal.com/pg/StartPay';
  return `${base}/${authority}`;
}