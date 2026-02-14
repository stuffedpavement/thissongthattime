import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Music } from "lucide-react";
import StoryForm from "@/components/story-form";
import type { StoryWithDetails } from "@shared/schema";

export default function EditStory() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/edit-story/:id");
  const storyId = params?.id;

  const { data: story, isLoading, error } = useQuery<StoryWithDetails>({
    queryKey: [`/api/stories/${storyId}`],
    enabled: !!storyId,
  });

  if (!match || !storyId) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Story Not Found</h1>
            <Button onClick={() => setLocation('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
            <p className="text-gray-600">Loading story...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Story</h1>
            <p className="text-gray-600 mb-6">Could not load the story for editing.</p>
            <Button onClick={() => setLocation('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleEditComplete = () => {
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/discover')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Discover
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Story</h1>
              <p className="text-gray-600 mt-1">Update your musical memory</p>
            </div>
          </div>
        </div>

        {/* Current Song Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Music className="w-5 h-5" />
              <span>Editing Story About</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              {story.song.albumArt && (
                <img
                  src={story.song.albumArt}
                  alt={`${story.song.album} cover`}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{story.song.title}</h3>
                <p className="text-gray-600">{story.song.artist}</p>
                <p className="text-sm text-gray-500">{story.song.album}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Edit Form */}
        <StoryForm
          song={story.song}
          existingStory={story}
          onComplete={handleEditComplete}
        />
      </div>
    </div>
  );
}