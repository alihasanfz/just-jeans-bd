import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // 60s timeout for AI generation

interface TryOnRequestBody {
  modelImage: string; // Base64 data URI or public HTTPS image URL
  garmentImage: string; // Base64 data URI or public HTTPS image URL
  category?: 'upper_body' | 'lower_body' | 'dresses' | 'tops' | 'bottoms';
  description?: string;
  garmentType?: string;
  provider?: 'replicate' | 'fal' | 'fashn' | 'mock' | 'auto';
}

/**
 * Ensures relative URLs are converted to full absolute URLs for external API consumption
 */
function toAbsoluteUrl(urlOrData: string, hostHeader?: string | null): string {
  if (!urlOrData) return '';
  if (urlOrData.startsWith('data:') || urlOrData.startsWith('http://') || urlOrData.startsWith('https://')) {
    return urlOrData;
  }
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (hostHeader ? `https://${hostHeader}` : 'https://just-jeans-bd-4ik7.vercel.app');
  return `${baseUrl.replace(/\/$/, '')}/${urlOrData.replace(/^\//, '')}`;
}

/**
 * Replicate IDM-VTON API caller (State-of-the-art Diffusion Virtual Try-On)
 */
async function runReplicateIDMVTON(
  modelImgUrl: string,
  garmImgUrl: string,
  category: 'upper_body' | 'lower_body' | 'dresses',
  description: string,
  apiToken: string
): Promise<string> {
  const modelVersion = 'c871bb9b046616b680466e01e6659c258d44743ec992e59174526d246c757cbb';

  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${apiToken.trim()}`,
    },
    body: JSON.stringify({
      version: modelVersion,
      input: {
        human_img: modelImgUrl,
        garm_img: garmImgUrl,
        garment_des: description || 'Fashion garment item',
        category,
        is_checked: true,
        is_checked_crop: false,
        denoise_steps: 30,
        seed: 42,
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Replicate API returned status ${res.status}: ${errorText}`);
  }

  const prediction = await res.json();
  const getUrl = prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`;

  // Poll prediction status
  for (let i = 0; i < 40; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1800));
    const pollRes = await fetch(getUrl, {
      headers: { Authorization: `Token ${apiToken.trim()}` },
    });

    if (pollRes.ok) {
      const data = await pollRes.json();
      if (data.status === 'succeeded') {
        const output = Array.isArray(data.output) ? data.output[0] : data.output;
        if (!output) throw new Error('No output image returned from Replicate.');
        return output;
      }
      if (data.status === 'failed' || data.status === 'canceled') {
        throw new Error(`Replicate IDM-VTON execution ${data.status}: ${data.error || 'Prediction failure'}`);
      }
    }
  }

  throw new Error('Virtual Try-On generation timed out on Replicate IDM-VTON.');
}

/**
 * Fal.ai IDM-VTON API caller
 */
async function runFalAIVTON(
  modelImgUrl: string,
  garmImgUrl: string,
  description: string,
  falKey: string
): Promise<string> {
  const res = await fetch('https://queue.fal.run/fal-ai/idm-vton', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Key ${falKey.trim()}`,
    },
    body: JSON.stringify({
      human_image_url: modelImgUrl,
      garment_image_url: garmImgUrl,
      description: description || 'Fashion apparel item',
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Fal.ai API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  if (data.image?.url) {
    return data.image.url;
  }
  throw new Error('Fal.ai IDM-VTON did not return image URL.');
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body: TryOnRequestBody = await req.json();
    const { modelImage, garmentImage, category = 'upper_body', description = '', garmentType = 'jacket' } = body;

    // 1. Validation
    if (!modelImage || typeof modelImage !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid modelImage (data URI or URL) is required.' },
        { status: 400 }
      );
    }
    if (!garmentImage || typeof garmentImage !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid garmentImage (data URI or URL) is required.' },
        { status: 400 }
      );
    }

    const hostHeader = req.headers.get('host');
    const cleanModelImg = toAbsoluteUrl(modelImage, hostHeader);
    const cleanGarmImg = toAbsoluteUrl(garmentImage, hostHeader);

    // Normalize category for IDM-VTON
    let normalizedCategory: 'upper_body' | 'lower_body' | 'dresses' = 'upper_body';
    if (category === 'lower_body' || category === 'bottoms' || garmentType === 'jeans' || garmentType === 'pants') {
      normalizedCategory = 'lower_body';
    } else if (category === 'dresses') {
      normalizedCategory = 'dresses';
    }

    // Determine configured API keys
    const replicateToken = process.env.REPLICATE_API_TOKEN || process.env.VIRTUAL_TRYON_API_KEY;
    const falKey = process.env.FAL_KEY;

    // 2. Production execution via Replicate IDM-VTON
    if (replicateToken && (replicateToken.startsWith('r8_') || !falKey)) {
      try {
        const resultUrl = await runReplicateIDMVTON(
          cleanModelImg,
          cleanGarmImg,
          normalizedCategory,
          description || `${garmentType} fashion apparel`,
          replicateToken
        );

        return NextResponse.json({
          success: true,
          resultImageUrl: resultUrl,
          beforeImageUrl: cleanModelImg,
          provider: 'replicate-idm-vton',
          category: normalizedCategory,
          processingTimeMs: Date.now() - startTime,
        });
      } catch (err: any) {
        console.warn('Replicate IDM-VTON failed:', err?.message || err);
        // If external API key fails, fall through to fallback
      }
    }

    // 3. Fallback to Fal.ai if configured
    if (falKey) {
      try {
        const resultUrl = await runFalAIVTON(
          cleanModelImg,
          cleanGarmImg,
          description || `${garmentType} fashion apparel`,
          falKey
        );

        return NextResponse.json({
          success: true,
          resultImageUrl: resultUrl,
          beforeImageUrl: cleanModelImg,
          provider: 'fal-ai-idm-vton',
          category: normalizedCategory,
          processingTimeMs: Date.now() - startTime,
        });
      } catch (err: any) {
        console.warn('Fal.ai VTON failed:', err?.message || err);
      }
    }

    // 4. Mock / Client-side fallback mode (Safe instant fallback when no API token configured)
    return NextResponse.json({
      success: true,
      resultImageUrl: cleanModelImg, // Client will render neural shader composite
      beforeImageUrl: cleanModelImg,
      provider: 'mock-simulation',
      isMockFallback: true,
      category: normalizedCategory,
      processingTimeMs: Date.now() - startTime,
      message: 'Running in simulated development mode. Configure REPLICATE_API_TOKEN for production cloud diffusion.',
    });
  } catch (error: any) {
    console.error('API /api/try-on error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Internal Virtual Try-On error',
        processingTimeMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
