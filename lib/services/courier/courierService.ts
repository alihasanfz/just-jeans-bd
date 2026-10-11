import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { CourierSettings, Order } from '@/types';
import { DEFAULT_SITE_SETTINGS } from '@/lib/data/mockData';
import {
  createSteadfastOrder,
  getSteadfastStatus,
  testSteadfastConnection,
} from './steadfast';
import {
  createPathaoOrder,
  getPathaoStatus,
  getPathaoStores,
  testPathaoConnection,
} from './pathao';

/**
 * Load courier settings on the server side:
 * 1. Checks Supabase site_settings table (data.courierSettings)
 * 2. Merges with environment variables (.env.local) if available
 * 3. Falls back to default settings
 */
export async function loadServerCourierSettings(): Promise<CourierSettings> {
  const fallback = DEFAULT_SITE_SETTINGS.courierSettings!;

  let dbSettings: CourierSettings | null = null;

  try {
    const client = isSupabaseAdminConfigured ? supabaseAdmin : isSupabaseConfigured ? supabase : null;
    if (client) {
      const { data, error } = await client
        .from('site_settings')
        .select('data')
        .eq('id', 1)
        .maybeSingle();

      if (!error && data?.data?.courierSettings) {
        dbSettings = data.data.courierSettings;
      }
    }
  } catch (err) {
    console.warn('Could not read courier settings from Supabase:', err);
  }

  const merged: CourierSettings = {
    defaultCourierDhaka: dbSettings?.defaultCourierDhaka || fallback.defaultCourierDhaka,
    defaultCourierOutsideDhaka: dbSettings?.defaultCourierOutsideDhaka || fallback.defaultCourierOutsideDhaka,
    autoDispatchOnConfirm: dbSettings?.autoDispatchOnConfirm ?? fallback.autoDispatchOnConfirm,
    steadfast: {
      enabled: dbSettings?.steadfast?.enabled ?? Boolean(process.env.STEADFAST_API_KEY),
      apiKey: dbSettings?.steadfast?.apiKey || process.env.STEADFAST_API_KEY || '',
      secretKey: dbSettings?.steadfast?.secretKey || process.env.STEADFAST_SECRET_KEY || '',
      baseUrl: dbSettings?.steadfast?.baseUrl || process.env.STEADFAST_BASE_URL || 'https://portal.steadfast.com.bd/api/v1',
      defaultNote: dbSettings?.steadfast?.defaultNote || 'Jeans BD Premium Denim',
    },
    pathao: {
      enabled: dbSettings?.pathao?.enabled ?? Boolean(process.env.PATHAO_CLIENT_ID),
      clientId: dbSettings?.pathao?.clientId || process.env.PATHAO_CLIENT_ID || '',
      clientSecret: dbSettings?.pathao?.clientSecret || process.env.PATHAO_CLIENT_SECRET || '',
      username: dbSettings?.pathao?.username || process.env.PATHAO_USERNAME || '',
      password: dbSettings?.pathao?.password || process.env.PATHAO_PASSWORD || '',
      storeId: dbSettings?.pathao?.storeId || process.env.PATHAO_STORE_ID || '',
      isSandbox: dbSettings?.pathao?.isSandbox ?? (process.env.PATHAO_IS_SANDBOX === 'true'),
      defaultDeliveryType: dbSettings?.pathao?.defaultDeliveryType || 48,
      defaultItemType: dbSettings?.pathao?.defaultItemType || 2,
    },
    lastTested: dbSettings?.lastTested,
  };

  return merged;
}

/**
 * Save courier settings to Supabase site_settings table
 */
export async function saveServerCourierSettings(
  settings: Partial<CourierSettings>
): Promise<{ success: boolean; message?: string }> {
  try {
    const currentSettings = await loadServerCourierSettings();
    const updatedCourierSettings: CourierSettings = {
      ...currentSettings,
      ...settings,
      steadfast: {
        ...currentSettings.steadfast,
        ...(settings.steadfast || {}),
      },
      pathao: {
        ...currentSettings.pathao,
        ...(settings.pathao || {}),
      },
    };

    const client = isSupabaseAdminConfigured ? supabaseAdmin : isSupabaseConfigured ? supabase : null;
    if (client) {
      // First get existing site settings data
      const { data: existing } = await client
        .from('site_settings')
        .select('data')
        .eq('id', 1)
        .maybeSingle();

      const existingData = existing?.data || DEFAULT_SITE_SETTINGS;
      const mergedData = {
        ...existingData,
        courierSettings: updatedCourierSettings,
      };

      const { error } = await client.from('site_settings').upsert({
        id: 1,
        data: mergedData,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        return { success: false, message: error.message };
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to save courier settings' };
  }
}

export interface DispatchOrderResult {
  success: boolean;
  message: string;
  trackingCode?: string;
  consignmentId?: string;
  trackingUrl?: string;
  provider?: string;
  raw?: any;
}

/**
 * Dispatch an order to Steadfast or Pathao
 */
export async function dispatchOrder(
  order: Order,
  courierProvider: 'Steadfast' | 'Pathao' | 'auto',
  options?: {
    customNote?: string;
    overrideCodAmount?: number;
    pathaoStoreId?: string;
  }
): Promise<DispatchOrderResult> {
  const settings = await loadServerCourierSettings();

  // Resolve provider if set to auto
  let provider = courierProvider;
  if (provider === 'auto') {
    const isDhaka = (order.customer.district || '').toLowerCase().includes('dhaka');
    provider = isDhaka ? settings.defaultCourierDhaka : settings.defaultCourierOutsideDhaka;
  }

  // Calculate COD amount: if COD payment method, collect full totalAmount unless prepaid
  const isCod = order.paymentMethod === 'cod';
  const codAmount = options?.overrideCodAmount !== undefined
    ? options.overrideCodAmount
    : isCod
    ? order.totalAmount
    : 0;

  const fullAddress = `${order.customer.address}, ${order.customer.area}, ${order.customer.district}`;

  if (provider === 'Steadfast') {
    if (!settings.steadfast.apiKey || !settings.steadfast.secretKey) {
      return {
        success: false,
        message: 'Steadfast API Key or Secret Key is not configured. Please add keys in Courier Settings.',
      };
    }

    const res = await createSteadfastOrder(
      settings.steadfast.apiKey,
      settings.steadfast.secretKey,
      {
        invoice: order.orderNumber,
        recipient_name: order.customer.fullName,
        recipient_phone: order.customer.phone,
        recipient_address: fullAddress,
        cod_amount: codAmount,
        note: options?.customNote || settings.steadfast.defaultNote || 'Jeans BD Premium Denim',
      },
      settings.steadfast.baseUrl
    );

    return {
      ...res,
      provider: 'Steadfast Courier',
    };
  }

  if (provider === 'Pathao') {
    const creds = {
      clientId: settings.pathao.clientId,
      clientSecret: settings.pathao.clientSecret,
      username: settings.pathao.username,
      password: settings.pathao.password,
      storeId: options?.pathaoStoreId || settings.pathao.storeId,
      isSandbox: settings.pathao.isSandbox,
    };

    if (!creds.clientId || !creds.clientSecret || !creds.username || !creds.password) {
      return {
        success: false,
        message: 'Pathao Merchant credentials are missing. Please add credentials in Courier Settings.',
      };
    }

    if (!creds.storeId) {
      return {
        success: false,
        message: 'Pathao Store ID is missing. Please select or enter your Store ID in Courier Settings.',
      };
    }

    const res = await createPathaoOrder(creds, {
      storeId: creds.storeId,
      merchantOrderId: order.orderNumber,
      recipientName: order.customer.fullName,
      recipientPhone: order.customer.phone,
      recipientAddress: fullAddress,
      amountToCollect: codAmount,
      itemQuantity: order.items?.reduce((acc, it) => acc + it.quantity, 0) || 1,
      itemWeight: 0.5,
      itemDescription: order.items?.map((it) => `${it.name} (${it.size})`).join(', ') || 'Denim Jeans',
      specialInstruction: options?.customNote || 'Jeans BD Apparel - Call before delivery',
      deliveryType: settings.pathao.defaultDeliveryType || 48,
      itemType: settings.pathao.defaultItemType || 2,
    });

    return {
      ...res,
      trackingCode: res.consignmentId,
      provider: 'Pathao Express',
    };
  }

  return {
    success: false,
    message: `Unsupported courier provider: ${courierProvider}`,
  };
}

/**
 * Track live consignment status
 */
export async function trackConsignment(
  provider: 'Steadfast' | 'Pathao' | string,
  identifier: { trackingCode?: string; consignmentId?: string; invoice?: string }
) {
  const settings = await loadServerCourierSettings();
  const lower = (provider || '').toLowerCase();

  if (lower.includes('steadfast')) {
    if (!settings.steadfast.apiKey || !settings.steadfast.secretKey) {
      return { success: false, message: 'Steadfast API keys are not configured.' };
    }
    return getSteadfastStatus(
      settings.steadfast.apiKey,
      settings.steadfast.secretKey,
      identifier,
      settings.steadfast.baseUrl
    );
  }

  if (lower.includes('pathao')) {
    const creds = {
      clientId: settings.pathao.clientId,
      clientSecret: settings.pathao.clientSecret,
      username: settings.pathao.username,
      password: settings.pathao.password,
      isSandbox: settings.pathao.isSandbox,
    };
    const cId = identifier.consignmentId || identifier.trackingCode;
    if (!cId) {
      return { success: false, message: 'Consignment ID required for Pathao tracking.' };
    }
    return getPathaoStatus(creds, cId);
  }

  return { success: false, message: `Tracking not available for courier: ${provider}` };
}
