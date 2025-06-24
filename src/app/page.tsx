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
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
  </svg>
);

const NextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
  </svg>
);

const VolumeUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
    <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
  </svg>
);

const VolumeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
  </svg>
);

const PlaylistIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M5.566 4.657A4.505 4.505 0 016.75 4.5h10.5c.41 0 .806.055 1.183.157A3 3 0 0015.75 3h-7.5a3 3 0 00-2.684 1.657zM2.25 12a3 3 0 013-3h13.5a3 3 0 013 3v6a3 3 0 01-3 3H5.25a3 3 0 01-3-3v-6zM5.25 7.5c-.41 0-.806.055-1.184.157A3 3 0 016.75 6h10.5a3 3 0 012.683 1.657A4.505 4.505 0 0018.75 7.5H5.25z" />
  </svg>
);

const MusicNoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M19.952 1.651a.75.75 0 01.298.599V16.303a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.403-4.909l2.311-.66a1.5 1.5 0 001.088-1.442V6.994l-9 2.572v9.737a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.402-4.909l2.31-.66a1.5 1.5 0 001.088-1.442V9.017 5.25a.75.75 0 01.544-.721l10.5-3a.75.75 0 01.658.122z" clipRule="evenodd" />
  </svg>
);

export default function YouTubePlayer() {
  const [player, setPlayer] = useState<any>(null);
  const [playerState, setPlayerState] = useState(-1);
  const [title, setTitle] = useState('Not Playing');
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlistId, setPlaylistId] = useState(process.env.NEXT_PUBLIC_PLAYLIST_ID || '');
  const [playlistItems, setPlaylistItems] = useState<any[]>([]);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300&auto=format&fit=crop');
  const [isPlaying, setIsPlaying] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const youtubeScriptRef = useRef<HTMLScriptElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPlaylistItems = async () => {
      if (!playlistId) return;
      try {
        const response = await fetch(`/api/yt-playlist?playlistId=${playlistId}`);
        const data = await response.json();
        setPlaylistItems(data.items);
        if (data.items?.[0]?.thumbnail) {
          setThumbnail(data.items[0].thumbnail);
        }
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
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            const p = event.target;
            setPlayer(p);
            setIsReady(true);
            p.setVolume(volume);
            setIsMuted(p.isMuted());
          },
          onStateChange: (event: any) => {
            setPlayerState(event.data);
            setIsPlaying(event.data === 1);
            if (event.data === 1) {
              const videoData = event.target.getVideoData();
              setTitle(videoData.title);
              setDuration(event.target.getDuration());
              startProgressTracking(event.target);

              // Find and set thumbnail from playlist items
              const currentIndex = event.target.getPlaylistIndex();
              if (playlistItems[currentIndex]?.thumbnail) {
                setThumbnail(playlistItems[currentIndex].thumbnail);
              }
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
  }, [playlistId, playlistItems]);

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-gray-800">
      <div ref={playerContainerRef} className="hidden" />

      <div className="w-full max-w-sm bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
        {/* Album Art */}
        <div className="relative h-64 w-full bg-gray-700 overflow-hidden">
          <img
            src={thumbnail}
            alt="Album cover"
            className={`w-full h-full object-cover transition-all duration-500 ${isPlaying ? 'scale-100' : 'scale-105'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <MusicNoteIcon />
            <span className="text-xs font-medium text-pink-400">NOW PLAYING</span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="p-5">
          {/* Song Title - Marquee effect */}
          <div className="mb-6 overflow-hidden">
            <div
              ref={titleRef}
              className="text-lg font-semibold text-white whitespace-nowrap transition-transform duration-10000"
              style={{
                transform: title.length > 30 ? `translateX(${-Math.max(0, (title.length - 30) * 10)}px)` : 'none',
                animation: title.length > 30 ? 'marquee 15s linear infinite' : 'none'
              }}
            >
              {title}
            </div>
            <style jsx>{`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => {
                const newTime = parseFloat(e.target.value);
                setCurrentTime(newTime);
                player?.seekTo?.(newTime, true);
              }}
              className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-pink-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setShowPlaylist(!showPlaylist)}
              className={`p-2 rounded-full ${showPlaylist ? 'bg-pink-500/20 text-pink-400' : 'text-gray-400 hover:text-white'}`}
              aria-label="Playlist"
            >
              <PlaylistIcon />
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={() => player?.previousVideo?.()}
                className="p-2 text-gray-300 hover:text-white transition-colors"
                aria-label="Previous"
              >
                <PreviousIcon />
              </button>
              <button
                onClick={() => playerState === 1 ? player?.pauseVideo?.() : player?.playVideo?.()}
                className="p-3 bg-pink-500 text-white hover:bg-pink-600 rounded-full transition-all shadow-lg"
                aria-label={playerState === 1 ? 'Pause' : 'Play'}
              >
                {playerState === 1 ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button
                onClick={() => player?.nextVideo?.()}
                className="p-2 text-gray-300 hover:text-white transition-colors"
                aria-label="Next"
              >
                <NextIcon />
              </button>
            </div>

            <div className="flex items-center gap-2">
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
                className="p-1 text-gray-300 hover:text-white transition-colors"
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
                className="w-16 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-pink-500"
              />
            </div>
          </div>

          {/* Playlist */}
          {showPlaylist && (
            <div className="mb-4 max-h-48 overflow-y-auto rounded-lg bg-gray-700/50 border border-gray-600 playlist-scrollbar">
              {playlistItems.map((item, index) => (
                <div key={item.id} className="border-b border-gray-600/50 last:border-b-0 hover:bg-gray-700/70 transition-colors">
                  <button
                    onClick={() => playVideoByIndex(index)}
                    className={`block w-full text-left px-4 py-3 text-sm truncate ${item.title === title ? 'text-pink-400 font-medium' : 'text-gray-300'}`}
                  >
                    {item.title}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-[0.5rem] text-gray-500 pt-4 border-t border-gray-700">
            <div className="mb-1">
              Playing from YouTube playlist {playlistId}
            </div>
            <div>
              Made with <span className="text-pink-400">♥</span> by{' '}
              <a
                href="https://bhargav-rathod.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:underline"
              >
                Bhargav Rathod
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
