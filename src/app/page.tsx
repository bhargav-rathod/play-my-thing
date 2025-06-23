'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function YouTubePlayer() {
  const [player, setPlayer] = useState<any>(null);
  const [playerState, setPlayerState] = useState(-1);
  const [title, setTitle] = useState('');
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(true);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const youtubeScriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
        return;
      }

      // Clean up old script if present
      const oldScript = document.getElementById('youtube-api-script');
      if (oldScript) oldScript.remove();

      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.id = 'youtube-api-script';
      youtubeScriptRef.current = script;

      window.onYouTubeIframeAPIReady = () => initializePlayer();
      document.head.appendChild(script);
    };

    const initializePlayer = () => {
      if (!playerContainerRef.current || !window.YT) return;

      const ytPlayer = new window.YT.Player(playerContainerRef.current, {
        height: '0',
        width: '0',
        playerVars: {
          listType: 'playlist',
          list: process.env.NEXT_PUBLIC_PLAYLIST_ID,
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            const p = event.target;
            setPlayer(p);
            setIsReady(true);

            try {
              p.setVolume(volume);
              setIsMuted(p.isMuted());
              p.playVideo();
              setNeedsInteraction(false);
            } catch {
              console.log('Autoplay blocked. Awaiting user interaction.');
              setNeedsInteraction(true);
            }
          },
          onStateChange: (event: any) => {
            setPlayerState(event.data);
            if (event.data === 1) {
              setTitle(event.target.getVideoData().title);
            }
          },
          onError: (e: any) => {
            console.error('YouTube Player Error:', e.data);
          }
        },
      });
    };

    loadYouTubeAPI();

    return () => {
      player?.destroy?.();

      if (youtubeScriptRef.current?.parentNode) {
        youtubeScriptRef.current.parentNode.removeChild(youtubeScriptRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (player && typeof player.setVolume === 'function') {
      player.setVolume(volume);
    }

    if (player && typeof player.isMuted === 'function') {
      const currentlyMuted = player.isMuted();
      if (volume > 0 && currentlyMuted) {
        player.unMute();
        setIsMuted(false);
      } else if (volume === 0 && !currentlyMuted) {
        player.mute();
        setIsMuted(true);
      }
    }
  }, [volume, player]);

  const handlePlay = () => {
    if (player?.playVideo) {
      player.playVideo();
      setNeedsInteraction(false);
    }
  };

  const togglePlay = () => {
    if (!player) return;
    if (playerState === 1) player.pauseVideo();
    else player.playVideo();
  };

  const toggleMute = () => {
    if (!player) return;

    if (isMuted) {
      player.unMute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const handleNext = () => player?.nextVideo?.();
  const handlePrevious = () => player?.previousVideo?.();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div ref={playerContainerRef} className="hidden" />

      <div className="bg-gray-900 bg-opacity-80 p-6 rounded-xl text-white max-w-md w-full">
        {needsInteraction ? (
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold">YouTube Playlist Player</h1>
            <button
              onClick={handlePlay}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all"
            >
              Start Playback
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-medium mb-4 truncate">
              {title || 'Loading...'}
            </h2>

            <div className="flex justify-center items-center gap-6 mb-8">
              <button onClick={handlePrevious} aria-label="Previous track">⏮️</button>
              <button onClick={togglePlay} aria-label="Play/Pause">
                {playerState === 1 ? '⏸️' : '▶️'}
              </button>
              <button onClick={handleNext} aria-label="Next track">⏭️</button>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted ? '🔇' : '🔊'}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
