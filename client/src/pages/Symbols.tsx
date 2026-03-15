import { useState } from "react";
import { trpc } from "@/lib/trpc";

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  visual: { color: "#00d4ff", bg: "rgba(0,212,255,0.08)" },
  color: { color: "#f0c040", bg: "rgba(240,192,64,0.08)" },
  gesture: { color: "#c084fc", bg: "rgba(192,132,252,0.08)" },
  location: { color: "#ff6b6b", bg: "rgba(255,107,107,0.08)" },
  object: { color: "#9b59b6", bg: "rgba(155,89,182,0.08)" },
};

const COLOR_MEANINGS = [
  { name: "Purple / Mauve / Violet", hex: "#9b59b6", meaning: "Queer identity, royalty, spiritual transformation, the liminal space between masculine and feminine. The color of the Myth District and the protagonist's inner world." },
  { name: "Teal / Cyan / Neon Blue", hex: "#00d4ff", meaning: "The Stage energy — performance, electricity, the artificial light of the city. The color of visibility, of being seen under neon." },
  { name: "Gold / Amber", hex: "#f0c040", meaning: "Mythological ascension, legacy, the sun. The color of the Myth District — what you become when the city can no longer contain you." },
  { name: "Red / Coral", hex: "#ff6b6b", meaning: "The Riot — anger, passion, resistance, blood. The color of confrontation and the refusal to be invisible." },
  { name: "Black / Void", hex: "#1a1a2e", meaning: "The Shadows — the space before performance, the night, the unseen. Not emptiness but potential." },
  { name: "White / Silver", hex: "#e8e8f0", meaning: "Clarity, exposure, the moment of revelation. The spotlight. What happens when the shadow is removed." },
];

export default function Symbols() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { data: symbols, isLoading } = trpc.symbols.list.useQuery({ category: activeCategory ?? undefined });

  const categories = ["visual", "color", "gesture", "location", "object"];

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs text-white/30 tracking-widest uppercase mb-2">City Cycle Universe</div>
        <h1 className="font-display text-4xl font-bold text-white mb-2">Symbolism Library</h1>
        <p className="text-white/40 text-sm max-w-xl leading-relaxed">
          The visual language of the City Cycle universe — every symbol, color, gesture, and location carries meaning that threads through the mythology.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 rounded-full text-sm transition-all ${!activeCategory ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        >
          All Symbols
        </button>
        {categories.map(cat => {
          const cfg = CATEGORY_COLORS[cat] ?? { color: "#ffffff", bg: "rgba(255,255,255,0.06)" };
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className="px-4 py-2 rounded-full text-sm capitalize transition-all"
              style={{
                color: activeCategory === cat ? cfg.color : "rgba(255,255,255,0.4)",
                background: activeCategory === cat ? cfg.bg : "transparent",
                border: `1px solid ${activeCategory === cat ? cfg.color + "40" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Symbols grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {(symbols ?? []).map(symbol => {
            const cfg = CATEGORY_COLORS[symbol.category] ?? { color: "#ffffff", bg: "rgba(255,255,255,0.04)" };
            return (
              <div key={symbol.id} className="p-6 rounded-2xl transition-all hover:scale-[1.01]"
                style={{ background: cfg.bg, border: `1px solid ${cfg.color}20` }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    {symbol.colorHex && (
                      <div className="w-8 h-8 rounded-lg mb-3 border border-white/10"
                        style={{ background: symbol.colorHex }} />
                    )}
                    <h3 className="font-display font-bold text-white text-lg">{symbol.name}</h3>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full capitalize"
                    style={{ color: cfg.color, background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                    {symbol.category}
                  </span>
                </div>

                {symbol.description && (
                  <p className="text-sm text-white/50 leading-relaxed mb-3">{symbol.description}</p>
                )}

                {symbol.culturalMeaning && (
                  <div className="mb-3">
                    <div className="text-[9px] text-white/25 tracking-widest uppercase mb-1">Cultural Meaning</div>
                    <p className="text-xs text-white/40 leading-relaxed">{symbol.culturalMeaning}</p>
                  </div>
                )}

                {Array.isArray(symbol.emotionalAssociations) && symbol.emotionalAssociations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(symbol.emotionalAssociations as string[]).map((tag: string) => (
                      <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full text-white/35"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Color System */}
      <div className="mb-12">
        <div className="text-xs text-white/30 tracking-widest uppercase mb-6">Color Symbolism System</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {COLOR_MEANINGS.map(c => (
            <div key={c.name} className="p-5 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl border border-white/10" style={{ background: c.hex }} />
                <h3 className="font-display font-semibold text-white text-sm">{c.name}</h3>
              </div>
              <p className="text-xs text-white/45 leading-relaxed">{c.meaning}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key motifs */}
      <div className="p-6 rounded-2xl" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}>
        <div className="text-xs text-white/30 tracking-widest uppercase mb-4">Recurring Motifs</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { motif: "The Bus Stop Loop", meaning: "Cyclical oppression — the same route, the same invisibility, the performance that never ends. The bus stop is where the protagonist waits to be seen." },
            { motif: "The Mirror", meaning: "Self-recognition vs. external recognition. The mirror is both the protagonist's ally (self-affirmation) and enemy (the city's judgment reflected back)." },
            { motif: "The Bandana", meaning: "Queer coding, community, resistance. A gesture that signals belonging to those who know, invisibility to those who don't." },
            { motif: "Birds on Wires", meaning: "Observation from above, the watched and the watcher. Freedom constrained by the city's infrastructure. The audience before the performance begins." },
          ].map(m => (
            <div key={m.motif} className="flex gap-3">
              <div className="w-1 flex-shrink-0 rounded-full mt-1" style={{ background: "rgba(124,58,237,0.6)" }} />
              <div>
                <div className="font-display font-semibold text-white text-sm mb-1">{m.motif}</div>
                <p className="text-xs text-white/40 leading-relaxed">{m.meaning}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
