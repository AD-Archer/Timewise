// more than likely this will not be used in final site and can be ignored.

'use client';

import { useState, useEffect } from 'react';

const CLIENT_ID = 'your_spotify_client_id';
const REDIRECT_URI = 'http://localhost:3000'; // Change this to your domain
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';
const SCOPES = ['user-read-private', 'user-read-email', 'streaming'];

export default function SpotifyLogin() {
  const [token, setToken] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<any>(null);

  useEffect(() => {
    // Check if token is in the URL hash (after redirect)
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        setToken(accessToken);
        window.localStorage.setItem('spotify_token', accessToken);
        window.history.replaceState(null, '', window.location.pathname); // Clean URL
      }
    } else {
      const storedToken = window.localStorage.getItem('spotify_token');
      if (storedToken) setToken(storedToken);
    }
  }, []);

  const loginToSpotify = () => {
    window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join('%20')}`;
  };

  const logout = () => {
    setToken(null);
    window.localStorage.removeItem('spotify_token');
  };

  const fetchPlaylist = async () => {
    if (!token) return;
    const playlistId = 'your_playlist_id'; // Replace with your playlist ID

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data = await response.json();
      setPlaylist(data);
    } else {
      console.error('Error fetching playlist');
    }
  };

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

      {playlist && (
        <div className="mt-6">
          <h2 className="text-xl font-bold">{playlist.name}</h2>
          <p>{playlist.description}</p>
          <ul className="mt-4 space-y-2">
            {playlist.tracks.items.map((item: any) => (
              <li key={item.track.id} className="flex items-center space-x-4">
                <img src={item.track.album.images[0].url} alt="Album Art" className="w-12 h-12 rounded" />
                <div>
                  <p className="font-semibold">{item.track.name}</p>
                  <p className="text-sm text-gray-400">{item.track.artists.map((a: any) => a.name).join(', ')}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
