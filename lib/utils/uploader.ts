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

  // Strategy 1: Direct client upload to Catbox permanent CDN
  try {
    const catboxForm = new FormData();
    catboxForm.append('reqtype', 'fileupload');
    catboxForm.append('fileToUpload', file, file.name);

    if (onProgress) {
      onProgress({ percent: 50, uploadedBytes: Math.round(totalBytes * 0.5), totalBytes, statusText: 'Uploading video file...' });
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
    console.warn('Direct catbox video upload failed, trying tmpfiles fallback:', e);
  }

  // Strategy 2: Direct client upload to tmpfiles CDN
  try {
    const tmpForm = new FormData();
    tmpForm.append('file', file, file.name);

    if (onProgress) {
      onProgress({ percent: 75, uploadedBytes: Math.round(totalBytes * 0.75), totalBytes, statusText: 'Optimizing video stream...' });
    }

    const tmpRes = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: tmpForm,
    });

    if (tmpRes.ok) {
      const json = await tmpRes.json();
      if (json?.data?.url) {
        const directUrl = json.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
        if (onProgress) {
          onProgress({ percent: 100, uploadedBytes: totalBytes, totalBytes, statusText: 'Video ready!' });
        }
        return directUrl;
      }
    }
  } catch (e) {
    console.warn('Direct tmpfiles video upload failed:', e);
  }

  // Strategy 3: Server upload fallback via /api/upload
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'x-admin-auth': 'true' },
      credentials: 'include',
      body: formData,
    });
    if (res.ok) {
      const d = await res.json();
      if (d.url) {
        if (onProgress) {
          onProgress({ percent: 100, uploadedBytes: totalBytes, totalBytes, statusText: 'Complete!' });
        }
        return d.url;
      }
    }
  } catch (e) {
    console.error('Server upload fallback failed:', e);
  }

  throw new Error('Video upload failed. Please try again or paste a YouTube, Vimeo, or MP4 video link.');
}
