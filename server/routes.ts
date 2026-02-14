import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateStory } from "./openai";
import { 
  insertUserSchema, 
  insertStorySchema, 
  insertCommentSchema,
  insertSongSchema
} from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { songs, stories, users, likes, comments, follows } from "@shared/schema";
import { eq, desc, sql, like, or, and, ne } from "drizzle-orm";
import { searchAppleMusicTracks, getAppleMusicTrack, convertAppleMusicTrackToSong } from "./apple-music";
import { enhanceStory } from "./openai";


export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error: any) {
      console.error("Error getting user:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = req.body;

      const updatedUser = await storage.updateUser(id, userData);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error: any) {
      console.error("Error updating user:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/stats", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const stats = await storage.getUserStats(id);
      res.json(stats);
    } catch (error: any) {
      console.error("Error getting user stats:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/analytics", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const [genreStats, decadeStats, ageStats] = await Promise.all([
        storage.getUserGenreStats(id),
        storage.getUserDecadeStats(id),
        storage.getUserAgeStats(id)
      ]);

      res.json({
        genres: genreStats,
        decades: decadeStats,
        ages: ageStats
      });
    } catch (error: any) {
      console.error("Error getting user analytics:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Song routes
  app.get("/api/songs/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = 10;

      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }

      // Check if query is an Apple Music URL
      const appleMusicIdMatch = query.match(/music\.apple\.com\/[a-z]{2}\/(?:album\/[^\/]+\/)?(?:song\/)?([0-9]+)(?:\?i=([0-9]+))?/);

      if (appleMusicIdMatch) {
        // Extract Apple Music track ID and get specific song
        const trackId = appleMusicIdMatch[2] || appleMusicIdMatch[1];
        try {
          // Fetch from iTunes Search API
          const response = await fetch(`https://itunes.apple.com/lookup?id=${trackId}&entity=song`);
          const data = await response.json();

          if (data.results && data.results.length > 0) {
            const track = data.results[0];

            // Convert to our song format
            const songData = {
              title: track.trackName,
              artist: track.artistName,
              album: track.collectionName,
              year: track.releaseDate ? new Date(track.releaseDate).getFullYear() : null,
              genre: track.primaryGenreName,
              albumArt: track.artworkUrl100?.replace('100x100', '500x500') || null,
              spotifyId: null,
              appleMusicId: trackId,
            };

            // Save to database
            const savedSong = await storage.createSong(songData);
            res.json([savedSong]);
          } else {
            res.json([]);
          }
        } catch (appleMusicError) {
          console.error("Error getting Apple Music track:", appleMusicError);
          res.json([]);
        }
      } else {
        // Regular search flow
        // First search local songs
        const localSongs = await storage.searchSongs(query);

        // For pagination, always search Apple Music to get more results
        try {
          const appleMusicResults = await searchAppleMusicTracks(query, 10, offset);
          // Save Apple Music results to local storage and return saved songs with IDs
          const savedSongs = [];
          for (const track of appleMusicResults) {
            const songData = convertAppleMusicTrackToSong(track);
            let existingSong = await storage.getSongByAppleMusicId(track.trackId.toString());
            if (!existingSong) {
              existingSong = await storage.createSong(songData);
            }
            savedSongs.push(existingSong);
          }
          res.json(savedSongs);
        } catch (appleMusicError) {
          console.error("Error searching Apple Music:", appleMusicError);
          // If Apple Music fails, return empty array
          res.json([]);
        }
      }
    } catch (error: any) {
      console.error("Error searching songs:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/songs", async (req, res) => {
    try {
      const songData = insertSongSchema.parse(req.body);
      const song = await storage.createSong(songData);
      res.json(song);
    } catch (error: any) {
      console.error("Error creating song:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/songs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const song = await storage.getSong(id);

      if (!song) {
        return res.status(404).json({ message: "Song not found" });
      }

      res.json(song);
    } catch (error: any) {
      console.error("Error getting song:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Story routes
  app.get("/api/stories", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const published = req.query.published === 'true' ? true : 
                       req.query.published === 'false' ? false : undefined;

      const stories = await storage.getStories(userId, published);
      res.json(stories);
    } catch (error: any) {
      console.error("Error getting stories:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Get specific story
  app.get("/api/stories/:id", async (req, res) => {
    try {
      const story = await storage.getStory(parseInt(req.params.id));
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }
      res.json(story);
    } catch (error: any) {
      console.error("Error fetching story:", error);
      res.status(500).json({ error: "Failed to fetch story" });
    }
  });

  // Preview functionality has been removed

  app.post("/api/stories", async (req, res) => {
    try {
      const storyData = insertStorySchema.parse(req.body);
      const story = await storage.createStory(storyData);
      res.json(story);
    } catch (error: any) {
      console.error("Error creating story:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;

      const story = await storage.updateStory(id, updates);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }

      res.json(story);
    } catch (error: any) {
      console.error("Error updating story:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/stories/:id/publish", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const story = await storage.publishStory(id);

      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }

      res.json(story);
    } catch (error: any) {
      console.error("Error publishing story:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteStory(id);

      if (!deleted) {
        return res.status(404).json({ message: "Story not found" });
      }

      res.json({ message: "Story deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting story:", error);
      res.status(400).json({ message: error.message });
    }
  });



  // Generate AI story
  app.post("/api/stories/generate", async (req, res) => {
    try {
      const { prompts, tone, songTitle, artist } = req.body;

      if (!prompts || !tone) {
        return res.status(400).json({ message: "Prompts and tone are required" });
      }

      const generatedStory = await generateStory(prompts, tone, songTitle, artist);
      res.json({ content: generatedStory });
    } catch (error: any) {
      console.error("Error generating story:", error);
      res.status(500).json({ message: `Story generation failed: ${error.message}` });
    }
  });

  // Interaction routes
  app.post("/api/stories/:id/like", async (req, res) => {
    try {
      const storyId = parseInt(req.params.id);
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const isLiked = await storage.isStoryLiked(userId, storyId);

      if (isLiked) {
        await storage.unlikeStory(userId, storyId);
        res.json({ liked: false });
      } else {
        await storage.likeStory(userId, storyId);
        res.json({ liked: true });
      }
    } catch (error: any) {
      console.error("Error liking story:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Add comment to a story
  app.post("/api/stories/:id/comments", async (req, res) => {
    try {
      const storyId = parseInt(req.params.id);
      const { userId, content, commenterName } = req.body;

      if (!content?.trim()) {
        return res.status(400).json({ error: "Comment content is required" });
      }

      const [comment] = await db
        .insert(comments)
        .values({
          storyId,
          userId,
          content: content.trim(),
          commenterName: commenterName?.trim() || null,
        })
        .returning();

    // Get the comment with user info
    const commentWithUser = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        commenterName: comments.commenterName,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        }
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.id, comment.id))
      .limit(1);

    res.json(commentWithUser[0]);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Get comments for a story
app.get("/api/stories/:id/comments", async (req, res) => {
  try {
    const storyId = parseInt(req.params.id);

    const storyComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        commenterName: comments.commenterName,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        }
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.storyId, storyId))
      .orderBy(desc(comments.createdAt));

    res.json(storyComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

  // Follow routes
  app.post("/api/users/:id/follow", async (req, res) => {
    try {
      const followingId = parseInt(req.params.id);
      const { followerId } = req.body;

      if (!followerId) {
        return res.status(400).json({ message: "Follower ID is required" });
      }

      const isFollowing = await storage.isUserFollowing(followerId, followingId);

      if (isFollowing) {
        await storage.unfollowUser(followerId, followingId);
        res.json({ following: false });
      } else {
        await storage.followUser(followerId, followingId);
        res.json({ following: true });
      }
    } catch (error: any) {
      console.error("Error following user:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Test iTunes API endpoint
  app.get("/api/test-itunes", async (req, res) => {
    try {
      const query = req.query.q as string || "Billie Jean Michael Jackson";
      console.log(`Testing iTunes API with query: "${query}"`);
      
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=5&country=US`;
      console.log(`Fetching: ${url}`);
      
      const response = await fetch(url);
      console.log(`iTunes API responded with status: ${response.status}`);
      
      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `iTunes API error: ${response.status}`,
          url 
        });
      }
      
      const data = await response.json();
      console.log(`iTunes returned ${data.resultCount} results`);
      
      // Log preview URL availability
      const withPreviews = data.results?.filter((r: any) => r.previewUrl) || [];
      console.log(`${withPreviews.length} out of ${data.results?.length || 0} results have preview URLs`);
      
      res.json({
        query,
        url,
        resultCount: data.resultCount,
        resultsWithPreviews: withPreviews.length,
        results: data.results?.map((r: any) => ({
          trackName: r.trackName,
          artistName: r.artistName,
          hasPreview: !!r.previewUrl,
          previewUrl: r.previewUrl
        })) || []
      });
    } catch (error: any) {
      console.error("iTunes API test failed:", error);
      res.status(500).json({ 
        error: "iTunes API test failed", 
        message: error.message 
      });
    }
  });

  // Feedback route
  app.post("/api/feedback", async (req, res) => {
    try {
      const { type, subject, description, email, priority, device, browser } = req.body;

      // Validate required fields
      if (!type || !subject || !description) {
        return res.status(400).json({ message: "Type, subject, and description are required" });
      }

      // Format email content
      const emailContent = `
        <h2>New Feedback from ThisSongThatTime</h2>

        <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        ${priority ? `<p><strong>Priority:</strong> ${priority.charAt(0).toUpperCase() + priority.slice(1)}</p>` : ''}

        <h3>Description:</h3>
        <p style="white-space: pre-wrap;">${description}</p>

        ${device || browser ? '<h3>Technical Details:</h3>' : ''}
        ${device ? `<p><strong>Device:</strong> ${device}</p>` : ''}
        ${browser ? `<p><strong>Browser:</strong> ${browser}</p>` : ''}

        ${email ? `<p><strong>User Email:</strong> ${email}</p>` : '<p><em>No email provided</em></p>'}

        <hr>
        <p><small>Sent from ThisSongThatTime Feedback Form</small></p>
      `;

      const textContent = `
        New Feedback from ThisSongThatTime

        Type: ${type.charAt(0).toUpperCase() + type.slice(1)}
        Subject: ${subject}
        ${priority ? `Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}` : ''}

        Description:
        ${description}

        ${device || browser ? 'Technical Details:' : ''}
        ${device ? `Device: ${device}` : ''}
        ${browser ? `Browser: ${browser}` : ''}

        ${email ? `User Email: ${email}` : 'No email provided'}

        ---
        Sent from ThisSongThatTime Feedback Form
      `;

      // Check if SendGrid is available
      if (process.env.SENDGRID_API_KEY) {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const msg = {
          to: 'greghhh@me.com',
          from: 'noreply@moodloop.com', // This should be a verified sender
          subject: `[ThisSongThatTime] ${type.charAt(0).toUpperCase() + type.slice(1)}: ${subject}`,
          text: textContent,
          html: emailContent,
          replyTo: email || undefined,
        };

        await sgMail.send(msg);
      } else {
        // Log feedback to console if SendGrid is not configured
        console.log('=== NEW FEEDBACK ===');
        console.log(`Type: ${type}`);
        console.log(`Subject: ${subject}`);
        console.log(`Description: ${description}`);
        console.log(`Email: ${email || 'Not provided'}`);
        console.log(`Priority: ${priority || 'Not specified'}`);
        console.log(`Device: ${device || 'Not specified'}`);
        console.log(`Browser: ${browser || 'Not specified'}`);
        console.log('===================');
      }

      res.json({ message: "Feedback sent successfully" });
    } catch (error) {
      console.error("Failed to send feedback:", error);
      res.status(500).json({ message: "Failed to send feedback" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}