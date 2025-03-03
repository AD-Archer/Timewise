'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

const CLIENT_ID = 'your_spotify_client_id';
const REDIRECT_URI = 'http://localhost:3000'; // Change this to your domain
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';
const SCOPES = ['user-read-private', 'user-read-email', 'streaming'];

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
}

interface Playlist {
  name: string;
  description: string;
  tracks: { items: { track: Track }[] };
}

export default function SpotifyLogin() {
  const [token, setToken] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
    const accessToken = hashParams.get('access_token');

    if (accessToken) {
      setToken(accessToken);
      try {
        window.localStorage.setItem('spotify_token', accessToken);
      } catch (error) {
        console.error('Failed to store token:', error);
      }
      window.history.replaceState(null, '', window.location.pathname);
    } else {
      try {
        const storedToken = window.localStorage.getItem('spotify_token');
        if (storedToken) setToken(storedToken);
      } catch (error) {
        console.error('Failed to retrieve token:', error);
      }
    }
  }, []);

  const loginToSpotify = () => {
    window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join('%20')}`;
  };

  const logout = () => {
    setToken(null);
    try {
      window.localStorage.removeItem('spotify_token');
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  };

  const fetchPlaylist = useCallback(async () => {
    if (!token) return;

    const playlistId = 'your_playlist_id'; // Replace with actual playlist ID

    try {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data: Playlist = await response.json();
      setPlaylist(data);
    } catch (error) {
      console.error('Error fetching playlist:', error);
    }
  }, [token]);

  return (
    <div className="text-center p-6">
      {!token ? (
        <button
          onClick={loginToSpotify}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
        >
          Login with Spotify
        </button>
      ) : (
        <>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
          <button
            onClick={fetchPlaylist}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition ml-4"
          >
            Load Playlist
          </button>
        </>
      )}

      {playlist && playlist.tracks?.items?.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold">{playlist.name}</h2>
          <p>{playlist.description}</p>
          <ul className="mt-4 space-y-2">
            {playlist.tracks.items.map(({ track }) => (
              <li key={track.id} className="flex items-center space-x-4">
                {track.album.images.length > 0 && (
                  <Image
                    src={track.album.images[0].url}
                    alt="Album Art"
                    width={48}
                    height={48}
                    className="rounded"
                  />
                )}
                <div>
                  <p className="font-semibold">{track.name}</p>
                  <p className="text-sm text-gray-400">
                    {track.artists.map((a) => a.name).join(', ')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
