import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import StoryCard from "@/components/story-card";
import AdminLogin from "@/components/admin-login";
import { Link } from "wouter";
import { 
  Plus, 
  Heart, 
  MessageCircle, 
  Users, 
  Music, 
  TrendingUp,
  Calendar,
  Award,
  Shield,
  ShieldOff,
  RefreshCw
} from "lucide-react";
import type { 
  StoryWithDetails, 
  UserStats, 
  GenreStats, 
  DecadeStats, 
  AgeStats 
} from "@shared/schema";
import { apiRequest } from '@/lib/api';

// Mock user ID - in a real app, this would come from authentication
const CURRENT_USER_ID = 1;

// Admin user check - only these user IDs can see admin controls
const ADMIN_USER_IDS = [1]; // Add authorized admin user IDs here
const isAdminUser = ADMIN_USER_IDS.includes(CURRENT_USER_ID);

export default function Dashboard() {
  const [adminMode, setAdminMode] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

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

  const { data: myStories = [], isLoading: storiesLoading } = useQuery<StoryWithDetails[]>({
    queryKey: [`/api/stories?userId=${CURRENT_USER_ID}`],
  });

  const { data: publishedStories = [] } = useQuery<StoryWithDetails[]>({
    queryKey: [`/api/stories?userId=${CURRENT_USER_ID}&published=true`],
  });

  const { data: draftStories = [] } = useQuery<StoryWithDetails[]>({
    queryKey: [`/api/stories?userId=${CURRENT_USER_ID}&published=false`],
  });

  const refreshPreviewUrls = async () => {
    setIsRefreshing(true);
    setRefreshMessage(null);

    // Preview functionality has been removed
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Musical Journeys</h1>
            <p className="text-gray-600 mt-1">Discover patterns in your musical memories</p>
          </div>
          <Link href="/create-story">
            <Button className="spotify-green text-white hover:bg-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Story
            </Button>
          </Link>
          {isAdminUser && (
            <div className="flex gap-2">
            <Button
              onClick={refreshPreviewUrls}
              disabled={isRefreshing}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Apple Music Previews'}
            </Button>
            <Button
              onClick={async () => {
                setIsRefreshing(true);
                try {
                  const response = await fetch('/api/songs/find-previews', {
                    method: 'POST'
                  });
                  const result = await response.json();
                  console.log('Comprehensive search results:', result);
                  alert(`Found ${result.found} previews out of ${result.total} songs!`);
                  // Refresh the page to show updated previews
                  window.location.reload();
                } catch (error) {
                  console.error('Comprehensive search failed:', error);
                  alert('Failed to search for previews');
                } finally {
                  setIsRefreshing(false);
                }
              }}
              disabled={isRefreshing}
              variant="outline"
            >
              <Music className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Searching...' : 'Find All Previews'}
            </Button>
          </div>
          )}
        </div>
        {refreshMessage && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">{refreshMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Stories Shared</span>
                  <span className="text-2xl font-bold text-spotify-green">
                    {userStats?.storiesCount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Likes</span>
                  <span className="text-2xl font-bold text-coral">
                    {userStats?.totalLikes || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Followers</span>
                  <span className="text-2xl font-bold text-teal">
                    {userStats?.followers || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {analytics?.genres && analytics.genres.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Genres</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics.genres.slice(0, 4).map((genre, index) => (
                    <div key={genre.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'spotify-green' :
                          index === 1 ? 'coral' :
                          index === 2 ? 'teal' : 'sky'
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

            {analytics?.ages && analytics.ages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Memory Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {analytics.ages.slice(0, 4).map((age, index) => (
                    <div key={age.age} className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-gray-600 w-20">
                        Age {age.age}
                      </div>
                      <div className="flex-1 flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          index === 0 ? 'spotify-green' :
                          index === 1 ? 'coral' :
                          index === 2 ? 'teal' : 'bg-purple-400'
                        }`}></div>
                        <span className="text-gray-700 text-sm">{age.description}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {age.count} {age.count === 1 ? 'story' : 'stories'}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Admin Mode Indicator */}
        {adminMode && (
          <div className="fixed top-4 right-4 z-50">
            <Badge variant="destructive" className="bg-red-500 text-white">
              <Shield className="w-3 h-3 mr-1" />
              Admin Mode Active
            </Badge>
          </div>
        )}

        {/* Stories Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Stories</h2>
            {isAdminUser && (
              <div className="flex items-center space-x-2">
                {adminMode ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAdminMode(false)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <ShieldOff className="w-4 h-4 mr-2" />
                    Exit Admin Mode
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdminLogin(true)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                )}
              </div>
            )}
          </div>
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Stories ({myStories.length})</TabsTrigger>
              <TabsTrigger value="published">Published ({publishedStories.length})</TabsTrigger>
              <TabsTrigger value="drafts">Drafts ({draftStories.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
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
              ) : myStories.length === 0 ? (
                <div className="text-center py-12">
                  <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Stories Yet</h3>
                  <p className="text-gray-600 mb-6">Start sharing your musical memories!</p>
                  <Link href="/create">
                    <Button className="spotify-green text-white hover:bg-green-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Story
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {myStories.map((story) => (
                    <StoryCard key={story.id} story={story} showEditButton showAdminControls={adminMode} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="published" className="space-y-6">
              {publishedStories.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Published Stories</h3>
                  <p className="text-gray-600">Share your stories with the world!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {publishedStories.map((story) => (
                    <StoryCard key={story.id} story={story} showEditButton showAdminControls={adminMode} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="drafts" className="space-y-6">
              {draftStories.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Drafts</h3>
                  <p className="text-gray-600">All your stories are published!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {draftStories.map((story) => (
                    <StoryCard key={story.id} story={story} showEditButton showAdminControls={adminMode} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Admin Login Modal */}
        {showAdminLogin && (
          <AdminLogin
            onLogin={() => {
              setAdminMode(true);
              setShowAdminLogin(false);
            }}
            onCancel={() => setShowAdminLogin(false)}
          />
        )}
      </div>
    </div>
  );
}