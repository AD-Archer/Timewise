/**
 * Spotify Player using proxy API for search and playback
 */
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { SkipBack, SkipForward, Play, Pause, Volume2, VolumeX, Search } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useMusic } from '../../contexts/MusicContext';

// Proxy API base URL
const SPOTIFY_PROXY_API = 'https://spotify-api-sage.vercel.app';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { 
    name?: string;
    images: { url: string }[] 
  };
  uri: string;
  duration_ms: number;
  external_urls: { spotify: string };
}

interface Album {
  id: string;
  name: string;
  artists: { name: string }[];
  images: { url: string }[];
  uri: string;
  external_urls: { spotify: string };
}

interface SearchResults {
  tracks?: { items: Track[] };
  albums?: { items: Album[] };
}

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
  const { settings, updateSettings, spotifyPlaylists, currentSpotifyPlaylistUri, setCurrentSpotifyPlaylistUri } = useSettings();
  const { registerPlayer, setIsPlaying: setMusicContextPlaying } = useMusic();
  
  // Search and playback state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults>({});
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  
  // Player state
  const [player, setPlayer] = useState<SpotifyPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [lastPlayedPlaylistUri, setLastPlayedPlaylistUri] = useState<string | null>(null);
  const playerRef = useRef<SpotifyPlayer | null>(null);

  // Search for tracks and albums
  const searchSpotify = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults({});
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `${SPOTIFY_PROXY_API}/v1/search?q=${encodeURIComponent(query)}&type=track,album&limit=20`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        console.error('Search failed:', response.status);
        setSearchResults({});
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({});
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Play a track directly
  const playTrack = useCallback(async (track: Track) => {
    if (!deviceId) return;
    
    setIsLoading(true);
    try {
      await fetch(`${SPOTIFY_PROXY_API}/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [track.uri]
        })
      });
      
      setSelectedTrack(track);
      setCurrentTrack(track);
      setIsPlaying(true);
      setMusicContextPlaying(true);
    } catch (error) {
      console.error('Error playing track:', error);
    } finally {
      setIsLoading(false);
    }
  }, [deviceId, setMusicContextPlaying]);

  // Play an album
  const playAlbum = useCallback(async (album: Album) => {
    if (!deviceId) return;
    
    setIsLoading(true);
    try {
      await fetch(`${SPOTIFY_PROXY_API}/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context_uri: album.uri
        })
      });
      
      setIsPlaying(true);
      setMusicContextPlaying(true);
    } catch (error) {
      console.error('Error playing album:', error);
    } finally {
      setIsLoading(false);
    }
  }, [deviceId, setMusicContextPlaying]);

  const logout = useCallback(async () => {
    try {
      setPlayer(null);
      playerRef.current = null;
      setCurrentTrack(null);
      setIsPlaying(false);
      setDeviceId(null);
      setLastPlayedPlaylistUri(null);
      
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
    if (spotifyPlaylists?.length > 0 && !currentSpotifyPlaylistUri) {
      setCurrentSpotifyPlaylistUri(spotifyPlaylists[0].uri);
    }
    
    // Create a custom event to tell the settings component to switch to the music tab
    const event = new CustomEvent('openSettingsTab', { detail: { tab: 'music' } });
    window.dispatchEvent(event);
  }, [spotifyPlaylists, currentSpotifyPlaylistUri, updateSettings, setCurrentSpotifyPlaylistUri]);

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

  // Load the Spotify Web Playback SDK (no token required for proxy)
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      const scriptElement = document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]');
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
      
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, []);

  // Setup player once SDK is loaded
  useEffect(() => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Timewise Music Player',
        getOAuthToken: (cb: (token: string) => void) => {
          // Proxy API might not need real tokens
          cb('proxy-token');
        },
        volume: volume
      });

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
        
        setCurrentTrack({
          id: currentTrackInfo.id,
          name: currentTrackInfo.name,
          artists: currentTrackInfo.artists,
          album: { images: currentTrackInfo.album.images },
          uri: currentTrackInfo.uri,
          duration_ms: 0,
          external_urls: { spotify: '' }
        });
        
        setIsPlaying(!state.paused);
        setMusicContextPlaying(!state.paused);
      });

      // Connect to the player
      spotifyPlayer.connect().then((success) => {
        if (success) {
          console.log('Connected to Spotify Web Playback SDK!');
        }
      });
    };
  }, [volume, setMusicContextPlaying]);
  // Don't render if user has chosen YouTube player
  if (settings.preferredMusicService === 'youtube') {
    return null;
  }

  // Search-based Spotify player
  return (
    <div className={`fixed bottom-4 left-4 z-50 transition-all duration-300 ${isExpanded ? 'w-80' : 'w-16'} bg-black/80 backdrop-blur-md rounded-lg shadow-lg overflow-hidden`}>
      {/* Mini player header/toggle */}
      <div className="flex items-center p-2">
        <div 
          className="cursor-pointer flex items-center flex-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center mr-2">
            <span className="text-white text-sm font-bold">♪</span>
          </div>
          {!isExpanded && (
            <div className="text-white text-xs">
              {currentTrack ? (
                <div>
                  <div className="font-medium truncate">{currentTrack.name}</div>
                  <div className="text-white/60 truncate">
                    {currentTrack.artists.map(a => a.name).join(', ')}
                  </div>
                </div>
              ) : (
                <div className="text-white/60">Spotify</div>
              )}
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-3">
          {/* Search Input */}
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <input
                type="text"
                placeholder="Search songs, albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm"
              />
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {isSearching ? (
              <div className="text-white/60 text-center py-4">Searching...</div>
            ) : searchQuery && (
              <div className="space-y-2">
                {/* Tracks */}
                {searchResults.tracks?.items?.slice(0, 5).map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center p-2 bg-white/5 rounded hover:bg-white/10 cursor-pointer transition-colors"
                    onClick={() => playTrack(track)}
                  >
                    <Image
                      src={track.album.images[0]?.url || '/placeholder.png'}
                      alt={track.album.name || 'Album'}
                      width={40}
                      height={40}
                      className="rounded mr-3"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{track.name}</div>
                      <div className="text-white/60 text-xs truncate">
                        {track.artists.map(a => a.name).join(', ')}
                      </div>
                    </div>
                    <div className="text-white/40 text-xs">♪</div>
                  </div>
                ))}

                {/* Albums */}
                {searchResults.albums?.items?.slice(0, 3).map((album) => (
                  <div
                    key={album.id}
                    className="flex items-center p-2 bg-white/5 rounded hover:bg-white/10 cursor-pointer transition-colors"
                    onClick={() => playAlbum(album)}
                  >
                    <Image
                      src={album.images[0]?.url || '/placeholder.png'}
                      alt={album.name}
                      width={40}
                      height={40}
                      className="rounded mr-3"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{album.name}</div>
                      <div className="text-white/60 text-xs truncate">
                        {album.artists.map(a => a.name).join(', ')}
                      </div>
                    </div>
                    <div className="text-white/40 text-xs">💿</div>
                  </div>
                ))}

                {(!searchResults.tracks?.items?.length && !searchResults.albums?.items?.length) && searchQuery && (
                  <div className="text-white/60 text-center py-4">No results found</div>
                )}
              </div>
            )}
          </div>

          {/* Current Track & Controls */}
          {currentTrack && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex items-center mb-2">
                <Image
                  src={currentTrack.album.images[0]?.url || '/placeholder.png'}
                  alt={currentTrack.album.name || 'Album'}
                  width={40}
                  height={40}
                  className="rounded mr-3"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{currentTrack.name}</div>
                  <div className="text-white/60 text-xs truncate">
                    {currentTrack.artists.map(a => a.name).join(', ')}
                  </div>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => player?.previousTrack()}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (isPlaying) {
                      player?.pause();
                    } else {
                      player?.resume();
                    }
                  }}
                  className="p-3 bg-green-600 rounded-full text-white hover:bg-green-700 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => player?.nextTrack()}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setIsMuted(!isMuted);
                    player?.setVolume(isMuted ? volume : 0);
                  }}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {!deviceId && (
            <div className="text-white/60 text-xs text-center mt-2">
              Connect a Spotify app to start playing
            </div>
          )}
        </div>
      )}
    </div>
  );
}
