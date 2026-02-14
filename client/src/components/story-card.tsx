import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/api";
import { Link, useLocation } from "wouter";
import { 
  Heart, 
  MessageCircle, 
  Music, 
  Edit,
  Calendar,
  Trash2
} from "lucide-react";
import MusicPreviewPlayer from "@/components/spotify-preview-player";
import ShareButton from "@/components/share-button";
import FormattedContent from "@/components/formatted-content";
import type { StoryWithDetails } from "@shared/schema";

interface StoryCardProps {
  story: StoryWithDetails;
  showEditButton?: boolean;
  showAdminControls?: boolean;
}

// Mock user ID - in a real app, this would come from authentication
const CURRENT_USER_ID = 1;

export default function StoryCard({ story, showEditButton = false, showAdminControls = false }: StoryCardProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const likeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/stories/${story.id}/like`, { userId: CURRENT_USER_ID });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories?published=true"] });
      queryClient.invalidateQueries({ queryKey: [`/api/stories/${story.id}`] });
      toast({
        title: "Story liked!",
        description: "Added to your favorites",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/stories/${story.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories?published=true"] });
      queryClient.invalidateQueries({ queryKey: [`/api/stories?userId=${CURRENT_USER_ID}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${CURRENT_USER_ID}/stats`] });
      toast({
        title: "Story deleted",
        description: "The story has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    likeMutation.mutate();
  };



  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm(`Are you sure you want to delete "${story.title}"? This action cannot be undone.`)) {
      deleteMutation.mutate();
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Link href={`/story/${story.id}`}>
      <Card className="overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 cursor-pointer group">
        {/* Header Image */}
        <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300">
          {story.song.albumArt ? (
            <img
              src={story.song.albumArt}
              alt={`${story.song.title} album cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-spotify-green to-teal">
              <Music className="w-16 h-16 text-white opacity-50" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

          {/* Song Info */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center space-x-3">
              {story.song.albumArt && (
                <img
                  src={story.song.albumArt}
                  alt={`${story.song.title} album cover`}
                  className="w-12 h-12 rounded-lg shadow-lg"
                />
              )}
              <div className="text-white flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{story.song.title}</h3>
                <p className="text-sm opacity-90 truncate">{story.song.artist}</p>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Author Info */}
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="gradient-coral text-white">
                {story.authorName?.charAt(0).toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {story.authorName}
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(new Date(story.createdAt))}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {!story.isPublished && (
                <Badge variant="secondary">Draft</Badge>
              )}
              {showEditButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setLocation(`/edit-story/${story.id}`);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Story Preview */}
          <h4 className="text-xl font-bold text-gray-900 mb-3 font-serif line-clamp-2">
            {story.title}
          </h4>

          <div className="text-gray-600 leading-relaxed mb-4 font-serif line-clamp-3">
            <FormattedContent 
              content={story.content.slice(0, 150) + (story.content.length > 150 ? "..." : "")}
              className="text-gray-600"
            />
          </div>

          {/* Story Metadata */}
          <div className="flex flex-wrap gap-2 mb-4">
            {story.age && (
              <Badge variant="outline" className="text-xs">
                Age {story.age}
              </Badge>
            )}
            {story.isAiGenerated && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">
                Polished with AI
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <button
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className="flex items-center space-x-1 hover:text-coral transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>{story.likesCount || 0}</span>
              </button>

              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>{story.commentsCount || 0}</span>
              </div>

              <ShareButton 
                story={story} 
                variant="ghost" 
                size="sm" 
                showLabel={false} 
              />
            </div>

            <div className="flex items-center space-x-2">
              {showAdminControls && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-spotify-green hover:text-green-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Read More
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}