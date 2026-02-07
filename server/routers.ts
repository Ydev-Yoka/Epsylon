import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ USER OPERATIONS ============
  user: router({
    getProfile: publicProcedure
      .input(z.object({ username: z.string() }))
      .query(async ({ input }) => {
        const user = await db.getUserByUsername(input.username);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }
        return user;
      }),

    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        username: z.string().optional(),
        avatarUrl: z.string().optional(),
        coverImageUrl: z.string().optional(),
        isPrivate: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const updated = await db.updateUserProfile(ctx.user.id, input);
        return updated;
      }),

    uploadAvatar: protectedProcedure
      .input(z.object({
        imageBase64: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const buffer = Buffer.from(input.imageBase64, 'base64');
          const fileKey = `users/${ctx.user.id}/avatar-${Date.now()}.jpg`;
          const { url } = await storagePut(fileKey, buffer, input.mimeType);
          
          await db.updateUserProfile(ctx.user.id, { avatarUrl: url });
          return { success: true, url };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to upload avatar" });
        }
      }),

    search: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.searchUsers(input.query, input.limit || 20);
      }),
  }),

  // ============ POST OPERATIONS ============
  post: router({
    create: protectedProcedure
      .input(z.object({
        content: z.string().min(1),
        imageUrls: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Content moderation
        const moderationResult = await moderateContent(input.content);
        if (moderationResult === "unsafe") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Content violates community guidelines" });
        }

        const result = await db.createPost(ctx.user.id, input.content, input.imageUrls);
        return result;
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPostById(input.id);
      }),

    getUserPosts: publicProcedure
      .input(z.object({ userId: z.number(), limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getUserPosts(input.userId, input.limit || 20, input.offset || 0);
      }),

    getFeed: protectedProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return await db.getFeedPosts(ctx.user.id, input.limit || 20, input.offset || 0);
      }),

    update: protectedProcedure
      .input(z.object({
        postId: z.number(),
        content: z.string(),
        imageUrls: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getPostById(input.postId);
        if (!post || post.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return await db.updatePost(input.postId, input.content, input.imageUrls);
      }),

    delete: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getPostById(input.postId);
        if (!post || post.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return await db.deletePost(input.postId);
      }),

    like: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.likePost(input.postId, ctx.user.id);
        if (result && !result.alreadyLiked) {
          await db.createNotification(
            (await db.getPostById(input.postId))?.userId || 0,
            "like",
            `${ctx.user.name} liked your post`,
            undefined,
            ctx.user.id,
            input.postId
          );
        }
        return result;
      }),

    unlike: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.unlikePost(input.postId, ctx.user.id);
      }),

    hasLiked: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.hasUserLikedPost(input.postId, ctx.user.id);
      }),

    search: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.searchPosts(input.query, input.limit || 20);
      }),
  }),

  // ============ COMMENT OPERATIONS ============
  comment: router({
    create: protectedProcedure
      .input(z.object({
        postId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const moderationResult = await moderateContent(input.content);
        if (moderationResult === "unsafe") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Content violates community guidelines" });
        }

        const result = await db.createComment(input.postId, ctx.user.id, input.content);
        
        const post = await db.getPostById(input.postId);
        if (post) {
          await db.createNotification(
            post.userId,
            "comment",
            `${ctx.user.name} commented on your post`,
            input.content,
            ctx.user.id,
            input.postId
          );
        }

        return result;
      }),

    getPostComments: publicProcedure
      .input(z.object({ postId: z.number(), limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getPostComments(input.postId, input.limit || 50, input.offset || 0);
      }),

    update: protectedProcedure
      .input(z.object({
        commentId: z.number(),
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const comments = await db.getPostComments(0);
        const comment = comments.find(c => c.id === input.commentId);
        if (!comment || comment.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return await db.updateComment(input.commentId, input.content);
      }),

    delete: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.deleteComment(input.commentId);
      }),

    like: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.likeComment(input.commentId, ctx.user.id);
      }),

    unlike: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.unlikeComment(input.commentId, ctx.user.id);
      }),
  }),

  // ============ RELATIONSHIP OPERATIONS ============
  relationship: router({
    follow: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.followUser(ctx.user.id, input.userId);
        if (result && !result.alreadyFollowing) {
          await db.createNotification(
            input.userId,
            "follow",
            `${ctx.user.name} started following you`,
            undefined,
            ctx.user.id
          );
        }
        return result;
      }),

    unfollow: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.unfollowUser(ctx.user.id, input.userId);
      }),

    isFollowing: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.isFollowing(ctx.user.id, input.userId);
      }),

    getFollowers: publicProcedure
      .input(z.object({ userId: z.number(), limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getFollowers(input.userId, input.limit || 50, input.offset || 0);
      }),

    getFollowing: publicProcedure
      .input(z.object({ userId: z.number(), limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getFollowing(input.userId, input.limit || 50, input.offset || 0);
      }),
  }),

  // ============ MESSAGING OPERATIONS ============
  message: router({
    sendDirect: protectedProcedure
      .input(z.object({
        recipientId: z.number(),
        content: z.string().min(1),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const moderationResult = await moderateContent(input.content);
        if (moderationResult === "unsafe") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Message violates community guidelines" });
        }

        const result = await db.sendDirectMessage(ctx.user.id, input.recipientId, input.content, input.imageUrl);
        
        await db.createNotification(
          input.recipientId,
          "message",
          `${ctx.user.name} sent you a message`,
          input.content,
          ctx.user.id
        );

        return result;
      }),

    getThread: publicProcedure
      .input(z.object({ userId1: z.number(), userId2: z.number(), limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getDirectMessageThread(input.userId1, input.userId2, input.limit || 50, input.offset || 0);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ messageId: z.number() }))
      .mutation(async ({ input }) => {
        return await db.markMessageAsRead(input.messageId);
      }),
  }),

  // ============ CHAT ROOM OPERATIONS ============
  chatRoom: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        isPrivate: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createChatRoom(input.name, ctx.user.id, input.description, input.isPrivate);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getChatRoom(input.id);
      }),

    getUserRooms: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserChatRooms(ctx.user.id);
      }),

    addMember: protectedProcedure
      .input(z.object({ chatRoomId: z.number(), userId: z.number() }))
      .mutation(async ({ input }) => {
        return await db.addChatRoomMember(input.chatRoomId, input.userId);
      }),

    removeMember: protectedProcedure
      .input(z.object({ chatRoomId: z.number(), userId: z.number() }))
      .mutation(async ({ input }) => {
        return await db.removeChatRoomMember(input.chatRoomId, input.userId);
      }),

    getMembers: publicProcedure
      .input(z.object({ chatRoomId: z.number() }))
      .query(async ({ input }) => {
        return await db.getChatRoomMembers(input.chatRoomId);
      }),
  }),

  // ============ GROUP MESSAGE OPERATIONS ============
  groupMessage: router({
    send: protectedProcedure
      .input(z.object({
        chatRoomId: z.number(),
        content: z.string().min(1),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const moderationResult = await moderateContent(input.content);
        if (moderationResult === "unsafe") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Message violates community guidelines" });
        }

        return await db.sendGroupMessage(input.chatRoomId, ctx.user.id, input.content, input.imageUrl);
      }),

    getMessages: publicProcedure
      .input(z.object({ chatRoomId: z.number(), limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getGroupMessages(input.chatRoomId, input.limit || 50, input.offset || 0);
      }),
  }),

  // ============ NOTIFICATION OPERATIONS ============
  notification: router({
    getNotifications: protectedProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return await db.getUserNotifications(ctx.user.id, input.limit || 20, input.offset || 0);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        return await db.markNotificationAsRead(input.notificationId);
      }),
  }),

  // ============ CONTENT MODERATION OPERATIONS ============
  moderation: router({
    flagContent: protectedProcedure
      .input(z.object({
        contentType: z.enum(["post", "comment", "message", "profile"]),
        contentId: z.number(),
        reason: z.string(),
        details: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.flagContent(input.contentType, input.contentId, ctx.user.id, input.reason, input.details);
      }),

    getPendingFlags: protectedProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        // Only admins and moderators can view flags
        if (ctx.user.role !== "admin" && ctx.user.role !== "moderator") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return await db.getPendingFlags(input.limit || 50, input.offset || 0);
      }),

    resolveFlag: protectedProcedure
      .input(z.object({
        flagId: z.number(),
        result: z.enum(["safe", "unsafe", "review"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "moderator") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return await db.resolveFlag(input.flagId, ctx.user.id, input.result);
      }),
  }),
});

// ============ CONTENT MODERATION HELPER ============
async function moderateContent(content: string): Promise<"safe" | "unsafe" | "review"> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a content moderation AI. Analyze the following content and determine if it violates community guidelines. Respond with only one word: 'safe' or 'unsafe'.",
        },
        {
          role: "user",
          content: content,
        },
      ],
    });

    const messageContent = response.choices[0]?.message.content;
    if (typeof messageContent === 'string') {
      const result = messageContent.toLowerCase().trim();
      if (result === "unsafe") {
        return "unsafe";
      }
    }
    return "safe";
  } catch (error) {
    console.error("Content moderation error:", error);
    return "review";
  }
}

export type AppRouter = typeof appRouter;
