import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { InferSelectModel } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const songs = pgTable("songs", {
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
  externalUrl: text("external_url"),
});

export const stories = pgTable("stories", {
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
  isAiGenerated: boolean("is_ai_generated").default(false),
  isPublished: boolean("is_published").default(false),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  storyId: integer("story_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  commenterName: text("commenter_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull(),
  followingId: integer("following_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSongSchema = createInsertSchema(songs).omit({
  id: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  likesCount: true,
  commentsCount: true,
  sharesCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Song = typeof songs.$inferSelect;
export type InsertSong = z.infer<typeof insertSongSchema>;

export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;

export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;

export type Comment = InferSelectModel<typeof comments>;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;

// Extended types for API responses
export type StoryWithDetails = Story & {
  user: User;
  song: Song;
  isLiked?: boolean;
  comments?: (Comment & { user: User })[];
};

export type UserStats = {
  storiesCount: number;
  totalLikes: number;
  followers: number;
  following: number;
};

export type GenreStats = {
  name: string;
  count: number;
  percentage: number;
};

export type DecadeStats = {
  decade: string;
  count: number;
};

export type AgeStats = {
  age: string;
  count: number;
  description: string;
};