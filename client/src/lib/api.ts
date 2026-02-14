export async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// Spotify Web API helper functions
export async function searchSpotify(query: string, type: 'track' | 'artist' | 'album' = 'track', limit: number = 20) {
  try {
    const response = await apiRequest(
      'GET', 
      `/api/songs/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`
    );
    return await response.json();
  } catch (error) {
    console.error('Spotify search failed:', error);
    throw error;
  }
}

// YouTube helper functions
export function extractYouTubeId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

export function extractSpotifyId(url: string): string | null {
  const regExp = /spotify:track:([a-zA-Z0-9]+)|open\.spotify\.com\/track\/([a-zA-Z0-9]+)/;
  const match = url.match(regExp);
  return match ? (match[1] || match[2]) : null;
}

// Extract Apple Music track ID from URL
export function extractAppleMusicId(url: string): string | null {
  const regExp = /music\.apple\.com\/[a-z]{2}\/(?:album\/[^\/]+\/)?(?:song\/)?([0-9]+)(?:\?i=([0-9]+))?/;
  const match = url.match(regExp);
  return match ? (match[2] || match[1]) : null;
}

// Parse song input (URL or search query)
export function parseSongInput(input: string): {
  type: 'youtube' | 'spotify' | 'applemusic' | 'search';
  id?: string;
  query?: string;
} {
  const trimmedInput = input.trim();

  // Check for YouTube URL
  const youtubeId = extractYouTubeId(trimmedInput);
  if (youtubeId) {
    return { type: 'youtube', id: youtubeId };
  }

  // Check for Spotify URL
  const spotifyId = extractSpotifyId(trimmedInput);
  if (spotifyId) {
    return { type: 'spotify', id: spotifyId };
  }

  // Check for Apple Music URL
  const appleMusicId = extractAppleMusicId(trimmedInput);
  if (appleMusicId) {
    return { type: 'applemusic', id: appleMusicId };
  }

  // Default to search query
  return { type: 'search', query: trimmedInput };
}

// Format time duration
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Format numbers (likes, plays, etc.)
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

// Validate song data
export function validateSongData(data: any): boolean {
  return !!(data.title && data.artist);
}

// Generate embed URLs
export function generateSpotifyEmbedUrl(trackId: string): string {
  return `https://open.spotify.com/embed/track/${trackId}`;
}

export function generateYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

// Share functionality
export async function shareStory(storyId: number, title: string): Promise<void> {
  const url = `${window.location.origin}/story/${storyId}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `SoundStories: ${title}`,
        text: `Check out this musical memory: "${title}"`,
        url: url,
      });
    } catch (error) {
      // Fallback to clipboard if share API fails
      await navigator.clipboard.writeText(url);
    }
  } else {
    // Fallback for browsers without Web Share API
    await navigator.clipboard.writeText(url);
  }
}

// Local storage helpers for user preferences
export const storage = {
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return defaultValue;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }
};

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: any): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

// Debounce utility for search
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Image loading utilities
export function loadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

export function getImagePlaceholder(type: 'album' | 'artist' | 'user'): string {
  const placeholders = {
    album: '/api/placeholder/album.svg',
    artist: '/api/placeholder/artist.svg',
    user: '/api/placeholder/user.svg'
  };

  return placeholders[type] || placeholders.album;
}

const API_BASE = '/api';

// Add default error handling for fetch requests
const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const api = {
  async createStory(story: Omit<Story, 'id' | 'createdAt'>) {
    const response = await fetchWithErrorHandling(`${API_BASE}/stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(story),
    });
    return response.json();
  },
};