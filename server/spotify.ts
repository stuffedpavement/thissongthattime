import { type InsertSong } from "@shared/schema";

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    release_date: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  preview_url?: string;
  external_urls: {
    spotify: string;
  };
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getSpotifyAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured");
  }

  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Spotify auth failed: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Spotify auth failed: ${response.statusText}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute early

    return accessToken!;
  } catch (error: any) {
    console.error('Spotify authentication error:', error);
    // Clear cached token on error
    accessToken = null;
    tokenExpiry = 0;
    throw error;
  }
}

export async function searchSpotifyTracks(query: string, limit: number = 10, offset: number = 0): Promise<InsertSong[]> {
  try {
    const token = await getSpotifyAccessToken();
    
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&offset=${offset}`;
    console.log(`Searching Spotify: ${searchUrl}`);
    
    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Spotify search failed: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Spotify search failed: ${response.statusText}`);
    }

    const data: SpotifySearchResponse = await response.json();
    console.log(`Found ${data.tracks.items.length} tracks for query: ${query}`);
    
    return data.tracks.items.map(track => ({
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      year: new Date(track.album.release_date).getFullYear(),
      spotifyId: track.id,
      albumArt: track.album.images[0]?.url,
      previewUrl: track.preview_url,
      externalUrl: track.external_urls.spotify,
      genre: null, // Spotify doesn't provide genre in search results
      youtubeId: null
    }));
  } catch (error: any) {
    console.error('Full Spotify search error:', error);
    throw new Error(`Spotify search error: ${error.message}`);
  }
}

export async function getSpotifyTrack(trackId: string): Promise<InsertSong | null> {
  try {
    const token = await getSpotifyAccessToken();
    
    const response = await fetch(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const track: SpotifyTrack = await response.json();
    
    return {
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      year: new Date(track.album.release_date).getFullYear(),
      spotifyId: track.id,
      albumArt: track.album.images[0]?.url,
      previewUrl: track.preview_url,
      externalUrl: track.external_urls.spotify,
      genre: null,
      youtubeId: null
    };
  } catch (error: any) {
    return null;
  }
}
