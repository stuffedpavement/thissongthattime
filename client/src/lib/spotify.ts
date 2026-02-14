import { apiRequest } from './api';
import type { Song, InsertSong } from '@shared/schema';

// Client-side Spotify integration utilities
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string; id: string }>;
  album: {
    name: string;
    release_date: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  preview_url?: string;
  external_urls: {
    spotify: string;
  };
  popularity: number;
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
    total: number;
    limit: number;
    offset: number;
  };
}

// Client-side search function that calls our backend API
export async function searchSpotifyTracks(query: string, limit: number = 20): Promise<Song[]> {
  try {
    const response = await apiRequest(
      'GET',
      `/api/songs/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    
    return await response.json();
  } catch (error: any) {
    console.error('Spotify search failed:', error);
    throw new Error(`Failed to search songs: ${error.message}`);
  }
}

// Parse Spotify URL to extract track ID
export function parseSpotifyUrl(url: string): string | null {
  const patterns = [
    /spotify:track:([a-zA-Z0-9]+)/,
    /open\.spotify\.com\/track\/([a-zA-Z0-9]+)/,
    /spotify\.com\/track\/([a-zA-Z0-9]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// Get Spotify track by ID
export async function getSpotifyTrack(trackId: string): Promise<Song | null> {
  try {
    const response = await apiRequest('GET', `/api/songs/spotify/${trackId}`);
    return await response.json();
  } catch (error: any) {
    console.error('Failed to get Spotify track:', error);
    return null;
  }
}

// Generate Spotify Web Player embed URL
export function generateSpotifyEmbedUrl(trackId: string, theme: 'light' | 'dark' = 'light'): string {
  return `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=${theme}`;
}

// Generate Spotify Web Player URL
export function generateSpotifyWebUrl(trackId: string): string {
  return `https://open.spotify.com/track/${trackId}`;
}

// Check if Spotify Web Playback SDK is available
export function isSpotifyWebPlaybackAvailable(): boolean {
  return typeof window !== 'undefined' && 'Spotify' in window;
}

// Format track duration
export function formatTrackDuration(durationMs: number): string {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Get the best quality album art
export function getBestAlbumArt(images: Array<{ url: string; height: number; width: number }>): string | null {
  if (!images || images.length === 0) return null;
  
  // Sort by size (largest first) and return the best quality image
  const sortedImages = images.sort((a, b) => (b.height * b.width) - (a.height * a.width));
  return sortedImages[0]?.url || null;
}

// Get appropriate album art size
export function getAlbumArtBySize(
  images: Array<{ url: string; height: number; width: number }>,
  preferredSize: 'small' | 'medium' | 'large' = 'medium'
): string | null {
  if (!images || images.length === 0) return null;
  
  const sizeTargets = {
    small: 64,
    medium: 300,
    large: 640
  };
  
  const targetSize = sizeTargets[preferredSize];
  
  // Find the image closest to our target size
  let bestImage = images[0];
  let bestDifference = Math.abs(bestImage.height - targetSize);
  
  for (const image of images) {
    const difference = Math.abs(image.height - targetSize);
    if (difference < bestDifference) {
      bestImage = image;
      bestDifference = difference;
    }
  }
  
  return bestImage.url;
}

// Convert Spotify track to our Song format
export function convertSpotifyTrackToSong(track: SpotifyTrack): InsertSong {
  return {
    title: track.name,
    artist: track.artists.map(artist => artist.name).join(', '),
    album: track.album.name,
    year: new Date(track.album.release_date).getFullYear(),
    genre: null, // Spotify doesn't provide genre in search results
    spotifyId: track.id,
    youtubeId: null,
    albumArt: getBestAlbumArt(track.album.images),
    previewUrl: track.preview_url || null,
    externalUrl: track.external_urls.spotify,
  };
}

// Validate Spotify track data
export function validateSpotifyTrack(track: any): track is SpotifyTrack {
  return !!(
    track &&
    track.id &&
    track.name &&
    track.artists &&
    Array.isArray(track.artists) &&
    track.artists.length > 0 &&
    track.album &&
    track.album.name &&
    track.external_urls &&
    track.external_urls.spotify
  );
}

// Get genre from Spotify artist (requires additional API call)
export async function getArtistGenres(artistId: string): Promise<string[]> {
  try {
    const response = await apiRequest('GET', `/api/spotify/artist/${artistId}`);
    const artist = await response.json();
    return artist.genres || [];
  } catch (error) {
    console.error('Failed to get artist genres:', error);
    return [];
  }
}

// Create a Spotify playlist (if user is authenticated)
export async function createSpotifyPlaylist(name: string, trackIds: string[]): Promise<string | null> {
  try {
    const response = await apiRequest('POST', '/api/spotify/playlist', {
      name,
      trackIds
    });
    const playlist = await response.json();
    return playlist.external_urls.spotify;
  } catch (error) {
    console.error('Failed to create Spotify playlist:', error);
    return null;
  }
}

// Check if we have a valid preview URL
export function hasValidPreview(track: Song): boolean {
  return !!(track.previewUrl && track.previewUrl.length > 0);
}

// Generate fallback audio preview (using YouTube or other services)
export function generateFallbackPreview(track: Song): string | null {
  if (track.youtubeId) {
    return `https://www.youtube.com/watch?v=${track.youtubeId}`;
  }
  
  // Could integrate with other music services here
  return null;
}

// Audio player utilities
export class SpotifyPreviewPlayer {
  private audio: HTMLAudioElement | null = null;
  private currentTrack: Song | null = null;
  
  async play(track: Song): Promise<void> {
    if (!hasValidPreview(track)) {
      throw new Error('No preview available for this track');
    }
    
    // Stop current playback
    this.stop();
    
    // Create new audio element
    this.audio = new Audio(track.previewUrl!);
    this.currentTrack = track;
    
    try {
      await this.audio.play();
    } catch (error) {
      console.error('Failed to play preview:', error);
      throw new Error('Failed to play track preview');
    }
  }
  
  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    this.currentTrack = null;
  }
  
  pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
  }
  
  resume(): void {
    if (this.audio) {
      this.audio.play().catch(console.error);
    }
  }
  
  getCurrentTrack(): Song | null {
    return this.currentTrack;
  }
  
  isPlaying(): boolean {
    return !!(this.audio && !this.audio.paused);
  }
  
  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }
}

// Export a singleton instance for global use
export const spotifyPlayer = new SpotifyPreviewPlayer();
