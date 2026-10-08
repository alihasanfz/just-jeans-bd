import { NextRequest, NextResponse } from 'next/server';
import { VirtualTryOnOrchestrator } from '@/lib/services/vton/orchestratorService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const orchestrator = VirtualTryOnOrchestrator.getInstance();
    const job = await orchestrator.getJobStatus(jobId);

    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: job.status,
      stepDescription: job.stepDescription,
      progressPercent: job.progressPercent,
      resultImageUrl: job.resultImageUrl,
      beforeImageUrl: job.inputImageUrl,
      garmentImageUrl: job.garmentImageUrl,
      garmentType: job.garmentType,
      productName: job.productName,
      provider: job.provider,
      processingTimeMs: job.processingTimeMs,
      error: job.errorMessage,
    });
  } catch (err: any) {
    console.error('Virtual Try-On status poll error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Failed to check Virtual Try-On job status',
      },
      { status: 404 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    const orchestrator = VirtualTryOnOrchestrator.getInstance();
    const canceled = await orchestrator.cancelJob(jobId);
    return NextResponse.json({ success: canceled });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
