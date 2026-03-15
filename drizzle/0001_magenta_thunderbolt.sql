CREATE TABLE `connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` int NOT NULL,
	`targetId` int NOT NULL,
	`connectionType` varchar(64) NOT NULL,
	`strength` int NOT NULL DEFAULT 1,
	`label` varchar(256),
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `districts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`thematicFocus` text,
	`emotionalSpace` text,
	`temporalQuality` text,
	`colorPrimary` varchar(32),
	`colorSecondary` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `districts_id` PRIMARY KEY(`id`),
	CONSTRAINT `districts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `mythology_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`content` text NOT NULL,
	`entryType` enum('connection','arc','suggestion','analysis') NOT NULL DEFAULT 'analysis',
	`relatedTrackIds` json DEFAULT ('[]'),
	`generatedByAI` boolean NOT NULL DEFAULT false,
	`userId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mythology_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`noteType` enum('interpretation','connection','expansion','question') NOT NULL DEFAULT 'interpretation',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `symbols` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`category` varchar(64) NOT NULL,
	`description` text,
	`culturalMeaning` text,
	`emotionalAssociations` json DEFAULT ('[]'),
	`linkedThemes` json DEFAULT ('[]'),
	`colorHex` varchar(16),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `symbols_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`number` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`description` text,
	`districtId` int,
	`thematicCluster` varchar(128),
	`emotionalTags` json DEFAULT ('[]'),
	`narrativeArc` varchar(128),
	`symbolicElements` json DEFAULT ('[]'),
	`themes` json DEFAULT ('[]'),
	`mythologicalReferences` json DEFAULT ('[]'),
	`culturalReferences` json DEFAULT ('[]'),
	`narrativePotential` text,
	`creativeStatus` enum('concept','developed','produced') NOT NULL DEFAULT 'concept',
	`type` enum('song','visual','narrative','philosophical','cinematic','performance') NOT NULL DEFAULT 'song',
	`isBlank` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tracks_id` PRIMARY KEY(`id`)
);
