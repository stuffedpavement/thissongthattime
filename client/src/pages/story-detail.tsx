import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/api";
import SpotifyPreviewPlayer from "@/components/spotify-preview-player";
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  User,
  Calendar,
  MapPin,
  Users
} from "lucide-react";
import MusicPreviewPlayer from "@/components/spotify-preview-player";
import ShareButton from "@/components/share-button";
import FormattedContent from "@/components/formatted-content";
import type { StoryWithDetails, Comment, User as UserType } from "@shared/schema";

// Mock user ID - in a real app, this would come from authentication
const CURRENT_USER_ID = 1;

export default function StoryDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [commenterName, setCommenterName] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  const storyId = parseInt(params.id || "0");

  const { data: story, isLoading } = useQuery<StoryWithDetails>({
    queryKey: [`/api/stories/${storyId}`],
    enabled: !!storyId,
  });

  const { data: comments = [] } = useQuery<(Comment & { user: UserType })[]>({
    queryKey: [`/api/stories/${storyId}/comments`],
    enabled: !!storyId,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/stories/${storyId}/like`, { userId: CURRENT_USER_ID });
      return response.json();
    },
    onSuccess: (data) => {
      setIsLiked(data.liked);
      queryClient.invalidateQueries({ queryKey: [`/api/stories/${storyId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      toast({
        title: data.liked ? "Story liked!" : "Like removed",
        description: data.liked ? "Added to your favorites" : "Removed from favorites",
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

  const commentMutation = useMutation({
    mutationFn: async (data: { content: string; commenterName?: string }) => {
      const response = await apiRequest("POST", `/api/stories/${storyId}/comments`, {
        userId: CURRENT_USER_ID,
        content: data.content,
        commenterName: data.commenterName,
      });
      return response.json();
    },
    onSuccess: () => {
      setNewComment("");
      setCommenterName("");
      queryClient.invalidateQueries({ queryKey: [`/api/stories/${storyId}/comments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/stories/${storyId}`] });
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
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

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleComment = () => {
    if (newComment.trim()) {
      commentMutation.mutate({
        content: newComment.trim(),
        commenterName: commenterName.trim() || undefined
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Story Not Found</h2>
            <p className="text-gray-600 mb-6">The story you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Story Content */}
        <div className="space-y-8">
          {/* Song Info */}
          <Card>
            <CardContent className="p-0">
              <div className="gradient-spotify text-white p-8 rounded-t-lg">
                <div className="flex items-center space-x-6">
                  {story.song.albumArt && (
                    <img
                      src={story.song.albumArt}
                      alt={`${story.song.title} album cover`}
                      className="w-24 h-24 rounded-lg shadow-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-2">{story.song.title}</h1>
                    <p className="text-xl opacity-90 mb-1">{story.song.artist}</p>
                    {story.song.album && story.song.year && (
                      <p className="opacity-75">
                        {story.song.album} • {story.song.year}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Story Details */}
          <Card>
            <CardContent className="p-8">
              {/* Author Info */}
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="gradient-coral text-white">
                    {story.authorName?.charAt(0).toUpperCase() || story.user?.displayName?.charAt(0) || story.user?.username?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{story.authorName || story.user?.displayName || story.user?.username || "Anonymous"}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(story.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                {!story.isPublished && (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </div>

              {/* Story Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">
                {story.title}
              </h2>

              {/* Story Metadata */}
              {(story.age || story.theScene || story.lifeContext) && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {story.age && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Age: {story.age}</span>
                      </div>
                    )}
                    {story.theScene && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Scene: {story.theScene}</span>
                      </div>
                    )}
                    {story.lifeContext && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Context: {story.lifeContext}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Story Content */}
              <div className="prose prose-lg max-w-none mb-8">
                <FormattedContent 
                  content={story.content}
                  className="text-gray-700 leading-relaxed font-serif"
                />
                {story.isAiGenerated && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 italic">Polished with AI</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t">
                <div className="flex items-center space-x-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    disabled={likeMutation.isPending}
                    className={`flex items-center space-x-2 ${
                      isLiked ? 'text-coral' : 'text-gray-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{story.likesCount || 0}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 text-gray-500"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{comments.length}</span>
                  </Button>

                  <ShareButton 
                    story={story} 
                    variant="ghost" 
                    size="sm" 
                    showLabel={true} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Comments ({comments.length})
              </h3>

              {/* Add Comment */}
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <Input
                      placeholder="Your name (optional)"
                      value={commenterName}
                      onChange={(e) => setCommenterName(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Textarea
                      placeholder="Share your thoughts about this story..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleComment}
                    disabled={!newComment.trim() || commentMutation.isPending}
                    className="spotify-green text-white hover:bg-green-600"
                  >
                    {commentMutation.isPending ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>

              <Separator className="mb-8" />

              {/* Comments List */}
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No comments yet. Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="gradient-purple text-white">
                          {(comment.commenterName || comment.user?.displayName || comment.user?.username || "Guest").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-gray-900">
                            {comment.commenterName || comment.user?.displayName || comment.user?.username || "Guest"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}