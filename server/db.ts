import { eq, and, or, desc, asc, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  userProfiles,
  posts,
  comments,
  postLikes,
  commentLikes,
  relationships,
  directMessages,
  chatRooms,
  chatRoomMembers,
  groupMessages,
  notifications,
  contentFlags,
  notificationPreferences
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER OPERATIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "username", "bio", "avatarUrl", "coverImageUrl", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });

    // Get the created/updated user ID
    const createdUser = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    if (createdUser.length > 0) {
      const userId = createdUser[0].id;

      // Create user profile if it doesn't exist
      const existingProfile = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
      if (!existingProfile.length) {
        try {
          await db.insert(userProfiles).values({ userId });
        } catch (e) {
          // Profile might already exist, ignore
        }
      }

      // Create notification preferences if they don't exist
      const existingPrefs = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).limit(1);
      if (!existingPrefs.length) {
        try {
          await db.insert(notificationPreferences).values({ userId });
        } catch (e) {
          // Preferences might already exist, ignore
        }
      }
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, updates: Partial<typeof users.$inferInsert>) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(users).set(updates).where(eq(users.id, userId));
  return getUserById(userId);
}

// ============ POST OPERATIONS ============

export async function createPost(userId: number, content: string, imageUrls?: string[]) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.insert(posts).values({
    userId,
    content,
    imageUrls: imageUrls ? JSON.stringify(imageUrls) : null,
  });

  // Update user post count
  const userProfile = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  if (userProfile.length) {
    await db.update(userProfiles).set({ postCount: (userProfile[0].postCount || 0) + 1 }).where(eq(userProfiles.userId, userId));
  }

  return result;
}

export async function getPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserPosts(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(posts)
    .where(and(eq(posts.userId, userId), eq(posts.isDeleted, false)))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getFeedPosts(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  // Get users that current user follows
  const following = await db.select({ followingId: relationships.followingId })
    .from(relationships)
    .where(and(eq(relationships.followerId, userId), eq(relationships.status, "following")));

  const followingIds = following.map(f => f.followingId);
  followingIds.push(userId); // Include own posts

  if (followingIds.length === 0) {
    return [];
  }

  return await db.select().from(posts)
    .where(and(inArray(posts.userId, followingIds), eq(posts.isDeleted, false)))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updatePost(postId: number, content: string, imageUrls?: string[]) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(posts).set({
    content,
    imageUrls: imageUrls ? JSON.stringify(imageUrls) : null,
    isEdited: true,
  }).where(eq(posts.id, postId));
  const post = await getPostById(postId);
  return post || undefined;
}

export async function deletePost(postId: number) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(posts).set({ isDeleted: true }).where(eq(posts.id, postId));
  return true;
}

// ============ COMMENT OPERATIONS ============

export async function createComment(postId: number, userId: number, content: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(comments).values({
    postId,
    userId,
    content,
  });

  // Update post comment count
  const post = await getPostById(postId);
  if (post) {
    await db.update(posts).set({ commentCount: (post.commentCount || 0) + 1 }).where(eq(posts.id, postId));
  }

  return result;
}

export async function getPostComments(postId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(comments)
    .where(and(eq(comments.postId, postId), eq(comments.isDeleted, false)))
    .orderBy(desc(comments.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateComment(commentId: number, content: string) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(comments).set({ content, isEdited: true }).where(eq(comments.id, commentId));
  return true;
}

export async function deleteComment(commentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const comment = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);
  if (comment.length) {
    await db.update(comments).set({ isDeleted: true }).where(eq(comments.id, commentId));
    // Update post comment count
    await db.update(posts).set({ commentCount: sql`commentCount - 1` }).where(eq(posts.id, comment[0].postId));
  }
  return true;
}

// ============ LIKE OPERATIONS ============

export async function likePost(postId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const existing = await db.select().from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
    .limit(1);

  if (existing.length) {
    return { alreadyLiked: true };
  }

  await db.insert(postLikes).values({ postId, userId });
  await db.update(posts).set({ likeCount: sql`likeCount + 1` }).where(eq(posts.id, postId));
  return { success: true };
}

export async function unlikePost(postId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  await db.delete(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
  await db.update(posts).set({ likeCount: sql`likeCount - 1` }).where(eq(posts.id, postId));
  return { success: true };
}

export async function hasUserLikedPost(postId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
    .limit(1);
  return result.length > 0;
}

export async function likeComment(commentId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const existing = await db.select().from(commentLikes)
    .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)))
    .limit(1);

  if (existing.length) {
    return { alreadyLiked: true };
  }

  await db.insert(commentLikes).values({ commentId, userId });
  await db.update(comments).set({ likeCount: sql`likeCount + 1` }).where(eq(comments.id, commentId));
  return { success: true };
}

export async function unlikeComment(commentId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  await db.delete(commentLikes).where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)));
  await db.update(comments).set({ likeCount: sql`likeCount - 1` }).where(eq(comments.id, commentId));
  return { success: true };
}

// ============ RELATIONSHIP OPERATIONS ============

export async function followUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return undefined;

  if (followerId === followingId) {
    throw new Error("Cannot follow yourself");
  }

  const existing = await db.select().from(relationships)
    .where(and(eq(relationships.followerId, followerId), eq(relationships.followingId, followingId)))
    .limit(1);

  if (existing.length) {
    return { alreadyFollowing: true };
  }

  await db.insert(relationships).values({ followerId, followingId, status: "following" });

  // Update follower counts
  const followerProfile = await db.select().from(userProfiles).where(eq(userProfiles.userId, followerId)).limit(1);
  const followingProfile = await db.select().from(userProfiles).where(eq(userProfiles.userId, followingId)).limit(1);

  if (followerProfile.length) {
    await db.update(userProfiles).set({ followingCount: (followerProfile[0].followingCount || 0) + 1 }).where(eq(userProfiles.userId, followerId));
  }
  if (followingProfile.length) {
    await db.update(userProfiles).set({ followerCount: (followingProfile[0].followerCount || 0) + 1 }).where(eq(userProfiles.userId, followingId));
  }

  return { success: true };
}

export async function unfollowUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return undefined;

  await db.delete(relationships).where(and(eq(relationships.followerId, followerId), eq(relationships.followingId, followingId)));

  // Update follower counts
  const followerProfile = await db.select().from(userProfiles).where(eq(userProfiles.userId, followerId)).limit(1);
  const followingProfile = await db.select().from(userProfiles).where(eq(userProfiles.userId, followingId)).limit(1);

  if (followerProfile.length > 0 && followerProfile[0] && followerProfile[0].followingCount && followerProfile[0].followingCount > 0) {
    await db.update(userProfiles).set({ followingCount: followerProfile[0].followingCount - 1 }).where(eq(userProfiles.userId, followerId));
  }
  if (followingProfile.length > 0 && followingProfile[0] && followingProfile[0].followerCount && followingProfile[0].followerCount > 0) {
    await db.update(userProfiles).set({ followerCount: followingProfile[0].followerCount - 1 }).where(eq(userProfiles.userId, followingId));
  }

  return { success: true };
}

export async function isFollowing(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(relationships)
    .where(and(eq(relationships.followerId, followerId), eq(relationships.followingId, followingId), eq(relationships.status, "following")))
    .limit(1);
  return result.length > 0;
}

export async function getFollowers(userId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  const relationships_list = await db.select({ followerId: relationships.followerId })
    .from(relationships)
    .where(and(eq(relationships.followingId, userId), eq(relationships.status, "following")))
    .limit(limit)
    .offset(offset);
  
  const followerIds = relationships_list.map(r => r.followerId);
  if (followerIds.length === 0) return [];
  
  return await db.select().from(users).where(inArray(users.id, followerIds));
}

export async function getFollowing(userId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  const relationships_list = await db.select({ followingId: relationships.followingId })
    .from(relationships)
    .where(and(eq(relationships.followerId, userId), eq(relationships.status, "following")))
    .limit(limit)
    .offset(offset);
  
  const followingIds = relationships_list.map(r => r.followingId);
  if (followingIds.length === 0) return [];
  
  return await db.select().from(users).where(inArray(users.id, followingIds));
}

// ============ DIRECT MESSAGE OPERATIONS ============

export async function sendDirectMessage(senderId: number, recipientId: number, content: string, imageUrl?: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(directMessages).values({
    senderId,
    recipientId,
    content,
    imageUrl: imageUrl || null,
  });

  return result;
}

export async function getDirectMessageThread(userId1: number, userId2: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(directMessages)
    .where(or(
      and(eq(directMessages.senderId, userId1), eq(directMessages.recipientId, userId2)),
      and(eq(directMessages.senderId, userId2), eq(directMessages.recipientId, userId1))
    ))
    .orderBy(desc(directMessages.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function markMessageAsRead(messageId: number) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(directMessages).set({ isRead: true }).where(eq(directMessages.id, messageId));
  return true;
}

// ============ CHAT ROOM OPERATIONS ============

export async function createChatRoom(name: string, creatorId: number, description?: string, isPrivate = false) {
  const db = await getDb();
  if (!db) return undefined;

  await db.insert(chatRooms).values({
    name,
    creatorId,
    description: description || null,
    isPrivate,
  });

  // Get the created room
  const createdRoom = await db.select().from(chatRooms)
    .where(and(eq(chatRooms.name, name), eq(chatRooms.creatorId, creatorId)))
    .orderBy(desc(chatRooms.createdAt))
    .limit(1);

  if (createdRoom.length > 0) {
    const roomId = createdRoom[0].id;
    await db.insert(chatRoomMembers).values({
      userId: creatorId,
      chatRoomId: roomId,
      role: "admin",
    });
    return createdRoom[0];
  }

  return undefined;
}

export async function getChatRoom(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(chatRooms).where(eq(chatRooms.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function addChatRoomMember(chatRoomId: number, userId: number, role: "member" | "moderator" | "admin" = "member") {
  const db = await getDb();
  if (!db) return undefined;

  const existing = await db.select().from(chatRoomMembers)
    .where(and(eq(chatRoomMembers.chatRoomId, chatRoomId), eq(chatRoomMembers.userId, userId)))
    .limit(1);

  if (existing.length) {
    return { alreadyMember: true };
  }

  await db.insert(chatRoomMembers).values({ userId, chatRoomId, role });
  await db.update(chatRooms).set({ memberCount: sql`memberCount + 1` }).where(eq(chatRooms.id, chatRoomId));

  return { success: true };
}

export async function removeChatRoomMember(chatRoomId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  await db.delete(chatRoomMembers).where(and(eq(chatRoomMembers.chatRoomId, chatRoomId), eq(chatRoomMembers.userId, userId)));
  await db.update(chatRooms).set({ memberCount: sql`memberCount - 1` }).where(eq(chatRooms.id, chatRoomId));

  return { success: true };
}

export async function getChatRoomMembers(chatRoomId: number) {
  const db = await getDb();
  if (!db) return [];
  const members = await db.select({ userId: chatRoomMembers.userId }).from(chatRoomMembers).where(eq(chatRoomMembers.chatRoomId, chatRoomId));
  const userIds = members.map(m => m.userId);
  if (userIds.length === 0) return [];
  return await db.select().from(users).where(inArray(users.id, userIds));
}

export async function getUserChatRooms(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const rooms = await db.select({ chatRoomId: chatRoomMembers.chatRoomId }).from(chatRoomMembers).where(eq(chatRoomMembers.userId, userId));
  const roomIds = rooms.map(r => r.chatRoomId);
  if (roomIds.length === 0) return [];
  return await db.select().from(chatRooms).where(inArray(chatRooms.id, roomIds)).orderBy(desc(chatRooms.updatedAt));
}

// ============ GROUP MESSAGE OPERATIONS ============

export async function sendGroupMessage(chatRoomId: number, userId: number, content: string, imageUrl?: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(groupMessages).values({
    chatRoomId,
    userId,
    content,
    imageUrl: imageUrl || null,
  });

  return result;
}

export async function getGroupMessages(chatRoomId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(groupMessages)
    .where(and(eq(groupMessages.chatRoomId, chatRoomId), eq(groupMessages.isDeleted, false)))
    .orderBy(desc(groupMessages.createdAt))
    .limit(limit)
    .offset(offset);
}

// ============ NOTIFICATION OPERATIONS ============

export async function createNotification(userId: number, type: string, title: string, content?: string, relatedUserId?: number, relatedPostId?: number, relatedCommentId?: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(notifications).values({
    userId,
    type: type as any,
    title,
    content: content || null,
    relatedUserId: relatedUserId || null,
    relatedPostId: relatedPostId || null,
    relatedCommentId: relatedCommentId || null,
  });

  return result;
}

export async function getUserNotifications(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId));
  return true;
}

// ============ CONTENT MODERATION OPERATIONS ============

export async function flagContent(contentType: string, contentId: number, userId: number, reason: string, details?: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(contentFlags).values({
    contentType: contentType as any,
    contentId,
    userId,
    reason,
    details: details || null,
    status: "pending",
  });

  // Mark content as flagged
  if (contentType === "post") {
    await db.update(posts).set({ isFlagged: true, flagReason: reason }).where(eq(posts.id, contentId));
  } else if (contentType === "comment") {
    await db.update(comments).set({ isFlagged: true }).where(eq(comments.id, contentId));
  } else if (contentType === "message") {
    await db.update(directMessages).set({ isFlagged: true }).where(eq(directMessages.id, contentId));
  }

  return result;
}

export async function getPendingFlags(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(contentFlags)
    .where(eq(contentFlags.status, "pending"))
    .orderBy(asc(contentFlags.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function resolveFlag(flagId: number, moderatorId: number, result: string) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(contentFlags).set({
    moderationResult: result as any,
    moderatorId,
    status: "resolved",
  }).where(eq(contentFlags.id, flagId));
  return true;
}

// ============ SEARCH OPERATIONS ============

export async function searchUsers(query: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users)
    .where(or(
      sql`LOWER(COALESCE(${users.name}, '')) LIKE LOWER(${`%${query}%`})`,
      sql`LOWER(COALESCE(${users.username}, '')) LIKE LOWER(${`%${query}%`})`,
      sql`LOWER(COALESCE(${users.email}, '')) LIKE LOWER(${`%${query}%`})`
    ))
    .limit(limit);
}

export async function searchPosts(query: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(posts)
    .where(and(
      sql`LOWER(COALESCE(${posts.content}, '')) LIKE LOWER(${`%${query}%`})`,
      eq(posts.isDeleted, false)
    ))
    .orderBy(desc(posts.createdAt))
    .limit(limit);
}
