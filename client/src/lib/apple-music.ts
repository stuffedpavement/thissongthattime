
import type { Song, InsertSong } from '@shared/schema';

export interface AppleMusicTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  releaseDate: string;
  primaryGenreName: string;
  artworkUrl100: string;
  previewUrl?: string;
  trackViewUrl: string;
}

// Extract Apple Music track ID from URL
export function extractAppleMusicId(url: string): string | null {
  const match = url.match(/music\.apple\.com\/[a-z]{2}\/(?:album\/[^\/]+\/)?(?:song\/)?([0-9]+)(?:\?i=([0-9]+))?/);
  return match ? (match[2] || match[1]) : null;
}

// Check if we have a valid preview URL
export function hasValidPreview(track: Song): boolean {
  return !!(track.previewUrl && track.previewUrl.length > 0);
}

// Audio player utilities
export class AppleMusicPreviewPlayer {
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
export const appleMusicPlayer = new AppleMusicPreviewPlayer();
