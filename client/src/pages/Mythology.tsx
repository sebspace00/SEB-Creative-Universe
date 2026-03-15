import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Sparkles, Loader2, BookOpen, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

const DISTRICT_NAMES: Record<number, string> = { 1: "The Shadows", 2: "The Stage", 3: "The Riot", 4: "The Myth District" };
const DISTRICT_COLORS: Record<number, string> = { 1: "#c084fc", 2: "#00d4ff", 3: "#ff6b6b", 4: "#f0c040" };

export default function Mythology() {
  const { isAuthenticated } = useAuth();
  const [selectedTrackIds, setSelectedTrackIds] = useState<number[]>([]);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ title: string; content: string } | null>(null);

  const { data: entries, isLoading: entriesLoading } = trpc.mythology.list.useQuery();
  const { data: tracksData } = trpc.tracks.list.useQuery({ limit: 174, offset: 0 });
  const utils = trpc.useUtils();

  const generate = trpc.mythology.generate.useMutation({
    onMutate: () => { setGenerating(true); setResult(null); },
    onSuccess: (data) => {
      setResult(data);
      setGenerating(false);
      utils.mythology.list.invalidate();
      toast.success("Mythology entry generated");
    },
    onError: () => {
      toast.error("Failed to generate mythology entry");
      setGenerating(false);
    },
  });

  const toggleTrack = (id: number) => {
    setSelectedTrackIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 10 ? [...prev, id] : prev
    );
  };

  const tracks = tracksData?.tracks ?? [];

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs text-white/30 tracking-widest uppercase mb-2">City Cycle Universe</div>
        <h1 className="font-display text-4xl font-bold text-white mb-2">Mythology Engine</h1>
        <p className="text-white/40 text-sm max-w-xl leading-relaxed">
          Select tracks from the archive and let the AI reveal their hidden connections, shared themes, and narrative significance within the City Cycle mythology.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Track selector */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-white/30 tracking-widest uppercase">Select Tracks (max 10)</div>
            <div className="text-xs text-white/40">
              <span className="text-[#c084fc] font-medium">{selectedTrackIds.length}</span>/10 selected
            </div>
          </div>

          <div className="h-80 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
            {tracks.map(track => {
              const isSelected = selectedTrackIds.includes(track.id);
              const distColor = DISTRICT_COLORS[track.districtId ?? 0] ?? "#ffffff";
              return (
                <button
                  key={track.id}
                  onClick={() => toggleTrack(track.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                  style={{
                    background: isSelected ? `${distColor}12` : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isSelected ? distColor + "35" : "rgba(255,255,255,0.05)"}`,
                  }}
                >
                  <div className={`w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center transition-all`}
                    style={{ background: isSelected ? distColor : "rgba(255,255,255,0.06)", border: `1px solid ${isSelected ? distColor : "rgba(255,255,255,0.1)"}` }}>
                    {isSelected && <div className="w-2 h-2 rounded-sm bg-[#050510]" />}
                  </div>
                  <span className="font-mono-custom text-[9px] text-white/25 w-8 flex-shrink-0">
                    #{track.number.toString().padStart(3, "0")}
                  </span>
                  <span className="text-xs text-white/60 flex-1 truncate">{track.title}</span>
                  <span className="text-[9px] flex-shrink-0" style={{ color: distColor }}>
                    {DISTRICT_NAMES[track.districtId ?? 0]?.split(" ").slice(-1)[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generator */}
        <div>
          <div className="text-xs text-white/30 tracking-widest uppercase mb-4">Generation Options</div>

          <div className="p-5 rounded-2xl mb-4"
            style={{ background: "rgba(192,132,252,0.05)", border: "1px solid rgba(192,132,252,0.15)" }}>
            <div className="mb-3">
              <label className="text-xs text-white/30 tracking-widest uppercase block mb-2">Focus Prompt (Optional)</label>
              <Textarea
                placeholder="e.g. 'Focus on the queer identity themes' or 'Explore the transformation from Rebel to Myth'..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 resize-none text-sm"
                rows={3}
              />
            </div>

            {!isAuthenticated ? (
              <a href={getLoginUrl()}>
                <Button className="w-full" style={{ background: "rgba(192,132,252,0.15)", border: "1px solid rgba(192,132,252,0.3)", color: "#c084fc" }}>
                  Sign In to Generate
                </Button>
              </a>
            ) : (
              <Button
                disabled={selectedTrackIds.length === 0 || generating}
                onClick={() => generate.mutate({ trackIds: selectedTrackIds, prompt: prompt || undefined })}
                className="w-full font-medium"
                style={{ background: "linear-gradient(135deg, rgba(192,132,252,0.2), rgba(124,58,237,0.3))", border: "1px solid rgba(192,132,252,0.35)", color: "#c084fc" }}
              >
                {generating ? <Loader2 size={14} className="animate-spin mr-2" /> : <Sparkles size={14} className="mr-2" />}
                {selectedTrackIds.length === 0 ? "Select tracks to generate" : `Generate Mythology Entry (${selectedTrackIds.length} tracks)`}
              </Button>
            )}
          </div>

          {/* Result */}
          {generating && (
            <div className="p-5 rounded-2xl flex items-center gap-3 text-white/40 text-sm"
              style={{ background: "rgba(192,132,252,0.04)", border: "1px solid rgba(192,132,252,0.12)" }}>
              <Loader2 size={16} className="animate-spin text-[#c084fc]" />
              The mythology engine is weaving connections...
            </div>
          )}

          {result && !generating && (
            <div className="p-5 rounded-2xl"
              style={{ background: "rgba(192,132,252,0.06)", border: "1px solid rgba(192,132,252,0.2)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={12} className="text-[#c084fc]" />
                <h3 className="font-display font-bold text-white text-sm">{result.title}</h3>
              </div>
              <div className="text-sm text-white/60 leading-relaxed">
                <Streamdown>{result.content}</Streamdown>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saved entries */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <BookOpen size={14} className="text-white/30" />
          <span className="text-xs text-white/30 tracking-widest uppercase">Mythology Archive</span>
          <span className="text-xs text-white/20">({entries?.length ?? 0} entries)</span>
        </div>

        {entriesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : (entries ?? []).length === 0 ? (
          <div className="text-center py-16 text-white/25">
            <Zap size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No mythology entries yet</p>
            <p className="text-xs mt-1">Select tracks above and generate the first entry</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(entries ?? []).map(entry => (
              <div key={entry.id} className="p-5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(192,132,252,0.12)" }}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-display font-bold text-white text-sm leading-tight flex-1 pr-3">{entry.title}</h3>
                  <div className="flex items-center gap-1 text-[9px] text-white/25 flex-shrink-0">
                    <Clock size={9} />
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {entry.generatedByAI && (
                  <div className="flex items-center gap-1 mb-2">
                    <Sparkles size={9} className="text-[#c084fc]" />
                    <span className="text-[9px] text-[#c084fc]/60">AI Generated</span>
                  </div>
                )}
                <p className="text-xs text-white/45 leading-relaxed line-clamp-4">{entry.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
