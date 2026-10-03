/**
 * bKash Payment Gateway Integration Module (Tokenized / Checkout API)
 * Follows official bKash Merchant API specification
 */

export interface BkashCreatePaymentPayload {
  amount: number;
  orderNumber: string;
  customerPhone?: string;
  intent?: 'sale' | 'authorization';
}

export interface BkashPaymentResponse {
  statusCode: string;
  statusMessage: string;
  paymentID?: string;
  bkashURL?: string;
  transactionStatus?: string;
  trxID?: string;
}

export class BkashGateway {
  private appKey: string;
  private appSecret: string;
  private username: string;
  private password: string;
  private baseUrl: string;

  constructor() {
    this.appKey = process.env.BKASH_APP_KEY || '';
    this.appSecret = process.env.BKASH_APP_SECRET || '';
    this.username = process.env.BKASH_USERNAME || '';
    this.password = process.env.BKASH_PASSWORD || '';
    this.baseUrl = process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';
  }

  public isConfigured(): boolean {
    return Boolean(this.appKey && this.appSecret && this.username && this.password);
  }

  /**
   * Grant Token from bKash server
   */
  async grantToken(): Promise<string | null> {
    if (!this.isConfigured()) return null;

    try {
      const response = await fetch(`${this.baseUrl}/tokenized/checkout/token/grant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          username: this.username,
          password: this.password,
        },
        body: JSON.stringify({
          app_key: this.appKey,
          app_secret: this.appSecret,
        }),
      });

      const data = await response.json();
      return data.id_token || null;
    } catch (error) {
      console.error('bKash Grant Token Error:', error);
      return null;
    }
  }

  /**
   * Create Payment Agreement / Checkout URL
   */
  async createPayment(payload: BkashCreatePaymentPayload): Promise<BkashPaymentResponse> {
    if (!this.isConfigured()) {
      // In demo mode without credentials, generate simulated transaction for local testing
      return {
        statusCode: '0000',
        statusMessage: 'Demo mode: bKash Gateway ready',
        paymentID: `DEMO-BKASH-${Date.now()}`,
        bkashURL: `/checkout/payment-redirect?gateway=bkash&order=${payload.orderNumber}`,
        transactionStatus: 'Initiated',
      };
    }

    try {
      const token = await this.grantToken();
      if (!token) throw new Error('Could not obtain bKash authentication token');

      const response = await fetch(`${this.baseUrl}/tokenized/checkout/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
          'X-APP-Key': this.appKey,
        },
        body: JSON.stringify({
          mode: '0011',
          payerReference: payload.customerPhone || 'Customer',
          callbackURL: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payment/bkash/callback`,
          amount: payload.amount.toFixed(2),
          currency: 'BDT',
          intent: payload.intent || 'sale',
          merchantInvoiceNumber: payload.orderNumber,
        }),
      });

      return await response.json();
    } catch (error: any) {
      return {
        statusCode: '9999',
        statusMessage: error.message || 'bKash initiation failed',
      };
    }
  }

  /**
   * Execute / Verify Payment after customer approval
   */
  async executePayment(paymentID: string): Promise<BkashPaymentResponse> {
    if (!this.isConfigured()) {
      return {
        statusCode: '0000',
        statusMessage: 'Successful',
        paymentID,
        trxID: `BK${Math.floor(10000000 + Math.random() * 90000000)}`,
        transactionStatus: 'Completed',
      };
    }

    try {
      const token = await this.grantToken();
      const response = await fetch(`${this.baseUrl}/tokenized/checkout/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
          'X-APP-Key': this.appKey,
        },
        body: JSON.stringify({ paymentID }),
      });

      return await response.json();
    } catch (error: any) {
      return {
        statusCode: '9999',
        statusMessage: error.message || 'bKash execute failed',
      };
    }
  }
}

export const bkash = new BkashGateway();
