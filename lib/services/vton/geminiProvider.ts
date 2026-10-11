import { IVirtualTryOnProvider, TryOnJobRequest, VTOStatusResult } from './types';

export class GeminiVisionProvider implements IVirtualTryOnProvider {
  public readonly id = 'gemini';
  public readonly name = 'Google Vision Multimodal Engine';

  private getApiKey(): string {
    return (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      (process.env.VIRTUAL_TRYON_API_KEY?.startsWith('AQ.') || process.env.VIRTUAL_TRYON_API_KEY?.startsWith('AIza')
        ? process.env.VIRTUAL_TRYON_API_KEY
        : '') ||
      ''
    ).trim();
  }

  public isConfigured(): boolean {
    return !!this.getApiKey();
  }

  private async toBase64Payload(imageSource: string): Promise<{ mimeType: string; data: string } | null> {
    try {
      if (imageSource.startsWith('data:')) {
        const matches = imageSource.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches && matches[1] && matches[2]) {
          return { mimeType: matches[1], data: matches[2] };
        }
      }
      const res = await fetch(imageSource);
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const contentType = res.headers.get('content-type') || 'image/jpeg';
      return { mimeType: contentType, data: base64 };
    } catch (e) {
      console.warn('Failed to parse Gemini image payload:', e);
      return null;
    }
  }

  // Gemini is direct generation; we cache completed results by providerJobId in memory
  private static completedResults = new Map<string, string>();

  public async createTryOnJob(request: TryOnJobRequest): Promise<{
    providerJobId: string;
    status: 'queued' | 'processing' | 'completed';
    resultImageUrl?: string;
  }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Gemini API Key is not configured. Set GEMINI_API_KEY or VIRTUAL_TRYON_API_KEY.');
    }

    const customerData = await this.toBase64Payload(request.humanImage);
    const garmentData = await this.toBase64Payload(request.garmentImage);

    if (!customerData || !garmentData) {
      throw new Error('Failed to load human or garment image for Gemini processing.');
    }

    const isBottom =
      request.category === 'bottoms' ||
      request.category === 'lower_body' ||
      request.garmentType === 'jeans' ||
      request.garmentType === 'pants' ||
      request.garmentType === 'shorts' ||
      request.garmentType === 'skirt';

    const promptText = `TASK: HIGH-PRECISION PHOTOREALISTIC VIRTUAL TRY-ON & BODY-REGION GARMENT SWAP.
INPUT 1: Customer photograph.
INPUT 2: Retail clothing product (${request.productName || request.garmentType}, Target Category: ${isBottom ? 'Lower Wear / Bottoms' : 'Upper Wear / Tops'}).

ANATOMICAL COVERAGE AREA:
${
  isBottom
    ? '- TARGET ZONE: Lower Body / Bottoms (Waist, Navel/Abdomen, Hips, Thighs, and Legs down to hem/ankles).\n- ACTION: Detect and replace ONLY the bottom garment (jeans/pants/shorts). Keep the customer\'s upper body top/shirt/torso, face, hair, and background 100% UNTOUCHED and PRESERVED.'
    : '- TARGET ZONE: Upper Body / Tops (Neck, Shoulders, Chest, Torso, and Arms down to the navel/waistline).\n- ACTION: Detect and replace ONLY the top garment (jacket/shirt/t-shirt). Keep the customer\'s lower body pants/shorts/legs, footwear, and background 100% UNTOUCHED and PRESERVED.'
}

STRICT QUALITY RULES:
1. Seamless anatomical blending along the waistline/navel border where upper wear meets lower wear.
2. Perfect preservation of customer skin, facial identity, body posture, hands, and room lighting.
3. Realistic fabric texture, stitching details, buttons/zippers, natural cloth folds, and subtle drop shadows.`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: promptText },
              { inline_data: { mime_type: customerData.mimeType, data: customerData.data } },
              { inline_data: { mime_type: garmentData.mimeType, data: garmentData.data } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        },
      }),
    });

    const jobId = `gemini-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inline_data?.data) {
        const imgUrl = `data:${part.inline_data.mime_type || 'image/jpeg'};base64,${part.inline_data.data}`;
        GeminiVisionProvider.completedResults.set(jobId, imgUrl);
        return {
          providerJobId: jobId,
          status: 'completed',
          resultImageUrl: imgUrl,
        };
      }
    }

    // If Gemini text model only returned description rather than direct image synthesis
    // Return job status so the orchestrator can fall back to the diffusion try-on provider or report status
    throw new Error('Gemini model did not return image synthesis part for direct virtual try-on. Use Replicate IDM-VTON or Fashn.ai for production diffusion.');
  }

  public async getTryOnJobStatus(providerJobId: string): Promise<VTOStatusResult> {
    const cached = GeminiVisionProvider.completedResults.get(providerJobId);
    if (cached) {
      return {
        status: 'completed',
        progressPercent: 100,
        stepDescription: 'Multimodal fitting complete',
        resultImageUrl: cached,
      };
    }

    return {
      status: 'failed',
      progressPercent: 0,
      stepDescription: 'Job result expired or not found',
      errorMessage: 'Job result unavailable',
    };
  }
}
