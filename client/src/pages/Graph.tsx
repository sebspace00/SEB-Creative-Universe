import { useEffect, useRef, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import * as d3 from "d3";
import { Link } from "wouter";
import { ZoomIn, ZoomOut, RotateCcw, Info, X, GitBranch } from "lucide-react";
import { toast } from "sonner";
 
const DISTRICT_COLORS: Record<number, string> = {
  1: "#c084fc",
  2: "#00d4ff",
  3: "#ff6b6b",
  4: "#f0c040",
};
 
const DISTRICT_NAMES: Record<number, string> = {
  1: "The Shadows",
  2: "The Stage",
  3: "The Riot",
  4: "The Myth District",
};
 
const ARC_COLORS: Record<string, string> = {
  "Invisible": "#c084fc",
  "Performer": "#00d4ff",
  "Rebel": "#ff6b6b",
  "Myth": "#f0c040",
};
 
interface NodeDatum extends d3.SimulationNodeDatum {
  id: number;
  title: string;
  districtId: number | null;
  narrativeArc: string | null;
  thematicCluster: string | null;
  type: string;
}
 
interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  connectionType: string;
  strength: number;
  label: string | null;
}
 
export default function Graph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<NodeDatum | null>(null);
  const [filterDistrict, setFilterDistrict] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: NodeDatum } | null>(null);
  const simulationRef = useRef<d3.Simulation<NodeDatum, LinkDatum> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [connectMode, setConnectMode] = useState(false);
  const [connectFirst, setConnectFirst] = useState<NodeDatum | null>(null);
  const connectModeRef = useRef(false);
  const connectFirstRef = useRef<NodeDatum | null>(null);
 
  const { data: tracksData } = trpc.tracks.list.useQuery({ limit: 200, offset: 0 });
  const { data: connectionsData, refetch: refetchConnections } = trpc.connections.list.useQuery();
  const createConnection = trpc.connections.create.useMutation({
    onSuccess: () => {
      refetchConnections();
      setConnectFirst(null);
      connectFirstRef.current = null;
      toast.success("Connection created!");
    },
    onError: () => toast.error("Failed to create connection"),
  });
 
  useEffect(() => { connectModeRef.current = connectMode; }, [connectMode]);
  useEffect(() => { connectFirstRef.current = connectFirst; }, [connectFirst]);
 
  const buildGraph = useCallback(() => {
    if (!svgRef.current || !tracksData?.tracks || !connectionsData) return;
 
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
 
    const width = svgRef.current.clientWidth || 900;
    const height = svgRef.current.clientHeight || 600;
 
    const allNodes: NodeDatum[] = tracksData.tracks
      .filter(t => !filterDistrict || t.districtId === filterDistrict)
      .map(t => ({
        id: t.id,
        title: t.title,
        districtId: t.districtId,
        narrativeArc: t.narrativeArc,
        thematicCluster: t.thematicCluster,
        type: t.type,
      }));
 
    const nodeIds = new Set(allNodes.map(n => n.id));
    const links: LinkDatum[] = connectionsData
      .filter(c => nodeIds.has(c.sourceId) && nodeIds.has(c.targetId))
      .map(c => ({
        source: c.sourceId,
        target: c.targetId,
        connectionType: c.connectionType,
        strength: c.strength,
        label: c.label,
      }));
 
    // Defs — natural radial blur
    const defs = svg.append("defs");
 
    // Glow filter — radial, no square
    const glowFilter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-100%").attr("y", "-100%")
      .attr("width", "300%").attr("height", "300%");
    glowFilter.append("feGaussianBlur")
      .attr("stdDeviation", "4")
      .attr("result", "coloredBlur");
    const feMerge = glowFilter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");
 
    // Strong glow for selected
    const strongGlow = defs.append("filter")
      .attr("id", "glow-strong")
      .attr("x", "-150%").attr("y", "-150%")
      .attr("width", "400%").attr("height", "400%");
    strongGlow.append("feGaussianBlur")
      .attr("stdDeviation", "8")
      .attr("result", "coloredBlur");
    const feMerge2 = strongGlow.append("feMerge");
    feMerge2.append("feMergeNode").attr("in", "coloredBlur");
    feMerge2.append("feMergeNode").attr("in", "coloredBlur");
    feMerge2.append("feMergeNode").attr("in", "SourceGraphic");
 
    // Radial gradient per district color for each node
    [1, 2, 3, 4].forEach(id => {
      const color = DISTRICT_COLORS[id];
      const grad = defs.append("radialGradient")
        .attr("id", `node-grad-${id}`)
        .attr("cx", "50%").attr("cy", "35%").attr("r", "65%");
      grad.append("stop").attr("offset", "0%").attr("stop-color", "white").attr("stop-opacity", "0.9");
      grad.append("stop").attr("offset", "40%").attr("stop-color", color).attr("stop-opacity", "1");
      grad.append("stop").attr("offset", "100%").attr("stop-color", color).attr("stop-opacity", "0.6");
    });
 
    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 6])
      .on("zoom", (event) => g.attr("transform", event.transform.toString()));
    zoomRef.current = zoom;
    svg.call(zoom);
 
    svg.append("rect").attr("width", width).attr("height", height).attr("fill", "transparent");
    const g = svg.append("g");
 
    // Simulation
    const simulation = d3.forceSimulation<NodeDatum>(allNodes)
      .force("link", d3.forceLink<NodeDatum, LinkDatum>(links).id(d => d.id).distance(100).strength(0.3))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide(22));
    simulationRef.current = simulation;
 
    // Links
    const link = g.append("g").selectAll("line").data(links).join("line")
      .attr("stroke", d => {
        const c: Record<string, string> = {
          theme: "rgba(0,212,255,0.3)",
          symbol: "rgba(192,132,252,0.3)",
          emotion: "rgba(240,192,64,0.3)",
          narrative: "rgba(155,89,182,0.3)",
          character: "rgba(255,107,107,0.3)"
        };
        return c[d.connectionType] ?? "rgba(255,255,255,0.15)";
      })
      .attr("stroke-width", d => Math.max(1, d.strength / 4));
 
    // Nodes
    const node = g.append("g").selectAll<SVGGElement, NodeDatum>("g").data(allNodes).join("g")
      .attr("cursor", "pointer")
      .call(
        d3.drag<SVGGElement, NodeDatum>()
          .on("start", (event, d) => {
            if (connectModeRef.current) return;
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on("drag", (event, d) => {
            if (connectModeRef.current) return;
            d.fx = event.x; d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (connectModeRef.current) return;
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null; d.fy = null;
          }) as any
      );
 
    // Outer glow circle (blur halo)
    node.append("circle")
      .attr("r", 14)
      .attr("fill", d => DISTRICT_COLORS[d.districtId ?? 1] ?? "#888")
      .attr("fill-opacity", 0.18)
      .attr("filter", "url(#glow)");
 
    // Main node circle
    node.append("circle")
      .attr("r", 8)
      .attr("fill", d => `url(#node-grad-${d.districtId ?? 1})`)
      .attr("stroke", d => DISTRICT_COLORS[d.districtId ?? 0] ?? "#888")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.8)
      .attr("filter", "url(#glow)");
 
    // Labels
    node.append("text")
      .text(d => d.title.length > 18 ? d.title.slice(0, 18) + "…" : d.title)
      .attr("x", 12).attr("y", 4)
      .attr("font-size", "10px")
      .attr("fill", "rgba(255,255,255,0.75)")
      .attr("font-family", "Space Grotesk, sans-serif")
      .attr("font-weight", "500")
      .attr("pointer-events", "none");
 
    node
      .on("mouseenter", (event, d) => {
        d3.select(event.currentTarget).select("circle:nth-child(2)")
          .attr("r", 12)
          .attr("filter", "url(#glow-strong)");
        d3.select(event.currentTarget).select("circle:first-child")
          .attr("r", 20)
          .attr("fill-opacity", 0.3);
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top, node: d });
      })
      .on("mouseleave", (event) => {
        d3.select(event.currentTarget).select("circle:nth-child(2)")
          .attr("r", 8)
          .attr("filter", "url(#glow)");
        d3.select(event.currentTarget).select("circle:first-child")
          .attr("r", 14)
          .attr("fill-opacity", 0.18);
        setTooltip(null);
      })
      .on("click", (_, d) => {
        if (connectModeRef.current) {
          const first = connectFirstRef.current;
          if (!first) {
            setConnectFirst(d);
            connectFirstRef.current = d;
            toast(`Selected "${d.title}" — now click another track to connect`);
          } else if (first.id !== d.id) {
            createConnection.mutate({
              sourceId: first.id,
              targetId: d.id,
              connectionType: "theme",
              strength: 5,
            });
          }
        } else {
          setSelectedNode(d);
        }
      });
 
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as NodeDatum).x ?? 0)
        .attr("y1", d => (d.source as NodeDatum).y ?? 0)
        .attr("x2", d => (d.target as NodeDatum).x ?? 0)
        .attr("y2", d => (d.target as NodeDatum).y ?? 0);
      node.attr("transform", d => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });
  }, [tracksData, connectionsData, filterDistrict]);
 
  useEffect(() => {
    buildGraph();
    return () => { simulationRef.current?.stop(); };
  }, [buildGraph]);
 
  const doZoom = (factor: number) => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, factor);
  };
 
  const doReset = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const w = svgRef.current.clientWidth, h = svgRef.current.clientHeight;
    d3.select(svgRef.current).transition().duration(500).call(
      zoomRef.current.transform,
      d3.zoomIdentity.translate(w * 0.2, h * 0.2).scale(0.6)
    );
  };
 
  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 48px)" }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] flex-shrink-0"
        style={{ background: "rgba(5,5,16,0.95)" }}>
        <div>
          <h1 className="font-display text-lg font-bold text-white">Knowledge Graph</h1>
          <p className="text-[10px] text-white/30">{tracksData?.total ?? 0} nodes · {connectionsData?.length ?? 0} connections · drag, scroll, click</p>
        </div>
        <div className="flex items-center gap-2">
          {[null, 1, 2, 3, 4].map(id => (
            <button key={id ?? "all"}
              onClick={() => setFilterDistrict(id)}
              className="px-2.5 py-1 rounded-full text-[10px] transition-all"
              style={{
                color: id ? (filterDistrict === id ? DISTRICT_COLORS[id] : "rgba(255,255,255,0.3)") : (!filterDistrict ? "white" : "rgba(255,255,255,0.3)"),
                background: id ? (filterDistrict === id ? `${DISTRICT_COLORS[id]}15` : "transparent") : (!filterDistrict ? "rgba(255,255,255,0.1)" : "transparent"),
                border: `1px solid ${id ? (filterDistrict === id ? DISTRICT_COLORS[id] + "40" : "rgba(255,255,255,0.06)") : (!filterDistrict ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)")}`,
              }}>
              {id ? DISTRICT_NAMES[id].split(" ").slice(-1)[0] : "All"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {/* Connect mode button */}
          <button
            onClick={() => { setConnectMode(v => !v); setConnectFirst(null); connectFirstRef.current = null; }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: connectMode ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${connectMode ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.08)"}`,
              color: connectMode ? "#00d4ff" : "rgba(255,255,255,0.4)",
            }}>
            <GitBranch size={12} />
            {connectMode ? (connectFirst ? `→ click target` : "click a track") : "Connect"}
          </button>
          <button onClick={() => doZoom(1.4)} className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all"><ZoomIn size={14} /></button>
          <button onClick={() => doZoom(0.7)} className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all"><ZoomOut size={14} /></button>
          <button onClick={doReset} className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all"><RotateCcw size={14} /></button>
        </div>
      </div>
 
      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden"
        style={{ background: "radial-gradient(ellipse at 40% 40%, #0d0820 0%, #050510 70%)" }}>
        <svg ref={svgRef} className="w-full h-full"
          style={{ cursor: connectMode ? "crosshair" : "default" }} />
 
        {/* Connect mode banner */}
        {connectMode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs font-medium z-20"
            style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff" }}>
            {connectFirst ? `"${connectFirst.title}" selected — click another track to connect` : "Click any track to start a connection"}
          </div>
        )}
 
        {tooltip && (
          <div className="absolute pointer-events-none px-3 py-2 rounded-xl text-xs z-10"
            style={{ left: tooltip.x + 12, top: tooltip.y - 8, background: "rgba(10,6,24,0.97)", border: `1px solid ${DISTRICT_COLORS[tooltip.node.districtId ?? 0] ?? "#fff"}35`, maxWidth: 220 }}>
            <div className="font-display font-bold text-white mb-1 leading-tight">{tooltip.node.title}</div>
            <div className="text-[10px]" style={{ color: DISTRICT_COLORS[tooltip.node.districtId ?? 0] }}>{DISTRICT_NAMES[tooltip.node.districtId ?? 0]}</div>
            <div className="text-[10px] text-white/30">{tooltip.node.narrativeArc} Arc · {tooltip.node.thematicCluster}</div>
          </div>
        )}
 
        <div className="absolute bottom-4 left-4 p-3 rounded-xl text-[10px]"
          style={{ background: "rgba(5,5,16,0.85)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="text-white/25 mb-2 tracking-widest uppercase text-[8px]">Districts</div>
          {[1, 2, 3, 4].map(id => (
            <div key={id} className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: DISTRICT_COLORS[id], boxShadow: `0 0 6px ${DISTRICT_COLORS[id]}` }} />
              <span className="text-white/45">{DISTRICT_NAMES[id]}</span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-white/[0.06] text-white/25 text-[8px]">
            <div className="flex items-center gap-1"><Info size={8} /> Drag · Scroll · Click</div>
          </div>
        </div>
 
        {selectedNode && (
          <div className="absolute right-4 top-4 w-64 p-4 rounded-2xl z-20"
            style={{ background: "rgba(10,6,24,0.97)", border: `1px solid ${DISTRICT_COLORS[selectedNode.districtId ?? 0] ?? "#fff"}30` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="text-[10px] font-medium" style={{ color: DISTRICT_COLORS[selectedNode.districtId ?? 0] }}>
                {DISTRICT_NAMES[selectedNode.districtId ?? 0]}
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-white/30 hover:text-white/70"><X size={14} /></button>
            </div>
            <h3 className="font-display font-bold text-white text-base leading-tight mb-3">{selectedNode.title}</h3>
            <div className="space-y-1.5 mb-4 text-xs">
              <div className="flex justify-between">
                <span className="text-white/30">Arc</span>
                <span style={{ color: ARC_COLORS[selectedNode.narrativeArc ?? ""] ?? "#fff" }}>{selectedNode.narrativeArc}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/30">Cluster</span>
                <span className="text-white/55 text-right max-w-32 truncate">{selectedNode.thematicCluster}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/30">Type</span>
                <span className="text-white/55 capitalize">{selectedNode.type}</span>
              </div>
            </div>
            <Link href={`/track/${selectedNode.id}`}>
              <button className="w-full py-1.5 rounded-lg text-xs font-medium text-[#00d4ff] transition-all hover:bg-[#00d4ff]/10"
                style={{ border: "1px solid rgba(0,212,255,0.2)" }}>
                View Details →
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
