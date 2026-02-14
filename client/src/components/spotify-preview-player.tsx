import type { Song } from '@shared/schema';

interface SpotifyPreviewPlayerProps {
  song: Song;
  className?: string;
  variant?: 'compact' | 'full';
}

export default function SpotifyPreviewPlayer({ song, className = '', variant = 'full' }: SpotifyPreviewPlayerProps) {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="text-xs">
          <div className="text-white/90 font-medium">{song.title}</div>
          <div className="text-white/60">{song.artist}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-white/10">
        <div className="text-white/80 text-center">
          <p className="text-lg font-medium">{song.title}</p>
          <p className="text-sm opacity-75">{song.artist}</p>
          {song.album && <p className="text-xs opacity-60 mt-1">{song.album}</p>}
        </div>
      </div>
    </div>
  );
}