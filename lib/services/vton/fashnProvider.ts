import { IVirtualTryOnProvider, TryOnJobRequest, VTOStatusResult } from './types';

export class FashnAIProvider implements IVirtualTryOnProvider {
  public readonly id = 'fashn';
  public readonly name = 'Fashn.ai Virtual Try-On';

  private getApiKey(): string {
    return (
      process.env.FASHN_API_KEY ||
      (process.env.VIRTUAL_TRYON_API_KEY?.startsWith('fa_') ? process.env.VIRTUAL_TRYON_API_KEY : '') ||
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
      throw new Error('Fashn.ai API Key is not configured. Set FASHN_API_KEY or VIRTUAL_TRYON_API_KEY in environment variables.');
    }

    const apiUrl = process.env.FASHN_API_URL || 'https://api.fashn.ai/v1/run';
    const category =
      request.garmentType === 'jeans' || request.garmentType === 'pants'
        ? 'bottoms'
        : request.garmentType === 'dress'
        ? 'one-pieces'
        : 'tops';

    const payload = {
      model_image: request.humanImage,
      garment_image: request.garmentImage,
      category,
      mode: 'balanced',
      num_samples: 1,
      moderation_filter: false,
    };

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Fashn.ai API request failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const jobId = data.id || `fashn-${Date.now()}`;

    if (data.status === 'completed' && (data.output?.[0] || data.output)) {
      return {
        providerJobId: jobId,
        status: 'completed',
        resultImageUrl: Array.isArray(data.output) ? data.output[0] : data.output,
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
      throw new Error('Fashn.ai API Key missing.');
    }

    const statusUrl = `https://api.fashn.ai/v1/status/${providerJobId}`;
    const res = await fetch(statusUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      const err = await res.text();
      return {
        status: 'failed',
        progressPercent: 0,
        stepDescription: 'Failed to communicate with Fashn.ai',
        errorMessage: `HTTP ${res.status}: ${err}`,
      };
    }

    const data = await res.json();

    if (data.status === 'completed') {
      const outputImg = Array.isArray(data.output) ? data.output[0] : data.output;
      return {
        status: 'completed',
        progressPercent: 100,
        stepDescription: 'Fitting finalized realistically',
        resultImageUrl: outputImg,
      };
    }

    if (data.status === 'failed') {
      return {
        status: 'failed',
        progressPercent: 0,
        stepDescription: 'Try-on failed',
        errorMessage: data.error?.message || 'Fashn.ai generation failed',
      };
    }

    return {
      status: 'processing',
      progressPercent: 65,
      stepDescription: 'Synthesizing garment folds & lighting...',
    };
  }

  public async cancelTryOnJob(providerJobId: string): Promise<boolean> {
    const apiKey = this.getApiKey();
    if (!apiKey) return false;
    try {
      await fetch(`https://api.fashn.ai/v1/cancel/${providerJobId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return true;
    } catch (_) {
      return false;
    }
  }
}
