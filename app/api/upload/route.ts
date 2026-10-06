import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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

    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, safeFilename);

    // Save file to disk
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${safeFilename}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'File upload processing failed' },
      { status: 500 }
    );
  }
}
