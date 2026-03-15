import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { tracks, districts, symbols, connections, notes, mythologyEntries } from "../drizzle/schema";
import { eq, like, or, and, inArray, desc, asc, sql } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

// ─── TRACKS ROUTER ────────────────────────────────────────────────────────────
const tracksRouter = router({
  list: publicProcedure
    .input(z.object({
      district: z.string().optional(),
      cluster: z.string().optional(),
      arc: z.string().optional(),
      type: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { tracks: [], total: 0 };

      const conditions = [];
      if (input.district) {
        const districtRow = await db.select().from(districts).where(eq(districts.slug, input.district)).limit(1);
        if (districtRow[0]) conditions.push(eq(tracks.districtId, districtRow[0].id));
      }
      if (input.cluster) conditions.push(eq(tracks.thematicCluster, input.cluster));
      if (input.arc) conditions.push(eq(tracks.narrativeArc, input.arc));
      if (input.type) conditions.push(eq(tracks.type, input.type as any));
      if (input.search) {
        conditions.push(or(
          like(tracks.title, `%${input.search}%`),
          like(tracks.description, `%${input.search}%`),
          like(tracks.thematicCluster, `%${input.search}%`)
        ));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const result = await db.select().from(tracks).where(where).orderBy(asc(tracks.number)).limit(input.limit).offset(input.offset);
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(tracks).where(where);
      return { tracks: result, total: countResult[0]?.count ?? 0 };
    }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(tracks).where(eq(tracks.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  byNumber: publicProcedure
    .input(z.object({ number: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(tracks).where(eq(tracks.number, input.number)).limit(1);
      return result[0] ?? null;
    }),

  stats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return {};
    const total = await db.select({ count: sql<number>`count(*)` }).from(tracks);
    const byDistrict = await db.select({
      districtId: tracks.districtId,
      count: sql<number>`count(*)`
    }).from(tracks).groupBy(tracks.districtId);
    const byArc = await db.select({
      arc: tracks.narrativeArc,
      count: sql<number>`count(*)`
    }).from(tracks).groupBy(tracks.narrativeArc);
    const byCluster = await db.select({
      cluster: tracks.thematicCluster,
      count: sql<number>`count(*)`
    }).from(tracks).groupBy(tracks.thematicCluster);
    return { total: total[0]?.count ?? 0, byDistrict, byArc, byCluster };
  }),
  add: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      districtSlug: z.string().optional(),
      narrativeArc: z.string().optional(),
      type: z.string().default("track"),
      thematicCluster: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      let districtId: number | null = null;
      if (input.districtSlug) {
        const d = await db.select().from(districts).where(eq(districts.slug, input.districtSlug)).limit(1);
        if (d[0]) districtId = d[0].id;
      }
      const maxNum = await db.select({ max: sql<number>`max(number)` }).from(tracks);
      const nextNum = (maxNum[0]?.max ?? 174) + 1;
      await db.insert(tracks).values({
        number: nextNum,
        title: input.title,
        description: input.description ?? null,
        districtId,
        narrativeArc: input.narrativeArc ?? null,
        type: (input.type ?? "track") as any,
        thematicCluster: input.thematicCluster ?? null,
        creativeStatus: "concept",
      });
      return { success: true };
    }),
});
// ─── DISTRICTS ROUTERR ─────────────────────────────────────────────────────────
const districtsRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(districts).orderBy(asc(districts.id));
  }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(districts).where(eq(districts.slug, input.slug)).limit(1);
      return result[0] ?? null;
    }),
});

// ─── SYMBOLS ROUTER ───────────────────────────────────────────────────────────
const symbolsRouter = router({
  list: publicProcedure
    .input(z.object({ category: z.string().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      if (input.category) {
        return db.select().from(symbols).where(eq(symbols.category, input.category));
      }
      return db.select().from(symbols).orderBy(asc(symbols.name));
    }),
});

// ─── CONNECTIONS ROUTER ───────────────────────────────────────────────────────
const connectionsRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(connections).orderBy(desc(connections.strength));
  }),

  forTrack: publicProcedure
    .input(z.object({ trackId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(connections).where(
        or(eq(connections.sourceId, input.trackId), eq(connections.targetId, input.trackId))
      );
    }),

  create: protectedProcedure
    .input(z.object({
      sourceId: z.number(),
      targetId: z.number(),
      connectionType: z.string(),
      strength: z.number().min(1).max(10).default(5),
      label: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.insert(connections).values({
        sourceId: input.sourceId,
        targetId: input.targetId,
        connectionType: input.connectionType,
        strength: input.strength,
        label: input.label,
        createdBy: ctx.user.id,
      });
      return { success: true };
    }),
});

// ─── NOTES ROUTER ─────────────────────────────────────────────────────────────
const notesRouter = router({
  forTrack: publicProcedure
    .input(z.object({ trackId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(notes).where(eq(notes.trackId, input.trackId)).orderBy(desc(notes.createdAt));
    }),

  create: protectedProcedure
    .input(z.object({
      trackId: z.number(),
      content: z.string().min(1),
      noteType: z.enum(["interpretation", "connection", "expansion", "question"]).default("interpretation"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.insert(notes).values({
        trackId: input.trackId,
        userId: ctx.user.id,
        content: input.content,
        noteType: input.noteType,
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(notes).where(and(eq(notes.id, input.id), eq(notes.userId, ctx.user.id)));
      return { success: true };
    }),
});

// ─── MYTHOLOGY ROUTER ─────────────────────────────────────────────────────────
const mythologyRouter = router({
  generateIdea: protectedProcedure
    .input(z.object({ prompt: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const systemPrompt = `You are the mythology engine for the City Cycle universe — a creative world built around the philosophy: "The city never sleeps because someone somewhere is always performing."
The universe has four districts: The Shadows (invisibility), The Stage (performance), The Riot (rebellion), The Myth District (transformation into legend).
The emotional arc is: Invisible → Performer → Rebel → Myth.
Key themes: queer identity, masculinity vs femininity tension, performance as survival, invisibility vs recognition.
Influences: Beyoncé, David Bowie, Grace Jones, Now You See Me, Loki.`;
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input.prompt },
        ],
      });
      const idea = typeof response.choices[0]?.message?.content === 'string' ? response.choices[0].message.content : "Unable to generate idea.";
      return { idea };
    }),
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(mythologyEntries).orderBy(desc(mythologyEntries.createdAt)).limit(20);
  }),

  generate: protectedProcedure
    .input(z.object({
      trackIds: z.array(z.number()).min(1).max(10),
      prompt: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const selectedTracks = await db.select().from(tracks).where(inArray(tracks.id, input.trackIds));
      const trackSummary = selectedTracks.map(t =>
        `#${t.number} "${t.title}" — District: ${t.districtId === 1 ? "The Shadows" : t.districtId === 2 ? "The Stage" : t.districtId === 3 ? "The Riot" : "The Myth District"}, Arc: ${t.narrativeArc}, Cluster: ${t.thematicCluster}. ${t.description}`
      ).join("\n\n");

      const systemPrompt = `You are the mythology engine for the City Cycle universe — a creative world built around the philosophy: "The city never sleeps because someone somewhere is always performing."

The universe has four districts:
- The Shadows: invisibility, judgment, observation
- The Stage: performance, spectacle, charisma  
- The Riot: social conflict, rebellion, identity politics
- The Myth District: transformation into legend

The emotional arc is: Invisible → Performer → Rebel → Myth

Key themes: queer identity, masculinity vs femininity tension, performance as survival, invisibility vs recognition, transformation from outsider to myth.

Influences: Beyoncé, David Bowie, Grace Jones, Now You See Me, Loki.

Your role is to analyze the selected tracks and generate rich mythological connections, narrative arcs, and thematic insights that expand the City Cycle universe.`;

      const userPrompt = `Analyze these tracks from the City Cycle universe and generate a mythology entry that reveals their hidden connections, shared themes, and narrative significance:

${trackSummary}

${input.prompt ? `Additional focus: ${input.prompt}` : ""}

Generate a rich, poetic mythology entry (300-500 words) that:
1. Reveals the hidden thematic connections between these tracks
2. Identifies what narrative arc they collectively form
3. Suggests how they contribute to the City Cycle mythology
4. Proposes new creative directions they could inspire`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const content = typeof response.choices[0]?.message?.content === 'string' ? response.choices[0].message.content : "Unable to generate mythology entry.";
      const title = `Mythology: ${selectedTracks.map(t => t.title.slice(0, 20)).join(" × ")}`;

      await db.insert(mythologyEntries).values({
        title,
        content,
        entryType: "analysis",
        relatedTrackIds: input.trackIds,
        generatedByAI: true,
        userId: ctx.user.id,
      });

      return { title, content };
    }),

  suggest: publicProcedure
    .input(z.object({ district: z.string().optional(), arc: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const systemPrompt = `You are a creative consultant for the City Cycle universe — a mythology built around 174 tracklist items exploring queer identity, performance, and urban mythology. The core philosophy: "The city never sleeps because someone somewhere is always performing."`;

      const userPrompt = `Generate 5 new creative ideas for the City Cycle universe${input.district ? ` specifically for the "${input.district}" district` : ""}${input.arc ? ` and the "${input.arc}" narrative arc` : ""}.

Each idea should be:
- A potential new track title with a brief description
- Rooted in the universe's themes (queer identity, performance, visibility, transformation)
- Inspired by the existing mythology

Format as a JSON array: [{"title": "...", "description": "...", "district": "...", "arc": "..."}]`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "suggestions",
            strict: true,
            schema: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      district: { type: "string" },
                      arc: { type: "string" },
                    },
                    required: ["title", "description", "district", "arc"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["suggestions"],
              additionalProperties: false,
            },
          },
        },
      });

      const raw = typeof response.choices[0]?.message?.content === 'string' ? response.choices[0].message.content : '{"suggestions":[]}';
      try {
        const parsed = JSON.parse(raw);
        return parsed.suggestions ?? [];
      } catch {
        return [];
      }
    }),
});

// ─── SEARCH ROUTER ────────────────────────────────────────────────────────────
const searchRouter = router({
  query: publicProcedure
    .input(z.object({ q: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { tracks: [], symbols: [] };

      const trackResults = await db.select().from(tracks).where(
        or(
          like(tracks.title, `%${input.q}%`),
          like(tracks.description, `%${input.q}%`),
          like(tracks.thematicCluster, `%${input.q}%`),
          like(tracks.narrativeArc, `%${input.q}%`),
          like(tracks.narrativePotential, `%${input.q}%`)
        )
      ).limit(20);

      const symbolResults = await db.select().from(symbols).where(
        or(
          like(symbols.name, `%${input.q}%`),
          like(symbols.description, `%${input.q}%`)
        )
      ).limit(5);

      return { tracks: trackResults, symbols: symbolResults };
    }),
});

// ─── EXPORT ROUTER ────────────────────────────────────────────────────────────
const exportRouter = router({
  brief: publicProcedure
    .input(z.object({ trackIds: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const selectedTracks = await db.select().from(tracks).where(inArray(tracks.id, input.trackIds));
      const allDistricts = await db.select().from(districts);

      const districtMap = Object.fromEntries(allDistricts.map(d => [d.id, d.name]));

      let brief = `# City Cycle Universe — Creative Brief\n\n`;
      brief += `**Generated:** ${new Date().toLocaleDateString()}\n`;
      brief += `**Selected Tracks:** ${selectedTracks.length}\n\n`;
      brief += `---\n\n`;

      const byDistrict: Record<string, typeof selectedTracks> = {};
      for (const t of selectedTracks) {
        const dName = districtMap[t.districtId ?? 0] ?? "Unknown";
        if (!byDistrict[dName]) byDistrict[dName] = [];
        byDistrict[dName].push(t);
      }

      for (const [district, dTracks] of Object.entries(byDistrict)) {
        brief += `## ${district}\n\n`;
        for (const t of dTracks) {
          brief += `### ${t.number}. ${t.title}\n`;
          brief += `**Arc:** ${t.narrativeArc} | **Cluster:** ${t.thematicCluster} | **Type:** ${t.type}\n\n`;
          if (t.description) brief += `${t.description}\n\n`;
          if (t.narrativePotential) brief += `*Narrative Potential:* ${t.narrativePotential}\n\n`;
        }
      }

      return { content: brief };
    }),
});

// ─── APP ROUTER ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  tracks: tracksRouter,
  districts: districtsRouter,
  symbols: symbolsRouter,
  connections: connectionsRouter,
  notes: notesRouter,
  mythology: mythologyRouter,
  search: searchRouter,
  export: exportRouter,
});

export type AppRouter = typeof appRouter;
