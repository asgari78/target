export interface ZarinpalConfig {
  merchantId: string | null;
  sandbox: boolean;
  siteUrl: string | null;
  baseUrl: string | null;
  isConfigured: boolean;
}

export function getConfig(): ZarinpalConfig {
  const merchantId = process.env.ZARINPAL_MERCHANT_ID || null;
  const sandbox = process.env.ZARINPAL_SANDBOX === 'true';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || null;

  const isConfigured = Boolean(merchantId && siteUrl);
  const baseUrl = isConfigured
    ? (sandbox
        ? 'https://sandbox.zarinpal.com/pg/v4/payment'
        : 'https://api.zarinpal.com/pg/v4/payment')
    : null;

  return { merchantId, sandbox, siteUrl, baseUrl, isConfigured };
}

function getPaymentBaseUrl(sandbox: boolean): string {
  return sandbox
    ? 'https://sandbox.zarinpal.com/pg/StartPay'
    : 'https://www.zarinpal.com/pg/StartPay';
}

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

export interface FakePaymentResponse {
  orderId: string;
  authority: string;
  payUrl: string;
  amount: number;
  isTest: true;
}

function buildCallbackUrl(siteUrl: string, path: string): string {
  return `${siteUrl}${path}`;
}

export async function requestPayment(params: PaymentRequestParams): Promise<ZarinpalRequestResponse> {
  const { merchantId, siteUrl, baseUrl, isConfigured } = getConfig();

  if (!isConfigured || !merchantId || !siteUrl || !baseUrl) {
    // Return a fake/test response for development
    const testAuthority = `TEST_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    return {
      data: {
        authority: testAuthority,
        fee: 0,
        fee_type: 'test',
      },
      errors: undefined,
    };
  }

  const body = {
    merchant_id: merchantId,
    amount: params.amount,
    description: params.description,
    callback_url: buildCallbackUrl(siteUrl, params.callbackUrl),
    metadata: params.metadata,
  };

  const response = await fetch(`${baseUrl}/request.json`, {
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
  const { merchantId, baseUrl, isConfigured } = getConfig();

  if (!isConfigured || !merchantId || !baseUrl) {
    // Return a fake/test success response for development
    return {
      data: {
        ref_id: Math.floor(Math.random() * 1000000000),
        fee: 0,
        fee_type: 'test',
        card_pan: '6037************',
        card_hash: 'test_hash',
      },
      errors: undefined,
    };
  }

  const body = {
    merchant_id: merchantId,
    amount: params.amount,
    authority: params.authority,
  };

  const response = await fetch(`${baseUrl}/verify.json`, {
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
  const { sandbox, isConfigured } = getConfig();
  if (!isConfigured) {
    // Return a test URL that will simulate payment success
    return `/test-payment?authority=${authority}&status=success`;
  }
  const base = sandbox
    ? 'https://sandbox.zarinpal.com/pg/StartPay'
    : 'https://www.zarinpal.com/pg/StartPay';
  return `${base}/${authority}`;
}

/**
 * Convert Tomans to Rials for Zarinpal (1 Toman = 10 Rials)
 */
export function formatAmountForZarinpal(amountInTomans: number): number {
  return Math.round(amountInTomans * 10);
}

/**
 * Convert Rials to Tomans from Zarinpal
 */
export function formatAmountFromZarinpal(amountInRials: number): number {
  return Math.round(amountInRials / 10);
}