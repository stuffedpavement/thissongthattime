import { 
  users, songs, stories, likes, comments, follows,
  type User, type InsertUser,
  type Song, type InsertSong,
  type Story, type InsertStory,
  type Like, type InsertLike,
  type Comment, type InsertComment,
  type Follow, type InsertFollow,
  type StoryWithDetails,
  type UserStats,
  type GenreStats,
  type DecadeStats,
  type AgeStats
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, ilike, or } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Songs
  getSong(id: number): Promise<Song | undefined>;
  getSongBySpotifyId(spotifyId: string): Promise<Song | undefined>;
  searchSongs(query: string): Promise<Song[]>;
  createSong(song: InsertSong): Promise<Song>;
  updateSong(id: number, updates: Partial<InsertSong>): Promise<Song | undefined>;
  getAllSongs(): Promise<Song[]>;

  // Stories
  getStory(id: number): Promise<StoryWithDetails | undefined>;
  getStories(userId?: number, published?: boolean): Promise<StoryWithDetails[]>;
  createStory(story: InsertStory): Promise<Story>;
  updateStory(id: number, story: Partial<InsertStory>): Promise<Story | undefined>;
  deleteStory(id: number): Promise<boolean>;
  publishStory(id: number): Promise<Story | undefined>;

  // Interactions
  likeStory(userId: number, storyId: number): Promise<Like>;
  unlikeStory(userId: number, storyId: number): Promise<boolean>;
  isStoryLiked(userId: number, storyId: number): Promise<boolean>;

  addComment(comment: InsertComment): Promise<Comment>;
  getComments(storyId: number): Promise<(Comment & { user: User })[]>;

  followUser(followerId: number, followingId: number): Promise<Follow>;
  unfollowUser(followerId: number, followingId: number): Promise<boolean>;
  isUserFollowing(followerId: number, followingId: number): Promise<boolean>;

  // Analytics
  getUserStats(userId: number): Promise<UserStats>;
  getUserGenreStats(userId: number): Promise<GenreStats[]>;
  getUserDecadeStats(userId: number): Promise<DecadeStats[]>;
  getUserAgeStats(userId: number): Promise<AgeStats[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getSong(id: number): Promise<Song | undefined> {
    const [song] = await db.select().from(songs).where(eq(songs.id, id));
    return song || undefined;
  }

  async getSongBySpotifyId(spotifyId: string): Promise<Song | undefined> {
    const [song] = await db.select().from(songs).where(eq(songs.spotifyId, spotifyId));
    return song || undefined;
  }

  async getSongByAppleMusicId(appleMusicId: string): Promise<Song | undefined> {
    const [song] = await db.select().from(songs).where(eq(songs.appleMusicId, appleMusicId));
    return song || undefined;
  }

  async searchSongs(query: string): Promise<Song[]> {
    const results = await db.select().from(songs).where(
      or(
        ilike(songs.title, `%${query}%`),
        ilike(songs.artist, `%${query}%`),
        ilike(songs.album, `%${query}%`)
      )
    );
    return results;
  }

  async createSong(insertSong: InsertSong): Promise<Song> {
    const [song] = await db
      .insert(songs)
      .values(insertSong)
      .returning();
    return song;
  }

  async updateSong(id: number, updates: Partial<InsertSong>): Promise<Song | undefined> {
    const [updatedSong] = await db
      .update(songs)
      .set(updates)
      .where(eq(songs.id, id))
      .returning();
    return updatedSong || undefined;
  }

  async getAllSongs(): Promise<Song[]> {
    return await db.select().from(songs);
  }

  async getStory(id: number): Promise<StoryWithDetails | undefined> {
    const result = await db
      .select()
      .from(stories)
      .leftJoin(users, eq(stories.userId, users.id))
      .leftJoin(songs, eq(stories.songId, songs.id))
      .where(eq(stories.id, id));

    if (!result[0] || !result[0].users || !result[0].songs) return undefined;

    const comments = await this.getComments(id);

    return {
      ...result[0].stories,
      user: result[0].users,
      song: result[0].songs,
      comments
    };
  }

  async getStories(userId?: number, published?: boolean): Promise<StoryWithDetails[]> {
    const conditions = [];
    if (userId !== undefined) {
      conditions.push(eq(stories.userId, userId));
    }
    if (published !== undefined) {
      conditions.push(eq(stories.isPublished, published));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select()
      .from(stories)
      .leftJoin(users, eq(stories.userId, users.id))
      .leftJoin(songs, eq(stories.songId, songs.id))
      .where(whereClause)
      .orderBy(desc(stories.createdAt));

    const storiesWithDetails: StoryWithDetails[] = [];
    for (const result of results) {
      if (result.users && result.songs) {
        const comments = await this.getComments(result.stories.id);
        storiesWithDetails.push({
          ...result.stories,
          user: result.users,
          song: result.songs,
          comments
        });
      }
    }

    return storiesWithDetails;
  }

  async createStory(insertStory: InsertStory): Promise<Story> {
    const [story] = await db
      .insert(stories)
      .values(insertStory)
      .returning();
    return story;
  }

  async updateStory(id: number, storyData: Partial<InsertStory>): Promise<Story | undefined> {
    const [story] = await db
      .update(stories)
      .set({ ...storyData, updatedAt: new Date() })
      .where(eq(stories.id, id))
      .returning();
    return story || undefined;
  }

  async deleteStory(id: number): Promise<boolean> {
    const result = await db
      .delete(stories)
      .where(eq(stories.id, id))
      .returning();
    return result.length > 0;
  }

  async publishStory(id: number): Promise<Story | undefined> {
    return this.updateStory(id, { isPublished: true });
  }

  async likeStory(userId: number, storyId: number): Promise<Like> {
    const [like] = await db
      .insert(likes)
      .values({ userId, storyId })
      .returning();

    // Update story likes count
    await db
      .update(stories)
      .set({ likesCount: sql`${stories.likesCount} + 1` })
      .where(eq(stories.id, storyId));

    return like;
  }

  async unlikeStory(userId: number, storyId: number): Promise<boolean> {
    const result = await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.storyId, storyId)))
      .returning();

    if (result.length > 0) {
      // Update story likes count
      await db
        .update(stories)
        .set({ likesCount: sql`GREATEST(0, ${stories.likesCount} - 1)` })
        .where(eq(stories.id, storyId));
      return true;
    }

    return false;
  }

  async isStoryLiked(userId: number, storyId: number): Promise<boolean> {
    const [like] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.storyId, storyId)));
    return !!like;
  }

  async addComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();

    // Update story comments count
    await db
      .update(stories)
      .set({ commentsCount: sql`${stories.commentsCount} + 1` })
      .where(eq(stories.id, insertComment.storyId));

    return comment;
  }

  async getComments(storyId: number): Promise<(Comment & { user: User })[]> {
    const results = await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.storyId, storyId))
      .orderBy(desc(comments.createdAt));

    const commentsWithUsers: (Comment & { user: User })[] = [];
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

  async followUser(followerId: number, followingId: number): Promise<Follow> {
    const [follow] = await db
      .insert(follows)
      .values({ followerId, followingId })
      .returning();
    return follow;
  }

  async unfollowUser(followerId: number, followingId: number): Promise<boolean> {
    const result = await db
      .delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
      .returning();
    return result.length > 0;
  }

  async isUserFollowing(followerId: number, followingId: number): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    return !!follow;
  }

  async getUserStats(userId: number): Promise<UserStats> {
    const [storiesCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(stories)
      .where(eq(stories.userId, userId));

    const [totalLikesResult] = await db
      .select({ total: sql<number>`COALESCE(sum(${stories.likesCount}), 0)` })
      .from(stories)
      .where(eq(stories.userId, userId));

    const [followersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followingId, userId));

    const [followingResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followerId, userId));

    return {
      storiesCount: storiesCountResult?.count || 0,
      totalLikes: totalLikesResult?.total || 0,
      followers: followersResult?.count || 0,
      following: followingResult?.count || 0,
    };
  }

  async getUserGenreStats(userId: number): Promise<GenreStats[]> {
    const results = await db
      .select({
        genre: songs.genre,
        count: sql<number>`count(*)`
      })
      .from(stories)
      .leftJoin(songs, eq(stories.songId, songs.id))
      .where(and(eq(stories.userId, userId), sql`${songs.genre} IS NOT NULL`))
      .groupBy(songs.genre)
      .orderBy(desc(sql`count(*)`));

    const total = results.reduce((sum, r) => sum + r.count, 0);

    return results.map(r => ({
      name: r.genre || 'Unknown',
      count: r.count,
      percentage: total > 0 ? Math.round((r.count / total) * 100) : 0
    }));
  }

  async getUserDecadeStats(userId: number): Promise<DecadeStats[]> {
    const results = await db
      .select({
        decade: sql<string>`FLOOR(${songs.year} / 10) * 10`,
        count: sql<number>`count(*)`
      })
      .from(stories)
      .leftJoin(songs, eq(stories.songId, songs.id))
      .where(and(eq(stories.userId, userId), sql`${songs.year} IS NOT NULL`))
      .groupBy(sql`FLOOR(${songs.year} / 10) * 10`)
      .orderBy(desc(sql`count(*)`));

    return results.map(r => ({
      decade: `${r.decade}s`,
      count: r.count
    }));
  }

  async getUserAgeStats(userId: number): Promise<AgeStats[]> {
    const results = await db
      .select({
        age: stories.age,
        count: sql<number>`count(*)`
      })
      .from(stories)
      .where(and(eq(stories.userId, userId), sql`${stories.age} IS NOT NULL`))
      .groupBy(stories.age)
      .orderBy(desc(sql`count(*)`));

    return results.map(r => ({
      age: r.age || 'Unknown',
      count: r.count,
      description: this.getAgeDescription(r.age || '')
    }));
  }

  private getAgeDescription(age: string): string {
    const ageMap: Record<string, string> = {
      'childhood': 'Early memories and formative experiences',
      'teenage': 'Adolescent years and coming of age',
      'young-adult': 'College years and early independence',
      'adult': 'Career building and major life decisions',
      'middle-age': 'Established life and family responsibilities',
      'senior': 'Wisdom years and life reflection'
    };
    return ageMap[age] || 'Life experiences and memories';
  }
}

export const storage = new DatabaseStorage();