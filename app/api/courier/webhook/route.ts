import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => null);

    if (!payload) {
      return NextResponse.json({ message: 'No payload received' }, { status: 400 });
    }

    // Identify Steadfast or Pathao webhook payload
    const invoice = payload.invoice || payload.merchant_order_id;
    const status = payload.status || payload.order_status || payload.delivery_status;
    const trackingCode = payload.tracking_code || payload.consignment_id;

    if (invoice) {
      const client = isSupabaseAdminConfigured ? supabaseAdmin : isSupabaseConfigured ? supabase : null;
      if (client) {
        let orderStatus = 'shipped';
        const lower = String(status || '').toLowerCase();
        if (lower.includes('delivered')) orderStatus = 'delivered';
        else if (lower.includes('cancel')) orderStatus = 'cancelled';

        await client
          .from('orders')
          .update({
            order_status: orderStatus,
            tracking_number: trackingCode ? String(trackingCode) : undefined,
            updated_at: new Date().toISOString(),
          })
          .eq('order_number', invoice);
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Webhook failed' }, { status: 500 });
  }
}
