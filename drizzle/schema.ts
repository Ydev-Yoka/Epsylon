import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  boolean,
  longtext,
  decimal,
  index
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with additional fields for social platform.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  username: varchar("username", { length: 64 }).unique(),
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  coverImageUrl: text("coverImageUrl"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "moderator"]).default("user").notNull(),
  isPrivate: boolean("isPrivate").default(false),
  isVerified: boolean("isVerified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  usernameIdx: index("username_idx").on(table.username),
  createdAtIdx: index("createdAt_idx").on(table.createdAt),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User profiles with extended information
 */
export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  location: varchar("location", { length: 255 }),
  website: varchar("website", { length: 255 }),
  birthDate: timestamp("birthDate"),
  followerCount: int("followerCount").default(0),
  followingCount: int("followingCount").default(0),
  postCount: int("postCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Posts/status updates
 */
export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  content: longtext("content").notNull(),
  imageUrls: text("imageUrls"), // JSON array of URLs
  likeCount: int("likeCount").default(0),
  commentCount: int("commentCount").default(0),
  isEdited: boolean("isEdited").default(false),
  isDeleted: boolean("isDeleted").default(false),
  isFlagged: boolean("isFlagged").default(false),
  flagReason: varchar("flagReason", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("posts_userId_idx").on(table.userId),
  createdAtIdx: index("posts_createdAt_idx").on(table.createdAt),
  isFlaggedIdx: index("posts_isFlagged_idx").on(table.isFlagged),
}));

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

/**
 * Comments on posts
 */
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  likeCount: int("likeCount").default(0),
  isEdited: boolean("isEdited").default(false),
  isDeleted: boolean("isDeleted").default(false),
  isFlagged: boolean("isFlagged").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  postIdIdx: index("comments_postId_idx").on(table.postId),
  userIdIdx: index("comments_userId_idx").on(table.userId),
}));

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

/**
 * Post likes
 */
export const postLikes = mysqlTable("postLikes", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  postUserIdx: index("postLikes_postId_userId_idx").on(table.postId, table.userId),
}));

export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = typeof postLikes.$inferInsert;

/**
 * Comment likes
 */
export const commentLikes = mysqlTable("commentLikes", {
  id: int("id").autoincrement().primaryKey(),
  commentId: int("commentId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  commentUserIdx: index("commentLikes_commentId_userId_idx").on(table.commentId, table.userId),
}));

export type CommentLike = typeof commentLikes.$inferSelect;
export type InsertCommentLike = typeof commentLikes.$inferInsert;

/**
 * Friend/Follow relationships
 */
export const relationships = mysqlTable("relationships", {
  id: int("id").autoincrement().primaryKey(),
  followerId: int("followerId").notNull(),
  followingId: int("followingId").notNull(),
  status: mysqlEnum("status", ["following", "blocked"]).default("following").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  followerFollowingIdx: index("relationships_follower_following_idx").on(table.followerId, table.followingId),
}));

export type Relationship = typeof relationships.$inferSelect;
export type InsertRelationship = typeof relationships.$inferInsert;

/**
 * Direct messages
 */
export const directMessages = mysqlTable("directMessages", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("senderId").notNull(),
  recipientId: int("recipientId").notNull(),
  content: longtext("content").notNull(),
  imageUrl: text("imageUrl"),
  isRead: boolean("isRead").default(false),
  isDeleted: boolean("isDeleted").default(false),
  isFlagged: boolean("isFlagged").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  senderRecipientIdx: index("directMessages_sender_recipient_idx").on(table.senderId, table.recipientId),
  createdAtIdx: index("directMessages_createdAt_idx").on(table.createdAt),
}));

export type DirectMessage = typeof directMessages.$inferSelect;
export type InsertDirectMessage = typeof directMessages.$inferInsert;

/**
 * Chat rooms/channels for group messaging
 */
export const chatRooms = mysqlTable("chatRooms", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  creatorId: int("creatorId").notNull(),
  iconUrl: text("iconUrl"),
  isPrivate: boolean("isPrivate").default(false),
  memberCount: int("memberCount").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  creatorIdIdx: index("chatRooms_creatorId_idx").on(table.creatorId),
  createdAtIdx: index("chatRooms_createdAt_idx").on(table.createdAt),
}));

export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = typeof chatRooms.$inferInsert;

/**
 * Chat room members
 */
export const chatRoomMembers = mysqlTable("chatRoomMembers", {
  id: int("id").autoincrement().primaryKey(),
  chatRoomId: int("chatRoomId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["member", "moderator", "admin"]).default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
}, (table) => ({
  chatRoomUserIdx: index("chatRoomMembers_chatRoom_user_idx").on(table.chatRoomId, table.userId),
}));

export type ChatRoomMember = typeof chatRoomMembers.$inferSelect;
export type InsertChatRoomMember = typeof chatRoomMembers.$inferInsert;

/**
 * Group chat messages
 */
export const groupMessages = mysqlTable("groupMessages", {
  id: int("id").autoincrement().primaryKey(),
  chatRoomId: int("chatRoomId").notNull(),
  userId: int("userId").notNull(),
  content: longtext("content").notNull(),
  imageUrl: text("imageUrl"),
  isEdited: boolean("isEdited").default(false),
  isDeleted: boolean("isDeleted").default(false),
  isFlagged: boolean("isFlagged").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  chatRoomIdIdx: index("groupMessages_chatRoomId_idx").on(table.chatRoomId),
  userIdIdx: index("groupMessages_userId_idx").on(table.userId),
  createdAtIdx: index("groupMessages_createdAt_idx").on(table.createdAt),
}));

export type GroupMessage = typeof groupMessages.$inferSelect;
export type InsertGroupMessage = typeof groupMessages.$inferInsert;

/**
 * Notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", [
    "message",
    "like",
    "comment",
    "follow",
    "mention",
    "reply",
    "system"
  ]).notNull(),
  relatedUserId: int("relatedUserId"),
  relatedPostId: int("relatedPostId"),
  relatedCommentId: int("relatedCommentId"),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("notifications_userId_idx").on(table.userId),
  createdAtIdx: index("notifications_createdAt_idx").on(table.createdAt),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Content moderation flags
 */
export const contentFlags = mysqlTable("contentFlags", {
  id: int("id").autoincrement().primaryKey(),
  contentType: mysqlEnum("contentType", ["post", "comment", "message", "profile"]).notNull(),
  contentId: int("contentId").notNull(),
  userId: int("userId").notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  details: text("details"),
  moderationResult: mysqlEnum("moderationResult", ["safe", "unsafe", "review"]),
  moderatorId: int("moderatorId"),
  status: mysqlEnum("status", ["pending", "reviewed", "resolved"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  contentTypeIdIdx: index("contentFlags_contentType_contentId_idx").on(table.contentType, table.contentId),
  statusIdx: index("contentFlags_status_idx").on(table.status),
}));

export type ContentFlag = typeof contentFlags.$inferSelect;
export type InsertContentFlag = typeof contentFlags.$inferInsert;

/**
 * Email notification preferences
 */
export const notificationPreferences = mysqlTable("notificationPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  emailOnMessage: boolean("emailOnMessage").default(true),
  emailOnLike: boolean("emailOnLike").default(true),
  emailOnComment: boolean("emailOnComment").default(true),
  emailOnFollow: boolean("emailOnFollow").default(true),
  emailOnMention: boolean("emailOnMention").default(true),
  inAppNotifications: boolean("inAppNotifications").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

/**
 * Video/Voice Calls
 */
export const calls = mysqlTable("calls", {
  id: int("id").autoincrement().primaryKey(),
  initiatorId: int("initiatorId").notNull(),
  recipientId: int("recipientId").notNull(),
  chatRoomId: int("chatRoomId"),
  callType: mysqlEnum("callType", ["voice", "video"]).notNull(),
  status: mysqlEnum("status", ["pending", "active", "ended", "missed", "declined"]).default("pending").notNull(),
  startedAt: timestamp("startedAt"),
  endedAt: timestamp("endedAt"),
  duration: int("duration"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  initiatorIdIdx: index("calls_initiatorId_idx").on(table.initiatorId),
  recipientIdIdx: index("calls_recipientId_idx").on(table.recipientId),
  statusIdx: index("calls_status_idx").on(table.status),
}));

export type Call = typeof calls.$inferSelect;
export type InsertCall = typeof calls.$inferInsert;

/**
 * Message Reactions (Emojis)
 */
export const messageReactions = mysqlTable("messageReactions", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("messageId").notNull(),
  userId: int("userId").notNull(),
  emoji: varchar("emoji", { length: 10 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  messageUserIdx: index("messageReactions_messageId_userId_idx").on(table.messageId, table.userId),
}));

export type MessageReaction = typeof messageReactions.$inferSelect;
export type InsertMessageReaction = typeof messageReactions.$inferInsert;

/**
 * File Shares in Chat
 */
export const fileShares = mysqlTable("fileShares", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("messageId"),
  directMessageId: int("directMessageId"),
  groupMessageId: int("groupMessageId"),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileSize: int("fileSize"),
  mimeType: varchar("mimeType", { length: 100 }),
  fileType: mysqlEnum("fileType", ["image", "video", "audio", "document", "other"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("fileShares_userId_idx").on(table.userId),
  messageIdIdx: index("fileShares_messageId_idx").on(table.messageId),
}));

export type FileShare = typeof fileShares.$inferSelect;
export type InsertFileShare = typeof fileShares.$inferInsert;

/**
 * Mini-Games
 */
export const miniGames = mysqlTable("miniGames", {
  id: int("id").autoincrement().primaryKey(),
  gameType: mysqlEnum("gameType", ["tictactoe", "wordgame", "dice", "trivia"]).notNull(),
  initiatorId: int("initiatorId").notNull(),
  opponentId: int("opponentId"),
  chatRoomId: int("chatRoomId"),
  directMessageId: int("directMessageId"),
  status: mysqlEnum("status", ["pending", "active", "completed", "declined"]).default("pending").notNull(),
  gameData: longtext("gameData"),
  winnerId: int("winnerId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  initiatorIdIdx: index("miniGames_initiatorId_idx").on(table.initiatorId),
  statusIdx: index("miniGames_status_idx").on(table.status),
}));

export type MiniGame = typeof miniGames.$inferSelect;
export type InsertMiniGame = typeof miniGames.$inferInsert;

/**
 * Game Moves/Turns
 */
export const gameMoves = mysqlTable("gameMoves", {
  id: int("id").autoincrement().primaryKey(),
  gameId: int("gameId").notNull(),
  userId: int("userId").notNull(),
  moveData: longtext("moveData").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  gameIdIdx: index("gameMoves_gameId_idx").on(table.gameId),
}));

export type GameMove = typeof gameMoves.$inferSelect;
export type InsertGameMove = typeof gameMoves.$inferInsert;
