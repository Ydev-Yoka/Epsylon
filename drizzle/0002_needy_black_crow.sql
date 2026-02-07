CREATE TABLE `calls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`initiatorId` int NOT NULL,
	`recipientId` int NOT NULL,
	`chatRoomId` int,
	`callType` enum('voice','video') NOT NULL,
	`status` enum('pending','active','ended','missed','declined') NOT NULL DEFAULT 'pending',
	`startedAt` timestamp,
	`endedAt` timestamp,
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `calls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fileShares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int,
	`directMessageId` int,
	`groupMessageId` int,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` int,
	`mimeType` varchar(100),
	`fileType` enum('image','video','audio','document','other') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fileShares_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gameMoves` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gameId` int NOT NULL,
	`userId` int NOT NULL,
	`moveData` longtext NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gameMoves_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messageReactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`userId` int NOT NULL,
	`emoji` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messageReactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `miniGames` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gameType` enum('tictactoe','wordgame','dice','trivia') NOT NULL,
	`initiatorId` int NOT NULL,
	`opponentId` int,
	`chatRoomId` int,
	`directMessageId` int,
	`status` enum('pending','active','completed','declined') NOT NULL DEFAULT 'pending',
	`gameData` longtext,
	`winnerId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `miniGames_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `calls_initiatorId_idx` ON `calls` (`initiatorId`);--> statement-breakpoint
CREATE INDEX `calls_recipientId_idx` ON `calls` (`recipientId`);--> statement-breakpoint
CREATE INDEX `calls_status_idx` ON `calls` (`status`);--> statement-breakpoint
CREATE INDEX `fileShares_userId_idx` ON `fileShares` (`userId`);--> statement-breakpoint
CREATE INDEX `fileShares_messageId_idx` ON `fileShares` (`messageId`);--> statement-breakpoint
CREATE INDEX `gameMoves_gameId_idx` ON `gameMoves` (`gameId`);--> statement-breakpoint
CREATE INDEX `messageReactions_messageId_userId_idx` ON `messageReactions` (`messageId`,`userId`);--> statement-breakpoint
CREATE INDEX `miniGames_initiatorId_idx` ON `miniGames` (`initiatorId`);--> statement-breakpoint
CREATE INDEX `miniGames_status_idx` ON `miniGames` (`status`);