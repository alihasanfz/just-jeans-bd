import { NextRequest, NextResponse } from 'next/server';
import { trackConsignment } from '@/lib/services/courier/courierService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get('courier') || searchParams.get('provider') || 'Steadfast';
    const trackingCode = searchParams.get('trackingCode') || searchParams.get('code') || '';
    const consignmentId = searchParams.get('consignmentId') || searchParams.get('cid') || '';
    const invoice = searchParams.get('invoice') || '';

    if (!trackingCode && !consignmentId && !invoice) {
      return NextResponse.json(
        { success: false, message: 'Tracking code or consignment ID is required.' },
        { status: 400 }
      );
    }

    const result = await trackConsignment(provider, {
      trackingCode: trackingCode || undefined,
      consignmentId: consignmentId || undefined,
      invoice: invoice || undefined,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error tracking consignment.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, trackingCode, consignmentId, invoice } = body;

    const result = await trackConsignment(provider || 'Steadfast', {
      trackingCode,
      consignmentId,
      invoice,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error tracking consignment.' },
      { status: 500 }
    );
  }
}
