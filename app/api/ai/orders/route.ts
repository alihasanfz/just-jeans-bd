import { NextRequest, NextResponse } from 'next/server';
import { OrderAiService } from '@/lib/services/ai/orderAiService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'verify';
    const body = await req.json();

    if (action === 'verify') {
      const order = body.order;
      const allOrders = body.allOrders || [];
      if (!order) {
        return NextResponse.json({ success: false, error: 'Missing order in request body' }, { status: 400 });
      }
      const verification = OrderAiService.verifyOrder(order, allOrders);
      return NextResponse.json({ success: true, verification });
    }

    if (action === 'delays') {
      const orders = body.orders || [];
      const delayAlerts = OrderAiService.detectDeliveryDelays(orders);
      return NextResponse.json({ success: true, alerts: delayAlerts });
    }

    if (action === 'notify') {
      const order = body.order;
      const eventType = body.eventType || 'order_confirmed';
      const channel = body.channel || 'sms';
      if (!order) {
        return NextResponse.json({ success: false, error: 'Missing order in request body' }, { status: 400 });
      }
      const copy = OrderAiService.generateNotificationCopy(order, eventType, channel);
      return NextResponse.json({ success: true, copy });
    }

    return NextResponse.json({ success: false, error: 'Unknown action parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('API /api/ai/orders error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'AI Order Processing Failed' }, { status: 500 });
  }
}
