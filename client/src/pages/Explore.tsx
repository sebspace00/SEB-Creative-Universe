import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Layers, Zap, Heart, Star } from "lucide-react";

const CLUSTERS = [
  "The Shadows", "The Stage", "The Riot", "The Myth District",
  "Identity Paradox", "Social Commentary", "Emotional Depth", "Queer Identity"
];

const ARCS = ["Invisible", "Performer", "Rebel", "Myth"];

const ARC_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  "Invisible": { color: "#c084fc", bg: "rgba(192,132,252,0.08)", border: "rgba(192,132,252,0.2)" },
  "Performer": { color: "#00d4ff", bg: "rgba(0,212,255,0.08)", border: "rgba(0,212,255,0.2)" },
  "Rebel": { color: "#ff6b6b", bg: "rgba(255,107,107,0.08)", border: "rgba(255,107,107,0.2)" },
  "Myth": { color: "#f0c040", bg: "rgba(240,192,64,0.08)", border: "rgba(240,192,64,0.2)" },
};

const DISTRICT_CONFIG: Record<number, { color: string; bg: string }> = {
  1: { color: "#c084fc", bg: "rgba(192,132,252,0.06)" },
  2: { color: "#00d4ff", bg: "rgba(0,212,255,0.06)" },
  3: { color: "#ff6b6b", bg: "rgba(255,107,107,0.06)" },
  4: { color: "#f0c040", bg: "rgba(240,192,64,0.06)" },
};

export default function Explore() {
  const [activeArc, setActiveArc] = useState<string | null>(null);
  const [activeCluster, setActiveCluster] = useState<string | null>(null);

  const { data, isLoading } = trpc.tracks.list.useQuery({
    arc: activeArc ?? undefined,
    cluster: activeCluster ?? undefined,
    limit: 174,
    offset: 0,
  });

  const tracks = data?.tracks ?? [];

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs text-white/30 tracking-widest uppercase mb-2">Visual Discovery</div>
        <h1 className="font-display text-4xl font-bold text-white mb-2">Explore</h1>
        <p className="text-white/40 text-sm">Browse the universe by arc, cluster, and emotional tone</p>
      </div>

      {/* Arc filter */}
      <div className="mb-6">
        <div className="text-xs text-white/30 tracking-widest uppercase mb-3">Narrative Arc</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveArc(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!activeArc ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
            style={!activeArc ? { border: "1px solid rgba(255,255,255,0.2)" } : { border: "1px solid rgba(255,255,255,0.06)" }}
          >
            All Arcs
          </button>
          {ARCS.map((arc) => {
            const cfg = ARC_CONFIG[arc];
            const isActive = activeArc === arc;
            return (
              <button
                key={arc}
                onClick={() => setActiveArc(isActive ? null : arc)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  color: isActive ? cfg.color : "rgba(255,255,255,0.4)",
                  background: isActive ? cfg.bg : "transparent",
                  border: `1px solid ${isActive ? cfg.border : "rgba(255,255,255,0.06)"}`,
                }}
              >
                {arc}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cluster filter */}
      <div className="mb-8">
        <div className="text-xs text-white/30 tracking-widest uppercase mb-3">Thematic Cluster</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCluster(null)}
            className={`px-3 py-1.5 rounded-full text-xs transition-all ${!activeCluster ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
            style={!activeCluster ? { border: "1px solid rgba(255,255,255,0.15)" } : { border: "1px solid rgba(255,255,255,0.06)" }}
          >
            All
          </button>
          {CLUSTERS.map((cluster) => (
            <button
              key={cluster}
              onClick={() => setActiveCluster(activeCluster === cluster ? null : cluster)}
              className="px-3 py-1.5 rounded-full text-xs transition-all"
              style={{
                color: activeCluster === cluster ? "#00d4ff" : "rgba(255,255,255,0.35)",
                background: activeCluster === cluster ? "rgba(0,212,255,0.08)" : "transparent",
                border: `1px solid ${activeCluster === cluster ? "rgba(0,212,255,0.25)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              {cluster}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="mb-6 text-sm text-white/30">
        Showing <span className="text-white/60 font-medium">{tracks.length}</span> items
        {(activeArc || activeCluster) && (
          <button
            onClick={() => { setActiveArc(null); setActiveCluster(null); }}
            className="ml-3 text-[#00d4ff] hover:underline text-xs"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      )}

      {/* Masonry-style grid */}
      {!isLoading && (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {tracks.map((track, idx) => {
            const arcCfg = ARC_CONFIG[track.narrativeArc ?? ""] ?? { color: "#ffffff", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)" };
            const distCfg = DISTRICT_CONFIG[track.districtId ?? 0] ?? { color: "#ffffff", bg: "rgba(255,255,255,0.04)" };
            const isLarge = idx % 7 === 0 || idx % 11 === 0;

            return (
              <Link key={track.id} href={`/track/${track.id}`}>
                <div
                  className="break-inside-avoid mb-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] group"
                  style={{
                    background: `linear-gradient(135deg, ${distCfg.bg}, rgba(255,255,255,0.02))`,
                    border: `1px solid ${arcCfg.border}`,
                    minHeight: isLarge ? "200px" : "140px",
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-mono-custom text-[10px] text-white/25">#{track.number.toString().padStart(3, "0")}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                      style={{ color: arcCfg.color, background: arcCfg.bg, border: `1px solid ${arcCfg.border}` }}>
                      {track.narrativeArc}
                    </span>
                  </div>

                  <h3 className={`font-display font-bold text-white leading-tight mb-3 group-hover:text-opacity-90 transition-colors ${isLarge ? "text-xl" : "text-base"}`}
                    style={{ textShadow: `0 0 30px ${arcCfg.color}30` }}>
                    {track.title}
                  </h3>

                  {isLarge && track.description && (
                    <p className="text-xs text-white/40 leading-relaxed mb-3 line-clamp-3">{track.description}</p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {track.thematicCluster && (
                      <span className="text-[9px] text-white/30 px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        {track.thematicCluster}
                      </span>
                    )}
                    <span className="text-[9px] text-white/20 capitalize">{track.type}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
