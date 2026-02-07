CREATE TABLE `chatRoomMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chatRoomId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('member','moderator','admin') NOT NULL DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatRoomMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatRooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`creatorId` int NOT NULL,
	`iconUrl` text,
	`isPrivate` boolean DEFAULT false,
	`memberCount` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chatRooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commentLikes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commentId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commentLikes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`likeCount` int DEFAULT 0,
	`isEdited` boolean DEFAULT false,
	`isDeleted` boolean DEFAULT false,
	`isFlagged` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentFlags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentType` enum('post','comment','message','profile') NOT NULL,
	`contentId` int NOT NULL,
	`userId` int NOT NULL,
	`reason` varchar(255) NOT NULL,
	`details` text,
	`moderationResult` enum('safe','unsafe','review'),
	`moderatorId` int,
	`status` enum('pending','reviewed','resolved') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentFlags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `directMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` int NOT NULL,
	`recipientId` int NOT NULL,
	`content` longtext NOT NULL,
	`imageUrl` text,
	`isRead` boolean DEFAULT false,
	`isDeleted` boolean DEFAULT false,
	`isFlagged` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `directMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `groupMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chatRoomId` int NOT NULL,
	`userId` int NOT NULL,
	`content` longtext NOT NULL,
	`imageUrl` text,
	`isEdited` boolean DEFAULT false,
	`isDeleted` boolean DEFAULT false,
	`isFlagged` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `groupMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailOnMessage` boolean DEFAULT true,
	`emailOnLike` boolean DEFAULT true,
	`emailOnComment` boolean DEFAULT true,
	`emailOnFollow` boolean DEFAULT true,
	`emailOnMention` boolean DEFAULT true,
	`inAppNotifications` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notificationPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('message','like','comment','follow','mention','reply','system') NOT NULL,
	`relatedUserId` int,
	`relatedPostId` int,
	`relatedCommentId` int,
	`title` varchar(255) NOT NULL,
	`content` text,
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `postLikes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `postLikes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`content` longtext NOT NULL,
	`imageUrls` text,
	`likeCount` int DEFAULT 0,
	`commentCount` int DEFAULT 0,
	`isEdited` boolean DEFAULT false,
	`isDeleted` boolean DEFAULT false,
	`isFlagged` boolean DEFAULT false,
	`flagReason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `relationships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`followerId` int NOT NULL,
	`followingId` int NOT NULL,
	`status` enum('following','blocked') NOT NULL DEFAULT 'following',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `relationships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`location` varchar(255),
	`website` varchar(255),
	`birthDate` timestamp,
	`followerCount` int DEFAULT 0,
	`followingCount` int DEFAULT 0,
	`postCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `userProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','moderator') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `coverImageUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `isPrivate` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `isVerified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);--> statement-breakpoint
CREATE INDEX `chatRoomMembers_chatRoom_user_idx` ON `chatRoomMembers` (`chatRoomId`,`userId`);--> statement-breakpoint
CREATE INDEX `chatRooms_creatorId_idx` ON `chatRooms` (`creatorId`);--> statement-breakpoint
CREATE INDEX `chatRooms_createdAt_idx` ON `chatRooms` (`createdAt`);--> statement-breakpoint
CREATE INDEX `commentLikes_commentId_userId_idx` ON `commentLikes` (`commentId`,`userId`);--> statement-breakpoint
CREATE INDEX `comments_postId_idx` ON `comments` (`postId`);--> statement-breakpoint
CREATE INDEX `comments_userId_idx` ON `comments` (`userId`);--> statement-breakpoint
CREATE INDEX `contentFlags_contentType_contentId_idx` ON `contentFlags` (`contentType`,`contentId`);--> statement-breakpoint
CREATE INDEX `contentFlags_status_idx` ON `contentFlags` (`status`);--> statement-breakpoint
CREATE INDEX `directMessages_sender_recipient_idx` ON `directMessages` (`senderId`,`recipientId`);--> statement-breakpoint
CREATE INDEX `directMessages_createdAt_idx` ON `directMessages` (`createdAt`);--> statement-breakpoint
CREATE INDEX `groupMessages_chatRoomId_idx` ON `groupMessages` (`chatRoomId`);--> statement-breakpoint
CREATE INDEX `groupMessages_userId_idx` ON `groupMessages` (`userId`);--> statement-breakpoint
CREATE INDEX `groupMessages_createdAt_idx` ON `groupMessages` (`createdAt`);--> statement-breakpoint
CREATE INDEX `notifications_userId_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `notifications_createdAt_idx` ON `notifications` (`createdAt`);--> statement-breakpoint
CREATE INDEX `postLikes_postId_userId_idx` ON `postLikes` (`postId`,`userId`);--> statement-breakpoint
CREATE INDEX `posts_userId_idx` ON `posts` (`userId`);--> statement-breakpoint
CREATE INDEX `posts_createdAt_idx` ON `posts` (`createdAt`);--> statement-breakpoint
CREATE INDEX `posts_isFlagged_idx` ON `posts` (`isFlagged`);--> statement-breakpoint
CREATE INDEX `relationships_follower_following_idx` ON `relationships` (`followerId`,`followingId`);--> statement-breakpoint
CREATE INDEX `username_idx` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `users` (`createdAt`);