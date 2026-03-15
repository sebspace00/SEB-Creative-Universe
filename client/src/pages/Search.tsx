import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Search as SearchIcon, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";

const DISTRICT_COLORS: Record<number, string> = { 1: "#c084fc", 2: "#00d4ff", 3: "#ff6b6b", 4: "#f0c040" };
const DISTRICT_NAMES: Record<number, string> = { 1: "The Shadows", 2: "The Stage", 3: "The Riot", 4: "The Myth District" };
const ARC_COLORS: Record<string, string> = { "Invisible": "#c084fc", "Performer": "#00d4ff", "Rebel": "#ff6b6b", "Myth": "#f0c040" };

const QUICK_SEARCHES = [
  "performance", "queer", "mirror", "bandana", "invisible", "riot",
  "transformation", "myth", "neon", "rebellion", "identity", "legend"
];

export default function Search() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const { data, isLoading } = trpc.search.query.useQuery(
    { q: submitted },
    { enabled: submitted.length > 0 }
  );

  const handleSearch = (q: string) => {
    setQuery(q);
    setSubmitted(q);
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="mb-10">
        <div className="text-xs text-white/30 tracking-widest uppercase mb-2">City Cycle Universe</div>
        <h1 className="font-display text-4xl font-bold text-white mb-2">Search</h1>
        <p className="text-white/40 text-sm">Find tracks, themes, symbols, and narrative connections</p>
      </div>

      {/* Search input */}
      <div className="max-w-2xl mb-8">
        <div className="relative">
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <Input
            placeholder="Search the City Cycle universe..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
            className="pl-12 pr-4 py-4 text-base bg-white/[0.04] border-white/[0.1] text-white placeholder:text-white/25 rounded-2xl h-14 focus:border-[#00d4ff]/40"
          />
          {query && (
            <button
              onClick={() => handleSearch(query)}
              className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#050510] transition-all"
              style={{ background: "linear-gradient(135deg, #00d4ff, #7c3aed)" }}
            >
              Search
            </button>
          )}
        </div>
      </div>

      {/* Quick searches */}
      {!submitted && (
        <div className="mb-10">
          <div className="text-xs text-white/25 tracking-widest uppercase mb-3">Quick Searches</div>
          <div className="flex flex-wrap gap-2">
            {QUICK_SEARCHES.map(q => (
              <button
                key={q}
                onClick={() => handleSearch(q)}
                className="px-3 py-1.5 rounded-full text-sm text-white/40 hover:text-white/70 transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      )}

      {/* Results */}
      {submitted && !isLoading && data && (
        <div>
          <div className="text-sm text-white/30 mb-6">
            Found <span className="text-white/60 font-medium">{(data.tracks?.length ?? 0) + (data.symbols?.length ?? 0)}</span> results for "{submitted}"
          </div>

          {/* Track results */}
          {(data.tracks?.length ?? 0) > 0 && (
            <div className="mb-8">
              <div className="text-xs text-white/25 tracking-widest uppercase mb-4">Tracks ({data.tracks?.length})</div>
              <div className="space-y-2">
                {data.tracks?.map(track => {
                  const distColor = DISTRICT_COLORS[track.districtId ?? 0] ?? "#ffffff";
                  const arcColor = ARC_COLORS[track.narrativeArc ?? ""] ?? "#ffffff";
                  return (
                    <Link key={track.id} href={`/track/${track.id}`}>
                      <div className="flex items-center gap-4 px-5 py-4 rounded-xl cursor-pointer transition-all hover:bg-white/[0.04] group"
                        style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(0,212,255,0.15)")}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)")}>
                        <span className="font-mono-custom text-xs text-white/25 w-10 flex-shrink-0">
                          #{track.number.toString().padStart(3, "0")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-display font-semibold text-white text-sm group-hover:text-[#00d4ff] transition-colors truncate">
                            {track.title}
                          </div>
                          {track.description && (
                            <div className="text-xs text-white/30 truncate mt-0.5">{track.description}</div>
                          )}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ color: distColor, background: `${distColor}12`, border: `1px solid ${distColor}25` }}>
                          {DISTRICT_NAMES[track.districtId ?? 0]}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ color: arcColor, background: `${arcColor}12`, border: `1px solid ${arcColor}25` }}>
                          {track.narrativeArc}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Symbol results */}
          {(data.symbols?.length ?? 0) > 0 && (
            <div>
              <div className="text-xs text-white/25 tracking-widest uppercase mb-4">Symbols ({data.symbols?.length})</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.symbols?.map(symbol => (
                  <Link key={symbol.id} href="/symbols">
                    <div className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all hover:bg-white/[0.04]"
                      style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                      <BookOpen size={16} className="text-white/30 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-display font-semibold text-white text-sm mb-1">{symbol.name}</div>
                        {symbol.description && (
                          <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{symbol.description}</p>
                        )}
                        <span className="text-[9px] text-white/25 capitalize mt-1 block">{symbol.category}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(data.tracks?.length ?? 0) === 0 && (data.symbols?.length ?? 0) === 0 && (
            <div className="text-center py-16 text-white/30">
              <SearchIcon size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-lg mb-1">No results found</p>
              <p className="text-sm">Try different keywords or browse the Archive</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
