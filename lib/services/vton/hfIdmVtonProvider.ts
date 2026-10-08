import { IVirtualTryOnProvider, TryOnJobRequest, VTOStatusResult } from './types';

/**
 * Hugging Face IDM-VTON Provider (100% FREE SOTA Virtual Try-On)
 * Runs the official IDM-VTON diffusion model hosted on Hugging Face Spaces.
 * No credit card or paid credits required!
 */
export class HuggingFaceIDMVTONProvider implements IVirtualTryOnProvider {
  public readonly id = 'hf-idm-vton';
  public readonly name = 'Hugging Face IDM-VTON (Free AI)';

  private getHfToken(): string {
    return (
      process.env.HF_TOKEN ||
      process.env.HUGGINGFACE_TOKEN ||
      (process.env.VIRTUAL_TRYON_API_KEY?.startsWith('hf_') ? process.env.VIRTUAL_TRYON_API_KEY : '') ||
      ''
    ).trim();
  }

  public isConfigured(): boolean {
    // The public space works even without a token, but a free token gives higher priority
    return true;
  }

  private toAbsoluteUrl(urlOrData: string): string {
    if (!urlOrData) return '';
    if (urlOrData.startsWith('data:') || urlOrData.startsWith('http://') || urlOrData.startsWith('https://')) {
      return urlOrData;
    }
    const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://just-jeans-bd-4ik7.vercel.app';
    return `${host.replace(/\/$/, '')}/${urlOrData.replace(/^\//, '')}`;
  }

  // Directly uploads image to the Hugging Face Gradio container filesystem (/upload)
  private async uploadToSpace(
    imageSource: string,
    defaultFilename: string,
    spaceUrl: string,
    token?: string
  ): Promise<string> {
    try {
      let blob: Blob;
      if (imageSource.startsWith('data:')) {
        const parts = imageSource.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const buffer = Buffer.from(parts[1], 'base64');
        blob = new Blob([buffer], { type: mime });
      } else {
        const fullUrl = this.toAbsoluteUrl(imageSource);
        const fetched = await fetch(fullUrl);
        if (!fetched.ok) {
          throw new Error(`Failed to fetch image: ${fetched.status}`);
        }
        const arrayBuf = await fetched.arrayBuffer();
        const mime = fetched.headers.get('content-type') || 'image/jpeg';
        blob = new Blob([arrayBuf], { type: mime });
      }

      const form = new FormData();
      form.append('files', blob, defaultFilename);

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${spaceUrl}/upload`, {
        method: 'POST',
        headers,
        body: form,
      });

      if (res.ok) {
        const paths = await res.json();
        if (Array.isArray(paths) && paths[0]) {
          return paths[0];
        }
      }
    } catch (err) {
      console.warn(`HF Space upload fallback for ${defaultFilename}:`, err);
    }

    return this.toAbsoluteUrl(imageSource);
  }

  public async createTryOnJob(request: TryOnJobRequest): Promise<{
    providerJobId: string;
    status: 'queued' | 'processing' | 'completed';
    resultImageUrl?: string;
  }> {
    const spaceUrl = process.env.HF_IDM_VTON_URL || 'https://yisol-idm-vton.hf.space';
    const token = this.getHfToken();

    const humanPath = await this.uploadToSpace(
      request.humanImage,
      `human_${Date.now()}.jpg`,
      spaceUrl,
      token
    );
    const garmentPath = await this.uploadToSpace(
      request.garmentImage,
      `garment_${Date.now()}.jpg`,
      spaceUrl,
      token
    );

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = {
      data: [
        {
          background: { path: humanPath },
          layers: [],
          composite: null,
        },
        { path: garmentPath },
        `${request.productName || request.garmentType} in size ${request.size || 'M'} ${request.color || ''}`,
        true, // is_checked: auto crop
        false, // is_checked_crop
        30, // denoise_steps
        42, // seed
      ],
    };

    const res = await fetch(`${spaceUrl}/call/tryon`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Hugging Face Space error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const eventId = data.event_id || `hf-${Date.now()}`;

    return {
      providerJobId: eventId,
      status: 'processing',
    };
  }

  public async getTryOnJobStatus(providerJobId: string): Promise<VTOStatusResult> {
    const spaceUrl = process.env.HF_IDM_VTON_URL || 'https://yisol-idm-vton.hf.space';
    const token = this.getHfToken();

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${spaceUrl}/call/tryon/${providerJobId}`, {
        headers,
      });

      if (!res.ok) {
        return {
          status: 'failed',
          progressPercent: 0,
          stepDescription: 'HF Space connection failed',
          errorMessage: `HTTP ${res.status}`,
        };
      }

      const streamText = await res.text();

      // Check if complete in SSE stream
      // Format: "event: complete\ndata: [ { "url": "https://..." } ]"
      if (streamText.includes('event: complete')) {
        const lines = streamText.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('event: complete') && lines[i + 1]?.startsWith('data:')) {
            const dataStr = lines[i + 1].replace(/^data:\s*/, '');
            try {
              const parsed = JSON.parse(dataStr);
              if (Array.isArray(parsed) && parsed[0]) {
                const outputObj = parsed[0];
                let outUrl = outputObj.url || outputObj.path || '';
                if (outUrl && !outUrl.startsWith('http')) {
                  outUrl = `${spaceUrl}/file=${outUrl}`;
                }
                if (outUrl) {
                  return {
                    status: 'completed',
                    progressPercent: 100,
                    stepDescription: 'IDM-VTON clothing replacement complete',
                    resultImageUrl: outUrl,
                  };
                }
              }
            } catch (_) {}
          }
        }
      }

      if (streamText.includes('event: error')) {
        return {
          status: 'failed',
          progressPercent: 0,
          stepDescription: 'AI generation error',
          errorMessage: 'IDM-VTON execution failed in space queue',
        };
      }

      return {
        status: 'processing',
        progressPercent: 60,
        stepDescription: 'IDM-VTON diffusion model is fitting garment to body...',
      };
    } catch (err: any) {
      return {
        status: 'processing',
        progressPercent: 40,
        stepDescription: 'Waiting for GPU diffusion worker...',
      };
    }
  }
}
