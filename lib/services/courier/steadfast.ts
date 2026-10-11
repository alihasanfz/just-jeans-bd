/**
 * Steadfast Courier API Client (Bangladesh)
 * Official Merchant Portal: https://portal.steadfast.com.bd
 */

export interface SteadfastOrderPayload {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
}

export interface SteadfastConsignment {
  consignment_id: number | string;
  invoice: string;
  tracking_code: string;
  recipient_name?: string;
  recipient_phone?: string;
  recipient_address?: string;
  cod_amount?: number;
  status?: string;
  created_at?: string;
}

export interface SteadfastCreateOrderResponse {
  status: number;
  message?: string;
  consignment?: SteadfastConsignment;
  errors?: any;
}

export interface SteadfastBalanceResponse {
  status: number;
  current_balance?: number;
  message?: string;
}

export interface SteadfastStatusResponse {
  status: number;
  delivery_status?: string;
  message?: string;
}

const DEFAULT_BASE_URL = 'https://portal.steadfast.com.bd/api/v1';

/**
 * Clean phone number to ensure valid BD phone format
 */
export function formatBdPhone(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('880')) {
    cleaned = cleaned.slice(2);
  }
  if (!cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = `0${cleaned}`;
  }
  return cleaned;
}

/**
 * Test Steadfast API Credentials by querying the balance endpoint
 */
export async function testSteadfastConnection(
  apiKey: string,
  secretKey: string,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<{ success: boolean; message: string; balance?: number }> {
  if (!apiKey || !secretKey) {
    return {
      success: false,
      message: 'API Key and Secret Key are required.',
    };
  }

  const cleanBase = baseUrl.replace(/\/+$/, '');

  try {
    const res = await fetch(`${cleanBase}/get_balance`, {
      method: 'GET',
      headers: {
        'Api-Key': apiKey.trim(),
        'Secret-Key': secretKey.trim(),
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data && (data.status === 200 || data.current_balance !== undefined)) {
      return {
        success: true,
        message: 'Steadfast Courier connected successfully!',
        balance: typeof data.current_balance === 'number' ? data.current_balance : Number(data.current_balance) || 0,
      };
    }

    return {
      success: false,
      message: data?.message || `Steadfast API responded with HTTP ${res.status}. Check API Key and Secret Key.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Network error connecting to Steadfast server.',
    };
  }
}

/**
 * Create a consignment order in Steadfast
 */
export async function createSteadfastOrder(
  apiKey: string,
  secretKey: string,
  payload: SteadfastOrderPayload,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<{
  success: boolean;
  message: string;
  consignmentId?: string;
  trackingCode?: string;
  trackingUrl?: string;
  raw?: any;
}> {
  if (!apiKey || !secretKey) {
    return { success: false, message: 'Steadfast API credentials are missing.' };
  }

  const cleanBase = baseUrl.replace(/\/+$/, '');

  const formattedPayload = {
    invoice: payload.invoice,
    recipient_name: payload.recipient_name,
    recipient_phone: formatBdPhone(payload.recipient_phone),
    recipient_address: payload.recipient_address,
    cod_amount: Math.max(0, Math.round(payload.cod_amount)),
    note: payload.note || 'Jeans BD - Handle with Care',
  };

  try {
    const res = await fetch(`${cleanBase}/create_order`, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey.trim(),
        'Secret-Key': secretKey.trim(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedPayload),
      cache: 'no-store',
    });

    const data: SteadfastCreateOrderResponse = await res.json().catch(() => null);

    if (res.ok && data && data.status === 200 && data.consignment) {
      const c = data.consignment;
      const consignmentId = String(c.consignment_id);
      const trackingCode = String(c.tracking_code || c.consignment_id);
      const trackingUrl = `https://steadfast.com.bd/t/${trackingCode}`;

      return {
        success: true,
        message: data.message || 'Parcel created successfully in Steadfast!',
        consignmentId,
        trackingCode,
        trackingUrl,
        raw: data,
      };
    }

    // Capture error message from Steadfast
    let errMsg = data?.message || `Failed to create Steadfast order (HTTP ${res.status})`;
    if (data?.errors) {
      const details = Object.entries(data.errors)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join('; ');
      if (details) errMsg += ` (${details})`;
    }

    return {
      success: false,
      message: errMsg,
      raw: data,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to communicate with Steadfast Courier API.',
    };
  }
}

/**
 * Check delivery status of a consignment
 */
export async function getSteadfastStatus(
  apiKey: string,
  secretKey: string,
  identifier: { trackingCode?: string; consignmentId?: string; invoice?: string },
  baseUrl: string = DEFAULT_BASE_URL
): Promise<{
  success: boolean;
  statusText?: string;
  humanStatus?: string;
  message?: string;
  raw?: any;
}> {
  if (!apiKey || !secretKey) {
    return { success: false, message: 'Steadfast credentials missing' };
  }

  const cleanBase = baseUrl.replace(/\/+$/, '');
  let endpoint = '';

  if (identifier.trackingCode) {
    endpoint = `${cleanBase}/status_by_trackingcode/${encodeURIComponent(identifier.trackingCode)}`;
  } else if (identifier.consignmentId) {
    endpoint = `${cleanBase}/status_by_cid/${encodeURIComponent(identifier.consignmentId)}`;
  } else if (identifier.invoice) {
    endpoint = `${cleanBase}/status_by_invoice/${encodeURIComponent(identifier.invoice)}`;
  } else {
    return { success: false, message: 'No tracking code or consignment ID provided.' };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Api-Key': apiKey.trim(),
        'Secret-Key': secretKey.trim(),
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data && (data.status === 200 || data.delivery_status)) {
      const rawStatus = (data.delivery_status || 'unknown').toLowerCase();
      const humanStatus = mapSteadfastStatus(rawStatus);

      return {
        success: true,
        statusText: data.delivery_status,
        humanStatus,
        message: 'Status retrieved successfully',
        raw: data,
      };
    }

    return {
      success: false,
      message: data?.message || 'Could not find consignment in Steadfast records.',
      raw: data,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Network error querying Steadfast status.',
    };
  }
}

/**
 * Map Steadfast status code to user-friendly label with English and Bengali
 */
export function mapSteadfastStatus(status: string): string {
  const s = (status || '').toLowerCase().trim();
  switch (s) {
    case 'in_review':
      return 'In Review (রিভিউ প্রক্রিয়াধীন)';
    case 'pending':
      return 'Pending Hub Pickup (পিকআপ অপেক্ষমান)';
    case 'delivered':
      return 'Delivered (সফলভাবে ডেলিভার্ড)';
    case 'partial_delivered':
      return 'Partially Delivered (আংশিক ডেলিভার্ড)';
    case 'cancelled':
      return 'Cancelled (বাতিল)';
    case 'hold':
      return 'On Hold (স্থগিত রাখা হয়েছে)';
    case 'in_transit':
      return 'In Transit (গন্তব্যের পথে)';
    case 'unknown':
    default:
      return s ? s.replace(/_/g, ' ').toUpperCase() : 'Processing';
  }
}
