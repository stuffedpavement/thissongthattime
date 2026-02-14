import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SongSearch from "@/components/song-search";
import EnhancedStoryForm from "@/components/enhanced-story-form";
import { ArrowLeft, Music } from "lucide-react";
import type { Song } from "@shared/schema";

export default function CreateStory() {
  const [, setLocation] = useLocation();
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [step, setStep] = useState<'song' | 'story'>('song');

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
    setStep('story');
  };

  const handleBackToSongSelection = () => {
    setStep('song');
    setSelectedSong(null);
  };

  const handleStoryComplete = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="text-gray-600 hover:text-gray-900 p-0 h-auto font-normal"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create Your Story</h1>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === 'song' ? 'spotify-green text-white' : 'bg-green-500 text-white'
            }`}>
              <Music className="w-5 h-5" />
            </div>
            <div className={`h-1 w-16 rounded ${
              step === 'story' ? 'bg-green-500' : 'bg-gray-200'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === 'story' ? 'spotify-green text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Content */}
        {step === 'song' ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Find Your Song</CardTitle>
              <p className="text-center text-gray-600">
                Search by name, paste a Spotify/YouTube link, or browse by artist
              </p>
            </CardHeader>
            <CardContent>
              <SongSearch onSongSelect={handleSongSelect} />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Selected Song Display */}
            {selectedSong && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-6 gradient-spotify rounded-xl text-white p-6">
                    {selectedSong.albumArt && (
                      <img 
                        src={selectedSong.albumArt} 
                        alt={`${selectedSong.title} album cover`}
                        className="w-20 h-20 rounded-lg shadow-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{selectedSong.title}</h3>
                      <p className="opacity-90">{selectedSong.artist}</p>
                      {selectedSong.album && selectedSong.year && (
                        <p className="text-sm opacity-75">
                          {selectedSong.album} • {selectedSong.year}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToSongSelection}
                      className="text-white hover:text-yellow-300 hover:bg-white/10"
                    >
                      Change Song
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Separator />
            
            {/* Story Form */}
            <EnhancedStoryForm 
              song={selectedSong} 
              onComplete={handleStoryComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
}
