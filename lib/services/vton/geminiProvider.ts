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

    const promptText = `TASK: HIGH-PRECISION PHOTOREALISTIC VIRTUAL TRY-ON & GARMENT REPLACEMENT.
INPUT 1: Customer photograph.
INPUT 2: Retail clothing product (${request.productName || request.garmentType}, Category: ${request.category}).

STRICT INSTRUCTIONS:
1. Identify the existing clothing on the person in the ${request.category === 'bottoms' ? 'lower-body (jeans/pants)' : 'upper-body (torso/chest/shoulders)'} region.
2. Completely REPLACE the person's existing clothing with the exact garment from Input 2.
3. Preserve 100% of the customer's facial identity, facial expressions, hairstyle, neck, skin tone, hands, arms, body pose, posture, and room background.
4. Fit the garment realistically according to the person's body contours, anatomical shoulder width, waistline, and torso proportions.
5. Generate natural fabric drapery, realistic wrinkles, ambient drop-shadow beneath collar/hem, and lighting highlights consistent with the original photograph.`;

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
