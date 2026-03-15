import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Search, Filter, Grid3X3, List, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DISTRICT_COLORS: Record<number, { label: string; color: string; cls: string }> = {
  1: { label: "The Shadows", color: "#c084fc", cls: "district-shadows" },
  2: { label: "The Stage", color: "#00d4ff", cls: "district-stage" },
  3: { label: "The Riot", color: "#ff6b6b", cls: "district-riot" },
  4: { label: "The Myth District", color: "#f0c040", cls: "district-myth" },
};

const ARC_COLORS: Record<string, string> = {
  "Invisible": "#c084fc",
  "Performer": "#00d4ff",
  "Rebel": "#ff6b6b",
  "Myth": "#f0c040",
};

export default function Archive() {
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("all");
  const [arc, setArc] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [limit] = useState(174);

  const { data, isLoading } = trpc.tracks.list.useQuery({
    search: search || undefined,
    district: district !== "all" ? district : undefined,
    arc: arc !== "all" ? arc : undefined,
    limit,
    offset: 0,
  });

  const tracks = data?.tracks ?? [];

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs text-white/30 tracking-widest uppercase mb-2">City Cycle Universe</div>
        <h1 className="font-display text-4xl font-bold text-white mb-2">Archive</h1>
        <p className="text-white/40 text-sm">
          {data?.total ?? 0} tracklist items — the complete mythology database
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <Input
            placeholder="Search tracks, themes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 text-sm"
          />
        </div>

        <Select value={district} onValueChange={setDistrict}>
          <SelectTrigger className="w-44 bg-white/[0.04] border-white/[0.08] text-white/70 text-sm">
            <SelectValue placeholder="All Districts" />
          </SelectTrigger>
          <SelectContent className="bg-[#0d0820] border-white/[0.08]">
            <SelectItem value="all" className="text-white/70">All Districts</SelectItem>
            <SelectItem value="the-shadows" className="text-[#c084fc]">The Shadows</SelectItem>
            <SelectItem value="the-stage" className="text-[#00d4ff]">The Stage</SelectItem>
            <SelectItem value="the-riot" className="text-[#ff6b6b]">The Riot</SelectItem>
            <SelectItem value="the-myth-district" className="text-[#f0c040]">The Myth District</SelectItem>
          </SelectContent>
        </Select>

        <Select value={arc} onValueChange={setArc}>
          <SelectTrigger className="w-40 bg-white/[0.04] border-white/[0.08] text-white/70 text-sm">
            <SelectValue placeholder="All Arcs" />
          </SelectTrigger>
          <SelectContent className="bg-[#0d0820] border-white/[0.08]">
            <SelectItem value="all" className="text-white/70">All Arcs</SelectItem>
            <SelectItem value="Invisible" className="text-[#c084fc]">Invisible</SelectItem>
            <SelectItem value="Performer" className="text-[#00d4ff]">Performer</SelectItem>
            <SelectItem value="Rebel" className="text-[#ff6b6b]">Rebel</SelectItem>
            <SelectItem value="Myth" className="text-[#f0c040]">Myth</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-1 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
          >
            <Grid3X3 size={14} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3" : "space-y-2"}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      )}

      {/* Grid view */}
      {!isLoading && viewMode === "grid" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {tracks.map((track) => {
            const distInfo = DISTRICT_COLORS[track.districtId ?? 0];
            const arcColor = ARC_COLORS[track.narrativeArc ?? ""] ?? "#ffffff";
            return (
              <Link key={track.id} href={`/track/${track.id}`}>
                <div className="track-card p-4 rounded-xl glass" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-mono-custom text-[10px] text-white/25">#{track.number.toString().padStart(3, "0")}</span>
                    {distInfo && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${distInfo.cls}`}>
                        {distInfo.label.split(" ")[1] ?? distInfo.label}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-semibold text-white text-sm leading-tight mb-3 line-clamp-2">
                    {track.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{ color: arcColor, background: `${arcColor}15`, border: `1px solid ${arcColor}30` }}>
                      {track.narrativeArc}
                    </span>
                    <span className="text-[9px] text-white/25 capitalize">{track.type}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* List view */}
      {!isLoading && viewMode === "list" && (
        <div className="space-y-1">
          {tracks.map((track) => {
            const distInfo = DISTRICT_COLORS[track.districtId ?? 0];
            const arcColor = ARC_COLORS[track.narrativeArc ?? ""] ?? "#ffffff";
            return (
              <Link key={track.id} href={`/track/${track.id}`}>
                <div className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all hover:bg-white/[0.04] group"
                  style={{ border: "1px solid transparent" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(0,212,255,0.15)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}>
                  <span className="font-mono-custom text-xs text-white/25 w-10 flex-shrink-0">#{track.number.toString().padStart(3, "0")}</span>
                  <span className="font-display font-semibold text-white text-sm flex-1 truncate group-hover:text-[#00d4ff] transition-colors">{track.title}</span>
                  {distInfo && (
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${distInfo.cls}`}>
                      {distInfo.label}
                    </span>
                  )}
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ color: arcColor, background: `${arcColor}15`, border: `1px solid ${arcColor}30` }}>
                    {track.narrativeArc}
                  </span>
                  <span className="text-xs text-white/25 flex-shrink-0 w-24 truncate">{track.thematicCluster}</span>
                  <span className="text-[10px] text-white/20 capitalize flex-shrink-0">{track.type}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!isLoading && tracks.length === 0 && (
        <div className="text-center py-20 text-white/30">
          <p className="text-lg mb-2">No tracks found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
