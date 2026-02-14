import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import StoryCard from "@/components/story-card";
import { Link } from "wouter";
import { 
  Plus, 
  Music, 
  TrendingUp,
  Calendar
} from "lucide-react";
import type { 
  StoryWithDetails, 
  UserStats, 
  GenreStats, 
  DecadeStats, 
  AgeStats 
} from "@shared/schema";

// Mock user ID - in a real app, this would come from authentication
const CURRENT_USER_ID = 1;

export default function Discover() {
  const { data: userStats } = useQuery<UserStats>({
    queryKey: [`/api/users/${CURRENT_USER_ID}/stats`],
  });

  const { data: analytics } = useQuery<{
    genres: GenreStats[];
    decades: DecadeStats[];
    ages: AgeStats[];
  }>({
    queryKey: [`/api/users/${CURRENT_USER_ID}/analytics`],
  });

  const { data: allStories = [], isLoading: storiesLoading } = useQuery<StoryWithDetails[]>({
    queryKey: ["/api/stories?published=true"],
  });

  

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discover Musical Stories</h1>
            <p className="text-gray-600 mt-1">Explore patterns and stories from our community</p>
          </div>
          <Link href="/create-story">
            <Button className="spotify-green text-white hover:bg-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Story
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Community Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Stories</span>
                  <span className="text-2xl font-bold text-spotify-green">
                    {allStories.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Likes</span>
                  <span className="text-2xl font-bold text-coral">
                    {userStats?.totalLikes || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {analytics?.genres && analytics.genres.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Top Genres</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics.genres.slice(0, 4).map((genre, index) => (
                    <div key={genre.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-green-500' :
                          index === 1 ? 'bg-coral' :
                          index === 2 ? 'bg-teal' : 'bg-purple-400'
                        }`}></div>
                        <span className="text-gray-700">{genre.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{genre.percentage}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Charts and Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {analytics?.decades && analytics.decades.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Memories by Decade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics.decades.map((decade) => {
                    const maxCount = Math.max(...analytics.decades.map(d => d.count));
                    const percentage = (decade.count / maxCount) * 100;
                    
                    return (
                      <div key={decade.decade} className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-600 w-16">
                          {decade.decade}
                        </span>
                        <div className="flex-1">
                          <Progress value={percentage} className="h-3" />
                        </div>
                        <span className="text-sm text-gray-500 w-8">
                          {decade.count}
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}


          </div>
        </div>

        {/* Stories Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Stories ({allStories.length})</h2>
          
          <div className="space-y-6">
            {storiesLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : allStories.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Stories Yet</h3>
                <p className="text-gray-600 mb-6">Be the first to share a musical memory!</p>
                <Link href="/create-story">
                  <Button className="spotify-green text-white hover:bg-green-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Story
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {allStories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}