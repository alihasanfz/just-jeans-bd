/**
 * Universal Video & Media Uploader
 * Supports small files directly and large files via 2MB chunking for Vercel compatibility
 */

export interface UploadProgressCallback {
  (progress: { percent: number; uploadedBytes: number; totalBytes: number; statusText: string }): void;
}

export async function uploadVideoFile(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<string> {
  if (!file) throw new Error('No file provided');

  const totalBytes = file.size;
  const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks (under Vercel's 4.5MB limit)

  // 1. If small file (<= 3.5MB), use direct POST /api/upload
  if (totalBytes <= 3.5 * 1024 * 1024) {
    if (onProgress) {
      onProgress({ percent: 30, uploadedBytes: Math.round(totalBytes * 0.3), totalBytes, statusText: 'Uploading video...' });
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        if (onProgress) {
          onProgress({ percent: 100, uploadedBytes: totalBytes, totalBytes, statusText: 'Complete!' });
        }
        return data.url;
      }
    }

    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson?.error || 'Direct upload failed');
  }

  // 2. For larger files (> 3.5MB), use chunked upload to bypass Vercel body limits
  const totalChunks = Math.ceil(totalBytes / CHUNK_SIZE);
  const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, totalBytes);
    const chunkBlob = file.slice(start, end);

    const chunkFormData = new FormData();
    chunkFormData.append('chunk', chunkBlob, file.name);
    chunkFormData.append('uploadId', uploadId);
    chunkFormData.append('chunkIndex', chunkIndex.toString());
    chunkFormData.append('totalChunks', totalChunks.toString());
    chunkFormData.append('filename', file.name);
    chunkFormData.append('fileType', file.type || 'video/mp4');

    const percent = Math.round(((chunkIndex + 1) / totalChunks) * 100);
    if (onProgress) {
      onProgress({
        percent,
        uploadedBytes: end,
        totalBytes,
        statusText: chunkIndex === totalChunks - 1 ? 'Processing video...' : `Uploading part ${chunkIndex + 1} of ${totalChunks} (${percent}%)...`,
      });
    }

    const res = await fetch('/api/upload/chunk', {
      method: 'POST',
      body: chunkFormData,
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error || `Chunk ${chunkIndex + 1} upload failed`);
    }

    const data = await res.json();
    // Final chunk returns the uploaded URL
    if (chunkIndex === totalChunks - 1 && data.url) {
      if (onProgress) {
        onProgress({ percent: 100, uploadedBytes: totalBytes, totalBytes, statusText: 'Video ready!' });
      }
      return data.url;
    }
  }

  throw new Error('Upload completed without receiving video URL');
}
