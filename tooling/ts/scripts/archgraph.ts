// Render the Suluk architecture as a UML "Strata-of-Derivation" diagram — a STATIC SVG string built server-side
// with d3 + jsdom (no client JS, no interactivity), so the same <img> renders in BOTH the HTML docs site and the
// GitHub-markdown mirror. It replaces the old flat package-dependency graph on the Architecture guide page with a
// richer, UML-flavoured picture (design: the 3-lens design panel, 2026-07-02):
//
//   • every @suluk package is a UML class-box: a «stereotype» role + name header, an exports-count badge, and a
//     members compartment listing a sample of its public exports in `+ member` notation;
//   • packages are stacked in six NAMED strata bands (L5 apps at the top … L0 foundation at the bottom), so the
//     eye reads Suluk's "one contract in → a whole derived stack out" story top-to-bottom;
//   • dependencies are UML «use» dependencies (dashed line, open arrowhead at the supplier), all pointing DOWN;
//   • `core` (25 of 47 packages depend on it) is the keystone: pinned bottom-centre, peach-bordered, with a
//     peach "keystone bus" rail rising out of it and a `←25` fan-in badge — so its centrality reads as a single
//     spine, not 25 crossing lines.
//
// Deterministic (no force sim, no Math.random/Date): identical input → byte-identical SVG, so the committed file
// only changes when the graph does. Build tooling only — jsdom/d3 never touch the published @suluk/docs package.
import { JSDOM } from "jsdom";
import * as d3 from "d3";
import type { ArchitectureGraph, ArchNode } from "../packages/docs/src/index";

// ── geometry ───────────────────────────────────────────────────────────────────────────────────────────────
const BOX_W = 178, GAP_X = 24, PITCH = BOX_W + GAP_X; // 202
const LEAF_H = 78, HUB_H = 96; // hubs (≥2 dependents) are a touch taller for a 3rd member line
const STRIP_H = 5, HDR_H = 40, RX = 7;
const LEFT_RAIL = 52, LEFT_PAD = 26, RIGHT_PAD = 34;
const BAND_PAD = 18, ROW_GAP = 18, BAND_GUTTER = 26, TITLE_H = 92, BOTTOM = 40;
const MAX_PER_ROW = 8;

// ── palette (all literal — an <img> can't read CSS vars; dark boxes carry their own contrast on light OR dark) ─
const C = {
  panel: "#12151d", node: "#242938", core: "#2c3242", border: "#3a4050", coreBorder: "#e8862f",
  name: "#eef1f7", member: "#c9cedc", muted: "#6e7484", shadow: "#00000030",
  edge: "#8a90a0", bus: "#e8862f", hairline: "#3a3f4d", title: "#e7eaf1", sub: "#9aa1b2",
  fanin: "#2b2f3a", faninText: "#e7eaf1",
};
// six layer hues (strip / rail / band-tint / badge fill); all pass ≥4.5:1 with white badge text
const HUE = ["#e8a34c", "#34b3a6", "#6e8bf0", "#b48cea", "#ee7fa0", "#5fb874"]; // L0…L5

/** Build a name → «stereotype» role lookup from a {role: names[]} table; unmapped names fall back to `fallback`. */
function roleTable(table: Record<string, string[]>, fallback: string): (name: string) => string {
  const map: Record<string, string> = {};
  for (const role of Object.keys(table)) for (const n of table[role]) map[n] = role;
  return (name: string) => map[name] ?? fallback;
}

/**
 * Everything about a graph that differs between the two surfaces this renderer draws — the @suluk PACKAGE stack
 * and the shadcn-REGISTRY stack. The layout/box/edge/legend machinery is identical; only these vary.
 */
export interface DiagramConfig {
  title: string;
  /** subtitle line (n = node count). */ subtitle: (n: number) => string;
  caption: string;
  /** the node to emphasise (border + halo + bus) — the graph's keystone; "" for none. */ keystoneName: string;
  keystoneBusLabel: (deps: number) => string;
  keystoneLegend: (deps: number) => string;
  roleOf: (name: string) => string;
  /** editorial band label per layer index (full form). */ bandLabels: string[];
  bandLabelsShort: string[];
  /** legend line describing what a box is. */ boxLegend: string;
  /** legend line describing an edge. */ edgeLegend: string;
  deprecated: Set<string>;
  /** OPTIONAL band override — return a node's stratum index (0-based) directly instead of the topological longest-path.
   *  The registry graph uses this so its bands ARE its `foundation|services|derivation|surfaces` folders (labels match). */
  layerOf?: (node: ArchNode) => number;
}

/** The @suluk PACKAGE stack — the default (so `renderArchitectureSvg(graph)` keeps its original output). */
export const PACKAGE_CONFIG: DiagramConfig = {
  title: "Suluk — architecture",
  subtitle: (n) => `One v4 contract in — a whole derived stack out. ${n} @suluk packages · read top (apps) down to core.`,
  caption: "Boxes = packages (UML class-box: «role» · name · NN exports · sample members). Dashed → = «use» dependency (points to the supplier).",
  keystoneName: "core",
  keystoneBusLabel: (d) => `↓ core keystone bus · ${d} depend on core`,
  keystoneLegend: (d) => `core keystone bus (${d} depend on core)`,
  roleOf: roleTable({
    contract: ["core"],
    engine: ["hono", "builder", "platform", "provision"],
    primitive: ["zod", "theme", "i18n", "env", "examples", "models"],
    facet: ["harden", "cost", "openapi-compat", "seo", "keys", "credits"],
    renderer: ["scalar", "swagger", "reference", "editor", "docs", "cockpit", "panel"],
    generator: ["sdk", "stubgen", "testgen", "drizzle", "shadcn", "mcp", "nano-stores"],
    adapter: ["cloudflare", "better-auth", "payments", "stripe", "deploy", "email", "agents", "chat", "billing"],
    app: ["admin", "suluk-vscode"],
    tooling: ["eslint", "visual", "journeys", "scalar-standalone", "typedoc-umlclass"],
  }, "package"),
  bandLabels: [
    "L0 · FOUNDATION — primitives & the core contract",
    "L1 · DERIVATION — engine & facets",
    "L2 · PROJECTIONS — renderers, stores & data",
    "L3 · COMPOSERS — builder / billing / editor",
    "L4 · COCKPIT — governed console",
    "L5 · APPS — shipped surfaces",
  ],
  bandLabelsShort: ["L0 · FOUNDATION", "L1 · DERIVATION", "L2 · PROJECTIONS", "L3 · COMPOSERS", "L4 · COCKPIT", "L5 · APPS"],
  boxLegend: "package (@suluk/*) — header + top exports",
  edgeLegend: "«use» dependency → the supplier",
  deprecated: new Set(["stripe"]),
};

/** The shadcn-REGISTRY stack — own-the-code backend modules wired over the @suluk packages, tied by registryDependencies. */
export const REGISTRY_CONFIG: DiagramConfig = {
  title: "Suluk registry — how the modules compose",
  subtitle: (n) => `${n} own-the-code backend modules · each builds on the ones below · read top (surfaces) down to the app.`,
  caption: "Boxes = registry items (UML class-box: «role» · name · NN exports · sample members). Dashed → = registry dependency (points to the module it builds on).",
  keystoneName: "app",
  keystoneBusLabel: (d) => `↓ app foundation · ${d} modules build on app`,
  keystoneLegend: (d) => `app foundation bus (${d} build on app)`,
  roleOf: roleTable({
    foundation: ["app"],
    auth: ["auth", "keys"],
    contract: ["contract"],
    ledger: ["credits", "cost", "billing"],
    middleware: ["rate-limit", "rate-credit", "i18n"],
    service: ["erasure", "logs", "webhooks", "email"],
    surface: ["admin", "reference", "mcp"],
    dev: ["audit", "journeys"],
  }, "module"),
  bandLabels: [
    "L0 · FOUNDATION — the Hono app + Effect runtime seam",
    "L1 · SERVICES — auth, billing, credits & the feature modules",
    "L2 · DERIVATION — the contract keystone + key algebra",
    "L3 · SURFACES — the reference & MCP endpoints",
  ],
  bandLabelsShort: ["L0 · FOUNDATION", "L1 · SERVICES", "L2 · DERIVATION", "L3 · SURFACES"],
  boxLegend: "registry item — header + top exports",
  edgeLegend: "registry dependency → the base module",
  deprecated: new Set(),
  // band each item by its STRATUM FOLDER (foundation→services→derivation→surfaces) so the graph's bands ARE the registry's
  // folder categories (labels accurate). Safe: every registryDependency points from a higher stratum to a lower one.
  layerOf: (n) => { const i = ["foundation", "services", "derivation", "surfaces"].indexOf(n.category ?? ""); return i >= 0 ? i : 1; },
};

/** UML member notation for a sampled export name: `+ Name` for a Type (Capitalized), `+ name()` for a function. */
function memberLabel(name: string): string {
  const isType = /^[A-Z]/.test(name);
  const trimmed = name.length > 16 ? `${name.slice(0, 15)}…` : name;
  return isType ? `+ ${trimmed}` : `+ ${trimmed}()`;
}

interface Placed extends ArchNode { layer: number; dependents: number; hub: boolean; x: number; cx: number; y: number; h: number; }

/** Longest-path layer of a node: 0 if it has no drawn deps, else 1 + max(layer(dep)). Cycle-guarded, deterministic. */
function layersOf(graph: ArchitectureGraph): Map<string, number> {
  const deps = new Map<string, string[]>();
  graph.nodes.forEach((n) => deps.set(n.id, []));
  graph.links.forEach((l) => deps.get(l.source)?.push(l.target));
  const layer = new Map<string, number>();
  const visit = (id: string, stack: Set<string>): number => {
    if (layer.has(id)) return layer.get(id)!;
    if (stack.has(id)) return 0;
    stack.add(id);
    const ds = deps.get(id) ?? [];
    const l = ds.length ? 1 + Math.max(...ds.map((d) => visit(d, stack))) : 0;
    stack.delete(id);
    layer.set(id, l);
    return l;
  };
  [...graph.nodes].sort((a, b) => a.id.localeCompare(b.id)).forEach((n) => visit(n.id, new Set()));
  return layer;
}

/** Balanced wrap: n nodes at ≤MAX_PER_ROW cols → the per-row count that evens the rows (e.g. 10 → 5+5, 15 → 8+7). */
function perRowOf(n: number): number {
  const rows = Math.max(1, Math.ceil(n / MAX_PER_ROW));
  return Math.ceil(n / rows);
}

/** Deterministic layout: order each band (barycentre over lower bands, keystone pinned centre), place, size, y-stack. */
function layout(graph: ArchitectureGraph, keystoneName: string, layerOf?: (node: ArchNode) => number) {
  const coreId = graph.nodes.find((n) => n.name === keystoneName)?.id;
  // bands come from the config's `layerOf` (e.g. the registry's stratum folder) when supplied, else the topological longest-path.
  const layer = layerOf ? new Map(graph.nodes.map((n) => [n.id, Math.max(0, layerOf(n))])) : layersOf(graph);
  const maxLayer = Math.max(0, ...layer.values());
  const dependents = new Map<string, number>();
  graph.nodes.forEach((n) => dependents.set(n.id, 0));
  graph.links.forEach((l) => dependents.set(l.target, (dependents.get(l.target) ?? 0) + 1));
  const depsOf = new Map<string, string[]>();
  graph.nodes.forEach((n) => depsOf.set(n.id, []));
  graph.links.forEach((l) => depsOf.get(l.source)?.push(l.target));

  // content width = widest band's row (independent of ordering) so every band's rows can be centred within it.
  const bandSize = new Map<number, number>();
  graph.nodes.forEach((n) => bandSize.set(layer.get(n.id)!, (bandSize.get(layer.get(n.id)!) ?? 0) + 1));
  let maxCols = 1;
  for (const [, n] of bandSize) maxCols = Math.max(maxCols, perRowOf(n));
  const innerW = maxCols * BOX_W + (maxCols - 1) * GAP_X;
  const contentLeft = LEFT_RAIL + LEFT_PAD;

  const placed = new Map<string, Placed>();
  const byLayer: string[][] = []; // ordered ids per layer

  // ── bottom-up ordering + x (x is y-independent, so we can compute it first and barycentre higher bands on it) ─
  for (let l = 0; l <= maxLayer; l++) {
    const ids = graph.nodes.filter((n) => layer.get(n.id) === l).map((n) => n.id);
    const bary = (id: string): number => {
      const xs = (depsOf.get(id) ?? []).map((d) => placed.get(d)?.cx).filter((v): v is number => v != null);
      return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : Number.POSITIVE_INFINITY;
    };
    ids.sort((a, b) => {
      const ba = bary(a), bb = bary(b);
      if (ba !== bb) return ba - bb; // align above dependencies
      const da = dependents.get(a)!, db = dependents.get(b)!;
      if (da !== db) return db - da; // hubs toward the centre-ish (earlier)
      return a.localeCompare(b);
    });
    // pin core to the centre column of its band's first row (so the keystone bus runs up the middle)
    const ci = coreId ? ids.indexOf(coreId) : -1;
    if (ci >= 0) {
      ids.splice(ci, 1);
      ids.splice(Math.min(Math.floor(perRowOf(ids.length + 1) / 2), ids.length), 0, coreId!);
    }
    byLayer[l] = ids;

    const perRow = perRowOf(ids.length);
    const node = new Map(graph.nodes.map((n) => [n.id, n] as const));
    ids.forEach((id, i) => {
      const col = i % perRow;
      const subRow = Math.floor(i / perRow);
      const rowCount = Math.min(perRow, ids.length - subRow * perRow);
      const rowW = rowCount * BOX_W + (rowCount - 1) * GAP_X;
      const startX = contentLeft + (innerW - rowW) / 2;
      const x = startX + col * PITCH;
      const dep = dependents.get(id)!;
      placed.set(id, {
        ...(node.get(id) as ArchNode), layer: l, dependents: dep, hub: dep >= 2,
        x, cx: x + BOX_W / 2, y: 0, h: dep >= 2 ? HUB_H : LEAF_H,
      });
      (placed.get(id) as Placed & { subRow: number }).subRow = subRow;
    });
  }

  // ── top-down y assignment (L5 at the top … L0 at the bottom) ─
  let y = TITLE_H;
  const bands: { layer: number; top: number; bottom: number }[] = [];
  for (let l = maxLayer; l >= 0; l--) {
    const ids = byLayer[l] ?? [];
    const perRow = perRowOf(ids.length);
    const rows = Math.max(1, Math.ceil(ids.length / perRow));
    const rowH: number[] = [];
    for (let r = 0; r < rows; r++) {
      const rowIds = ids.filter((_, i) => Math.floor(i / perRow) === r);
      rowH[r] = Math.max(LEAF_H, ...rowIds.map((id) => placed.get(id)!.h));
    }
    const bandTop = y;
    const bandBody = rowH.reduce((a, b) => a + b, 0) + (rows - 1) * ROW_GAP;
    ids.forEach((id, i) => {
      const r = Math.floor(i / perRow);
      const above = rowH.slice(0, r).reduce((a, b) => a + b, 0) + r * ROW_GAP;
      placed.get(id)!.y = bandTop + BAND_PAD + above;
    });
    bands.push({ layer: l, top: bandTop, bottom: bandTop + BAND_PAD * 2 + bandBody });
    y = bandTop + BAND_PAD * 2 + bandBody + BAND_GUTTER;
  }
  const width = contentLeft + innerW + RIGHT_PAD;
  const height = y - BAND_GUTTER + BOTTOM;
  return { placed, bands, width, height, maxLayer };
}

// ── small SVG helpers ─────────────────────────────────────────────────────────────────────────────────────
type Sel = d3.Selection<SVGGElement, unknown, null, undefined>;
/** A rect rounded on the TOP two corners only (for the coloured layer strip flush to the box top). */
const topRoundedRect = (w: number, r: number, h: number) =>
  `M0,${r} Q0,0 ${r},0 H${w - r} Q${w},0 ${w},${r} V${h} H0 Z`;

/** Render the architecture UML diagram to a standalone SVG string. `config` selects the package/registry surface. */
export function renderArchitectureSvg(graph: ArchitectureGraph, config: DiagramConfig = PACKAGE_CONFIG): string {
  const { placed, bands, width, height, maxLayer } = layout(graph, config.keystoneName, config.layerOf);
  const nodeOf = (id: string) => placed.get(id);
  const coreId = graph.nodes.find((n) => n.name === config.keystoneName)?.id;

  const doc = new JSDOM("<!DOCTYPE html><body></body>").window.document;
  const svg = d3
    .select(doc.body)
    .append("svg")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("font-family", "ui-sans-serif, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif")
    .attr("role", "img")
    .attr("aria-label", `${config.title} — ${graph.nodes.length} nodes in ${maxLayer + 1} strata`);

  // markers: open (unfilled) UML dependency arrowheads, one per colour
  const defs = svg.append("defs");
  const openArrow = (id: string, stroke: string) =>
    defs.append("marker").attr("id", id).attr("viewBox", "0 0 10 10").attr("refX", 8).attr("refY", 5)
      .attr("markerWidth", 9).attr("markerHeight", 9).attr("orient", "auto-start-reverse").attr("markerUnits", "userSpaceOnUse")
      .append("path").attr("d", "M1,1 L8.5,5 L1,9").attr("fill", "none").attr("stroke", stroke).attr("stroke-width", 1.3);
  openArrow("arr", C.edge);

  // panel background
  svg.append("rect").attr("x", 0).attr("y", 0).attr("width", width).attr("height", height).attr("fill", C.panel);

  // ── strata bands: tint + hairline + rotated left-rail label ─
  bands.forEach((b) => {
    const hue = HUE[b.layer];
    svg.append("rect").attr("x", 6).attr("y", b.top).attr("width", width - 12).attr("height", b.bottom - b.top)
      .attr("rx", 10).attr("fill", hue).attr("fill-opacity", 0.08);
    svg.append("line").attr("x1", 6).attr("x2", width - 6).attr("y1", b.top).attr("y2", b.top)
      .attr("stroke", C.hairline).attr("stroke-width", 1);
    const midY = (b.top + b.bottom) / 2;
    // the rotated label runs VERTICALLY, so its footprint is the band's HEIGHT; fall back to the short form when
    // the full label wouldn't fit (short top bands), so adjacent bands' labels never interleave.
    const full = config.bandLabels[b.layer] ?? `L${b.layer}`;
    const fits = full.length * 6.4 <= b.bottom - b.top - 12;
    svg.append("text").attr("transform", `translate(${LEFT_RAIL - 16},${midY}) rotate(-90)`).attr("text-anchor", "middle")
      .attr("font-size", 10).attr("font-weight", 700).attr("letter-spacing", "0.06em").attr("fill", hue)
      .attr("fill-opacity", 0.92).text(fits ? full : (config.bandLabelsShort[b.layer] ?? `L${b.layer}`));
  });
  // the L0 "ground" double baseline
  const l0 = bands.find((b) => b.layer === 0);
  if (l0) svg.append("line").attr("x1", 6).attr("x2", width - 6).attr("y1", l0.bottom - 2).attr("y2", l0.bottom - 2)
    .attr("stroke", HUE[0]).attr("stroke-opacity", 0.5).attr("stroke-width", 2);

  // ── the peach keystone bus: a rail rising out of core up through the strata (core's edges, collapsed) ─
  const core = coreId ? nodeOf(coreId) : undefined;
  if (core) {
    const topBand = Math.min(...bands.map((b) => b.top));
    const railTop = topBand + 4;
    svg.append("line").attr("x1", core.cx).attr("x2", core.cx).attr("y1", core.y).attr("y2", railTop)
      .attr("stroke", C.bus).attr("stroke-width", 2.5).attr("stroke-opacity", 0.85);
    // ◆ trunk entering core's top edge
    const d = 6, ty = core.y;
    svg.append("path").attr("d", `M${core.cx},${ty - d} L${core.cx + d},${ty} L${core.cx},${ty + d} L${core.cx - d},${ty} Z`)
      .attr("fill", C.bus);
    // horizontal label in the gutter above the top band (a rotated one runs off the top edge)
    svg.append("text").attr("x", core.cx).attr("y", topBand - 8).attr("text-anchor", "middle")
      .attr("font-size", 10).attr("font-weight", 700).attr("fill", C.bus)
      .text(config.keystoneBusLabel(core.dependents));
  }

  // ── dependency edges (all except the collapsed core edges): dashed «use» beziers, open arrow, behind nodes ─
  graph.links.forEach((l) => {
    if (l.target === coreId) return; // collapsed into the keystone bus
    const s = nodeOf(l.source), t = nodeOf(l.target);
    if (!s || !t) return;
    const x1 = s.cx, y1 = s.y + s.h; // source bottom-centre
    const x2 = t.cx, y2 = t.y; // target top-centre
    const my = (y1 + y2) / 2;
    svg.append("path").attr("fill", "none").attr("stroke", C.edge).attr("stroke-opacity", 0.5)
      .attr("stroke-width", 1).attr("stroke-dasharray", "5,4")
      .attr("d", `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`).attr("marker-end", "url(#arr)");
  });

  // ── nodes (core drawn last, on top of its halo) ─
  const drawNode = (p: Placed) => {
    const hue = HUE[p.layer];
    const isCore = p.name === config.keystoneName;
    const g = (svg.append("g") as unknown as Sel).attr("transform", `translate(${p.x},${p.y})`);
    if (isCore) g.append("ellipse").attr("cx", BOX_W / 2).attr("cy", p.h / 2).attr("rx", BOX_W / 2 + 16).attr("ry", p.h / 2 + 12)
      .attr("fill", C.bus).attr("fill-opacity", 0.14);
    g.append("rect").attr("x", 1).attr("y", 2).attr("width", BOX_W).attr("height", p.h).attr("rx", RX).attr("fill", C.shadow); // baked shadow
    g.append("rect").attr("width", BOX_W).attr("height", p.h).attr("rx", RX).attr("fill", isCore ? C.core : C.node)
      .attr("stroke", isCore ? C.coreBorder : C.border).attr("stroke-width", isCore ? 2.5 : 1);
    g.append("path").attr("d", topRoundedRect(BOX_W, RX, STRIP_H)).attr("fill", hue); // layer strip

    // header: «stereotype» + name (+ deprecated mark)
    g.append("text").attr("x", BOX_W / 2).attr("y", STRIP_H + 15).attr("text-anchor", "middle")
      .attr("font-size", 9.5).attr("font-style", "italic").attr("fill", hue).text(`«${config.roleOf(p.name)}»`);
    const deprecated = config.deprecated.has(p.name);
    const nameT = g.append("text").attr("x", BOX_W / 2).attr("y", STRIP_H + 31).attr("text-anchor", "middle")
      .attr("font-size", 13).attr("font-weight", 700).attr("fill", deprecated ? C.muted : C.name).text(p.name);
    if (deprecated) nameT.attr("text-decoration", "line-through");

    // exports badge (top-RIGHT header corner); hollow for a 0-export bundle
    const label = p.exports > 0 ? String(p.exports) : "bundle";
    const bw = label.length * 6.4 + 12;
    const bg = g.append("g").attr("transform", `translate(${BOX_W - bw - 7},${9})`);
    bg.append("rect").attr("width", bw).attr("height", 15).attr("rx", 7.5)
      .attr("fill", p.exports > 0 ? hue : "none").attr("stroke", p.exports > 0 ? "none" : hue).attr("stroke-width", 1);
    bg.append("text").attr("x", bw / 2).attr("y", 11).attr("text-anchor", "middle").attr("font-size", 9).attr("font-weight", 700)
      .attr("fill", p.exports > 0 ? "#12151d" : hue).text(label);

    // fan-in badge (hubs only) in the top-LEFT header corner, flanking the centred «stereotype» opposite the
    // exports badge — keeps it clear of the left-aligned members compartment below.
    if (p.hub) {
      const fl = `←${p.dependents}`, fw = fl.length * 6.2 + 10;
      const fg = g.append("g").attr("transform", `translate(7,9)`);
      fg.append("rect").attr("width", fw).attr("height", 15).attr("rx", 7.5).attr("fill", isCore ? C.bus : C.fanin);
      fg.append("text").attr("x", fw / 2).attr("y", 11).attr("text-anchor", "middle").attr("font-size", 9).attr("font-weight", 700)
        .attr("fill", isCore ? "#1a1200" : C.faninText).text(fl);
    }

    // divider + members compartment
    g.append("line").attr("x1", 0).attr("x2", BOX_W).attr("y1", HDR_H).attr("y2", HDR_H).attr("stroke", C.border);
    const slots = p.hub ? 3 : 2;
    if (p.exports === 0) {
      g.append("text").attr("x", 10).attr("y", HDR_H + 20).attr("font-size", 9.5).attr("font-style", "italic")
        .attr("fill", C.muted).text("‹ bundle — no public API ›");
    } else {
      p.topExports.slice(0, slots).forEach((ex, i) => {
        g.append("text").attr("x", 10).attr("y", HDR_H + 18 + i * 15).attr("font-size", 10.5)
          .attr("font-family", "ui-monospace, SFMono-Regular, Menlo, monospace").attr("fill", C.member).text(memberLabel(ex));
      });
    }

  };
  [...placed.values()].filter((p) => p.name !== config.keystoneName).sort((a, b) => a.layer - b.layer || a.x - b.x).forEach(drawNode);
  if (core) drawNode(core);

  // ── title + thesis caption (top-left) ─
  svg.append("text").attr("x", 14).attr("y", 30).attr("font-size", 20).attr("font-weight", 800).attr("fill", C.title)
    .text(config.title);
  svg.append("text").attr("x", 14).attr("y", 52).attr("font-size", 12).attr("fill", C.sub)
    .text(config.subtitle(graph.nodes.length));
  svg.append("text").attr("x", 14).attr("y", 70).attr("font-size", 11).attr("fill", C.muted)
    .text(config.caption);

  // ── legend (top-right), itself a small «legend» UML box ─
  drawLegend(svg, width, config, maxLayer, core?.dependents ?? 0);

  return (doc.body.querySelector("svg") as unknown as { outerHTML: string }).outerHTML;
}

/** A compact key, drawn as a small «legend» class-box in the sparse upper-right whitespace. */
function drawLegend(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, width: number, config: DiagramConfig, maxLayer: number, keystoneDeps: number) {
  const w = 322, h = 150, x = width - w - RIGHT_PAD, y = TITLE_H + 14;
  const g = (svg.append("g") as unknown as Sel).attr("transform", `translate(${x},${y})`);
  g.append("rect").attr("width", w).attr("height", h).attr("rx", RX).attr("fill", C.core).attr("stroke", C.border).attr("stroke-width", 1);
  g.append("text").attr("x", w / 2).attr("y", 17).attr("text-anchor", "middle").attr("font-size", 10).attr("font-style", "italic").attr("fill", C.sub).text("«legend»");
  g.append("line").attr("x1", 0).attr("x2", w).attr("y1", 24).attr("y2", 24).attr("stroke", C.border);

  const line = (yy: number, draw: (gg: Sel) => void, text: string) => {
    const row = (g.append("g") as unknown as Sel).attr("transform", `translate(12,${yy})`);
    draw(row);
    row.append("text").attr("x", 44).attr("y", 4).attr("font-size", 10).attr("fill", C.member).text(text);
  };
  line(38, (r) => r.append("path").attr("d", "M0,0 H32").attr("stroke", C.edge).attr("stroke-width", 1).attr("stroke-dasharray", "5,4").attr("marker-end", "url(#arr)"), config.edgeLegend);
  line(58, (r) => r.append("line").attr("x1", 0).attr("x2", 32).attr("y1", 0).attr("y2", 0).attr("stroke", C.bus).attr("stroke-width", 2.5), config.keystoneLegend(keystoneDeps));
  line(78, (r) => { r.append("rect").attr("x", 0).attr("y", -6).attr("width", 22).attr("height", 13).attr("rx", 6.5).attr("fill", HUE[2]); r.append("text").attr("x", 11).attr("y", 4).attr("text-anchor", "middle").attr("font-size", 9).attr("font-weight", 700).attr("fill", "#12151d").text("NN"); }, "public export count");
  line(98, (r) => { r.append("rect").attr("x", 0).attr("y", -6).attr("width", 22).attr("height", 13).attr("rx", 6.5).attr("fill", C.fanin); r.append("text").attr("x", 11).attr("y", 4).attr("text-anchor", "middle").attr("font-size", 9).attr("font-weight", 700).attr("fill", C.faninText).text("←N"); }, "fan-in: dependents on this");
  // layer hue chips (only the strata that exist)
  const chips = (g.append("g") as unknown as Sel).attr("transform", `translate(12,${118})`);
  chips.append("text").attr("x", 0).attr("y", 4).attr("font-size", 9.5).attr("fill", C.muted).text("strata:");
  for (let i = 0; i <= Math.min(maxLayer, 5); i++) {
    const cg = chips.append("g").attr("transform", `translate(${44 + i * 46},0)`);
    cg.append("rect").attr("x", 0).attr("y", -7).attr("width", 12).attr("height", 12).attr("rx", 2).attr("fill", HUE[i]);
    cg.append("text").attr("x", 16).attr("y", 3).attr("font-size", 9.5).attr("fill", C.member).text(`L${i}`);
  }
}
