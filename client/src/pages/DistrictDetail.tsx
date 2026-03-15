import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowLeft } from "lucide-react";

const DISTRICT_META: Record<string, {
  name: string; tagline: string; description: string;
  color: string; glow: string; border: string; arc: string;
  themes: string[]; symbols: string[];
}> = {
  "the-shadows": {
    name: "The Shadows", tagline: "Where the unseen watch the world perform",
    description: "The district of invisibility, judgment, and silent observation. Where the protagonist begins — unrecognized, overlooked, watching from the margins.",
    color: "#c084fc", glow: "rgba(192,132,252,0.08)", border: "rgba(192,132,252,0.2)", arc: "Invisible",
    themes: ["Invisibility", "Surveillance", "Loneliness", "Pre-performance tension"],
    symbols: ["Birds on wires", "Bandanas", "Shadows", "Bus stops"],
  },
  "the-stage": {
    name: "The Stage", tagline: "The city as theater, every street a runway",
    description: "The district of performance, spectacle, and charisma. Where invisibility transforms into presence — where the protagonist steps into the light.",
    color: "#00d4ff", glow: "rgba(0,212,255,0.08)", border: "rgba(0,212,255,0.2)", arc: "Performer",
    themes: ["Performance", "Spectacle", "Charisma", "Transformation"],
    symbols: ["Neon lights", "Mirrors", "Microphones", "Spotlights"],
  },
  "the-riot": {
    name: "The Riot", tagline: "When performance becomes resistance",
    description: "The district of social conflict, rebellion, and identity politics. Where performance collides with power — the crucible of the mythology.",
    color: "#ff6b6b", glow: "rgba(255,107,107,0.08)", border: "rgba(255,107,107,0.2)", arc: "Rebel",
    themes: ["Rebellion", "Social conflict", "Identity politics", "Queer resistance"],
    symbols: ["Broken glass", "Graffiti", "Raised fists", "Fire"],
  },
  "the-myth-district": {
    name: "The Myth District", tagline: "Where legends are made and mortals become gods",
    description: "The district of transformation, legend, and mythological ascension. Where the protagonist transcends the city itself — becoming iconic.",
    color: "#f0c040", glow: "rgba(240,192,64,0.08)", border: "rgba(240,192,64,0.2)", arc: "Myth",
    themes: ["Mythological ascension", "Transformation", "Legacy", "Cosmic identity"],
    symbols: ["Gold crowns", "Stars", "Phoenix imagery", "The sun"],
  },
};

export default function DistrictDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const meta = DISTRICT_META[slug];

  const { data: districtData } = trpc.districts.bySlug.useQuery({ slug }, { enabled: !!slug });
  const { data: tracksData, isLoading } = trpc.tracks.list.useQuery(
    { district: slug, limit: 174, offset: 0 },
    { enabled: !!slug }
  );

  const tracks = tracksData?.tracks ?? [];

  if (!meta) {
    return (
      <div className="p-8 text-center text-white/40">
        <p>District not found</p>
        <Link href="/districts" className="text-[#00d4ff] hover:underline mt-2 block">← Back to Districts</Link>
      </div>
    );
  }

  // Group by thematic cluster
  const byCluster: Record<string, typeof tracks> = {};
  for (const t of tracks) {
    const key = t.thematicCluster ?? "Uncategorized";
    if (!byCluster[key]) byCluster[key] = [];
    byCluster[key].push(t);
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Back */}
      <Link href="/districts">
        <button className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-8">
          <ArrowLeft size={14} /> All Districts
        </button>
      </Link>

      {/* Hero */}
      <div className="p-8 rounded-2xl mb-10"
        style={{ background: `linear-gradient(135deg, ${meta.glow}, rgba(255,255,255,0.01))`, border: `1px solid ${meta.border}` }}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-4 h-4 rounded-full" style={{ background: meta.color, boxShadow: `0 0 12px ${meta.color}60` }} />
              <span className="text-xs text-white/30 tracking-widest uppercase">{meta.arc} Arc</span>
            </div>
            <h1 className="font-display text-5xl font-bold mb-2" style={{ color: meta.color }}>{meta.name}</h1>
            <p className="text-white/50 italic mb-4">{meta.tagline}</p>
            <p className="text-white/40 text-sm leading-relaxed max-w-2xl">{meta.description}</p>
          </div>
          <div className="text-right ml-8">
            <div className="font-display text-5xl font-bold" style={{ color: meta.color }}>{tracks.length}</div>
            <div className="text-sm text-white/30">tracks</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          {meta.themes.map(t => (
            <span key={t} className="text-xs px-3 py-1 rounded-full"
              style={{ color: meta.color, background: `${meta.color}10`, border: `1px solid ${meta.color}25` }}>
              {t}
            </span>
          ))}
          {meta.symbols.map(s => (
            <span key={s} className="text-xs px-3 py-1 rounded-full text-white/35"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Tracks by cluster */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(byCluster).map(([cluster, clusterTracks]) => (
            <div key={cluster}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-5 rounded-full" style={{ background: meta.color }} />
                <h2 className="font-display text-lg font-semibold text-white">{cluster}</h2>
                <span className="text-xs text-white/25">{clusterTracks.length} tracks</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {clusterTracks.map(track => (
                  <Link key={track.id} href={`/track/${track.id}`}>
                    <div className="track-card p-4 rounded-xl"
                      style={{ background: `${meta.color}08`, border: `1px solid ${meta.color}15` }}>
                      <div className="font-mono-custom text-[10px] text-white/25 mb-2">
                        #{track.number.toString().padStart(3, "0")}
                      </div>
                      <h3 className="font-display font-semibold text-white text-sm leading-tight mb-2 line-clamp-2">
                        {track.title}
                      </h3>
                      <span className="text-[9px] text-white/25 capitalize">{track.type}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
