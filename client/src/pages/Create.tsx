import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Sparkles, Plus, Wand2, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

const DISTRICT_OPTIONS = [
  { value: "the-shadows", label: "The Shadows", color: "#c084fc" },
  { value: "the-stage", label: "The Stage", color: "#00d4ff" },
  { value: "the-riot", label: "The Riot", color: "#ff6b6b" },
  { value: "the-myth-district", label: "The Myth District", color: "#f0c040" },
];

const ARC_OPTIONS = [
  { value: "Invisible", color: "#c084fc" },
  { value: "Performer", color: "#00d4ff" },
  { value: "Rebel", color: "#ff6b6b" },
  { value: "Myth", color: "#f0c040" },
];

const TYPE_OPTIONS = ["track", "concept", "visual", "narrative", "character", "motif", "location"];

export default function Create() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  // New track form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [district, setDistrict] = useState("");
  const [arc, setArc] = useState("");
  const [type, setType] = useState("track");
  const [cluster, setCluster] = useState("");

  // AI idea generator
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const createTrack = trpc.tracks.add.useMutation({
    onSuccess: () => {
      setTitle(""); setDescription(""); setDistrict(""); setArc(""); setCluster("");
      utils.tracks.list.invalidate();
      toast.success("Track added to the universe");
    },
    onError: () => toast.error("Failed to create track"),
  });

  const generateIdea = trpc.mythology.generateIdea.useMutation({
    onMutate: () => { setAiLoading(true); setAiResult(""); },
    onSuccess: (data) => { setAiResult(data.idea); setAiLoading(false); },
    onError: () => { toast.error("Failed to generate idea"); setAiLoading(false); },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}>
            <Sparkles size={28} className="text-[#c084fc]" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-3">Create Mode</h2>
          <p className="text-white/40 text-sm leading-relaxed mb-6">
            Sign in to add new tracks to the City Cycle universe, generate AI-powered mythology ideas, and expand the narrative.
          </p>
          <a href={getLoginUrl()}>
            <Button className="w-full" style={{ background: "linear-gradient(135deg, #7c3aed, #00d4ff)", color: "white" }}>
              Sign In to Create
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="mb-10">
        <div className="text-xs text-white/30 tracking-widest uppercase mb-2">City Cycle Universe</div>
        <h1 className="font-display text-4xl font-bold text-white mb-2">Create</h1>
        <p className="text-white/40 text-sm">Expand the mythology — add new tracks, generate ideas, build narrative arcs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add new track */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Plus size={16} className="text-[#00d4ff]" />
            <h2 className="font-display text-lg font-semibold text-white">Add New Track</h2>
          </div>

          <div className="p-6 rounded-2xl space-y-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div>
              <label className="text-xs text-white/30 tracking-widest uppercase block mb-2">Title *</label>
              <Input
                placeholder="Track title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25"
              />
            </div>

            <div>
              <label className="text-xs text-white/30 tracking-widest uppercase block mb-2">Description</label>
              <Textarea
                placeholder="What does this track represent in the universe?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/30 tracking-widest uppercase block mb-2">District</label>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-white/60 text-sm">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d0820] border-white/[0.08]">
                    {DISTRICT_OPTIONS.map(d => (
                      <SelectItem key={d.value} value={d.value} style={{ color: d.color }}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-white/30 tracking-widest uppercase block mb-2">Arc</label>
                <Select value={arc} onValueChange={setArc}>
                  <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-white/60 text-sm">
                    <SelectValue placeholder="Select arc" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d0820] border-white/[0.08]">
                    {ARC_OPTIONS.map(a => (
                      <SelectItem key={a.value} value={a.value} style={{ color: a.color }}>{a.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/30 tracking-widest uppercase block mb-2">Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-white/60 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d0820] border-white/[0.08]">
                    {TYPE_OPTIONS.map(t => (
                      <SelectItem key={t} value={t} className="capitalize text-white/70">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-white/30 tracking-widest uppercase block mb-2">Thematic Cluster</label>
                <Input
                  placeholder="e.g. Identity Paradox"
                  value={cluster}
                  onChange={(e) => setCluster(e.target.value)}
                  className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 text-sm"
                />
              </div>
            </div>

            <Button
              disabled={!title.trim() || createTrack.isPending}
              onClick={() => createTrack.mutate({ title, description, districtSlug: district, narrativeArc: arc, type, thematicCluster: cluster })}
              className="w-full font-medium"
              style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2))", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff" }}
            >
              {createTrack.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : <Plus size={14} className="mr-2" />}
              Add to Universe
            </Button>
          </div>
        </div>

        {/* AI Mythology Generator */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Wand2 size={16} className="text-[#c084fc]" />
            <h2 className="font-display text-lg font-semibold text-white">Mythology Engine</h2>
          </div>

          <div className="p-6 rounded-2xl"
            style={{ background: "rgba(192,132,252,0.05)", border: "1px solid rgba(192,132,252,0.15)" }}>
            <p className="text-xs text-white/35 leading-relaxed mb-4">
              Describe a theme, emotion, or narrative direction and the AI will generate new mythology ideas that fit within the City Cycle universe — new track concepts, character arcs, symbolic connections, and narrative expansions.
            </p>

            <div className="mb-4">
              <label className="text-xs text-white/30 tracking-widest uppercase block mb-2">Your Prompt</label>
              <Textarea
                placeholder="e.g. 'A track about the moment before going on stage — the fear and the power colliding' or 'Explore the tension between queer joy and urban danger in The Riot district'..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 resize-none text-sm"
                rows={4}
              />
            </div>

            <Button
              disabled={!aiPrompt.trim() || aiLoading}
              onClick={() => generateIdea.mutate({ prompt: aiPrompt })}
              className="w-full mb-5 font-medium"
              style={{ background: "linear-gradient(135deg, rgba(192,132,252,0.2), rgba(124,58,237,0.3))", border: "1px solid rgba(192,132,252,0.35)", color: "#c084fc" }}
            >
              {aiLoading ? <Loader2 size={14} className="animate-spin mr-2" /> : <Sparkles size={14} className="mr-2" />}
              Generate Mythology Idea
            </Button>

            {aiLoading && (
              <div className="flex items-center gap-3 py-4 text-white/40 text-sm">
                <Loader2 size={16} className="animate-spin text-[#c084fc]" />
                The mythology engine is thinking...
              </div>
            )}

            {aiResult && !aiLoading && (
              <div className="p-4 rounded-xl"
                style={{ background: "rgba(192,132,252,0.06)", border: "1px solid rgba(192,132,252,0.2)" }}>
                <div className="text-[9px] text-[#c084fc]/60 tracking-widest uppercase mb-3 flex items-center gap-1.5">
                  <Sparkles size={9} /> Generated Idea
                </div>
                <div className="text-sm text-white/70 leading-relaxed prose-custom">
                  <Streamdown>{aiResult}</Streamdown>
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          <div className="mt-5">
            <div className="text-xs text-white/25 tracking-widest uppercase mb-3">Quick Prompts</div>
            <div className="space-y-2">
              {[
                "A new track for The Shadows about watching someone perform from the crowd",
                "Explore the moment of transformation from Rebel to Myth",
                "A symbolic motif connecting mirrors and queer identity",
                "A character arc for someone who performs to survive",
              ].map(p => (
                <button
                  key={p}
                  onClick={() => setAiPrompt(p)}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-white/35 hover:text-white/60 transition-all hover:bg-white/[0.04]"
                  style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Arc builder */}
      <div className="mt-10 p-6 rounded-2xl"
        style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)" }}>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-[#00d4ff]" />
          <h2 className="font-display text-lg font-semibold text-white">Narrative Arc Builder</h2>
        </div>
        <p className="text-sm text-white/40 leading-relaxed mb-4">
          The City Cycle universe follows the arc: <span className="text-[#c084fc]">Invisible</span> → <span className="text-[#00d4ff]">Performer</span> → <span className="text-[#ff6b6b]">Rebel</span> → <span className="text-[#f0c040]">Myth</span>. Use the Mythology Engine above to generate ideas for any phase of this arc, or add tracks directly to expand each district's narrative depth.
        </p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { arc: "Invisible", color: "#c084fc", district: "The Shadows", desc: "Before the performance. The watching. The waiting." },
            { arc: "Performer", color: "#00d4ff", district: "The Stage", desc: "The moment of visibility. The spectacle. The power." },
            { arc: "Rebel", color: "#ff6b6b", district: "The Riot", desc: "When performance becomes resistance. The confrontation." },
            { arc: "Myth", color: "#f0c040", district: "The Myth District", desc: "Transcendence. Legend. The city can no longer contain you." },
          ].map(item => (
            <div key={item.arc} className="p-4 rounded-xl"
              style={{ background: `${item.color}08`, border: `1px solid ${item.color}20` }}>
              <div className="font-display font-bold text-sm mb-1" style={{ color: item.color }}>{item.arc}</div>
              <div className="text-[10px] text-white/30 mb-2">{item.district}</div>
              <p className="text-[10px] text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
