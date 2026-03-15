import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowRight } from "lucide-react";

const DISTRICT_META = [
  {
    slug: "the-shadows",
    name: "The Shadows",
    tagline: "Where the unseen watch the world perform",
    description: "The Shadows is the district of invisibility, judgment, and silent observation. It is where the protagonist begins — unrecognized, overlooked, watching from the margins. This is the space of waiting, of being seen without being acknowledged, of existing in the peripheral vision of a city that never looks directly at you.",
    themes: ["Invisibility", "Surveillance", "Loneliness", "Pre-performance tension", "Queer concealment"],
    symbols: ["Birds on wires", "Bandanas", "Shadows on walls", "Bus stops at night"],
    color: "#c084fc",
    glow: "rgba(192,132,252,0.12)",
    border: "rgba(192,132,252,0.2)",
    arc: "Invisible",
    id: 1,
  },
  {
    slug: "the-stage",
    name: "The Stage",
    tagline: "The city as theater, every street a runway",
    description: "The Stage is the district of performance, spectacle, and charisma. It is where invisibility transforms into presence — where the protagonist steps into the light and commands attention. Every surface is a mirror, every crowd an audience. The Stage is not just a place but a state of being: the moment you decide to be seen.",
    themes: ["Performance", "Spectacle", "Charisma", "Transformation", "The male gaze subverted"],
    symbols: ["Neon lights", "Mirrors", "Microphones", "Spotlights", "Costumes"],
    color: "#00d4ff",
    glow: "rgba(0,212,255,0.1)",
    border: "rgba(0,212,255,0.2)",
    arc: "Performer",
    id: 2,
  },
  {
    slug: "the-riot",
    name: "The Riot",
    tagline: "When performance becomes resistance",
    description: "The Riot is the district of social conflict, rebellion, and identity politics. It is where performance collides with power — where the act of being visible becomes inherently political. The Riot is the moment the city pushes back, and the protagonist must decide whether to retreat or escalate. It is the crucible of the mythology.",
    themes: ["Rebellion", "Social conflict", "Identity politics", "Queer resistance", "Masculinity vs femininity"],
    symbols: ["Broken glass", "Graffiti", "Raised fists", "Fire", "Police tape"],
    color: "#ff6b6b",
    glow: "rgba(255,107,107,0.1)",
    border: "rgba(255,107,107,0.2)",
    arc: "Rebel",
    id: 3,
  },
  {
    slug: "the-myth-district",
    name: "The Myth District",
    tagline: "Where legends are made and mortals become gods",
    description: "The Myth District is the district of transformation, legend, and mythological ascension. It is where the protagonist transcends the city itself — becoming not just visible but iconic, not just recognized but mythologized. The Myth District is the space beyond performance, where the act becomes the identity and the identity becomes the story.",
    themes: ["Mythological ascension", "Transformation", "Legacy", "Cosmic identity", "Becoming legend"],
    symbols: ["Gold crowns", "Stars", "Mirrors reflecting infinity", "Phoenix imagery", "The sun"],
    color: "#f0c040",
    glow: "rgba(240,192,64,0.1)",
    border: "rgba(240,192,64,0.2)",
    arc: "Myth",
    id: 4,
  },
];

export default function Districts() {
  const { data: stats } = trpc.tracks.stats.useQuery();

  const districtCounts = stats?.byDistrict ?? [];
  const countMap: Record<number, number> = {};
  for (const d of districtCounts) {
    if (d.districtId) countMap[d.districtId] = d.count;
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="text-xs text-white/30 tracking-widest uppercase mb-2">City Cycle Universe</div>
        <h1 className="font-display text-4xl font-bold text-white mb-3">The Four Districts</h1>
        <p className="text-white/40 text-sm max-w-xl leading-relaxed">
          The City Cycle universe is divided into four zones, each representing a phase in the emotional arc from invisibility to myth. Every track belongs to a district — a spatial, emotional, and narrative territory.
        </p>
      </div>

      {/* Arc flow */}
      <div className="flex items-center gap-2 mb-12 overflow-x-auto pb-2">
        {["Invisible", "→", "Performer", "→", "Rebel", "→", "Myth"].map((item, i) => {
          const colors: Record<string, string> = { Invisible: "#c084fc", Performer: "#00d4ff", Rebel: "#ff6b6b", Myth: "#f0c040" };
          const isArrow = item === "→";
          return (
            <div key={i} className={`flex-shrink-0 ${isArrow ? "text-white/20 text-lg" : "px-4 py-2 rounded-full text-sm font-medium"}`}
              style={!isArrow ? { color: colors[item], background: `${colors[item]}15`, border: `1px solid ${colors[item]}30` } : {}}>
              {item}
            </div>
          );
        })}
        <div className="ml-4 text-xs text-white/25 italic flex-shrink-0">The Emotional Arc</div>
      </div>

      {/* Districts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {DISTRICT_META.map((d) => (
          <Link key={d.slug} href={`/districts/${d.slug}`}>
            <div className="p-8 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.01] group"
              style={{ background: `linear-gradient(135deg, ${d.glow}, rgba(255,255,255,0.01))`, border: `1px solid ${d.border}` }}>

              {/* District header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full animate-pulse-glow" style={{ background: d.color }} />
                    <span className="text-xs text-white/30 tracking-widest uppercase">{d.arc} Arc</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold" style={{ color: d.color }}>{d.name}</h2>
                  <p className="text-sm text-white/40 mt-1 italic">{d.tagline}</p>
                </div>
                <div className="text-right">
                  <div className="font-display text-3xl font-bold" style={{ color: d.color }}>
                    {countMap[d.id] ?? "—"}
                  </div>
                  <div className="text-xs text-white/25">tracks</div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-white/50 leading-relaxed mb-6 line-clamp-3">{d.description}</p>

              {/* Themes */}
              <div className="mb-4">
                <div className="text-[9px] text-white/25 tracking-widest uppercase mb-2">Core Themes</div>
                <div className="flex flex-wrap gap-1.5">
                  {d.themes.map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ color: d.color, background: `${d.color}10`, border: `1px solid ${d.color}20` }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Symbols */}
              <div className="mb-6">
                <div className="text-[9px] text-white/25 tracking-widest uppercase mb-2">Key Symbols</div>
                <div className="flex flex-wrap gap-1.5">
                  {d.symbols.map(s => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full text-white/35"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all"
                style={{ color: d.color }}>
                Explore {d.name} <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Philosophy note */}
      <div className="mt-12 p-6 rounded-2xl"
        style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}>
        <div className="text-xs text-white/30 tracking-widest uppercase mb-3">Universe Philosophy</div>
        <blockquote className="text-white/60 text-sm leading-relaxed italic">
          "The city never sleeps because someone somewhere is always performing. The four districts are not just locations — they are states of being, phases of a journey that every performer, every outsider, every queer body navigating urban space must pass through."
        </blockquote>
      </div>
    </div>
  );
}
