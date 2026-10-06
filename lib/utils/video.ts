/**
 * Video Helper utilities for Jeans BD
 * Supports: YouTube, Vimeo, direct MP4/WebM/MOV file uploads & URLs, Data URLs
 */

export interface VideoInfo {
  type: 'youtube' | 'vimeo' | 'direct' | 'unknown';
  embedUrl: string;
  originalUrl: string;
  videoId?: string;
  thumbnailUrl?: string;
}

export function parseVideoUrl(url: string | null | undefined): VideoInfo | null {
  if (!url || typeof url !== 'string' || !url.trim()) return null;
  const cleanUrl = url.trim();

  // 1. YouTube (watch?v=, youtu.be, embed, shorts)
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
  const ytMatch = cleanUrl.match(youtubeRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`,
      originalUrl: cleanUrl,
      videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  // 2. Vimeo (vimeo.com/123456 or player.vimeo.com/video/123456)
  const vimeoRegex = /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i;
  const vimeoMatch = cleanUrl.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&loop=1&muted=1`,
      originalUrl: cleanUrl,
      videoId,
      thumbnailUrl: '',
    };
  }

  // 3. Streamable (streamable.com/code)
  const streamableRegex = /streamable\.com\/(?:[e\/]+)?([a-zA-Z0-9]+)/i;
  const streamableMatch = cleanUrl.match(streamableRegex);
  if (streamableMatch && streamableMatch[1]) {
    const code = streamableMatch[1];
    return {
      type: 'youtube', // Use iframe player
      embedUrl: `https://streamable.com/e/${code}?autoplay=1&muted=1`,
      originalUrl: cleanUrl,
      videoId: code,
    };
  }

  // 4. Google Drive (drive.google.com/file/d/ID/...)
  const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i;
  const driveMatch = cleanUrl.match(driveRegex);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      type: 'youtube', // Use iframe player
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      originalUrl: cleanUrl,
      videoId: fileId,
    };
  }

  // 5. Direct video files (MP4, WebM, MOV, OGG, Catbox CDN, or uploaded /uploads/)
  const isDirect =
    cleanUrl.startsWith('data:video/') ||
    cleanUrl.startsWith('blob:') ||
    cleanUrl.startsWith('/uploads/') ||
    cleanUrl.includes('files.catbox.moe') ||
    cleanUrl.includes('litter.catbox.moe') ||
    /\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i.test(cleanUrl);

  if (isDirect || cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return {
      type: 'direct',
      embedUrl: cleanUrl,
      originalUrl: cleanUrl,
    };
  }

  return {
    type: 'unknown',
    embedUrl: cleanUrl,
    originalUrl: cleanUrl,
  };
}

export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string' || !url.trim()) return false;
  const info = parseVideoUrl(url);
  return info !== null && (info.type === 'youtube' || info.type === 'vimeo' || info.type === 'direct');
}
