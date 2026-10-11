/**
 * Pathao Courier Merchant API Client (Bangladesh)
 * Official Merchant Portal: https://merchant.pathao.com
 */

export interface PathaoCredentials {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  storeId?: string;
  isSandbox?: boolean;
}

export interface PathaoStore {
  store_id: number | string;
  store_name: string;
  store_address?: string;
  is_active?: boolean;
}

export interface PathaoOrderPayload {
  storeId: string | number;
  merchantOrderId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  amountToCollect: number;
  itemQuantity?: number;
  itemWeight?: number; // kg, e.g. 0.5
  itemDescription?: string;
  specialInstruction?: string;
  deliveryType?: number; // 48: normal delivery, 12: on demand
  itemType?: number; // 1: document, 2: parcel
  recipientCity?: number;
  recipientZone?: number;
  recipientArea?: number;
}

export interface PathaoTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

const PRODUCTION_URL = 'https://api-hermes.pathao.com';
const SANDBOX_URL = 'https://courier-api-sandbox.pathao.com';

function getBaseUrl(isSandbox?: boolean): string {
  return isSandbox ? SANDBOX_URL : PRODUCTION_URL;
}

/**
 * Format Bangladesh phone number (11 digits, starts with 01)
 */
export function formatPathaoPhone(phone: string): string {
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

// In-memory token cache to avoid issuing new tokens on every request
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

/**
 * Issue or retrieve cached OAuth2 Bearer token from Pathao
 */
export async function getPathaoToken(
  creds: PathaoCredentials
): Promise<{ success: boolean; token?: string; message?: string }> {
  if (!creds.clientId || !creds.clientSecret || !creds.username || !creds.password) {
    return {
      success: false,
      message: 'Pathao Client ID, Secret, Username (Email), and Password are required.',
    };
  }

  const baseUrl = getBaseUrl(creds.isSandbox);
  const cacheKey = `${creds.clientId}_${creds.username}_${creds.isSandbox ? 'sandbox' : 'prod'}`;

  // Check cache (allow 5-minute safety buffer)
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 300000) {
    return { success: true, token: cached.token };
  }

  try {
    const res = await fetch(`${baseUrl}/aladdin/api/v1/issue-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: creds.clientId.trim(),
        client_secret: creds.clientSecret.trim(),
        username: creds.username.trim(),
        password: creds.password.trim(),
        grant_type: 'password',
      }),
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.access_token) {
      const expiresInSec = data.expires_in || 2592000;
      tokenCache.set(cacheKey, {
        token: data.access_token,
        expiresAt: Date.now() + expiresInSec * 1000,
      });

      return {
        success: true,
        token: data.access_token,
      };
    }

    const errDetail = data?.message || data?.error_description || `HTTP ${res.status}`;
    return {
      success: false,
      message: `Pathao Authentication failed: ${errDetail}`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Network error connecting to Pathao Token API.',
    };
  }
}

/**
 * Test Pathao connection by authenticating and fetching stores list
 */
export async function testPathaoConnection(
  creds: PathaoCredentials
): Promise<{
  success: boolean;
  message: string;
  storeCount?: number;
  stores?: PathaoStore[];
}> {
  const tokenRes = await getPathaoToken(creds);
  if (!tokenRes.success || !tokenRes.token) {
    return {
      success: false,
      message: tokenRes.message || 'Pathao authentication failed.',
    };
  }

  const storesRes = await getPathaoStores(creds);
  if (storesRes.success) {
    const count = storesRes.stores?.length || 0;
    return {
      success: true,
      message: `Pathao Courier connected successfully! (${count} pickup store${count === 1 ? '' : 's'} found)`,
      storeCount: count,
      stores: storesRes.stores,
    };
  }

  return {
    success: true,
    message: 'Pathao connected, but could not load stores list. Please check your Pathao Merchant Dashboard.',
    storeCount: 0,
    stores: [],
  };
}

/**
 * Fetch available pickup stores from Pathao
 */
export async function getPathaoStores(
  creds: PathaoCredentials
): Promise<{
  success: boolean;
  stores?: PathaoStore[];
  message?: string;
}> {
  const tokenRes = await getPathaoToken(creds);
  if (!tokenRes.success || !tokenRes.token) {
    return { success: false, message: tokenRes.message };
  }

  const baseUrl = getBaseUrl(creds.isSandbox);

  try {
    const res = await fetch(`${baseUrl}/aladdin/api/v1/stores`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenRes.token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data) {
      let storeList: PathaoStore[] = [];
      if (Array.isArray(data.data)) {
        storeList = data.data;
      } else if (data.data?.data && Array.isArray(data.data.data)) {
        storeList = data.data.data;
      }

      return {
        success: true,
        stores: storeList,
      };
    }

    return {
      success: false,
      message: data?.message || `Failed to fetch Pathao stores (HTTP ${res.status})`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Error fetching Pathao stores',
    };
  }
}

/**
 * Create a new consignment / parcel order in Pathao
 */
export async function createPathaoOrder(
  creds: PathaoCredentials,
  payload: PathaoOrderPayload
): Promise<{
  success: boolean;
  message: string;
  consignmentId?: string;
  trackingUrl?: string;
  deliveryFee?: number;
  raw?: any;
}> {
  const tokenRes = await getPathaoToken(creds);
  if (!tokenRes.success || !tokenRes.token) {
    return { success: false, message: tokenRes.message || 'Cannot authenticate with Pathao' };
  }

  const baseUrl = getBaseUrl(creds.isSandbox);
  const storeId = Number(payload.storeId || creds.storeId);

  if (!storeId || isNaN(storeId)) {
    return {
      success: false,
      message: 'Pathao Store ID is missing. Please configure your Store ID in Courier Settings.',
    };
  }

  const pathaoPayload = {
    store_id: storeId,
    merchant_order_id: payload.merchantOrderId,
    recipient_name: payload.recipientName,
    recipient_phone: formatPathaoPhone(payload.recipientPhone),
    recipient_address: payload.recipientAddress,
    recipient_city: payload.recipientCity || 1, // 1 is Dhaka City
    recipient_zone: payload.recipientZone || 1,
    recipient_area: payload.recipientArea || 1,
    delivery_type: payload.deliveryType || 48, // 48: Normal, 12: On-demand
    item_type: payload.itemType || 2, // 2: Parcel
    special_instruction: payload.specialInstruction || 'Jeans BD - Fragile / Denim Apparel',
    item_quantity: payload.itemQuantity || 1,
    item_weight: payload.itemWeight || 0.5,
    amount_to_collect: Math.max(0, Math.round(payload.amountToCollect)),
    item_description: payload.itemDescription || 'Premium Denim Jeans',
  };

  try {
    const res = await fetch(`${baseUrl}/aladdin/api/v1/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenRes.token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(pathaoPayload),
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data && (data.type === 'success' || data.data?.consignment_id)) {
      const cId = data.data?.consignment_id;
      const trackingUrl = `https://pathao.com/courier-tracking/?consignment_id=${cId}`;

      return {
        success: true,
        message: data.message || 'Consignment created successfully in Pathao!',
        consignmentId: cId,
        trackingUrl,
        deliveryFee: data.data?.delivery_fee,
        raw: data,
      };
    }

    let errMsg = data?.message || `Failed to create Pathao consignment (HTTP ${res.status})`;
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
      message: err?.message || 'Error communicating with Pathao API.',
    };
  }
}

/**
 * Check delivery and tracking info of a consignment from Pathao
 */
export async function getPathaoStatus(
  creds: PathaoCredentials,
  consignmentId: string
): Promise<{
  success: boolean;
  statusText?: string;
  humanStatus?: string;
  message?: string;
  raw?: any;
}> {
  const tokenRes = await getPathaoToken(creds);
  if (!tokenRes.success || !tokenRes.token) {
    return { success: false, message: tokenRes.message };
  }

  const baseUrl = getBaseUrl(creds.isSandbox);

  try {
    const res = await fetch(`${baseUrl}/aladdin/api/v1/orders/${encodeURIComponent(consignmentId)}/info`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenRes.token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.data) {
      const rawStatus = data.data.order_status || 'Unknown';
      const humanStatus = mapPathaoStatus(rawStatus);

      return {
        success: true,
        statusText: rawStatus,
        humanStatus,
        message: 'Status retrieved successfully',
        raw: data,
      };
    }

    return {
      success: false,
      message: data?.message || 'Consignment not found in Pathao.',
      raw: data,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Error querying Pathao consignment.',
    };
  }
}

/**
 * Human-friendly Pathao status with English and Bengali labels
 */
export function mapPathaoStatus(status: string): string {
  const s = (status || '').toLowerCase().trim();
  switch (s) {
    case 'pending':
      return 'Pending Pickup (পিকআপ অপেক্ষমান)';
    case 'accepted':
      return 'Accepted by Rider (রাইডার গ্রহণ করেছে)';
    case 'in_transit':
    case 'in transit':
      return 'In Transit (গন্তব্যের পথে)';
    case 'delivered':
      return 'Delivered (সফলভাবে ডেলিভার্ড)';
    case 'partial_delivered':
    case 'partial delivery':
      return 'Partially Delivered (আংশিক ডেলিভার্ড)';
    case 'returned':
      return 'Returned to Merchant (রিটার্ন করা হয়েছে)';
    case 'cancelled':
      return 'Cancelled (বাতিল)';
    case 'on_hold':
    case 'on hold':
      return 'On Hold (স্থগিত)';
    default:
      return status || 'Processing';
  }
}
