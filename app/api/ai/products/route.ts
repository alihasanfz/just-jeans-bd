import { NextRequest, NextResponse } from 'next/server';
import { ProductAiService } from '@/lib/services/ai/productAiService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'generate';
    const body = await req.json();

    if (action === 'generate') {
      const generated = await ProductAiService.generateProductDetails(body);
      return NextResponse.json({ success: true, data: generated });
    }

    if (action === 'stock') {
      const products = body.products || [];
      const threshold = Number(body.threshold) || 5;
      const alerts = ProductAiService.monitorStock(products, threshold);
      return NextResponse.json({ success: true, alerts });
    }

    if (action === 'duplicates') {
      const products = body.products || [];
      const candidate = body.candidate;
      const result = ProductAiService.detectDuplicates(products, candidate);
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ success: false, error: 'Unknown action parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('API /api/ai/products error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'AI Product Processing Failed' }, { status: 500 });
  }
}
