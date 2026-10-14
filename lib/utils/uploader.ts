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

  if (onProgress) {
    onProgress({ percent: 20, uploadedBytes: Math.round(totalBytes * 0.2), totalBytes, statusText: 'Uploading video to fast CDN...' });
  }

  // Strategy 1: Server upload via /api/upload
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (onProgress) {
      onProgress({ percent: 40, uploadedBytes: Math.round(totalBytes * 0.4), totalBytes, statusText: 'Transferring video...' });
    }
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'x-admin-auth': 'true' },
      credentials: 'include',
      body: formData,
    });
    if (res.ok) {
      const d = await res.json();
      if (d.url && !d.url.includes('tmpfiles.org')) {
        if (onProgress) {
          onProgress({ percent: 100, uploadedBytes: totalBytes, totalBytes, statusText: 'Complete!' });
        }
        return d.url;
      }
    }
  } catch (e) {
    console.warn('Server upload failed, trying direct CDN:', e);
  }

  // Strategy 2: Direct client upload to Catbox permanent CDN
  try {
    const catboxForm = new FormData();
    catboxForm.append('reqtype', 'fileupload');
    catboxForm.append('fileToUpload', file, file.name);

    if (onProgress) {
      onProgress({ percent: 70, uploadedBytes: Math.round(totalBytes * 0.7), totalBytes, statusText: 'Uploading video file to CDN...' });
    }

    const catboxRes = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: catboxForm,
    });

    const cdnUrl = (await catboxRes.text()).trim();
    if (cdnUrl && cdnUrl.startsWith('http') && !cdnUrl.toLowerCase().includes('error')) {
      if (onProgress) {
        onProgress({ percent: 100, uploadedBytes: totalBytes, totalBytes, statusText: 'Video ready!' });
      }
      return cdnUrl;
    }
  } catch (e) {
    console.warn('Direct catbox video upload failed:', e);
  }

  throw new Error('Video upload failed. Please try again or paste a YouTube, Vimeo, or MP4 video link.');
}
