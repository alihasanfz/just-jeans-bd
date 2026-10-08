import { IVirtualTryOnProvider, TryOnJobRequest, VTOStatusResult } from './types';

export class FalAIProvider implements IVirtualTryOnProvider {
  public readonly id = 'fal';
  public readonly name = 'Fal.ai Fast Diffusion VTON';

  private getApiKey(): string {
    return (process.env.FAL_KEY || '').trim();
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
      throw new Error('Fal.ai Key is not configured. Set FAL_KEY in environment variables.');
    }

    const res = await fetch('https://queue.fal.run/fal-ai/idm-vton', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${apiKey}`,
      },
      body: JSON.stringify({
        human_image_url: request.humanImage,
        garment_image_url: request.garmentImage,
        description: request.productName || `${request.garmentType} fashion apparel`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Fal.ai API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const requestId = data.request_id || `fal-${Date.now()}`;

    if (data.image?.url) {
      return {
        providerJobId: requestId,
        status: 'completed',
        resultImageUrl: data.image.url,
      };
    }

    return {
      providerJobId: requestId,
      status: 'processing',
    };
  }

  public async getTryOnJobStatus(providerJobId: string): Promise<VTOStatusResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Fal.ai Key missing.');
    }

    const res = await fetch(`https://queue.fal.run/fal-ai/idm-vton/requests/${providerJobId}/status`, {
      headers: { Authorization: `Key ${apiKey}` },
    });

    if (!res.ok) {
      return {
        status: 'failed',
        progressPercent: 0,
        stepDescription: 'Failed to check Fal.ai status',
        errorMessage: `HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    if (data.status === 'COMPLETED') {
      const resultRes = await fetch(`https://queue.fal.run/fal-ai/idm-vton/requests/${providerJobId}`, {
        headers: { Authorization: `Key ${apiKey}` },
      });
      const resultData = await resultRes.json();
      return {
        status: 'completed',
        progressPercent: 100,
        stepDescription: 'Try-on rendering finished',
        resultImageUrl: resultData.image?.url,
      };
    }

    if (data.status === 'FAILED') {
      return {
        status: 'failed',
        progressPercent: 0,
        stepDescription: 'Fal.ai queue error',
        errorMessage: data.error || 'Prediction failed',
      };
    }

    return {
      status: 'processing',
      progressPercent: 75,
      stepDescription: 'Synthesizing with neural diffusion...',
    };
  }
}
