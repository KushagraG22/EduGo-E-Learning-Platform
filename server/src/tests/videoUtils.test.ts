import { describe, it, expect } from 'vitest';

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

function extractYouTubeVideoId(rawUrl?: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const url = rawUrl.trim();
  if (!url) return null;

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
      const parts = parsed.pathname.split('/').filter(Boolean);
      candidateId = parts[0] || null;
    } else if (parsed.pathname.startsWith('/shorts/')) {
      const parts = parsed.pathname.replace('/shorts/', '').split('/').filter(Boolean);
      candidateId = parts[0] || null;
    } else if (parsed.pathname.startsWith('/embed/')) {
      const parts = parsed.pathname.replace('/embed/', '').split('/').filter(Boolean);
      candidateId = parts[0] || null;
    } else if (parsed.pathname.startsWith('/v/')) {
      const parts = parsed.pathname.replace('/v/', '').split('/').filter(Boolean);
      candidateId = parts[0] || null;
    } else {
      candidateId = parsed.searchParams.get('v');
    }

    if (candidateId && YOUTUBE_ID_REGEX.test(candidateId)) {
      return candidateId;
    }
  } catch {
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?.*?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (match && match[1] && YOUTUBE_ID_REGEX.test(match[1])) {
      return match[1];
    }
  }

  return null;
}

function getYouTubeEmbedUrl(videoId: string): string {
  if (!YOUTUBE_ID_REGEX.test(videoId)) {
    throw new Error('Invalid YouTube Video ID');
  }
  return `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1`;
}

function isHlsStream(url?: string): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase().split('?')[0];
  return clean.endsWith('.m3u8');
}

function getVideoMimeType(url?: string): string {
  if (!url) return 'video/mp4';
  const clean = url.trim().toLowerCase().split('?')[0];
  if (clean.endsWith('.webm')) return 'video/webm';
  if (clean.endsWith('.m3u8')) return 'application/x-mpegURL';
  if (clean.endsWith('.ogv') || clean.endsWith('.ogg')) return 'video/ogg';
  return 'video/mp4';
}

describe('Video Utilities & YouTube URL Parser Test Suite', () => {
  describe('YouTube Link Parsing', () => {
    it('should extract 11-char ID from standard watch URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const id = extractYouTubeVideoId(url);
      expect(id).toBe('dQw4w9WgXcQ');
      expect(getYouTubeEmbedUrl(id!)).toBe(
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?enablejsapi=1&rel=0&modestbranding=1&playsinline=1'
      );
    });

    it('should extract ID from shortened youtu.be URL', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      expect(extractYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should extract ID from YouTube Shorts URL', () => {
      const url = 'https://www.youtube.com/shorts/dQw4w9WgXcQ';
      expect(extractYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should extract ID from YouTube embed URL', () => {
      const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      expect(extractYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should extract ID from mobile YouTube URL with timestamp and query parameters', () => {
      const url = 'https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=42s&feature=shared';
      expect(extractYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should reject malicious or arbitrary non-YouTube URLs', () => {
      expect(extractYouTubeVideoId('https://evil-site.com/watch?v=dQw4w9WgXcQ')).toBeNull();
      expect(extractYouTubeVideoId('https://phishing-youtube.com/dQw4w9WgXcQ')).toBeNull();
      expect(extractYouTubeVideoId('javascript:alert(1)')).toBeNull();
      expect(extractYouTubeVideoId('')).toBeNull();
    });

    it('should reject invalid YouTube IDs that are not 11 alphanumeric characters', () => {
      expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=short')).toBeNull();
      expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=toolongvideoid12345')).toBeNull();
    });
  });

  describe('Direct Video Streams & HLS Detection', () => {
    it('should detect HLS .m3u8 stream URLs correctly', () => {
      expect(isHlsStream('https://stream.provider.com/live/playlist.m3u8')).toBe(true);
      expect(isHlsStream('https://stream.provider.com/hls/master.m3u8?token=123')).toBe(true);
      expect(isHlsStream('https://storage.googleapis.com/video.mp4')).toBe(false);
    });

    it('should resolve correct MIME types for direct video formats', () => {
      expect(getVideoMimeType('https://domain.com/video.mp4')).toBe('video/mp4');
      expect(getVideoMimeType('https://domain.com/video.webm')).toBe('video/webm');
      expect(getVideoMimeType('https://domain.com/video.m3u8')).toBe('application/x-mpegURL');
      expect(getVideoMimeType('/uploads/videos/sample.mp4')).toBe('video/mp4');
    });
  });
});
