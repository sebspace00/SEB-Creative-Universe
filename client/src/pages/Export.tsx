import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Download, FileText, Loader2, Sparkles, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

const DISTRICT_COLORS: Record<number, string> = { 1: "#c084fc", 2: "#00d4ff", 3: "#ff6b6b", 4: "#f0c040" };
const DISTRICT_NAMES: Record<number, string> = { 1: "The Shadows", 2: "The Stage", 3: "The Riot", 4: "The Myth District" };

const EXPORT_TYPES = [
  { id: "universe_bible", label: "Universe Bible Excerpt", desc: "A narrative document describing the selected tracks' place in the mythology", icon: "📖" },
  { id: "thematic_report", label: "Thematic Report", desc: "Analysis of shared themes, symbols, and emotional patterns", icon: "🔍" },
  { id: "creative_brief", label: "Creative Brief", desc: "A production-ready brief for music, visual, or multimedia projects", icon: "🎬" },
  { id: "arc_map", label: "Narrative Arc Map", desc: "A structured map of the narrative journey across selected tracks", icon: "🗺️" },
];

export default function Export() {
  const { isAuthenticated } = useAuth();
  const [selectedTrackIds, setSelectedTrackIds] = useState<number[]>([]);
  const [exportType, setExportType] = useState("universe_bible");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ title: string; content: string } | null>(null);

  const { data: tracksData } = trpc.tracks.list.useQuery({ limit: 174, offset: 0 });

  const generate = trpc.export.brief.useMutation({
    onMutate: () => { setGenerating(true); setResult(null); },
    onSuccess: (data: { content: string }) => { setResult({ title: EXPORT_TYPES.find(t => t.id === exportType)?.label ?? "Export", content: data.content }); setGenerating(false); },
    onError: () => { toast.error("Failed to generate export"); setGenerating(false); },
  });

  const toggleTrack = (id: number) => {
    setSelectedTrackIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedTrackIds((tracksData?.tracks ?? []).map(t => t.id));
  const clearAll = () => setSelectedTrackIds([]);

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([`# ${result.title}\n\n${result.content}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded as Markdown");
  };

  const tracks = tracksData?.tracks ?? [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)" }}>
            <FileText size={28} className="text-[#00d4ff]" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-3">Export & Documentation</h2>
          <p className="text-white/40 text-sm leading-relaxed mb-6">
            Sign in to generate Universe Bible excerpts, thematic reports, and creative briefs from selected tracks.
          </p>
          <a href={getLoginUrl()}>
            <Button className="w-full" style={{ background: "linear-gradient(135deg, #7c3aed, #00d4ff)", color: "white" }}>
              Sign In to Export
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs text-white/30 tracking-widest uppercase mb-2">City Cycle Universe</div>
        <h1 className="font-display text-4xl font-bold text-white mb-2">Export & Documentation</h1>
        <p className="text-white/40 text-sm">Generate Universe Bible excerpts, thematic reports, and creative briefs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Track selector */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-white/30 tracking-widest uppercase">Select Tracks</div>
            <div className="flex items-center gap-2">
              <button onClick={selectAll} className="text-[10px] text-[#00d4ff] hover:underline">All</button>
              <span className="text-white/20">·</span>
              <button onClick={clearAll} className="text-[10px] text-white/30 hover:text-white/60">Clear</button>
              <span className="text-[10px] text-[#c084fc] font-medium ml-1">{selectedTrackIds.length} selected</span>
            </div>
          </div>

          <div className="h-96 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
            {tracks.map(track => {
              const isSelected = selectedTrackIds.includes(track.id);
              const distColor = DISTRICT_COLORS[track.districtId ?? 0] ?? "#ffffff";
              return (
                <button
                  key={track.id}
                  onClick={() => toggleTrack(track.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all"
                  style={{
                    background: isSelected ? `${distColor}10` : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isSelected ? distColor + "30" : "rgba(255,255,255,0.04)"}`,
                  }}
                >
                  {isSelected
                    ? <CheckSquare size={12} style={{ color: distColor, flexShrink: 0 }} />
                    : <Square size={12} className="text-white/20 flex-shrink-0" />
                  }
                  <span className="font-mono-custom text-[9px] text-white/20 w-7 flex-shrink-0">
                    #{track.number.toString().padStart(3, "0")}
                  </span>
                  <span className="text-[11px] text-white/55 flex-1 truncate">{track.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Export options + result */}
        <div className="lg:col-span-2">
          {/* Export type */}
          <div className="mb-6">
            <div className="text-xs text-white/30 tracking-widest uppercase mb-3">Export Type</div>
            <div className="grid grid-cols-2 gap-3">
              {EXPORT_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setExportType(type.id)}
                  className="p-4 rounded-xl text-left transition-all"
                  style={{
                    background: exportType === type.id ? "rgba(0,212,255,0.08)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${exportType === type.id ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  <div className="text-lg mb-2">{type.icon}</div>
                  <div className="font-display font-semibold text-white text-sm mb-1">{type.label}</div>
                  <div className="text-[10px] text-white/35 leading-relaxed">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <Button
            disabled={selectedTrackIds.length === 0 || generating}
            onClick={() => generate.mutate({ trackIds: selectedTrackIds })}
            className="w-full mb-6 font-medium py-3"
            style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.2))", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff" }}
          >
            {generating ? <Loader2 size={14} className="animate-spin mr-2" /> : <Sparkles size={14} className="mr-2" />}
            {selectedTrackIds.length === 0 ? "Select tracks to export" : `Generate ${EXPORT_TYPES.find(t => t.id === exportType)?.label} (${selectedTrackIds.length} tracks)`}
          </Button>

          {/* Loading */}
          {generating && (
            <div className="p-6 rounded-2xl flex items-center gap-3 text-white/40 text-sm"
              style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.1)" }}>
              <Loader2 size={16} className="animate-spin text-[#00d4ff]" />
              Generating your document...
            </div>
          )}

          {/* Result */}
          {result && !generating && (
            <div className="p-6 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,212,255,0.15)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-white text-lg">{result.title}</h3>
                <Button
                  onClick={handleDownload}
                  size="sm"
                  className="text-xs"
                  style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)", color: "#00d4ff" }}
                >
                  <Download size={12} className="mr-1.5" /> Download .md
                </Button>
              </div>
              <div className="text-sm text-white/60 leading-relaxed max-h-96 overflow-y-auto custom-scrollbar">
                <Streamdown>{result.content}</Streamdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
