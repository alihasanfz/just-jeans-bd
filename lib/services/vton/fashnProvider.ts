import { IVirtualTryOnProvider, TryOnJobRequest, VTOStatusResult } from './types';

export class FashnAIProvider implements IVirtualTryOnProvider {
  public readonly id = 'fashn';
  public readonly name = 'Fashn.ai Virtual Try-On';

  private getApiKey(): string {
    if (process.env.FASHN_API_KEY) return process.env.FASHN_API_KEY.trim();
    const genericKey = (process.env.VIRTUAL_TRYON_API_KEY || '').trim();
    // Do not use Google (AQ./AIza) or Replicate (r8_) keys for Fashn.ai
    if (genericKey && !genericKey.startsWith('AQ.') && !genericKey.startsWith('AIza') && !genericKey.startsWith('r8_')) {
      return genericKey;
    }
    return '';
  }

  public isConfigured(): boolean {
    return !!this.getApiKey();
  }

  private toAbsoluteUrl(urlOrData: string): string {
    if (!urlOrData) return '';
    if (urlOrData.startsWith('data:') || urlOrData.startsWith('http://') || urlOrData.startsWith('https://')) {
      return urlOrData;
    }
    const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://just-jeans-bd-4ik7.vercel.app';
    return `${host.replace(/\/$/, '')}/${urlOrData.replace(/^\//, '')}`;
  }

  public async createTryOnJob(request: TryOnJobRequest): Promise<{
    providerJobId: string;
    status: 'queued' | 'processing' | 'completed';
    resultImageUrl?: string;
  }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error(
        'Fashn.ai API Key কনফিগার করা হয়নি। অনুগ্রহ করে Vercel Settings > Environment Variables-এ FASHN_API_KEY যোগ করুন।'
      );
    }

    const apiUrl = process.env.FASHN_API_URL || 'https://api.fashn.ai/v1/run';
    const category =
      request.garmentType === 'jeans' || request.garmentType === 'pants'
        ? 'bottoms'
        : request.garmentType === 'dress'
        ? 'one-pieces'
        : 'tops';

    const cleanHumanImg = this.toAbsoluteUrl(request.humanImage);
    const cleanGarmentImg = this.toAbsoluteUrl(request.garmentImage);

    const payload = {
      model_image: cleanHumanImg,
      garment_image: cleanGarmentImg,
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
      let parsedErr = errText;
      try {
        const jsonErr = JSON.parse(errText);
        parsedErr = jsonErr.error?.message || jsonErr.message || errText;
      } catch (_) {}

      if (res.status === 401) {
        throw new Error(
          'Fashn.ai API Key অননুমোদিত (401 Unauthorized: Invalid token)। অনুগ্রহ করে Vercel Environment Variables-এ আপনার সঠিক FASHN_API_KEY দিন।'
        );
      }

      throw new Error(`Fashn.ai API error (${res.status}): ${parsedErr}`);
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
      throw new Error('Fashn.ai API Key is missing.');
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
        stepDescription: 'Garment replacement completed with natural lighting & drape',
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
      progressPercent: data.status === 'starting' ? 30 : 70,
      stepDescription: 'Draping garment according to human pose & lighting...',
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
