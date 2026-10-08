import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Image Proxy for Virtual Try-On output images.
 * Prevents mobile ISP blocks, CORS restrictions, and broken image icons.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json({ error: 'url parameter required' }, { status: 400 });
    }

    // Direct data URI pass-through
    if (imageUrl.startsWith('data:')) {
      return NextResponse.redirect(imageUrl);
    }

    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch target image (${res.status})` },
        { status: res.status }
      );
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    console.error('Image proxy error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to proxy image' },
      { status: 500 }
    );
  }
}
