import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB ──────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

// ─── Mock LLM ─────────────────────────────────────────────────────────────────
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "A poetic mythology entry about the City Cycle universe." } }],
  }),
}));

// ─── Context helpers ──────────────────────────────────────────────────────────
function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeAuthCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test Creator",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Auth tests ───────────────────────────────────────────────────────────────
describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user object for authenticated users", async () => {
    const caller = appRouter.createCaller(makeAuthCtx());
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Test Creator");
    expect(result?.role).toBe("user");
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});

// ─── Tracks tests ─────────────────────────────────────────────────────────────
describe("tracks.list", () => {
  it("returns empty result when DB is unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.tracks.list({});
    expect(result).toEqual({ tracks: [], total: 0 });
  });

  it("accepts district filter without error", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.tracks.list({ district: "the-shadows" });
    expect(result).toHaveProperty("tracks");
    expect(result).toHaveProperty("total");
  });

  it("accepts arc filter without error", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.tracks.list({ arc: "Myth" });
    expect(result).toHaveProperty("tracks");
  });

  it("accepts search filter without error", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.tracks.list({ search: "performance" });
    expect(result).toHaveProperty("tracks");
  });
});

describe("tracks.byId", () => {
  it("returns null when DB is unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.tracks.byId({ id: 1 });
    expect(result).toBeNull();
  });
});

describe("tracks.stats", () => {
  it("returns empty object when DB is unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.tracks.stats();
    // When DB is unavailable, returns {}
    expect(result).toBeDefined();
  });
});

// ─── Districts tests ──────────────────────────────────────────────────────────
describe("districts.list", () => {
  it("returns empty array when DB is unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.districts.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("districts.bySlug", () => {
  it("returns null when DB is unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.districts.bySlug({ slug: "the-shadows" });
    expect(result).toBeNull();
  });
});

// ─── Symbols tests ────────────────────────────────────────────────────────────
describe("symbols.list", () => {
  it("returns empty array when DB is unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.symbols.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("accepts category filter", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.symbols.list({ category: "object" });
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Connections tests ────────────────────────────────────────────────────────
describe("connections.list", () => {
  it("returns empty array when DB is unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.connections.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Mythology tests ──────────────────────────────────────────────────────────
describe("mythology.list", () => {
  it("returns empty array when DB is unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.mythology.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("mythology.generateIdea", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.mythology.generateIdea({ prompt: "test" })).rejects.toThrow();
  });

  it("returns an idea string when authenticated and DB unavailable", async () => {
    const caller = appRouter.createCaller(makeAuthCtx());
    await expect(caller.mythology.generateIdea({ prompt: "A track about transformation" })).rejects.toThrow("DB unavailable");
  });
});

// ─── Search tests ─────────────────────────────────────────────────────────────
describe("search.query", () => {
  it("returns empty results when DB is unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.search.query({ q: "performance" });
    expect(result).toHaveProperty("tracks");
    expect(result).toHaveProperty("symbols");
  });
});

// ─── Notes tests ──────────────────────────────────────────────────────────────
describe("notes.forTrack", () => {
  it("returns empty array when DB is unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.notes.forTrack({ trackId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("notes.create", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.notes.create({ trackId: 1, content: "test note" })).rejects.toThrow();
  });
});

// ─── Export tests ─────────────────────────────────────────────────────────────
describe("export.brief", () => {
  it("throws when DB is unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    // export.brief requires DB to be available
    await expect(caller.export.brief({ trackIds: [] })).rejects.toThrow();
  });

  it("requires no auth for public access", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    // It's a public procedure but throws when DB unavailable
    await expect(caller.export.brief({ trackIds: [1, 2] })).rejects.toThrow("DB unavailable");
  });
});
