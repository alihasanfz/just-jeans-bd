import { NextRequest, NextResponse } from 'next/server';
import { VirtualTryOnOrchestrator } from '@/lib/services/vton/orchestratorService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds limit for serverless initialization

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      humanImage,
      customerImage, // support both naming conventions
      garmentImage,
      garmentType = 'jacket',
      category = 'tops',
      productName = '',
      size = 'M',
      color = '',
      userId,
      productId,
    } = body;

    const activeHumanImg = humanImage || customerImage;
    if (!activeHumanImg) {
      return NextResponse.json(
        { success: false, error: 'A customer photo (camera capture or upload) is required.' },
        { status: 400 }
      );
    }

    if (!garmentImage) {
      return NextResponse.json(
        { success: false, error: 'A product garment image is required for virtual fitting.' },
        { status: 400 }
      );
    }

    const orchestrator = VirtualTryOnOrchestrator.getInstance();
    const result = await orchestrator.submitTryOnJob({
      humanImage: activeHumanImg,
      garmentImage,
      garmentType,
      category,
      productName,
      size,
      color,
      userId,
      productId,
    });

    return NextResponse.json({
      success: true,
      jobId: result.jobId,
      status: result.status,
      provider: result.provider,
      resultImageUrl: result.resultImageUrl,
      pollIntervalMs: 2000,
    });
  } catch (err: any) {
    console.error('Virtual Try-On submission error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Failed to submit Virtual Try-On job',
      },
      { status: 500 }
    );
  }
}
