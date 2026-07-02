// Render the @suluk package-dependency graph to a STATIC SVG string with d3 (server-side, via jsdom) — the d3
// replacement for the retired D2/kroki path. Deterministic layered layout (foundational packages on the left,
// higher-level ones on the right; "depends on" arrows point left toward dependencies), so the committed SVG only
// changes when the graph does. Static SVG (not client-d3) so it renders in BOTH the HTML site and the GitHub
// markdown mirror (as an <img>). Build tooling only — the heavy jsdom/d3 deps never touch the published @suluk/docs.
import { JSDOM } from "jsdom";
import * as d3 from "d3";
import type { PackageGraph } from "../packages/docs/src/index";

const NODE_W = 128, NODE_H = 26, COL_GAP = 66, ROW_GAP = 12, PAD = 16;
// A neutral palette baked into the SVG (an <img> can't read the page's theme vars) — readable on light or dark.
const C = { box: "#f6f8fa", boxStroke: "#6e9ecf", text: "#24292f", edge: "#8b949e", title: "#57606a" };

/** Longest-path layer of each node: 0 if it has no drawn deps, else 1 + max(layer(dep)). Cycle-guarded. */
function layerOf(graph: PackageGraph): Map<string, number> {
  const deps = new Map<string, string[]>();
  graph.nodes.forEach((n) => deps.set(n.id, []));
  graph.links.forEach((l) => deps.get(l.source)?.push(l.target));
  const layer = new Map<string, number>();
  const visit = (id: string, stack: Set<string>): number => {
    if (layer.has(id)) return layer.get(id)!;
    if (stack.has(id)) return 0; // break a dependency cycle
    stack.add(id);
    const ds = deps.get(id) ?? [];
    const l = ds.length ? 1 + Math.max(...ds.map((d) => visit(d, stack))) : 0;
    stack.delete(id);
    layer.set(id, l);
    return l;
  };
  graph.nodes.forEach((n) => visit(n.id, new Set()));
  return layer;
}

/** Render the graph to a standalone SVG string. */
export function renderPackageGraphSvg(graph: PackageGraph): string {
  const layer = layerOf(graph);
  const maxLayer = Math.max(0, ...layer.values());
  // group by layer, order alphabetically within a column (deterministic)
  const byLayer = d3.group(graph.nodes, (n) => layer.get(n.id) ?? 0);
  const pos = new Map<string, { x: number; y: number; label: string }>();
  let maxRows = 0;
  for (let l = 0; l <= maxLayer; l++) {
    const col = (byLayer.get(l) ?? []).slice().sort((a, b) => a.label.localeCompare(b.label));
    maxRows = Math.max(maxRows, col.length);
    col.forEach((n, i) => pos.set(n.id, { x: PAD + l * (NODE_W + COL_GAP), y: PAD + 24 + i * (NODE_H + ROW_GAP), label: n.label }));
  }
  const width = PAD * 2 + (maxLayer + 1) * NODE_W + maxLayer * COL_GAP;
  const height = PAD * 2 + 24 + maxRows * (NODE_H + ROW_GAP);

  const doc = new JSDOM("<!DOCTYPE html><body></body>").window.document;
  const svg = d3
    .select(doc.body)
    .append("svg")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height)
    .attr("font-family", "ui-sans-serif, system-ui, sans-serif");

  const marker = svg
    .append("defs")
    .append("marker")
    .attr("id", "pg-arrow")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 9)
    .attr("refY", 5)
    .attr("markerWidth", 7)
    .attr("markerHeight", 7)
    .attr("orient", "auto-start-reverse");
  marker.append("path").attr("d", "M0,0 L10,5 L0,10 z").attr("fill", C.edge);

  svg.append("text").attr("x", PAD).attr("y", 14).attr("font-size", 12).attr("fill", C.title)
    .text(`Suluk — how the tools compose (${graph.nodes.length} packages · each → its @suluk dependencies)`);

  // edges: source (dependent, right) → target (dependency, left); arrow at the dependency.
  graph.links.forEach((l) => {
    const s = pos.get(l.source), t = pos.get(l.target);
    if (!s || !t) return;
    const x1 = s.x, y1 = s.y + NODE_H / 2; // left edge of the dependent
    const x2 = t.x + NODE_W, y2 = t.y + NODE_H / 2; // right edge of the dependency
    const mx = (x1 + x2) / 2;
    svg.append("path").attr("fill", "none").attr("stroke", C.edge).attr("stroke-width", 1)
      .attr("d", `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`).attr("marker-end", "url(#pg-arrow)");
  });

  // nodes
  pos.forEach((p) => {
    const g = svg.append("g").attr("transform", `translate(${p.x},${p.y})`);
    g.append("rect").attr("width", NODE_W).attr("height", NODE_H).attr("rx", 5).attr("fill", C.box).attr("stroke", C.boxStroke).attr("stroke-width", 1);
    g.append("text").attr("x", NODE_W / 2).attr("y", NODE_H / 2 + 4).attr("text-anchor", "middle")
      .attr("font-family", "ui-monospace, SFMono-Regular, Menlo, monospace").attr("font-size", 11.5).attr("fill", C.text).text(p.label);
  });

  return (doc.body.querySelector("svg") as unknown as { outerHTML: string }).outerHTML;
}
