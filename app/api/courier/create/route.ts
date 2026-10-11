import { NextRequest, NextResponse } from 'next/server';
import { dispatchOrder } from '@/lib/services/courier/courierService';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Order } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order, courier, customNote, codAmount, pathaoStoreId }: {
      order: Order;
      courier: 'Steadfast' | 'Pathao' | 'auto';
      customNote?: string;
      codAmount?: number;
      pathaoStoreId?: string;
    } = body;

    if (!order || !order.customer || !order.orderNumber) {
      return NextResponse.json(
        { success: false, message: 'Invalid order data provided.' },
        { status: 400 }
      );
    }

    const result = await dispatchOrder(order, courier || 'auto', {
      customNote,
      overrideCodAmount: codAmount,
      pathaoStoreId,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    // Attempt to update cloud DB order row if it exists
    try {
      const client = isSupabaseAdminConfigured ? supabaseAdmin : isSupabaseConfigured ? supabase : null;
      if (client && order.orderNumber) {
        await client
          .from('orders')
          .update({
            tracking_number: result.trackingCode || result.consignmentId || '',
            order_status: 'shipped',
            updated_at: new Date().toISOString(),
          })
          .eq('order_number', order.orderNumber);
      }
    } catch (syncErr) {
      console.warn('Could not sync tracking update to Supabase orders table:', syncErr);
    }

    return NextResponse.json({
      success: true,
      message: result.message || 'Consignment created successfully!',
      trackingCode: result.trackingCode,
      consignmentId: result.consignmentId,
      trackingUrl: result.trackingUrl,
      provider: result.provider,
      raw: result.raw,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error creating consignment.' },
      { status: 500 }
    );
  }
}
