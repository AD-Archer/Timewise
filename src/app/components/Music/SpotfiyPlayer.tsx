'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useSettings } from '../../contexts/SettingsContext';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import dotenv from 'dotenv';
dotenv.config();

// Replace with your actual Spotify client ID
const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
// Use a redirect URI that matches one registered in the Spotify Developer Dashboard
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
  'playlist-read-private',
  'playlist-read-collaborative'
];

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
  uri: string;
}

// Define types for Spotify SDK events
interface PlayerState {
  track_window: {
    current_track: {
      id: string;
      name: string;
      artists: { name: string }[];
      album: { images: { url: string }[] };
      uri: string;
    }
  };
  paused: boolean;
  position: number;
  duration: number;
}

interface ReadyEvent {
  device_id: string;
}

type SpotifyEventCallback = 
  | ((state: ReadyEvent) => void) 
  | ((state: PlayerState) => void);

// Spotify SDK Player type
interface SpotifyPlayer {
  _options: { id: string; name: string };
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (event: string, callback: SpotifyEventCallback) => boolean;
  removeListener: (event: string, callback: SpotifyEventCallback) => boolean;
  getCurrentState: () => Promise<PlayerState | null>;
  setName: (name: string) => Promise<void>;
  getVolume: () => Promise<number>;
  setVolume: (volume: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (position_ms: number) => Promise<void>;
  previousTrack: () => Promise<void>;
  nextTrack: () => Promise<void>;
}

// Add Spotify SDK to window object
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: SpotifyPlayerOptions) => SpotifyPlayer;
    };
  }
}

// Options for Spotify Player constructor
interface SpotifyPlayerOptions {
  name: string;
  getOAuthToken: (callback: (token: string) => void) => void;
  volume: number;
}

export interface SpotifyPlaylistInfo {
  id: string;
  name: string;
  uri: string;
  imageUrl?: string;
}

// Interface for playlist API response
interface SpotifyPlaylistResponse {
  items: Array<{
    id: string;
    name: string;
    uri: string;
    images: Array<{ url: string }>;
  }>;
}

export default function SpotifyPlayer() {
  const { settings, updateSettings } = useSettings();
  const [token, setToken] = useState<string | null>(null);
  const [player, setPlayer] = useState<SpotifyPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const playerRef = useRef<SpotifyPlayer | null>(null);

  // Define logout function with useCallback to avoid dependency issues
  const logout = useCallback(() => {
    try {
      // Disconnect the player if it exists
      const currentPlayer = player || playerRef.current;
      if (currentPlayer) {
        currentPlayer.disconnect();
      }
      
      // Reset all state
      setToken(null);
      setPlayer(null);
      playerRef.current = null;
      setCurrentTrack(null);
      setIsPlaying(false);
      setDeviceId(null);
      
      // Remove token from storage
      window.localStorage.removeItem('spotify_token');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }, [player]);

  // Function to open settings directly to Spotify playlists tab
  const openSpotifySettings = useCallback(() => {
    // First set preferred music service to Spotify
    updateSettings({ preferredMusicService: 'spotify' });
    
    // If there are Spotify playlists and none is selected, select the first one
    if (settings.spotifyPlaylists?.length > 0 && !settings.currentSpotifyPlaylistUri) {
      updateSettings({ currentSpotifyPlaylistUri: settings.spotifyPlaylists[0].uri });
    }
    
    // Create a custom event to tell the settings component to switch to the music tab
    const event = new CustomEvent('openSettingsTab', { detail: { tab: 'music' } });
    window.dispatchEvent(event);
  }, [settings.spotifyPlaylists, settings.currentSpotifyPlaylistUri, updateSettings]);

  // Listen for the custom event in the main app component
  useEffect(() => {
    // Add event listener for settings popup state changes
    const handleSettingsClose = () => {
      // Handle any cleanup needed when settings are closed
    };
    
    window.addEventListener('settingsPopupClosed', handleSettingsClose);
    
    return () => {
      // Safe cleanup of event listener
      if (typeof window !== 'undefined') {
        window.removeEventListener('settingsPopupClosed', handleSettingsClose);
      }
    };
  }, []);

  // Load the Spotify Web Playback SDK
  useEffect(() => {
    if (!token) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    // Cleanup function to handle script removal
    return () => {
      // Only remove the script if it exists in the document
      const scriptElement = document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]');
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
      
      // Disconnect player if it exists
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [token]);

  // Setup player once SDK is loaded
  useEffect(() => {
    if (!token) return;
    
    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Pomodoro Clock Web Player',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(token);
        },
        volume: volume
      });

      // Store player in both state and ref for different access patterns
      setPlayer(spotifyPlayer);
      playerRef.current = spotifyPlayer;

      // Set up event listeners
      spotifyPlayer.addListener('ready', ({ device_id }: ReadyEvent) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
      });

      spotifyPlayer.addListener('not_ready', ({ device_id }: ReadyEvent) => {
        console.log('Device ID has gone offline', device_id);
      });

      spotifyPlayer.addListener('player_state_changed', (state: PlayerState) => {
        if (!state || !state.track_window || !state.track_window.current_track) return;
        
        const currentTrackInfo = state.track_window.current_track;
        
        // Make sure all required properties exist
        if (!currentTrackInfo.id || !currentTrackInfo.name || !currentTrackInfo.artists || 
            !currentTrackInfo.album || !currentTrackInfo.album.images || 
            !currentTrackInfo.album.images.length) {
          console.warn('Incomplete track information received from Spotify', currentTrackInfo);
          return;
        }
        
        setCurrentTrack({
          id: currentTrackInfo.id,
          name: currentTrackInfo.name,
          artists: currentTrackInfo.artists,
          album: { images: [{ url: currentTrackInfo.album.images[0].url }] },
          uri: currentTrackInfo.uri
        });
        
        setIsPlaying(!state.paused);
      });

      // Connect to the player
      spotifyPlayer.connect().then((success) => {
        if (success) {
          console.log('The Web Playback SDK successfully connected to Spotify!');
        }
      });
    };
  }, [token, volume]);

  // Handle token from URL hash or localStorage
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
    const accessToken = hashParams.get('access_token');

    if (accessToken) {
      setToken(accessToken);
      try {
        window.localStorage.setItem('spotify_token', accessToken);
        window.history.replaceState(null, '', window.location.pathname);
      } catch (error) {
        console.error('Failed to store token:', error);
      }
    } else {
      try {
        const storedToken = window.localStorage.getItem('spotify_token');
        if (storedToken) setToken(storedToken);
      } catch (error) {
        console.error('Failed to retrieve token:', error);
      }
    }
  }, []);

  // Fetch user's playlists when token is available
  useEffect(() => {
    if (!token) return;

    const fetchPlaylists = async () => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired, clear it
            logout();
            return;
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json() as SpotifyPlaylistResponse;
        const fetchedPlaylists: SpotifyPlaylistInfo[] = data.items.map((playlist) => ({
          id: playlist.id,
          name: playlist.name,
          uri: playlist.uri,
          imageUrl: playlist.images && playlist.images.length > 0 ? playlist.images[0].url : undefined
        }));
        
        // Update settings with Spotify playlists if needed
        if (fetchedPlaylists.length > 0 && !settings.spotifyPlaylists?.some(p => 
          fetchedPlaylists.some(fp => fp.id === p.id)
        )) {
          updateSettings({ spotifyPlaylists: fetchedPlaylists });
        }
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    };

    fetchPlaylists();
  }, [token, settings.spotifyPlaylists, updateSettings, logout]);

  // Play a specific playlist
  const playPlaylist = useCallback(async (playlistUri: string) => {
    if (!token || !deviceId) return;
    
    setIsLoading(true);
    
    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          context_uri: playlistUri
        })
      });
      
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing playlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, deviceId]);

  // Play the current Spotify playlist from settings
  useEffect(() => {
    if (!token || !deviceId || !settings.currentSpotifyPlaylistUri) return;
    
    // Auto-play the current playlist when device is ready
    playPlaylist(settings.currentSpotifyPlaylistUri);
  }, [deviceId, settings.currentSpotifyPlaylistUri, playPlaylist, token]);

  const loginToSpotify = () => {
    // Ensure REDIRECT_URI is defined before using it
    if (!CLIENT_ID || !REDIRECT_URI) {
      console.error('Spotify client ID or redirect URI is not defined');
      return;
    }
    
    window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join('%20')}`;
  };

  const togglePlayback = async () => {
    try {
      const currentPlayer = player || playerRef.current;
      if (!currentPlayer) return;
      
      await currentPlayer.togglePlay();
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const nextTrack = async () => {
    try {
      const currentPlayer = player || playerRef.current;
      if (!currentPlayer) return;
      
      await currentPlayer.nextTrack();
    } catch (error) {
      console.error('Error skipping to next track:', error);
    }
  };

  const previousTrack = async () => {
    try {
      const currentPlayer = player || playerRef.current;
      if (!currentPlayer) return;
      
      await currentPlayer.previousTrack();
    } catch (error) {
      console.error('Error going to previous track:', error);
    }
  };

  const toggleMute = async () => {
    try {
      const currentPlayer = player || playerRef.current;
      if (!currentPlayer) return;
      
      if (isMuted) {
        await currentPlayer.setVolume(volume);
      } else {
        await currentPlayer.setVolume(0);
      }
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      
      // Use both the state and ref to ensure we have access to the player
      const currentPlayer = player || playerRef.current;
      if (!currentPlayer) return;
      
      await currentPlayer.setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
      }
    } catch (error) {
      console.error('Error changing volume:', error);
    }
  };

  // Don't render if user has chosen YouTube player
  if (settings.preferredMusicService === 'youtube') {
    return null;
  }

  // Mini player in bottom left
  return (
    <div className={`fixed bottom-4 left-4 z-50 transition-all duration-300 ${isExpanded ? 'w-72' : 'w-16'} bg-black/80 backdrop-blur-md rounded-lg shadow-lg overflow-hidden`}>
      {!token ? (
        <button
          onClick={loginToSpotify}
          className="w-full h-16 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
        </button>
      ) : (
        <>
          {/* Mini player header/toggle */}
          <div 
            className="flex items-center p-2 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {currentTrack?.album.images[0]?.url ? (
              <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
                <Image
                  src={currentTrack.album.images[0].url}
                  alt="Album Art"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13"></path>
                  <circle cx="6" cy="18" r="3"></circle>
                  <circle cx="18" cy="16" r="3"></circle>
                </svg>
              </div>
            )}
            
            {isExpanded && (
              <div className="ml-2 flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{currentTrack?.name || 'Not Playing'}</p>
                <p className="text-white/70 text-xs truncate">
                  {currentTrack?.artists.map(a => a.name).join(', ') || 'Spotify'}
                </p>
              </div>
            )}
          </div>
          
          {/* Expanded player controls */}
          {isExpanded && (
            <div className="p-3 border-t border-white/10">
              {/* Playback controls */}
              <div className="flex items-center justify-between mb-3">
                <button 
                  onClick={previousTrack}
                  className="text-white/70 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  <SkipBack size={18} />
                </button>
                
                <button 
                  onClick={togglePlayback}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : isPlaying ? (
                    <Pause size={18} />
                  ) : (
                    <Play size={18} className="ml-0.5" />
                  )}
                </button>
                
                <button 
                  onClick={nextTrack}
                  className="text-white/70 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  <SkipForward size={18} />
                </button>
              </div>
              
              {/* Volume control */}
              <div className="flex items-center space-x-2">
                <button 
                  onClick={toggleMute}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>
              
              {/* Playlists button */}
              <button
                onClick={openSpotifySettings}
                className="w-full mt-3 py-1.5 text-xs bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors"
              >
                Manage Playlists
              </button>
              
              {/* Logout button */}
              <button
                onClick={logout}
                className="w-full mt-2 py-1 text-xs text-white/70 hover:text-white transition-colors"
              >
                Disconnect
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
