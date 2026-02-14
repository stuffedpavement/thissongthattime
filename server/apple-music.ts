
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

export interface AppleMusicSearchResponse {
  resultCount: number;
  results: AppleMusicTrack[];
}

export async function searchAppleMusicTracks(query: string, limit: number = 10, offset: number = 0): Promise<AppleMusicTrack[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodedQuery}&entity=song&limit=${limit}&offset=${offset}`
    );

    if (!response.ok) {
      throw new Error(`Apple Music API error: ${response.status}`);
    }

    const data: AppleMusicSearchResponse = await response.json();
    
    // Debug logging
    console.log(`Apple Music search for "${query}" returned ${data.resultCount} results`);
    if (data.results && data.results.length > 0) {
      const previewCount = data.results.filter(track => track.previewUrl).length;
      console.log(`${previewCount} out of ${data.results.length} tracks have preview URLs`);
      
      // Log first result details
      const firstTrack = data.results[0];
      console.log('First track details:', {
        trackName: firstTrack.trackName,
        artistName: firstTrack.artistName,
        hasPreview: !!firstTrack.previewUrl,
        previewUrl: firstTrack.previewUrl
      });
    }
    
    return data.results || [];
  } catch (error) {
    console.error('Error searching Apple Music:', error);
    throw error;
  }
}

export async function getAppleMusicTrack(trackId: string): Promise<AppleMusicTrack | null> {
  try {
    const response = await fetch(
      `https://itunes.apple.com/lookup?id=${trackId}&entity=song`
    );

    if (!response.ok) {
      throw new Error(`Apple Music API error: ${response.status}`);
    }

    const data: AppleMusicSearchResponse = await response.json();
    return data.results && data.results.length > 0 ? data.results[0] : null;
  } catch (error) {
    console.error('Error getting Apple Music track:', error);
    return null;
  }
}

export async function getAppleMusicPreview(songTitle: string, artist: string): Promise<string | null> {
  try {
    // Clean up the search terms
    const cleanTitle = songTitle.replace(/[()[\]]/g, '').trim();
    const cleanArtist = artist.replace(/[()[\]]/g, '').trim();
    
    // Try multiple search variations with proper URL encoding
    const searchVariations = [
      `${cleanTitle} ${cleanArtist}`,
      `${cleanArtist} ${cleanTitle}`,
      cleanTitle
    ];

    for (const query of searchVariations) {
      console.log(`Searching iTunes for: "${query}"`);
      
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=10&country=US`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.log(`iTunes API responded with status: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      console.log(`iTunes returned ${data.resultCount} results for "${query}"`);
      
      if (data.results && data.results.length > 0) {
        // Log all results for debugging
        data.results.forEach((track: AppleMusicTrack, index: number) => {
          console.log(`Result ${index + 1}: "${track.trackName}" by "${track.artistName}" - Preview: ${track.previewUrl ? 'YES' : 'NO'}`);
        });
        
        // Look for exact title matches first
        const exactTitleMatch = data.results.find((track: AppleMusicTrack) => 
          track.trackName.toLowerCase().trim() === cleanTitle.toLowerCase().trim() &&
          track.previewUrl
        );
        
        if (exactTitleMatch?.previewUrl) {
          console.log(`✓ Found exact title match with preview: ${exactTitleMatch.previewUrl}`);
          return exactTitleMatch.previewUrl;
        }
        
        // Look for close title matches
        const closeMatch = data.results.find((track: AppleMusicTrack) => 
          track.trackName.toLowerCase().includes(cleanTitle.toLowerCase()) &&
          track.previewUrl
        );
        
        if (closeMatch?.previewUrl) {
          console.log(`✓ Found close match with preview: ${closeMatch.previewUrl}`);
          return closeMatch.previewUrl;
        }
        
        // Take the first result with a preview URL
        const firstWithPreview = data.results.find((track: AppleMusicTrack) => track.previewUrl);
        if (firstWithPreview?.previewUrl) {
          console.log(`✓ Using first result with preview: ${firstWithPreview.previewUrl}`);
          return firstWithPreview.previewUrl;
        }
      }
      
      // Small delay between searches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log(`✗ No preview URL found for: "${cleanTitle}" by "${cleanArtist}"`);
    return null;
  } catch (error) {
    console.error('iTunes search failed:', error);
    return null;
  }
}

export function convertAppleMusicTrackToSong(track: AppleMusicTrack) {
  return {
    title: track.trackName,
    artist: track.artistName,
    album: track.collectionName,
    year: track.releaseDate ? new Date(track.releaseDate).getFullYear() : null,
    genre: track.primaryGenreName,
    albumArt: track.artworkUrl100?.replace('100x100', '500x500') || null,
    spotifyId: null,
    appleMusicId: track.trackId.toString(),
    previewUrl: track.previewUrl || null,
    externalUrl: track.trackViewUrl,
  };
}
