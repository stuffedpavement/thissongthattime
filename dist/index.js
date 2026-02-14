var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/spotify.ts
var spotify_exports = {};
__export(spotify_exports, {
  getSpotifyTrack: () => getSpotifyTrack,
  searchSpotifyTracks: () => searchSpotifyTracks
});
async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured");
  }
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`
    },
    body: "grant_type=client_credentials"
  });
  if (!response.ok) {
    throw new Error(`Spotify auth failed: ${response.statusText}`);
  }
  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1e3 - 6e4;
  return accessToken;
}
async function searchSpotifyTracks(query, limit = 10, offset = 0) {
  try {
    const token = await getSpotifyAccessToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&offset=${offset}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );
    if (!response.ok) {
      throw new Error(`Spotify search failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data.tracks.items.map((track) => ({
      title: track.name,
      artist: track.artists.map((artist) => artist.name).join(", "),
      album: track.album.name,
      year: new Date(track.album.release_date).getFullYear(),
      spotifyId: track.id,
      albumArt: track.album.images[0]?.url,
      previewUrl: track.preview_url,
      externalUrl: track.external_urls.spotify,
      genre: null,
      // Spotify doesn't provide genre in search results
      youtubeId: null
    }));
  } catch (error) {
    throw new Error(`Spotify search error: ${error.message}`);
  }
}
async function getSpotifyTrack(trackId) {
  try {
    const token = await getSpotifyAccessToken();
    const response = await fetch(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );
    if (!response.ok) {
      return null;
    }
    const track = await response.json();
    return {
      title: track.name,
      artist: track.artists.map((artist) => artist.name).join(", "),
      album: track.album.name,
      year: new Date(track.album.release_date).getFullYear(),
      spotifyId: track.id,
      albumArt: track.album.images[0]?.url,
      previewUrl: track.preview_url,
      externalUrl: track.external_urls.spotify,
      genre: null,
      youtubeId: null
    };
  } catch (error) {
    return null;
  }
}
var accessToken, tokenExpiry;
var init_spotify = __esm({
  "server/spotify.ts"() {
    "use strict";
    accessToken = null;
    tokenExpiry = 0;
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  comments: () => comments,
  follows: () => follows,
  insertCommentSchema: () => insertCommentSchema,
  insertFollowSchema: () => insertFollowSchema,
  insertLikeSchema: () => insertLikeSchema,
  insertSongSchema: () => insertSongSchema,
  insertStorySchema: () => insertStorySchema,
  insertUserSchema: () => insertUserSchema,
  likes: () => likes,
  songs: () => songs,
  stories: () => stories,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var songs = pgTable("songs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album"),
  year: integer("year"),
  genre: text("genre"),
  spotifyId: text("spotify_id"),
  appleMusicId: text("apple_music_id"),
  youtubeId: text("youtube_id"),
  albumArt: text("album_art"),
  previewUrl: text("preview_url"),
  externalUrl: text("external_url")
});
var stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  songId: integer("song_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorName: text("author_name").notNull(),
  // Core story fields
  age: text("age"),
  lifeContext: text("life_context"),
  discoveryMoment: text("discovery_moment"),
  coreMemory: text("core_memory"),
  emotionalConnection: text("emotional_connection"),
  tone: text("tone"),
  // Sensory & Setting
  theScene: text("the_scene"),
  soundtrackMoment: text("soundtrack_moment"),
  seasonalConnection: text("seasonal_connection"),
  // Relationships & People
  sharedExperience: text("shared_experience"),
  musicalIntroduction: text("musical_introduction"),
  generationalBridge: text("generational_bridge"),
  // Personal Growth & Change
  beforeAfter: text("before_after"),
  lifeTransition: text("life_transition"),
  comfortHealing: text("comfort_healing"),
  identityMarker: text("identity_marker"),
  // Musical Elements
  theHook: text("the_hook"),
  lyricalResonance: text("lyrical_resonance"),
  musicalDiscovery: text("musical_discovery"),
  // Broader Context
  culturalMoment: text("cultural_moment"),
  unexpectedConnection: text("unexpected_connection"),
  legacyImpact: text("legacy_impact"),
  sharingPassingOn: text("sharing_passing_on"),
  // Reflection Prompts
  messageToPastSelf: text("message_to_past_self"),
  songAsCompass: text("song_as_compass"),
  futureConnection: text("future_connection"),
  isPublished: boolean("is_published").default(false),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  storyId: integer("story_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  storyId: integer("story_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull(),
  followingId: integer("following_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertSongSchema = createInsertSchema(songs).omit({
  id: true
});
var insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  likesCount: true,
  commentsCount: true,
  sharesCount: true,
  createdAt: true,
  updatedAt: true
});
var insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  createdAt: true
});
var insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true
});
var insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 1e4,
  idleTimeoutMillis: 3e4,
  max: 10
});
var db = drizzle({ client: pool, schema: schema_exports });
async function initializeDatabase() {
  try {
    console.log("Testing database connection...");
    const client = await pool.connect();
    await client.query("SELECT NOW()");
    client.release();
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// server/storage.ts
import { eq, and, desc, sql, ilike, or } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, userData) {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  async getSong(id) {
    const [song] = await db.select().from(songs).where(eq(songs.id, id));
    return song || void 0;
  }
  async getSongBySpotifyId(spotifyId) {
    const [song] = await db.select().from(songs).where(eq(songs.spotifyId, spotifyId));
    return song || void 0;
  }
  async searchSongs(query) {
    const results = await db.select().from(songs).where(
      or(
        ilike(songs.title, `%${query}%`),
        ilike(songs.artist, `%${query}%`),
        ilike(songs.album, `%${query}%`)
      )
    );
    return results;
  }
  async createSong(insertSong) {
    const [song] = await db.insert(songs).values(insertSong).returning();
    return song;
  }
  async getStory(id) {
    const result = await db.select().from(stories).leftJoin(users, eq(stories.userId, users.id)).leftJoin(songs, eq(stories.songId, songs.id)).where(eq(stories.id, id));
    if (!result[0] || !result[0].users || !result[0].songs) return void 0;
    const comments2 = await this.getComments(id);
    return {
      ...result[0].stories,
      user: result[0].users,
      song: result[0].songs,
      comments: comments2
    };
  }
  async getStories(userId, published) {
    const conditions = [];
    if (userId !== void 0) {
      conditions.push(eq(stories.userId, userId));
    }
    if (published !== void 0) {
      conditions.push(eq(stories.isPublished, published));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
    const results = await db.select().from(stories).leftJoin(users, eq(stories.userId, users.id)).leftJoin(songs, eq(stories.songId, songs.id)).where(whereClause).orderBy(desc(stories.createdAt));
    const storiesWithDetails = [];
    for (const result of results) {
      if (result.users && result.songs) {
        const comments2 = await this.getComments(result.stories.id);
        storiesWithDetails.push({
          ...result.stories,
          user: result.users,
          song: result.songs,
          comments: comments2
        });
      }
    }
    return storiesWithDetails;
  }
  async createStory(insertStory) {
    const [story] = await db.insert(stories).values(insertStory).returning();
    return story;
  }
  async updateStory(id, storyData) {
    const [story] = await db.update(stories).set({ ...storyData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(stories.id, id)).returning();
    return story || void 0;
  }
  async deleteStory(id) {
    const result = await db.delete(stories).where(eq(stories.id, id)).returning();
    return result.length > 0;
  }
  async publishStory(id) {
    return this.updateStory(id, { isPublished: true });
  }
  async likeStory(userId, storyId) {
    const [like] = await db.insert(likes).values({ userId, storyId }).returning();
    await db.update(stories).set({ likesCount: sql`${stories.likesCount} + 1` }).where(eq(stories.id, storyId));
    return like;
  }
  async unlikeStory(userId, storyId) {
    const result = await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.storyId, storyId))).returning();
    if (result.length > 0) {
      await db.update(stories).set({ likesCount: sql`GREATEST(0, ${stories.likesCount} - 1)` }).where(eq(stories.id, storyId));
      return true;
    }
    return false;
  }
  async isStoryLiked(userId, storyId) {
    const [like] = await db.select().from(likes).where(and(eq(likes.userId, userId), eq(likes.storyId, storyId)));
    return !!like;
  }
  async addComment(insertComment) {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    await db.update(stories).set({ commentsCount: sql`${stories.commentsCount} + 1` }).where(eq(stories.id, insertComment.storyId));
    return comment;
  }
  async getComments(storyId) {
    const results = await db.select().from(comments).leftJoin(users, eq(comments.userId, users.id)).where(eq(comments.storyId, storyId)).orderBy(desc(comments.createdAt));
    const commentsWithUsers = [];
    for (const result of results) {
      if (result.users) {
        commentsWithUsers.push({
          ...result.comments,
          user: result.users
        });
      }
    }
    return commentsWithUsers;
  }
  async followUser(followerId, followingId) {
    const [follow] = await db.insert(follows).values({ followerId, followingId }).returning();
    return follow;
  }
  async unfollowUser(followerId, followingId) {
    const result = await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId))).returning();
    return result.length > 0;
  }
  async isUserFollowing(followerId, followingId) {
    const [follow] = await db.select().from(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    return !!follow;
  }
  async getUserStats(userId) {
    const [storiesCountResult] = await db.select({ count: sql`count(*)` }).from(stories).where(eq(stories.userId, userId));
    const [totalLikesResult] = await db.select({ total: sql`COALESCE(sum(${stories.likesCount}), 0)` }).from(stories).where(eq(stories.userId, userId));
    const [followersResult] = await db.select({ count: sql`count(*)` }).from(follows).where(eq(follows.followingId, userId));
    const [followingResult] = await db.select({ count: sql`count(*)` }).from(follows).where(eq(follows.followerId, userId));
    return {
      storiesCount: storiesCountResult?.count || 0,
      totalLikes: totalLikesResult?.total || 0,
      followers: followersResult?.count || 0,
      following: followingResult?.count || 0
    };
  }
  async getUserGenreStats(userId) {
    const results = await db.select({
      genre: songs.genre,
      count: sql`count(*)`
    }).from(stories).leftJoin(songs, eq(stories.songId, songs.id)).where(and(eq(stories.userId, userId), sql`${songs.genre} IS NOT NULL`)).groupBy(songs.genre).orderBy(desc(sql`count(*)`));
    const total = results.reduce((sum, r) => sum + r.count, 0);
    return results.map((r) => ({
      name: r.genre || "Unknown",
      count: r.count,
      percentage: total > 0 ? Math.round(r.count / total * 100) : 0
    }));
  }
  async getUserDecadeStats(userId) {
    const results = await db.select({
      decade: sql`FLOOR(${songs.year} / 10) * 10`,
      count: sql`count(*)`
    }).from(stories).leftJoin(songs, eq(stories.songId, songs.id)).where(and(eq(stories.userId, userId), sql`${songs.year} IS NOT NULL`)).groupBy(sql`FLOOR(${songs.year} / 10) * 10`).orderBy(desc(sql`count(*)`));
    return results.map((r) => ({
      decade: `${r.decade}s`,
      count: r.count
    }));
  }
  async getUserAgeStats(userId) {
    const results = await db.select({
      age: stories.age,
      count: sql`count(*)`
    }).from(stories).where(and(eq(stories.userId, userId), sql`${stories.age} IS NOT NULL`)).groupBy(stories.age).orderBy(desc(sql`count(*)`));
    return results.map((r) => ({
      age: r.age || "Unknown",
      count: r.count,
      description: this.getAgeDescription(r.age || "")
    }));
  }
  getAgeDescription(age) {
    const ageMap = {
      "childhood": "Early memories and formative experiences",
      "teenage": "Adolescent years and coming of age",
      "young-adult": "College years and early independence",
      "adult": "Career building and major life decisions",
      "middle-age": "Established life and family responsibilities",
      "senior": "Wisdom years and life reflection"
    };
    return ageMap[age] || "Life experiences and memories";
  }
};
var storage = new DatabaseStorage();

// server/openai.ts
import OpenAI from "openai";
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || ""
});
async function generateStory(prompts, tone, songTitle, artist) {
  if (!openai.apiKey) {
    throw new Error("OpenAI API key not configured");
  }
  const songInfo = songTitle && artist ? `"${songTitle}" by ${artist}` : "this song";
  const systemPrompt = `You are a personal memoir writer who helps people craft authentic stories from their memories. Write in a ${tone} tone and create a simple, honest narrative that stays true to the provided details. Keep it to 1-2 paragraphs and avoid adding details that weren't mentioned.`;
  const userPrompt = `Write a personal story about ${songInfo} using ONLY these provided details:
${prompts.age ? `- Age: ${prompts.age}` : ""}
${prompts.lifeContext ? `- Life context: ${prompts.lifeContext}` : ""}
${prompts.discoveryMoment ? `- Discovery moment: ${prompts.discoveryMoment}` : ""}
${prompts.coreMemory ? `- Core memory: ${prompts.coreMemory}` : ""}
${prompts.emotionalConnection ? `- Emotional connection: ${prompts.emotionalConnection}` : ""}
${prompts.theScene ? `- The scene: ${prompts.theScene}` : ""}
${prompts.soundtrackMoment ? `- Soundtrack moment: ${prompts.soundtrackMoment}` : ""}
${prompts.seasonalConnection ? `- Seasonal connection: ${prompts.seasonalConnection}` : ""}
${prompts.sharedExperience ? `- Shared experience: ${prompts.sharedExperience}` : ""}
${prompts.musicalIntroduction ? `- Musical introduction: ${prompts.musicalIntroduction}` : ""}
${prompts.generationalBridge ? `- Generational bridge: ${prompts.generationalBridge}` : ""}
${prompts.beforeAfter ? `- Before & after: ${prompts.beforeAfter}` : ""}
${prompts.lifeTransition ? `- Life transition: ${prompts.lifeTransition}` : ""}
${prompts.comfortHealing ? `- Comfort & healing: ${prompts.comfortHealing}` : ""}
${prompts.identityMarker ? `- Identity marker: ${prompts.identityMarker}` : ""}
${prompts.theHook ? `- The hook: ${prompts.theHook}` : ""}
${prompts.lyricalResonance ? `- Lyrical resonance: ${prompts.lyricalResonance}` : ""}
${prompts.musicalDiscovery ? `- Musical discovery: ${prompts.musicalDiscovery}` : ""}
${prompts.culturalMoment ? `- Cultural moment: ${prompts.culturalMoment}` : ""}
${prompts.unexpectedConnection ? `- Unexpected connection: ${prompts.unexpectedConnection}` : ""}
${prompts.legacyImpact ? `- Legacy impact: ${prompts.legacyImpact}` : ""}
${prompts.sharingPassingOn ? `- Sharing & passing on: ${prompts.sharingPassingOn}` : ""}
${prompts.messageToPastSelf ? `- Message to past self: ${prompts.messageToPastSelf}` : ""}
${prompts.songAsCompass ? `- Song as compass: ${prompts.songAsCompass}` : ""}
${prompts.futureConnection ? `- Future connection: ${prompts.futureConnection}` : ""}

Write a simple, authentic narrative in first person that weaves together only the details provided above. Do not add any details, characters, or events that weren't mentioned. Keep it concise and heartfelt.`;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1e3,
      temperature: 0.7
    });
    const generatedStory = response.choices[0].message.content;
    if (!generatedStory) {
      throw new Error("No story content generated");
    }
    return generatedStory;
  } catch (error) {
    throw new Error(`Story generation failed: ${error.message}`);
  }
}

// server/routes.ts
init_spotify();
async function registerRoutes(app2) {
  app2.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.patch("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = req.body;
      const updatedUser = await storage.updateUser(id, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/users/:id/stats", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const stats = await storage.getUserStats(id);
      res.json(stats);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/users/:id/analytics", async (req, res) => {
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
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/songs/search", async (req, res) => {
    try {
      const query = req.query.q;
      const offset = parseInt(req.query.offset) || 0;
      const limit = 10;
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      const spotifyTrackIdMatch = query.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
      const appleMusicIdMatch = query.match(/music\.apple\.com\/[a-z]{2}\/(?:album\/[^\/]+\/)?(?:song\/)?([0-9]+)(?:\?i=([0-9]+))?/);
      if (spotifyTrackIdMatch) {
        const trackId = spotifyTrackIdMatch[1];
        try {
          const existingSong = await storage.getSongBySpotifyId(trackId);
          if (existingSong) {
            return res.json([existingSong]);
          }
          const { getSpotifyTrack: getSpotifyTrack2 } = await Promise.resolve().then(() => (init_spotify(), spotify_exports));
          const spotifyTrack = await getSpotifyTrack2(trackId);
          if (spotifyTrack) {
            const savedSong = await storage.createSong(spotifyTrack);
            res.json([savedSong]);
          } else {
            res.json([]);
          }
        } catch (spotifyError) {
          res.json([]);
        }
      } else if (appleMusicIdMatch) {
        const trackId = appleMusicIdMatch[2] || appleMusicIdMatch[1];
        try {
          const response = await fetch(`https://itunes.apple.com/lookup?id=${trackId}&entity=song`);
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            const track = data.results[0];
            const songData = {
              title: track.trackName,
              artist: track.artistName,
              album: track.collectionName,
              year: track.releaseDate ? new Date(track.releaseDate).getFullYear() : null,
              genre: track.primaryGenreName,
              albumArt: track.artworkUrl100?.replace("100x100", "500x500") || null,
              spotifyId: null,
              appleMusicId: trackId
            };
            const savedSong = await storage.createSong(songData);
            res.json([savedSong]);
          } else {
            res.json([]);
          }
        } catch (appleMusicError) {
          res.json([]);
        }
      } else {
        const localSongs = await storage.searchSongs(query);
        try {
          const spotifyResults = await searchSpotifyTracks(query, 10, offset);
          const savedSongs = [];
          for (const track of spotifyResults) {
            let existingSong = await storage.getSongBySpotifyId(track.spotifyId);
            if (!existingSong) {
              existingSong = await storage.createSong(track);
            }
            savedSongs.push(existingSong);
          }
          res.json(savedSongs);
        } catch (spotifyError) {
          res.json([]);
        }
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/songs", async (req, res) => {
    try {
      const songData = insertSongSchema.parse(req.body);
      const song = await storage.createSong(songData);
      res.json(song);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/songs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const song = await storage.getSong(id);
      if (!song) {
        return res.status(404).json({ message: "Song not found" });
      }
      res.json(song);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/stories", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId) : void 0;
      const published = req.query.published === "true" ? true : req.query.published === "false" ? false : void 0;
      const stories2 = await storage.getStories(userId, published);
      res.json(stories2);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const story = await storage.getStory(id);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      res.json(story);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/stories", async (req, res) => {
    try {
      const storyData = insertStorySchema.parse(req.body);
      const story = await storage.createStory(storyData);
      res.json(story);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.put("/api/stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const story = await storage.updateStory(id, updates);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      res.json(story);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/stories/:id/publish", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const story = await storage.publishStory(id);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      res.json(story);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.delete("/api/stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteStory(id);
      if (!deleted) {
        return res.status(404).json({ message: "Story not found" });
      }
      res.json({ message: "Story deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/stories/generate", async (req, res) => {
    try {
      const { prompts, tone, songTitle, artist } = req.body;
      if (!prompts || !tone) {
        return res.status(400).json({ message: "Prompts and tone are required" });
      }
      const generatedStory = await generateStory(prompts, tone, songTitle, artist);
      res.json({ content: generatedStory });
    } catch (error) {
      res.status(500).json({ message: `Story generation failed: ${error.message}` });
    }
  });
  app2.post("/api/stories/:id/like", async (req, res) => {
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
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/stories/:id/comments", async (req, res) => {
    try {
      const storyId = parseInt(req.params.id);
      const commentData = insertCommentSchema.parse({
        ...req.body,
        storyId
      });
      const comment = await storage.addComment(commentData);
      res.json(comment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/stories/:id/comments", async (req, res) => {
    try {
      const storyId = parseInt(req.params.id);
      const comments2 = await storage.getComments(storyId);
      res.json(comments2);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/users/:id/follow", async (req, res) => {
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
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/feedback", async (req, res) => {
    try {
      const { type, subject, description, email, priority, device, browser } = req.body;
      if (!type || !subject || !description) {
        return res.status(400).json({ message: "Type, subject, and description are required" });
      }
      const emailContent = `
        <h2>New Feedback from Playback Stories</h2>
        
        <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        ${priority ? `<p><strong>Priority:</strong> ${priority.charAt(0).toUpperCase() + priority.slice(1)}</p>` : ""}
        
        <h3>Description:</h3>
        <p style="white-space: pre-wrap;">${description}</p>
        
        ${device || browser ? "<h3>Technical Details:</h3>" : ""}
        ${device ? `<p><strong>Device:</strong> ${device}</p>` : ""}
        ${browser ? `<p><strong>Browser:</strong> ${browser}</p>` : ""}
        
        ${email ? `<p><strong>User Email:</strong> ${email}</p>` : "<p><em>No email provided</em></p>"}
        
        <hr>
        <p><small>Sent from Playback Stories Feedback Form</small></p>
      `;
      const textContent = `
        New Feedback from Playback Stories
        
        Type: ${type.charAt(0).toUpperCase() + type.slice(1)}
        Subject: ${subject}
        ${priority ? `Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}` : ""}
        
        Description:
        ${description}
        
        ${device || browser ? "Technical Details:" : ""}
        ${device ? `Device: ${device}` : ""}
        ${browser ? `Browser: ${browser}` : ""}
        
        ${email ? `User Email: ${email}` : "No email provided"}
        
        ---
        Sent from Playback Stories Feedback Form
      `;
      if (process.env.SENDGRID_API_KEY) {
        const sgMail = __require("@sendgrid/mail");
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: "greghhh@me.com",
          from: "noreply@playbackstories.com",
          // This should be a verified sender
          subject: `[Playback Stories] ${type.charAt(0).toUpperCase() + type.slice(1)}: ${subject}`,
          text: textContent,
          html: emailContent,
          replyTo: email || void 0
        };
        await sgMail.send(msg);
      } else {
        console.log("=== NEW FEEDBACK ===");
        console.log(`Type: ${type}`);
        console.log(`Subject: ${subject}`);
        console.log(`Description: ${description}`);
        console.log(`Email: ${email || "Not provided"}`);
        console.log(`Priority: ${priority || "Not specified"}`);
        console.log(`Device: ${device || "Not specified"}`);
        console.log(`Browser: ${browser || "Not specified"}`);
        console.log("===================");
      }
      res.json({ message: "Feedback sent successfully" });
    } catch (error) {
      console.error("Failed to send feedback:", error);
      res.status(500).json({ message: "Failed to send feedback" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    log("Initializing database connection...");
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      log("Database initialization failed - starting server without database");
    }
    const server = await registerRoutes(app);
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error(`Error ${status}:`, message);
      res.status(status).json({ message });
    });
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    const port = 5e3;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true
    }, () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
