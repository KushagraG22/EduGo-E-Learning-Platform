/**
 * Video Utilities for EduGo
 * Supports YouTube link parsing/validation, HLS detection, and direct video URL formatting.
 */

const ALLOWED_YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Parses and validates YouTube video ID from various link formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function extractYouTubeVideoId(rawUrl?: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const url = rawUrl.trim();
  if (!url) return null;

  // Direct 11-character video ID
  if (YOUTUBE_ID_REGEX.test(url)) {
    return url;
  }

  try {
    const parsed = new URL(url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`);
    const host = parsed.hostname.toLowerCase();

    if (!ALLOWED_YOUTUBE_HOSTS.has(host)) {
      return null;
    }

    let candidateId: string | null = null;

    if (host.includes('youtu.be')) {
      // https://youtu.be/VIDEO_ID
      const parts = parsed.pathname.split('/').filter(Boolean);
      candidateId = parts[0] || null;
    } else if (parsed.pathname.startsWith('/shorts/')) {
      // https://www.youtube.com/shorts/VIDEO_ID
      const parts = parsed.pathname.replace('/shorts/', '').split('/').filter(Boolean);
      candidateId = parts[0] || null;
    } else if (parsed.pathname.startsWith('/embed/')) {
      // https://www.youtube.com/embed/VIDEO_ID
      const parts = parsed.pathname.replace('/embed/', '').split('/').filter(Boolean);
      candidateId = parts[0] || null;
    } else if (parsed.pathname.startsWith('/v/')) {
      // https://www.youtube.com/v/VIDEO_ID
      const parts = parsed.pathname.replace('/v/', '').split('/').filter(Boolean);
      candidateId = parts[0] || null;
    } else {
      // Standard watch link: https://www.youtube.com/watch?v=VIDEO_ID
      candidateId = parsed.searchParams.get('v');
    }

    if (candidateId && YOUTUBE_ID_REGEX.test(candidateId)) {
      return candidateId;
    }
  } catch {
    // Regex fallback if URL constructor fails
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?.*?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (match && match[1] && YOUTUBE_ID_REGEX.test(match[1])) {
      return match[1];
    }
  }

  return null;
}

/**
 * Creates safe, official YouTube nocookie embed URL
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  if (!YOUTUBE_ID_REGEX.test(videoId)) {
    throw new Error('Invalid YouTube Video ID');
  }
  // enablejsapi=1 allows postMessage / playback tracking
  // rel=0 limits related videos to same channel
  return `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1`;
}

/**
 * Checks if a URL points to an HLS (.m3u8) video stream
 */
export function isHlsStream(url?: string): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase().split('?')[0];
  return clean.endsWith('.m3u8');
}

/**
 * Detects MIME type for direct video files
 */
export function getVideoMimeType(url?: string): string {
  if (!url) return 'video/mp4';
  const clean = url.trim().toLowerCase().split('?')[0];
  if (clean.endsWith('.webm')) return 'video/webm';
  if (clean.endsWith('.m3u8')) return 'application/x-mpegURL';
  if (clean.endsWith('.ogv') || clean.endsWith('.ogg')) return 'video/ogg';
  return 'video/mp4';
}

/**
 * Resolves local upload paths to full accessible URLs
 */
export function resolveMediaUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads')) {
    // In production or when accessed directly, proxy or same-origin handles /uploads
    return trimmed;
  }
  return trimmed;
}
