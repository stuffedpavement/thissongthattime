import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Music, Play, Plus, RotateCcw } from "lucide-react";
import { parseSongInput, extractAppleMusicId } from "@/lib/api";
import type { Song } from "@shared/schema";

interface SongSearchProps {
  onSongSelect: (song: Song) => void;
}

export default function SongSearch({ onSongSelect }: SongSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [allResults, setAllResults] = useState<Song[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults = [], isLoading } = useQuery<Song[]>({
    queryKey: ['/api/songs/search', { query: debouncedQuery, offset }],
    queryFn: async () => {
      const response = await fetch(`/api/songs/search?q=${encodeURIComponent(debouncedQuery)}&offset=${offset}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      return response.json();
    },
    enabled: debouncedQuery.length > 2,
  });

  // Handle search results updates
  useEffect(() => {
    if (searchResults.length > 0) {
      if (offset === 0) {
        // New search - replace results
        setAllResults(searchResults);
      } else {
        // Loading more - append results
        setAllResults(prev => [...prev, ...searchResults]);
      }
      setHasMore(searchResults.length === 10); // Assuming 10 is the limit per request
      setIsLoadingMore(false);
    }
  }, [searchResults, offset]);

  const handleSearch = () => {
    if (searchQuery.length < 3) return;
    
    setOffset(0);
    setAllResults([]);
    setHasMore(true);
    // Force a new search by clearing and then setting the debounced query
    setDebouncedQuery("");
    setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 10);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      setOffset(prev => prev + 10);
    }
  };

  const handleRefresh = () => {
    setOffset(0);
    setAllResults([]);
    setHasMore(true);
    setDebouncedQuery("");
    setTimeout(() => setDebouncedQuery(searchQuery), 50);
  };

  const handleSpotifyClick = () => {
    const url = prompt("Paste your Spotify song URL:");
    if (url && url.includes('spotify.com')) {
      setSearchQuery(url);
      setOffset(0);
      setAllResults([]);
      setDebouncedQuery(url);
    }
  };

  const handleAppleMusicClick = () => {
    const url = prompt("Paste your Apple Music song URL:");
    if (url && extractAppleMusicId(url)) {
      setSearchQuery(url);
      setOffset(0);
      setAllResults([]);
      setDebouncedQuery(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search by artist, title or paste a music link"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="text-base sm:text-lg py-4 pr-16 placeholder:text-sm sm:placeholder:text-base"
        />
        <Button
          onClick={handleSearch}
          disabled={searchQuery.length < 3}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 spotify-green text-white hover:bg-green-600"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Badge 
          variant="secondary" 
          className="bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer transition-colors"
          onClick={handleSpotifyClick}
        >
          <Music className="w-3 h-3 mr-1" />
          From Spotify
        </Badge>
        <Badge 
          variant="secondary" 
          className="bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors"
          onClick={handleAppleMusicClick}
        >
          <Music className="w-3 h-3 mr-1" />
          From Apple Music
        </Badge>
      </div>

      {/* Search Results */}
      {isLoading && debouncedQuery && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {allResults.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allResults.map((song) => (
            <Card 
              key={song.id || `${song.title}-${song.artist}`}
              className="hover:border-spotify-green hover:shadow-md transition-all cursor-pointer group"
              onClick={() => onSongSelect(song)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {song.albumArt ? (
                    <img
                      src={song.albumArt}
                      alt={`${song.title} album cover`}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Music className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {song.title}
                    </h3>
                    <p className="text-gray-600 truncate">{song.artist}</p>
                    {song.year && (
                      <p className="text-sm text-gray-500">{song.year}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-spotify-green hover:text-green-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {hasMore && (
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {isLoadingMore ? (
                  <>
                    <Search className="w-4 h-4 mr-2 animate-spin" />
                    Loading more songs...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Load More Songs
                  </>
                )}
              </Button>
            )}
            
            {allResults.length > 0 && (
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Refresh Results
              </Button>
            )}
          </div>
        </div>
      )}

      {debouncedQuery && !isLoading && allResults.length === 0 && (
        <div className="text-center py-8">
          <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-600">
            Try searching with different keywords or check your spelling.
          </p>
        </div>
      )}
    </div>
  );
}
