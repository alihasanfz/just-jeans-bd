import { NextRequest, NextResponse } from 'next/server';
import { VirtualTryOnOrchestrator } from '@/lib/services/vton/orchestratorService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      modelImage,
      customerImage,
      humanImage,
      garmentImage,
      category = 'upper_body',
      description = '',
      garmentType = 'jacket',
    } = body;

    const activeHumanImg = modelImage || humanImage || customerImage;
    if (!activeHumanImg || !garmentImage) {
      return NextResponse.json(
        { success: false, error: 'A valid customer photo and garment image are required.' },
        { status: 400 }
      );
    }

    const normCategory =
      category === 'lower_body' || category === 'bottoms' || garmentType === 'jeans' || garmentType === 'pants'
        ? 'bottoms'
        : 'tops';

    const orchestrator = VirtualTryOnOrchestrator.getInstance();
    const submission = await orchestrator.submitTryOnJob({
      humanImage: activeHumanImg,
      garmentImage,
      garmentType,
      category: normCategory,
      productName: description,
    });

    // Await completion or return job status
    let job = await orchestrator.getJobStatus(submission.jobId);
    let attempts = 0;
    while ((job.status === 'queued' || job.status === 'processing') && attempts < 25) {
      await new Promise((r) => setTimeout(r, 1600));
      job = await orchestrator.getJobStatus(submission.jobId);
      attempts++;
    }

    if (job.status === 'completed' && job.resultImageUrl) {
      return NextResponse.json({
        success: true,
        resultImageUrl: job.resultImageUrl,
        beforeImageUrl: activeHumanImg,
        provider: job.provider,
        jobId: job.id,
        processingTimeMs: job.processingTimeMs,
      });
    }

    if (job.status === 'failed') {
      return NextResponse.json({
        success: false,
        error: job.errorMessage || 'AI Virtual Try-On generation failed',
        jobId: job.id,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: job.status,
      resultImageUrl: job.resultImageUrl || activeHumanImg,
      beforeImageUrl: activeHumanImg,
      provider: job.provider,
      stepDescription: job.stepDescription,
      progressPercent: job.progressPercent,
    });
  } catch (error: any) {
    console.error('API /api/try-on error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Virtual Try-On error occurred',
      },
      { status: 500 }
    );
  }
}
