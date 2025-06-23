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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlistId, setPlaylistId] = useState(process.env.NEXT_PUBLIC_PLAYLIST_ID || '');
  const [isEditingPlaylist, setIsEditingPlaylist] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const youtubeScriptRef = useRef<HTMLScriptElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

              // Start progress tracking
              startProgressTracking(p);
            } catch {
              console.log('Autoplay blocked. Awaiting user interaction.');
              setNeedsInteraction(true);
            }
          },
          onStateChange: (event: any) => {
            setPlayerState(event.data);
            if (event.data === 1) {
              setTitle(event.target.getVideoData().title);
              setDuration(event.target.getDuration());
              startProgressTracking(event.target);
            } else if (event.data === 0) {
              // Video ended
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
              }
            } else if (event.data === 2) {
              // Paused
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
      //startProgressTracking(player);
      setNeedsInteraction(false);
    }
  };

  const togglePlay = () => {
    if (!player) return;
    if (playerState === 1) {
      player.pauseVideo();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    } else {
      player.playVideo();
      //startProgressTracking(player);
    }
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

  const handleNext = () => {
    player?.nextVideo?.();
    //startProgressTracking(player);
  };

  const handlePrevious = () => {
    player?.previousVideo?.();
    //startProgressTracking(player);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (player && typeof player.seekTo === 'function') {
      player.seekTo(newTime, true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlaylistIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaylistId(e.target.value);
  };

  const handlePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingPlaylist(false);
    // The useEffect with playlistId dependency will handle the player reinitialization
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div ref={playerContainerRef} className="hidden" />

      <div className="bg-white bg-opacity-90 p-6 rounded-xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-xl font-bold text-indigo-900">Youtube Player</h1>
          {isEditingPlaylist ? (
            <form onSubmit={handlePlaylistSubmit} className="flex items-center">
              <input
                type="text"
                value={playlistId}
                onChange={handlePlaylistIdChange}
                className="text-xs p-1 border rounded mr-2 w-32"
                placeholder="Playlist ID"
              />
              <button type="submit" className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">
                Save
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsEditingPlaylist(true)}
              className="text-xs text-indigo-600 hover:text-indigo-800"
              title="Edit playlist"
            >
              {playlistId ? `${playlistId.substring(0, 6)}...` : 'Set Playlist'}
            </button>
          )}
        </div>

        {needsInteraction ? (
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728" />
              </svg>
            </div>
            <button
              onClick={handlePlay}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all flex items-center mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Start Playback
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-medium mb-4 truncate text-gray-800">
              {title}
            </h2>

            {/* Progress bar */}
            <div className="mb-6">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex justify-center items-center gap-6 mb-8">
              <button
                onClick={handlePrevious}
                aria-label="Previous track"
                className="p-2 rounded-full hover:bg-indigo-100 text-indigo-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                </svg>
              </button>
              <button
                onClick={togglePlay}
                aria-label="Play/Pause"
                className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {playerState === 1 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleNext}
                aria-label="Next track"
                className="p-2 rounded-full hover:bg-indigo-100 text-indigo-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="p-2 rounded-full hover:bg-indigo-100 text-indigo-700"
              >
                {isMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a7.975 7.975 0 015.657 2.343m0 0a7.975 7.975 0 010 11.314m-11.314 0a7.975 7.975 0 010-11.314m0 0a7.975 7.975 0 015.657-2.343" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="mt-8 text-center text-sm text-gray-500">
              Made with ❤️ by{' '}
              <a
                href="https://bhargav-rathod.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
              >
                Bhargav Rathod
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}