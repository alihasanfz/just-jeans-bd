import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// Global in-memory storage for active chunk uploads
interface ChunkSession {
  chunks: Buffer[];
  receivedCount: number;
  totalChunks: number;
  filename: string;
  fileType: string;
  createdAt: number;
}

const sessions = new Map<string, ChunkSession>();

// Cleanup stale sessions older than 10 minutes
function cleanupOldSessions() {
  const now = Date.now();
  sessions.forEach((session, id) => {
    if (now - session.createdAt > 10 * 60 * 1000) {
      sessions.delete(id);
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    cleanupOldSessions();

    const formData = await request.formData();
    const chunkFile = formData.get('chunk') as File | null;
    const uploadId = formData.get('uploadId') as string | null;
    const chunkIndexStr = formData.get('chunkIndex') as string | null;
    const totalChunksStr = formData.get('totalChunks') as string | null;
    const filename = (formData.get('filename') as string | null) || `video-${Date.now()}.mp4`;
    const fileType = (formData.get('fileType') as string | null) || 'video/mp4';

    if (!chunkFile || !uploadId || chunkIndexStr === null || totalChunksStr === null) {
      return NextResponse.json({ error: 'Missing chunk parameters' }, { status: 400 });
    }

    const chunkIndex = parseInt(chunkIndexStr, 10);
    const totalChunks = parseInt(totalChunksStr, 10);

    const chunkBytes = await chunkFile.arrayBuffer();
    const chunkBuffer = Buffer.from(chunkBytes);

    let session = sessions.get(uploadId);
    if (!session) {
      session = {
        chunks: new Array(totalChunks),
        receivedCount: 0,
        totalChunks,
        filename,
        fileType,
        createdAt: Date.now(),
      };
      sessions.set(uploadId, session);
    }

    session.chunks[chunkIndex] = chunkBuffer;
    session.receivedCount += 1;

    // Check if all chunks have been received
    if (session.receivedCount >= totalChunks) {
      const fullBuffer = Buffer.concat(session.chunks.filter(Boolean));
      sessions.delete(uploadId);

      // 1. Try uploading complete stitched video to Catbox permanent CDN
      try {
        const catboxForm = new FormData();
        catboxForm.append('reqtype', 'fileupload');
        const fileBlob = new Blob([fullBuffer], { type: session.fileType });
        catboxForm.append('fileToUpload', fileBlob, session.filename);

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
      } catch (catboxErr) {
        console.warn('Catbox upload failed in chunk route:', catboxErr);
      }

      // 2. Try Litterbox fallback
      try {
        const lbForm = new FormData();
        lbForm.append('reqtype', 'fileupload');
        lbForm.append('time', '72h');
        const fileBlob = new Blob([fullBuffer], { type: session.fileType });
        lbForm.append('fileToUpload', fileBlob, session.filename);

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
      } catch (lbErr) {
        console.warn('Litterbox upload failed in chunk route:', lbErr);
      }

      return NextResponse.json(
        { error: 'Cloud storage upload failed after stitching chunks' },
        { status: 500 }
      );
    }

    // Acknowledge chunk
    return NextResponse.json({
      success: true,
      received: chunkIndex,
      total: totalChunks,
      percent: Math.round((session.receivedCount / totalChunks) * 100),
    });
  } catch (error: any) {
    console.error('Chunk upload error:', error);
    return NextResponse.json(
      { error: `Chunk processing failed: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
