import { NextRequest, NextResponse } from 'next/server';
import { VirtualTryOnOrchestrator } from '@/lib/services/vton/orchestratorService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerImage,
      humanImage,
      garmentImage,
      garmentType = 'jacket',
      category = 'tops',
      size = 'M',
      color = '',
      productName = '',
    } = body;

    const activeHumanImg = humanImage || customerImage;
    if (!activeHumanImg || !garmentImage) {
      return NextResponse.json(
        { error: 'Missing customerImage or garmentImage in request payload' },
        { status: 400 }
      );
    }

    const orchestrator = VirtualTryOnOrchestrator.getInstance();
    const submission = await orchestrator.submitTryOnJob({
      humanImage: activeHumanImg,
      garmentImage,
      garmentType,
      category,
      productName,
      size,
      color,
    });

    // Check status or poll briefly for synchronous callers
    let job = await orchestrator.getJobStatus(submission.jobId);
    let attempts = 0;
    while ((job.status === 'queued' || job.status === 'processing') && attempts < 25) {
      await new Promise((r) => setTimeout(r, 1500));
      job = await orchestrator.getJobStatus(submission.jobId);
      attempts++;
    }

    if (job.status === 'completed' && job.resultImageUrl) {
      return NextResponse.json({
        success: true,
        resultImageUrl: job.resultImageUrl,
        beforeImageUrl: activeHumanImg,
        provider: job.provider,
        status: 'completed',
        jobId: job.id,
      });
    }

    return NextResponse.json({
      success: job.status !== 'failed',
      jobId: job.id,
      status: job.status,
      resultImageUrl: job.resultImageUrl || activeHumanImg,
      beforeImageUrl: activeHumanImg,
      provider: job.provider,
      stepDescription: job.stepDescription,
      progressPercent: job.progressPercent,
      error: job.errorMessage,
    });
  } catch (error: any) {
    console.error('Virtual Try-On AI error:', error);
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
