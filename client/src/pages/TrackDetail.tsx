import { useState } from "react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { ArrowLeft, MessageSquare, Plus, Trash2, GitBranch, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
 
const DISTRICT_NAMES: Record<number, string> = { 1: "The Shadows", 2: "The Stage", 3: "The Riot", 4: "The Myth District" };
const DISTRICT_COLORS: Record<number, string> = { 1: "#c084fc", 2: "#00d4ff", 3: "#ff6b6b", 4: "#f0c040" };
const ARC_COLORS: Record<string, string> = { "Invisible": "#c084fc", "Performer": "#00d4ff", "Rebel": "#ff6b6b", "Myth": "#f0c040" };
const NOTE_TYPE_COLORS: Record<string, string> = { interpretation: "#00d4ff", connection: "#c084fc", expansion: "#f0c040", question: "#ff6b6b" };
 
export default function TrackDetail() {
  const params = useParams<{ id: string }>();
  const trackId = parseInt(params.id ?? "0");
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
 
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState<"interpretation" | "connection" | "expansion" | "question">("interpretation");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState("");
  const [editingLyrics, setEditingLyrics] = useState(false);
  const [lyricsValue, setLyricsValue] = useState("");
 
  const { data: track, isLoading } = trpc.tracks.byId.useQuery({ id: trackId }, { enabled: !!trackId });
  const { data: notes } = trpc.notes.forTrack.useQuery({ trackId }, { enabled: !!trackId });
  const { data: connections } = trpc.connections.forTrack.useQuery({ trackId }, { enabled: !!trackId });
  const { data: allTracks } = trpc.tracks.list.useQuery({ limit: 174, offset: 0 });
 
  const createNote = trpc.notes.create.useMutation({
    onSuccess: () => {
      setNoteContent("");
      utils.notes.forTrack.invalidate({ trackId });
      toast.success("Note added");
    },
    onError: () => toast.error("Failed to add note"),
  });
 
  const updateTrack = trpc.tracks.update.useMutation({
    onSuccess: () => {
      utils.tracks.byId.invalidate({ id: trackId });
      setEditingDesc(false);
      setEditingLyrics(false);
      toast.success("Saved");
    },
    onError: () => toast.error("Failed to save"),
  });
 
  const deleteNote = trpc.notes.delete.useMutation({
    onSuccess: () => {
      utils.notes.forTrack.invalidate({ trackId });
      toast.success("Note deleted");
    },
  });
 
  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
        ))}
      </div>
    );
  }
 
  if (!track) {
    return (
      <div className="p-8 text-center text-white/40">
        <p>Track not found</p>
        <Link href="/archive" className="text-[#00d4ff] hover:underline mt-2 block">← Back to Archive</Link>
      </div>
    );
  }
 
  const distColor = DISTRICT_COLORS[track.districtId ?? 0] ?? "#ffffff";
  const arcColor = ARC_COLORS[track.narrativeArc ?? ""] ?? "#ffffff";
 
  const connectedTrackIds = new Set<number>();
  for (const c of connections ?? []) {
    if (c.sourceId === trackId) connectedTrackIds.add(c.targetId);
    if (c.targetId === trackId) connectedTrackIds.add(c.sourceId);
  }
  const connectedTracks = (allTracks?.tracks ?? []).filter(t => connectedTrackIds.has(t.id));
 
  return (
    <div className="min-h-screen p-6 lg:p-8 max-w-4xl">
      <Link href="/archive">
        <button className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-8">
          <ArrowLeft size={14} /> Archive
        </button>
      </Link>
 
      <div className="p-8 rounded-2xl mb-8"
        style={{ background: `linear-gradient(135deg, ${distColor}08, rgba(255,255,255,0.01))`, border: `1px solid ${distColor}20` }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono-custom text-sm text-white/30">#{track.number.toString().padStart(3, "0")}</span>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ color: distColor, background: `${distColor}15`, border: `1px solid ${distColor}30` }}>
              {DISTRICT_NAMES[track.districtId ?? 0]}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ color: arcColor, background: `${arcColor}15`, border: `1px solid ${arcColor}30` }}>
              {track.narrativeArc} Arc
            </span>
          </div>
          <span className="text-xs text-white/25 capitalize">{track.type}</span>
        </div>
 
        <h1 className="font-display text-4xl font-bold text-white leading-tight mb-4">{track.title}</h1>
 
        {/* Editable Description */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] text-white/25 tracking-widest uppercase">Description</span>
            {!editingDesc && (
              <button onClick={() => { setDescValue(track.description ?? ""); setEditingDesc(true); }}
                className="text-white/20 hover:text-white/50 transition-colors">
                <Pencil size={10} />
              </button>
            )}
          </div>
          {editingDesc ? (
            <div className="space-y-2">
              <Textarea value={descValue} onChange={(e) => setDescValue(e.target.value)}
                className="bg-white/[0.04] border-white/[0.08] text-white text-sm resize-none"
                rows={4} placeholder="Describe this track..." autoFocus />
              <div className="flex gap-2">
                <button onClick={() => updateTrack.mutate({ id: trackId, description: descValue, lyrics: (track as any).lyrics ?? undefined })}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-[#00d4ff]"
                  style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)" }}>
                  <Check size={11} /> Save
                </button>
                <button onClick={() => setEditingDesc(false)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white/40"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <X size={11} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-white/55 leading-relaxed text-sm">
              {track.description || <span className="text-white/20 italic">No description yet — click ✏️ to add one</span>}
            </p>
          )}
        </div>
 
        {/* Editable Lyrics */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] text-white/25 tracking-widest uppercase">Lyrics</span>
            {!editingLyrics && (
              <button onClick={() => { setLyricsValue((track as any).lyrics ?? ""); setEditingLyrics(true); }}
                className="text-white/20 hover:text-white/50 transition-colors">
                <Pencil size={10} />
              </button>
            )}
          </div>
          {editingLyrics ? (
            <div className="space-y-2">
              <Textarea value={lyricsValue} onChange={(e) => setLyricsValue(e.target.value)}
                className="bg-white/[0.04] border-white/[0.08] text-white text-sm font-mono resize-none"
                rows={10} placeholder="Paste or write the lyrics here..." autoFocus />
              <div className="flex gap-2">
                <button onClick={() => updateTrack.mutate({ id: trackId, description: track.description ?? undefined, lyrics: lyricsValue })}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-[#00d4ff]"
                  style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)" }}>
                  <Check size={11} /> Save
                </button>
                <button onClick={() => setEditingLyrics(false)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white/40"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <X size={11} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-white/55 leading-relaxed whitespace-pre-wrap font-mono">
              {(track as any).lyrics || <span className="text-white/20 italic font-sans">No lyrics yet — click ✏️ to add</span>}
            </div>
          )}
        </div>
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-4">
          {track.narrativePotential && (
            <div className="p-5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-[9px] text-white/25 tracking-widest uppercase mb-2">Narrative Potential</div>
              <p className="text-sm text-white/55 leading-relaxed">{track.narrativePotential}</p>
            </div>
          )}
          {Array.isArray(track.themes) && (track.themes as string[]).length > 0 && (
            <div className="p-5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-[9px] text-white/25 tracking-widest uppercase mb-3">Themes</div>
              <div className="flex flex-wrap gap-2">
                {(track.themes as string[]).map((t: string) => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-full text-white/55"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>{t}</span>
                ))}
              </div>
            </div>
          )}
          {Array.isArray(track.symbolicElements) && (track.symbolicElements as string[]).length > 0 && (
            <div className="p-5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-[9px] text-white/25 tracking-widest uppercase mb-3">Symbolic Elements</div>
              <div className="flex flex-wrap gap-2">
                {(track.symbolicElements as string[]).map((s: string) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full"
                    style={{ color: distColor, background: `${distColor}10`, border: `1px solid ${distColor}20` }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {Array.isArray(track.culturalReferences) && (track.culturalReferences as string[]).length > 0 && (
            <div className="p-5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-[9px] text-white/25 tracking-widest uppercase mb-3">Cultural References</div>
              <div className="flex flex-wrap gap-2">
                {(track.culturalReferences as string[]).map((r: string) => (
                  <span key={r} className="text-xs px-2.5 py-1 rounded-full text-white/45"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>
 
        <div className="space-y-4">
          <div className="p-5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-[9px] text-white/25 tracking-widest uppercase mb-3">Details</div>
            <div className="space-y-2 text-xs">
              {[
                { label: "District", value: DISTRICT_NAMES[track.districtId ?? 0], color: distColor },
                { label: "Arc", value: track.narrativeArc, color: arcColor },
                { label: "Cluster", value: track.thematicCluster, color: undefined },
                { label: "Type", value: track.type, color: undefined },
                { label: "Status", value: track.creativeStatus, color: undefined },
              ].map(f => f.value && (
                <div key={f.label} className="flex justify-between items-center">
                  <span className="text-white/30">{f.label}</span>
                  <span className="capitalize" style={{ color: f.color ?? "rgba(255,255,255,0.6)" }}>{f.value}</span>
                </div>
              ))}
            </div>
          </div>
          {Array.isArray(track.emotionalTags) && (track.emotionalTags as string[]).length > 0 && (
            <div className="p-5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-[9px] text-white/25 tracking-widest uppercase mb-3">Emotional Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {(track.emotionalTags as string[]).map((tag: string) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full text-white/40"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
 
      {connectedTracks.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch size={14} className="text-white/30" />
            <span className="text-xs text-white/30 tracking-widest uppercase">Connected Tracks</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {connectedTracks.map(ct => {
              const conn = (connections ?? []).find(c => c.sourceId === ct.id || c.targetId === ct.id);
              return (
                <Link key={ct.id} href={`/track/${ct.id}`}>
                  <div className="p-3 rounded-xl cursor-pointer transition-all hover:bg-white/[0.04]"
                    style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="font-mono-custom text-[9px] text-white/25 mb-1">#{ct.number.toString().padStart(3, "0")}</div>
                    <div className="font-display font-semibold text-white text-xs leading-tight mb-1 line-clamp-2">{ct.title}</div>
                    {conn?.label && <div className="text-[9px] text-white/30 italic">{conn.label}</div>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
 
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={14} className="text-white/30" />
          <span className="text-xs text-white/30 tracking-widest uppercase">Collaborative Notes</span>
          <span className="text-xs text-white/20">({notes?.length ?? 0})</span>
        </div>
 
        {isAuthenticated ? (
          <div className="p-5 rounded-xl mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Textarea
              placeholder="Add your interpretation, connection, or question..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="bg-transparent border-white/[0.08] text-white placeholder:text-white/25 text-sm resize-none mb-3"
              rows={3}
            />
            <div className="flex items-center justify-between">
              <Select value={noteType} onValueChange={(v) => setNoteType(v as any)}>
                <SelectTrigger className="w-40 bg-white/[0.04] border-white/[0.08] text-white/60 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d0820] border-white/[0.08]">
                  <SelectItem value="interpretation" className="text-[#00d4ff]">Interpretation</SelectItem>
                  <SelectItem value="connection" className="text-[#c084fc]">Connection</SelectItem>
                  <SelectItem value="expansion" className="text-[#f0c040]">Expansion</SelectItem>
                  <SelectItem value="question" className="text-[#ff6b6b]">Question</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                disabled={!noteContent.trim() || createNote.isPending}
                onClick={() => createNote.mutate({ trackId, content: noteContent, noteType })}
                className="text-xs"
                style={{ background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff" }}
              >
                <Plus size={12} className="mr-1" /> Add Note
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl mb-6 text-center text-sm text-white/30"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <a href={getLoginUrl()} className="text-[#00d4ff] hover:underline">Sign in</a> to add collaborative notes
          </div>
        )}
 
        <div className="space-y-3">
          {(notes ?? []).map(note => {
            const typeColor = NOTE_TYPE_COLORS[note.noteType] ?? "#ffffff";
            return (
              <div key={note.id} className="p-4 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${typeColor}15` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] px-2 py-0.5 rounded-full capitalize"
                    style={{ color: typeColor, background: `${typeColor}15`, border: `1px solid ${typeColor}25` }}>
                    {note.noteType}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-white/20">{new Date(note.createdAt).toLocaleDateString()}</span>
                    {isAuthenticated && user?.id === note.userId && (
                      <button onClick={() => deleteNote.mutate({ id: note.id })}
                        className="text-white/20 hover:text-[#ff6b6b] transition-colors">
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-white/55 leading-relaxed">{note.content}</p>
              </div>
            );
          })}
          {(notes ?? []).length === 0 && (
            <div className="text-center py-8 text-white/20 text-sm">
              No notes yet — be the first to add an interpretation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}