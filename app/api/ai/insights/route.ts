import { NextRequest, NextResponse } from 'next/server';
import { BusinessIntelligenceService } from '@/lib/services/ai/businessIntelligenceService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orders = body.orders || [];
    const products = body.products || [];

    const insights = await BusinessIntelligenceService.generateInsights(orders, products);
    return NextResponse.json({ success: true, insights });
  } catch (error: any) {
    console.error('API /api/ai/insights error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Insights generation error' }, { status: 500 });
  }
}
