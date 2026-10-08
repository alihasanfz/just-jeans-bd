import { NextRequest, NextResponse } from 'next/server';
import { VirtualTryOnService } from '@/lib/services/virtualTryOnService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // 60s timeout for AI generation

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerImage,
      garmentImage,
      garmentType = 'jacket',
      category = 'tops',
      size = 'M',
      color = '',
      productName = '',
      manualTransform,
    } = body;

    if (!customerImage || !garmentImage) {
      return NextResponse.json(
        { error: 'Missing customerImage or garmentImage in request payload' },
        { status: 400 }
      );
    }

    const tryOnService = VirtualTryOnService.getInstance();
    const output = await tryOnService.generateTryOn({
      customerImage,
      garmentImage,
      garmentType,
      category,
      size,
      color,
      productName,
      manualTransform,
    });

    return NextResponse.json(output);
  } catch (error: any) {
    console.error('Virtual Try-On generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Virtual Try-On generation failed',
        status: 'failed',
      },
      { status: 500 }
    );
  }
}
