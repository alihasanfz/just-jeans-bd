import { IVirtualTryOnProvider, TryOnJobRequest, VTOStatusResult } from './types';

export class ReplicateIDMVTONProvider implements IVirtualTryOnProvider {
  public readonly id = 'replicate';
  public readonly name = 'Replicate IDM-VTON Diffusion';

  private getApiKey(): string {
    return (
      process.env.REPLICATE_API_TOKEN ||
      (process.env.VIRTUAL_TRYON_API_KEY?.startsWith('r8_') ? process.env.VIRTUAL_TRYON_API_KEY : '') ||
      ''
    ).trim();
  }

  public isConfigured(): boolean {
    return !!this.getApiKey();
  }

  public async createTryOnJob(request: TryOnJobRequest): Promise<{
    providerJobId: string;
    status: 'queued' | 'processing' | 'completed';
    resultImageUrl?: string;
  }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Replicate API Token is not configured. Set REPLICATE_API_TOKEN in environment variables.');
    }

    const category =
      request.garmentType === 'jeans' || request.garmentType === 'pants'
        ? 'lower_body'
        : request.garmentType === 'dress'
        ? 'dresses'
        : 'upper_body';

    const version = 'c871bb9b046616b680466e01e6659c258d44743ec992e59174526d246c757cbb';

    const res = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${apiKey}`,
      },
      body: JSON.stringify({
        version,
        input: {
          human_img: request.humanImage,
          garm_img: request.garmentImage,
          garment_des: `${request.productName || request.garmentType} in size ${request.size || 'M'} ${request.color || ''}`,
          category,
          is_checked: true,
          is_checked_crop: false,
          denoise_steps: 30,
          seed: 42,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Replicate API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const jobId = data.id;

    if (data.status === 'succeeded' && data.output) {
      const result = Array.isArray(data.output) ? data.output[0] : data.output;
      return {
        providerJobId: jobId,
        status: 'completed',
        resultImageUrl: result,
      };
    }

    return {
      providerJobId: jobId,
      status: 'processing',
    };
  }

  public async getTryOnJobStatus(providerJobId: string): Promise<VTOStatusResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Replicate API Token missing.');
    }

    const res = await fetch(`https://api.replicate.com/v1/predictions/${providerJobId}`, {
      headers: { Authorization: `Token ${apiKey}` },
    });

    if (!res.ok) {
      const err = await res.text();
      return {
        status: 'failed',
        progressPercent: 0,
        stepDescription: 'Communication with Replicate failed',
        errorMessage: `HTTP ${res.status}: ${err}`,
      };
    }

    const data = await res.json();

    if (data.status === 'succeeded') {
      const outputImg = Array.isArray(data.output) ? data.output[0] : data.output;
      return {
        status: 'completed',
        progressPercent: 100,
        stepDescription: 'Realistic fitting rendered',
        resultImageUrl: outputImg,
      };
    }

    if (data.status === 'failed' || data.status === 'canceled') {
      return {
        status: 'failed',
        progressPercent: 0,
        stepDescription: 'Inference failed',
        errorMessage: data.error || `Prediction ended with status ${data.status}`,
      };
    }

    return {
      status: 'processing',
      progressPercent: data.status === 'starting' ? 30 : 70,
      stepDescription: data.status === 'starting' ? 'Preparing IDM-VTON model pipeline...' : 'Draping garment with diffusion inpainting...',
    };
  }

  public async cancelTryOnJob(providerJobId: string): Promise<boolean> {
    const apiKey = this.getApiKey();
    if (!apiKey) return false;
    try {
      await fetch(`https://api.replicate.com/v1/predictions/${providerJobId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Token ${apiKey}` },
      });
      return true;
    } catch (_) {
      return false;
    }
  }
}
