import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StoryCard from "@/components/story-card";
import { Link } from "wouter";
import { Music, Search, Play, TrendingUp, Users, Heart, Disc3, MessageCircleHeart } from "lucide-react";
import type { StoryWithDetails, UserStats } from "@shared/schema";

export default function Home() {
  const { data: stories = [], isLoading: storiesLoading } = useQuery<StoryWithDetails[]>({
    queryKey: ["/api/stories?published=true"],
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-spotify text-white py-20 relative overflow-hidden">
        {/* Floating Musical Notes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="floating-note note-1" style={{color: 'rgba(255,255,255,0.7)'}}>♪</div>
          <div className="floating-note note-2" style={{color: 'rgba(255,255,255,0.5)'}}>♫</div>
          <div className="floating-note note-3" style={{color: 'rgba(255,255,255,0.6)'}}>♪</div>
          <div className="floating-note note-4" style={{color: 'rgba(255,255,255,0.4)'}}>♬</div>
          <div className="floating-note note-5" style={{color: 'rgba(255,255,255,0.8)'}}>♪</div>
          <div className="floating-note note-6" style={{color: 'rgba(255,255,255,0.3)'}}>♫</div>
          <div className="floating-note note-7" style={{color: 'rgba(255,255,255,0.6)'}}>♪</div>
          <div className="floating-note note-8" style={{color: 'rgba(255,255,255,0.5)'}}>♬</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              This Song. <span className="text-yellow-300">That Time</span>.
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
              Share the memories, moments and emotions behind your favourite songs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/create-story">
                <Button size="lg" className="bg-white text-spotify-green hover:bg-gray-100 font-semibold text-lg px-8 py-4 rounded-full shadow-lg">
                  Create Your Story
                </Button>
              </Link>
              <Link href="/discover">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-spotify-green font-semibold text-lg px-8 py-4 rounded-full bg-opacity-10 bg-white"
                >
                  Explore Stories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-2xl text-gray-600 font-light">Turn your musical memories into lasting stories</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
                  <Disc3 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Choose Your Song</h3>
              <p className="text-gray-600 leading-relaxed">Search for any song, or paste in a link from Spotify or Apple Music. Pick the track that holds special meaning for you</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
                  <MessageCircleHeart className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Describe Your Memory</h3>
              <p className="text-gray-600 leading-relaxed">Tell us about the moment - where you were, who you were with, and what the song has meant to you</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Connect & Discover</h3>
              <p className="text-gray-600 leading-relaxed">Publish your story, share your memory with friends and read how a song has touched others</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <section id="stories" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Stories</h2>
            <p className="text-gray-600 text-lg">Discover the stories behind the music</p>
          </div>

          {storiesLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
          ) : stories.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Stories Yet</h3>
              <p className="text-gray-600 mb-6">Be the first to share your musical memory!</p>
              <Link href="/create-story">
                <Button className="spotify-green text-white hover:bg-green-600">
                  Create First Story
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {stories.slice(0, 6).map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}

          {stories.length > 6 && (
            <div className="text-center mt-12">
              <Link href="/discover">
                <Button variant="outline" size="lg">
                  View All Stories
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Share Your Musical Story?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our community of music lovers and storytellers
          </p>
          <Link href="/create-story">
            <Button size="lg" className="spotify-green text-white hover:bg-green-600 px-8 py-4 text-lg rounded-full">
              <Music className="w-5 h-5 mr-2" />
              Create Your Story
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
