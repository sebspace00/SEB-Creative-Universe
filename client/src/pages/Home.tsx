import { Link } from "wouter";
import { Archive, Compass, GitBranch, Map, Sparkles, Wand2, BookOpen, Search, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

const FEATURES = [
  { path: "/archive", icon: Archive, label: "Archive", desc: "All 174 tracklist items with full metadata", color: "#00d4ff" },
  { path: "/explore", icon: Compass, label: "Explore", desc: "Visual discovery feed by district and theme", color: "#c084fc" },
  { path: "/graph", icon: GitBranch, label: "Knowledge Graph", desc: "Interactive network of connections", color: "#7c3aed" },
  { path: "/districts", icon: Map, label: "Districts", desc: "Navigate the four zones of the city", color: "#f0c040" },
  { path: "/symbols", icon: BookOpen, label: "Symbolism Library", desc: "Visual language and color meanings", color: "#9b59b6" },
  { path: "/mythology", icon: Sparkles, label: "Mythology Engine", desc: "AI-powered narrative generation", color: "#00d4ff" },
  { path: "/create", icon: Wand2, label: "Create Mode", desc: "Expand the universe with new ideas", color: "#ff6b6b" },
  { path: "/search", icon: Search, label: "Search", desc: "Find tracks, themes, and symbols", color: "#c084fc" },
];

const DISTRICTS = [
  { slug: "the-shadows", name: "The Shadows", desc: "Invisibility, judgment, observation", color: "#c084fc", glow: "rgba(192,132,252,0.15)" },
  { slug: "the-stage", name: "The Stage", desc: "Performance, spectacle, charisma", color: "#00d4ff", glow: "rgba(0,212,255,0.15)" },
  { slug: "the-riot", name: "The Riot", desc: "Rebellion, conflict, identity politics", color: "#ff6b6b", glow: "rgba(255,107,107,0.15)" },
  { slug: "the-myth-district", name: "The Myth District", desc: "Transformation into legend", color: "#f0c040", glow: "rgba(240,192,64,0.15)" },
];

export default function Home() {
  const { data: stats } = trpc.tracks.stats.useQuery();

  return (
    <div className="min-h-screen bg-[#050510] overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(80px)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, #00d4ff, transparent)", filter: "blur(80px)" }} />
        <div className="absolute top-1/2 left-0 w-64 h-64 rounded-full opacity-6"
          style={{ background: "radial-gradient(circle, #ff2244, transparent)", filter: "blur(80px)" }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2))", border: "1px solid rgba(0,212,255,0.3)" }}>
            <span className="font-display font-bold text-[#00d4ff] text-base">C</span>
          </div>
          <div>
            <div className="font-display font-bold text-white tracking-wide">CUOS</div>
            <div className="text-[9px] text-white/30 tracking-widest uppercase">Creative Universe OS</div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/archive" className="text-sm text-white/50 hover:text-white/80 transition-colors">Archive</Link>
          <Link href="/explore" className="text-sm text-white/50 hover:text-white/80 transition-colors">Explore</Link>
          <Link href="/graph" className="text-sm text-white/50 hover:text-white/80 transition-colors">Graph</Link>
          <Link href="/archive">
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-[#050510] transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #00d4ff, #7c3aed)" }}>
              Enter Universe
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-8 pt-24 pb-20">
        <div className="max-w-5xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-xs text-[#00d4ff] font-mono-custom tracking-widest uppercase"
            style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse-glow" />
            City Cycle Universe — {stats?.total ?? 174} Tracklist Items
          </div>

          {/* Main headline */}
          <h1 className="font-display text-[clamp(3rem,8vw,7rem)] font-bold leading-[0.9] tracking-tight mb-8">
            <span className="block text-white">The City</span>
            <span className="block" style={{ background: "linear-gradient(135deg, #00d4ff, #7c3aed, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Never Sleeps
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/50 text-lg max-w-xl leading-relaxed mb-4">
            A creative universe operating system for the City Cycle mythology — 174 tracklist items across four districts, connected by performance, identity, and transformation.
          </p>
          <p className="text-white/30 text-sm italic mb-12">
            "Because someone somewhere is always performing."
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/archive">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-[#050510] transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #00d4ff, #7c3aed)" }}>
                <Archive size={16} />
                Browse Archive
              </button>
            </Link>
            <Link href="/graph">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white/80 transition-all hover:text-white hover:bg-white/[0.06]"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                <GitBranch size={16} />
                Knowledge Graph
              </button>
            </Link>
            <Link href="/mythology">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-[#c084fc] transition-all hover:bg-[#7c3aed]/10"
                style={{ border: "1px solid rgba(124,58,237,0.3)" }}>
                <Sparkles size={16} />
                Mythology Engine
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 px-8 py-6 border-y border-white/[0.06]"
        style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="flex items-center gap-12 overflow-x-auto">
          {[
            { label: "Tracklist Items", value: stats?.total ?? 174 },
            { label: "Districts", value: 4 },
            { label: "Thematic Clusters", value: 8 },
            { label: "Narrative Arcs", value: 4 },
            { label: "Symbolic Motifs", value: 12 },
          ].map((stat) => (
            <div key={stat.label} className="flex-shrink-0">
              <div className="font-display text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-white/30 tracking-wide mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Districts */}
      <section className="relative z-10 px-8 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="text-xs text-white/30 tracking-widest uppercase mb-2">The Four Zones</div>
            <h2 className="font-display text-3xl font-bold text-white">Districts of the City</h2>
          </div>
          <Link href="/districts" className="flex items-center gap-1 text-sm text-[#00d4ff] hover:gap-2 transition-all">
            Explore all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DISTRICTS.map((d) => (
            <Link key={d.slug} href={`/districts/${d.slug}`}>
              <div className="p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] group"
                style={{ background: `linear-gradient(135deg, ${d.glow}, rgba(255,255,255,0.02))`, border: `1px solid ${d.color}22` }}>
                <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center"
                  style={{ background: `${d.color}20`, border: `1px solid ${d.color}40` }}>
                  <div className="w-3 h-3 rounded-full animate-pulse-glow" style={{ background: d.color }} />
                </div>
                <h3 className="font-display font-bold text-white mb-2 group-hover:text-opacity-90"
                  style={{ color: d.color }}>{d.name}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{d.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 px-8 py-16 border-t border-white/[0.06]">
        <div className="mb-10">
          <div className="text-xs text-white/30 tracking-widest uppercase mb-2">Platform Features</div>
          <h2 className="font-display text-3xl font-bold text-white">Everything in One Place</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Link key={f.path} href={f.path}>
                <div className="p-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] group glass"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Icon size={20} className="mb-3" style={{ color: f.color }} />
                  <div className="font-medium text-white text-sm mb-1">{f.label}</div>
                  <div className="text-xs text-white/35 leading-relaxed">{f.desc}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-8 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="text-xs text-white/20">City Cycle Universe — Creative Universe Operating System</div>
          <div className="text-xs text-white/20 italic">"Invisible → Performer → Rebel → Myth"</div>
        </div>
      </footer>
    </div>
  );
}
