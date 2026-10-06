import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// Allowed image & video formats
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg',
  'video/x-matroska',
  'video/x-msvideo',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.avif',
  '.mp4',
  '.webm',
  '.mov',
  '.ogv',
  '.mkv',
  '.avi',
]);

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB max for images
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50MB max for videos

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const isVideo = file.type.startsWith('video/');
    const maxAllowedSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;

    // 1. File size verification (prevent denial of service)
    if (file.size > maxAllowedSize) {
      return NextResponse.json(
        {
          error: `Security violation: File exceeds maximum allowed size of ${
            isVideo ? '50MB for videos' : '10MB for images'
          }`,
        },
        { status: 400 }
      );
    }

    // 2. MIME type verification
    if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          error:
            'Security violation: Only JPG, PNG, WebP, GIF, MP4, WebM, and MOV files are permitted',
        },
        { status: 400 }
      );
    }

    // 3. Extension verification
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: 'Security violation: Invalid file extension' },
        { status: 400 }
      );
    }

    // 4. Sanitize file name to prevent directory traversal
    const safeBaseName = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);

    const safeFilename = `${Date.now()}-${safeBaseName}${ext}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Strategy 1: For videos or on serverless hosting (Vercel), upload to Catbox permanent CDN
    if (isVideo || process.env.VERCEL || process.env.NODE_ENV === 'production') {
      try {
        const catboxForm = new FormData();
        catboxForm.append('reqtype', 'fileupload');
        const fileBlob = new Blob([buffer], { type: file.type });
        catboxForm.append('fileToUpload', fileBlob, safeFilename);

        const uploadRes = await fetch('https://catbox.moe/user/api.php', {
          method: 'POST',
          body: catboxForm,
        });

        if (uploadRes.ok) {
          const cdnUrl = (await uploadRes.text()).trim();
          if (cdnUrl && cdnUrl.startsWith('http')) {
            return NextResponse.json({ success: true, url: cdnUrl });
          }
        }
      } catch (cdnErr) {
        console.warn('Catbox CDN upload fallback:', cdnErr);
      }
    }

    // Strategy 2: Local filesystem write (for local dev)
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, safeFilename);
      await writeFile(filePath, buffer);

      const publicUrl = `/uploads/${safeFilename}`;
      return NextResponse.json({ success: true, url: publicUrl });
    } catch (fsErr) {
      console.warn('Local fs write error, attempting Litterbox fallback:', fsErr);

      // Strategy 3: Litterbox fallback if local fs is read-only
      const lbForm = new FormData();
      lbForm.append('reqtype', 'fileupload');
      lbForm.append('time', '72h');
      const fileBlob = new Blob([buffer], { type: file.type });
      lbForm.append('fileToUpload', fileBlob, safeFilename);

      const lbRes = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
        method: 'POST',
        body: lbForm,
      });

      if (lbRes.ok) {
        const lbUrl = (await lbRes.text()).trim();
        if (lbUrl && lbUrl.startsWith('http')) {
          return NextResponse.json({ success: true, url: lbUrl });
        }
      }

      throw fsErr;
    }
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: `File upload processing failed: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
