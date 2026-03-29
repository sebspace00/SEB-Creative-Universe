import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Districts — the four zones of the City Cycle universe
export const districts = mysqlTable("districts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  thematicFocus: text("thematicFocus"),
  emotionalSpace: text("emotionalSpace"),
  temporalQuality: text("temporalQuality"),
  colorPrimary: varchar("colorPrimary", { length: 32 }),
  colorSecondary: varchar("colorSecondary", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type District = typeof districts.$inferSelect;

// Tracks — the 174 conceptual items
export const tracks = mysqlTable("tracks", {
  id: int("id").autoincrement().primaryKey(),
  number: int("number").notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description"),
  districtId: int("districtId"),
  thematicCluster: varchar("thematicCluster", { length: 128 }),
  emotionalTags: json("emotionalTags").$type<string[]>().default([]),
  narrativeArc: varchar("narrativeArc", { length: 128 }),
  symbolicElements: json("symbolicElements").$type<string[]>().default([]),
  themes: json("themes").$type<string[]>().default([]),
  mythologicalReferences: json("mythologicalReferences").$type<string[]>().default([]),
  culturalReferences: json("culturalReferences").$type<string[]>().default([]),
  narrativePotential: text("narrativePotential"),
  creativeStatus: mysqlEnum("creativeStatus", ["concept", "developed", "produced"]).default("concept").notNull(),
  type: mysqlEnum("type", ["song", "visual", "narrative", "philosophical", "cinematic", "performance"]).default("song").notNull(),
  lyrics: text("lyrics"),
  isBlank: boolean("isBlank").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = typeof tracks.$inferInsert;

// Connections — edges in the knowledge graph
export const connections = mysqlTable("connections", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: int("sourceId").notNull(),
  targetId: int("targetId").notNull(),
  connectionType: varchar("connectionType", { length: 64 }).notNull(), // theme, symbol, emotion, narrative, character
  strength: int("strength").default(1).notNull(), // 1-10
  label: varchar("label", { length: 256 }),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Connection = typeof connections.$inferSelect;
export type InsertConnection = typeof connections.$inferInsert;

// Symbols — the symbolism library
export const symbols = mysqlTable("symbols", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(), // visual, color, gesture, location, object
  description: text("description"),
  culturalMeaning: text("culturalMeaning"),
  emotionalAssociations: json("emotionalAssociations").$type<string[]>().default([]),
  linkedThemes: json("linkedThemes").$type<string[]>().default([]),
  colorHex: varchar("colorHex", { length: 16 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Symbol = typeof symbols.$inferSelect;

// Notes — collaborative annotations on tracks
export const notes = mysqlTable("notes", {
  id: int("id").autoincrement().primaryKey(),
  trackId: int("trackId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  noteType: mysqlEnum("noteType", ["interpretation", "connection", "expansion", "question"]).default("interpretation").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;

// Mythology entries — AI-generated or user-created mythology content
export const mythologyEntries = mysqlTable("mythology_entries", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content").notNull(),
  entryType: mysqlEnum("entryType", ["connection", "arc", "suggestion", "analysis"]).default("analysis").notNull(),
  relatedTrackIds: json("relatedTrackIds").$type<number[]>().default([]),
  generatedByAI: boolean("generatedByAI").default(false).notNull(),
  userId: int("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MythologyEntry = typeof mythologyEntries.$inferSelect;
