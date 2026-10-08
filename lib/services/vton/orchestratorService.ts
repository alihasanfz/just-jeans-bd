import { TryOnJobRequest, StoredTryOnJob, VTOStatusResult } from './types';
import { VirtualTryOnRegistry } from './providerRegistry';
import { TryOnJobRepository } from './jobRepository';

export class VirtualTryOnOrchestrator {
  private static instance: VirtualTryOnOrchestrator;
  private registry = VirtualTryOnRegistry.getInstance();
  private repository = TryOnJobRepository.getInstance();

  public static getInstance(): VirtualTryOnOrchestrator {
    if (!VirtualTryOnOrchestrator.instance) {
      VirtualTryOnOrchestrator.instance = new VirtualTryOnOrchestrator();
    }
    return VirtualTryOnOrchestrator.instance;
  }

  /**
   * Submit a new Virtual Try-On inference job
   */
  public async submitTryOnJob(params: {
    humanImage: string;
    garmentImage: string;
    garmentType: string;
    category?: string;
    productName?: string;
    size?: string;
    color?: string;
    userId?: string;
    productId?: string;
  }): Promise<{ jobId: string; status: string; provider: string }> {
    if (!params.humanImage || typeof params.humanImage !== 'string') {
      throw new Error('A valid customer photograph is required for Virtual Try-On.');
    }
    if (!params.garmentImage || typeof params.garmentImage !== 'string') {
      throw new Error('A valid product garment image is required for Virtual Try-On.');
    }

    const provider = this.registry.getActiveProvider();
    if (!provider || !provider.isConfigured()) {
      const configuredName = process.env.VIRTUAL_TRYON_PROVIDER || 'replicate';
      throw new Error(
        `AI Virtual Try-On Provider (${configuredName}) is not configured. Please supply VIRTUAL_TRYON_API_KEY, REPLICATE_API_TOKEN, FASHN_API_KEY, or FAL_KEY.`
      );
    }

    const jobId = `VTO-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const normalizedGarmentType: any = params.garmentType || 'jacket';
    const normalizedCategory: any =
      params.category ||
      (normalizedGarmentType === 'jeans' || normalizedGarmentType === 'pants' ? 'bottoms' : 'tops');

    const retentionHours = parseInt(process.env.TRYON_RETENTION_HOURS || '24', 10);
    const expiresAt = new Date(Date.now() + retentionHours * 3600 * 1000).toISOString();

    const initialJob: StoredTryOnJob = {
      id: jobId,
      userId: params.userId,
      productId: params.productId,
      productName: params.productName || 'Garment Item',
      inputImageUrl: params.humanImage,
      garmentImageUrl: params.garmentImage,
      garmentType: normalizedGarmentType,
      category: normalizedCategory,
      selectedSize: params.size || 'M',
      selectedColor: params.color || '',
      provider: provider.id,
      status: 'queued',
      stepDescription: 'Preparing your photo and clothing model...',
      progressPercent: 15,
      processingTimeMs: 0,
      createdAt: new Date().toISOString(),
      expiresAt,
    };

    await this.repository.saveJob(initialJob);

    // Dispatch job to the active provider asynchronously
    try {
      const jobRequest: TryOnJobRequest = {
        id: jobId,
        humanImage: params.humanImage,
        garmentImage: params.garmentImage,
        garmentType: normalizedGarmentType,
        category: normalizedCategory,
        productName: params.productName,
        size: params.size,
        color: params.color,
        userId: params.userId,
        productId: params.productId,
      };

      const providerResult = await provider.createTryOnJob(jobRequest);

      const updates: Partial<StoredTryOnJob> = {
        providerJobId: providerResult.providerJobId,
        status: providerResult.status,
        stepDescription:
          providerResult.status === 'completed'
            ? 'Fitting finalized realistically'
            : 'Analyzing body pose & segmenting existing clothes...',
        progressPercent: providerResult.status === 'completed' ? 100 : 40,
        resultImageUrl: providerResult.resultImageUrl,
        completedAt: providerResult.status === 'completed' ? new Date().toISOString() : undefined,
      };

      await this.repository.updateJob(jobId, updates);
    } catch (err: any) {
      console.error(`Provider ${provider.id} error on job ${jobId}:`, err);
      await this.repository.updateJob(jobId, {
        status: 'failed',
        stepDescription: 'AI Try-On model initialization failed',
        errorMessage: err?.message || 'Failed to dispatch job to AI model',
      });
      throw err;
    }

    return {
      jobId,
      status: 'queued',
      provider: provider.name,
    };
  }

  /**
   * Poll status of an ongoing Try-On job
   */
  public async getJobStatus(jobId: string): Promise<StoredTryOnJob> {
    const job = await this.repository.getJob(jobId);
    if (!job) {
      throw new Error(`Virtual Try-On job not found: ${jobId}`);
    }

    // Check expiration
    if (new Date(job.expiresAt).getTime() < Date.now()) {
      if (job.status !== 'expired') {
        await this.repository.updateJob(jobId, { status: 'expired' });
      }
      return { ...job, status: 'expired', errorMessage: 'Job session expired.' };
    }

    // If job is already terminal, return directly
    if (job.status === 'completed' || job.status === 'failed' || job.status === 'expired') {
      return job;
    }

    // If job has a provider and is still processing, poll provider status
    if (job.providerJobId && (job.status === 'queued' || job.status === 'processing')) {
      const provider = this.registry.getProvider(job.provider);
      if (provider) {
        try {
          const providerStatus: VTOStatusResult = await provider.getTryOnJobStatus(job.providerJobId);

          const timeElapsed = Date.now() - new Date(job.createdAt).getTime();

          if (providerStatus.status === 'completed' && providerStatus.resultImageUrl) {
            const updated = await this.repository.updateJob(jobId, {
              status: 'completed',
              resultImageUrl: providerStatus.resultImageUrl,
              progressPercent: 100,
              stepDescription: 'Garment replacement completed with natural lighting & drape',
              processingTimeMs: timeElapsed,
              completedAt: new Date().toISOString(),
            });
            return updated || job;
          }

          if (providerStatus.status === 'failed') {
            const updated = await this.repository.updateJob(jobId, {
              status: 'failed',
              errorMessage: providerStatus.errorMessage || 'AI Virtual Try-On failed to generate',
              progressPercent: 0,
              stepDescription: 'Generation halted',
              processingTimeMs: timeElapsed,
            });
            return updated || job;
          }

          // Advance progress smoothly based on provider step
          const updated = await this.repository.updateJob(jobId, {
            status: 'processing',
            stepDescription: providerStatus.stepDescription || 'Draping garment according to human pose...',
            progressPercent: Math.max(job.progressPercent, providerStatus.progressPercent || 50),
            processingTimeMs: timeElapsed,
          });
          return updated || job;
        } catch (pollErr: any) {
          console.warn(`Error polling provider for job ${jobId}:`, pollErr);
        }
      }
    }

    return job;
  }

  /**
   * Cancel an ongoing Try-On job
   */
  public async cancelJob(jobId: string): Promise<boolean> {
    const job = await this.repository.getJob(jobId);
    if (!job) return false;

    if (job.providerJobId) {
      const provider = this.registry.getProvider(job.provider);
      if (provider?.cancelTryOnJob) {
        try {
          await provider.cancelTryOnJob(job.providerJobId);
        } catch (_) {}
      }
    }

    await this.repository.updateJob(jobId, {
      status: 'failed',
      stepDescription: 'Job canceled by user',
      errorMessage: 'Canceled',
    });

    return true;
  }
}
