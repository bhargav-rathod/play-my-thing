'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// SVG Icons
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
  </svg>
);

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
  </svg>
);

const PreviousIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
  </svg>
);

const NextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
  </svg>
);

const VolumeUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
    <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
  </svg>
);

const VolumeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
  </svg>
);

const PlaylistIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M5.566 4.657A4.505 4.505 0 016.75 4.5h10.5c.41 0 .806.055 1.183.157A3 3 0 0015.75 3h-7.5a3 3 0 00-2.684 1.657zM2.25 12a3 3 0 013-3h13.5a3 3 0 013 3v6a3 3 0 01-3 3H5.25a3 3 0 01-3-3v-6zM5.25 7.5c-.41 0-.806.055-1.184.157A3 3 0 016.75 6h10.5a3 3 0 012.683 1.657A4.505 4.505 0 0018.75 7.5H5.25z" />
  </svg>
);

export default function YouTubePlayer() {
  const [player, setPlayer] = useState<any>(null);
  const [playerState, setPlayerState] = useState(-1);
  const [title, setTitle] = useState('');
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlistId, setPlaylistId] = useState(process.env.NEXT_PUBLIC_PLAYLIST_ID || '');
  const [isEditingPlaylist, setIsEditingPlaylist] = useState(false);
  const [playlistItems, setPlaylistItems] = useState<any[]>([]);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const youtubeScriptRef = useRef<HTMLScriptElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchPlaylistItems = async () => {
      if (!playlistId) return;
      try {
        const response = await fetch(`/api/yt-playlist?playlistId=${playlistId}`);
        const data = await response.json();
        setPlaylistItems(data.items);
      } catch (error) {
        console.error('Failed to fetch playlist items:', error);
      }
    };

    fetchPlaylistItems();
  }, [playlistId]);

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
        return;
      }

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
          list: playlistId,
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
              startProgressTracking(p);
            } catch {
              setNeedsInteraction(true);
            }
          },
          onStateChange: (event: any) => {
            setPlayerState(event.data);
            if (event.data === 1) {
              setTitle(event.target.getVideoData().title);
              setDuration(event.target.getDuration());
              startProgressTracking(event.target);
            } else {
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
              }
            }
          },
          onError: (e: any) => {
            console.error('YouTube Player Error:', e.data);
          }
        },
      });
    };

    const startProgressTracking = (p: any) => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      progressIntervalRef.current = setInterval(() => {
        if (p && typeof p.getCurrentTime === 'function') {
          setCurrentTime(p.getCurrentTime());
        }
        if (p && typeof p.getDuration === 'function' && !duration) {
          setDuration(p.getDuration());
        }
      }, 1000);
    };

    loadYouTubeAPI();

    return () => {
      player?.destroy?.();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      if (youtubeScriptRef.current?.parentNode) {
        youtubeScriptRef.current.parentNode.removeChild(youtubeScriptRef.current);
      }
    };
  }, [playlistId]);

  const playVideoByIndex = (index: number) => {
    if (player && typeof player.playVideoAt === 'function') {
      player.playVideoAt(index);
      setShowPlaylist(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculate background color based on scroll position
  const bgOpacity = Math.min(scrollY / 200, 0.2);
  const bgColor = `rgba(255, 255, 255, ${bgOpacity})`;

  return (
    <div
      ref={mainRef}
      className="min-h-screen flex items-center justify-center px-4 py-10 transition-all duration-500 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100"
      style={{
        background: `linear-gradient(to bottom right, rgba(255, 240, 245, 0.7), rgba(240, 248, 255, 0.7))`
      }}
    >
      <div ref={playerContainerRef} className="hidden" />

      <div className={`backdrop-blur-md bg-white/60 p-6 rounded-3xl shadow-xl w-full max-w-md border border-white/30 transition-all duration-500 ${scrollY > 50 ? 'shadow-2xl' : 'shadow-md'}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-purple-800 tracking-wide">Mini YouTube Player</h1>
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 transition-colors"
          >
            <PlaylistIcon />
            <span>{showPlaylist ? 'Hide' : 'Show'}</span>
          </button>
        </div>

        {showPlaylist && (
          <div className="mb-6 max-h-60 overflow-y-auto rounded-lg bg-white/40 border border-white/30 shadow-inner">
            {playlistItems.map((item, index) => (
              <div key={item.id} className="border-b border-white/20 last:border-b-0 hover:bg-white/50 transition-colors">
                <button
                  onClick={() => playVideoByIndex(index)}
                  className="block w-full text-left px-4 py-3 text-sm text-purple-700 truncate"
                >
                  {item.title}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mb-6">
          <div className="overflow-x-hidden whitespace-nowrap mb-2">
            <h2 className="text-lg font-medium text-purple-900 inline-block px-1 animate-marquee">
              {title}
            </h2>
          </div>
          <br />
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={(e) => {
              const newTime = parseFloat(e.target.value);
              setCurrentTime(newTime);
              player?.seekTo?.(newTime, true);
            }}
            className="w-full h-2 bg-purple-100 rounded-full cursor-pointer range-thumb"
            style={{
              background: `linear-gradient(to right, #d946ef ${(currentTime / duration) * 100}%, #e0d4f7 ${(currentTime / duration) * 100}%)`
            }}
          />


          <div className="flex justify-between text-xs text-purple-600 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex justify-center items-center gap-4 mb-6">
          <button
            onClick={() => player?.previousVideo?.()}
            className="p-3 text-purple-600 hover:text-pink-500 hover:bg-white/30 rounded-full transition-colors"
            aria-label="Previous"
          >
            <PreviousIcon />
          </button>
          <button
            onClick={() => playerState === 1 ? player?.pauseVideo?.() : player?.playVideo?.()}
            className="p-4 bg-pink-400 text-white hover:bg-pink-500 rounded-full transition-all shadow-md hover:shadow-xl"
            aria-label={playerState === 1 ? 'Pause' : 'Play'}
          >
            {playerState === 1 ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            onClick={() => player?.nextVideo?.()}
            className="p-3 text-purple-600 hover:text-pink-500 hover:bg-white/30 rounded-full transition-colors"
            aria-label="Next"
          >
            <NextIcon />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (isMuted) {
                player?.unMute?.();
                setIsMuted(false);
              } else {
                player?.mute?.();
                setIsMuted(true);
              }
            }}
            className="p-2 text-purple-600 hover:text-pink-500 transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => {
              const newVolume = Number(e.target.value);
              setVolume(newVolume);
              player?.setVolume?.(newVolume);
              if (isMuted && newVolume > 0) {
                setIsMuted(false);
                player?.unMute?.();
              }
            }}
            className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-pink-400"
          />
        </div>

        <div className="mt-6 text-center text-xs text-purple-600">
          <div className="mb-2 text-[0.55rem]">
            Playing from: <span className="font-mono bg-white/30 px-1 py-1 rounded">{playlistId} (Playlist Id)</span>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-purple-600">
          Made with <span className="text-red-400">❤️</span> by{' '}
          <a
            href="https://bhargav-rathod.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-800 hover:underline"
          >
            Bhargav Rathod
          </a>
        </div>
      </div>
    </div>

  );
}