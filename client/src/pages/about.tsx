import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Heart, Users, Sparkles } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center items-center space-x-3">
          <Music className="w-8 h-8 text-spotify-green" />
          <h1 className="text-4xl font-bold gradient-text">About ThisSongThatTime</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Where music meets memory, and every song tells a story
        </p>
      </div>

      {/* Two Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-spotify-green">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Some songs are time machines</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 leading-relaxed">
            <p className="mb-4"></p>
            <p className="mb-4">
              This Song That Time is for capturing those moments when a song transports you, back to who you were, where you were, who you were with, what mattered then.
            </p>
            <p className="mb-4">
              Not just "I love this song" (and maybe for some songs, you don't!) but the real story about what it meant then and what it means now.
            </p>
            <p>
              Maybe you want to revisit and jog deeper memories that get buried under newer playlists, share the story with the people who were there, or explain to someone who wasn't just how it felt.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-red-500" />
              <span>Why I Made This</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 leading-relaxed">
            <p className="mb-4">
              Like a lot of people, music has always been woven into my memories. Certain songs hit and suddenly I'm somewhere else entirely.
            </p>
            <p className="mb-4">
              I've always loved formats like Desert Island Discs and Song Exploder — not just the music, but the stories behind it. The quiet, personal context that turns a track into a time capsule.
            </p>
            <p className="mb-4">
              I also have a long-running interest in web tools and AI, experimenting with what's possible. When I heard about something called Vibe coding, I wanted to try it out. Casting about for a exploratory project, could I combine music & memory with storytelling & software?
            </p>
            <p className="mb-4">
              This Song That Time is the result.
            </p>
            <p>
              I built it using Replit for development, Spotify and Apple APIs for music integration, and OpenAI to help prompt those deeper memories, and a few other LLMs for some text support. But importantly, it's still evolving and to the extent it's improving, it's because there's been a lot of feedback from family and friends. Turns out AI can't do everything! But it's live and hopefully meaningful for anyone who's ever said, "aww, this song takes me back…"
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Story Enhancement</h3>
              <p className="text-gray-600 text-sm">
                AI on call to optionally weave together your inputs into an editable story.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Music Integration</h3>
              <p className="text-gray-600 text-sm">
                Spotify integrations brings your story to life with images and song data.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Community Discovery</h3>
              <p className="text-gray-600 text-sm">
                Find stories about your favorite songs and discover new music through others' memories.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Aide-mémoire</h3>
              <p className="text-gray-600 text-sm">
                A series of optional prompts to help enliven your music memories.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Footer */}
      <div className="text-center py-8 border-t border-gray-200">
        <p className="text-gray-600">
          Ready to share your musical story?{" "}
          <a href="/create" className="text-spotify-green font-medium hover:underline">
            Start creating
          </a>
        </p>
      </div>
    </div>
  );
}