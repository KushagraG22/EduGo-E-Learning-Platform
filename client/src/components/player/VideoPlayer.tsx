import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Video,
  Youtube,
  Info,
} from 'lucide-react';
import {
  extractYouTubeVideoId,
  getYouTubeEmbedUrl,
  getVideoMimeType,
  isHlsStream,
  resolveMediaUrl,
} from '../../utils/videoUtils';

interface VideoPlayerProps {
  videoUrl?: string;
  lessonTitle?: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl = '',
  lessonTitle = 'Lesson Video',
  onTimeUpdate,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryKey, setRetryKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const rawUrl = videoUrl?.trim() || '';
  const youtubeVideoId = extractYouTubeVideoId(rawUrl);
  const isYouTube = Boolean(youtubeVideoId);
  const resolvedUrl = resolveMediaUrl(rawUrl);
  const isHls = !isYouTube && isHlsStream(resolvedUrl);
  const mimeType = getVideoMimeType(resolvedUrl);

  // Reset state when videoUrl or retryKey changes
  useEffect(() => {
    setHasError(false);
    setErrorMessage('');
    setIsLoading(true);
  }, [rawUrl, retryKey]);

  // Handle direct video and HLS stream playback
  useEffect(() => {
    if (isYouTube || !resolvedUrl || !videoRef.current) {
      return;
    }

    const videoEl = videoRef.current;

    // Clean up previous Hls instance if any
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHls) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsRef.current = hls;
        hls.loadSource(resolvedUrl);
        hls.attachMedia(videoEl);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setHasError(true);
                setErrorMessage('Network error while loading HLS stream. Check CORS or link accessibility.');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setHasError(true);
                setErrorMessage('Media decoding error on HLS stream.');
                hls.recoverMediaError();
                break;
              default:
                setHasError(true);
                setErrorMessage('Fatal HLS stream playback error.');
                hls.destroy();
                break;
            }
          }
        });
      } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        // Native Safari HLS
        videoEl.src = resolvedUrl;
      } else {
        setHasError(true);
        setErrorMessage('HLS video playback is not supported on this browser.');
      }
    } else {
      // Direct MP4 / WebM URL
      videoEl.src = resolvedUrl;
      videoEl.load();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [resolvedUrl, isHls, isYouTube, retryKey]);

  // Periodic watch tracking for YouTube players
  useEffect(() => {
    if (!isYouTube || !onTimeUpdate) return;
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 15;
      onTimeUpdate(elapsed, 0);
    }, 15000);

    return () => clearInterval(interval);
  }, [isYouTube, onTimeUpdate, rawUrl]);

  // Direct video event handlers
  const handleNativeTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(
        videoRef.current.currentTime || 0,
        videoRef.current.duration || 0
      );
    }
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setHasError(true);
    const mediaError = videoRef.current?.error;
    if (!mediaError) {
      setErrorMessage('The video could not be loaded. Please verify the URL is accessible and allows cross-origin playback.');
      return;
    }

    switch (mediaError.code) {
      case 1:
        setErrorMessage('Video loading was aborted by the browser.');
        break;
      case 2:
        setErrorMessage('Network connection error prevented video playback. Check your network or the host server.');
        break;
      case 3:
        setErrorMessage('Video decoding failed due to a corrupted file or unsupported media codec.');
        break;
      case 4:
        setErrorMessage('Video format is not supported or the source is unavailable (HTTP 404/403 or CORS blocked).');
        break;
      default:
        setErrorMessage('An unexpected error occurred while loading this video.');
        break;
    }
  };

  const handleRetry = () => {
    setRetryKey((k) => k + 1);
  };

  // If no video URL provided
  if (!rawUrl) {
    return (
      <div className={`aspect-video w-full rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-6 text-center shadow-2xl ${className}`}>
        <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mb-3">
          <Video className="w-7 h-7" />
        </div>
        <h4 className="text-sm font-bold text-slate-300 mb-1">No Video Attached</h4>
        <p className="text-xs text-slate-500 max-w-sm">
          The instructor has not added a video source URL for this lesson yet.
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full space-y-2 ${className}`}>
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800 relative group">
        {/* YOUTUBE EMBED PLAYER */}
        {isYouTube && youtubeVideoId ? (
          <div className="w-full h-full relative">
            <iframe
              key={`yt-${youtubeVideoId}-${retryKey}`}
              src={getYouTubeEmbedUrl(youtubeVideoId)}
              title={`${lessonTitle} - YouTube Player`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              loading="lazy"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        ) : (
          /* HTML5 DIRECT / HLS VIDEO PLAYER */
          <div className="w-full h-full relative flex items-center justify-center">
            {hasError ? (
              <div className="p-6 text-center max-w-md mx-auto space-y-3 z-10">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Unable to Play Video</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {errorMessage || 'The video stream could not be loaded.'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry
                  </button>
                  {resolvedUrl && (
                    <a
                      href={resolvedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 text-xs font-semibold rounded-xl border border-brand-500/30 flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Source in New Tab
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                key={`video-${resolvedUrl}-${retryKey}`}
                controls
                playsInline
                preload="metadata"
                crossOrigin="anonymous"
                onTimeUpdate={handleNativeTimeUpdate}
                onError={handleVideoError}
                onLoadedData={() => setIsLoading(false)}
                onWaiting={() => setIsLoading(true)}
                onPlaying={() => setIsLoading(false)}
                className="w-full h-full object-contain"
              >
                <source src={resolvedUrl} type={mimeType} />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        )}
      </div>

      {/* Helpful Source Attribution & Fallback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          {isYouTube ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 font-medium text-[11px]">
              <Youtube className="w-3.5 h-3.5" />
              YouTube Player
            </span>
          ) : isHls ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium text-[11px]">
              <Video className="w-3.5 h-3.5" />
              HLS Stream Player
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium text-[11px]">
              <Video className="w-3.5 h-3.5" />
              Direct Video Stream ({mimeType.replace('video/', '').toUpperCase()})
            </span>
          )}

          {isYouTube && (
            <span className="hidden sm:inline text-slate-500 text-[11px]">
              Respects creator privacy via youtube-nocookie
            </span>
          )}
        </div>

        {isYouTube && rawUrl && (
          <a
            href={rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
            title="If video owner disabled embedding, watch directly on YouTube"
          >
            <span>Watch on YouTube</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};
