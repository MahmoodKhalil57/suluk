/**
 * diagram.ts — visualize an `x-suluk-agents` agent (C027) as an interactive, ZOOMABLE D3 tree. `agentDiagram()` builds
 * a typed composition hierarchy (agent → Skills / Resident routes / Cold-tail routes / Sub-agents, recursive, cycle-
 * safe); `agentDiagramHtml()` wraps it in ONE self-contained HTML page (D3 v7 from a CDN) — a collapsible tree you read
 * top-level for the SHAPE (who the agent is, what it serves by default vs behind `discover_tools`, its sub-agents) and
 * click / pan / zoom into for the DETAIL (scopes, guarantees, models, tiers, trust boundaries). Pure + deterministic;
 * read-only (no execution, no credentials) — the C020 OBSERVE seam.
 */
import type { OpenAPIv4Document, SulukAgent } from "@suluk/core";
import { agentMap, childKeys } from "./resolve";

export type DiagramKind = "agent" | "subagent" | "group" | "skill" | "route";

export interface DiagramNode {
  id: string;
  label: string;
  kind: DiagramKind;
  tier?: "resident" | "cold-tail";
  /** short pills shown on hover (model / scope / guarantee / tier / trust / maxDepth …). */
  badges: string[];
  /** a one-liner under the title (the agent description / the skill `whenToUse`). */
  note?: string;
  /** start collapsed (the cold-tail does, so the default view stays high-level). */
  collapsed?: boolean;
  children?: DiagramNode[];
}

type Route = NonNullable<SulukAgent["routes"]>[string];

/** Build the agent's composition hierarchy. Cycle-safe: a back-edge on the current path becomes a marked leaf. */
export function agentDiagram(doc: OpenAPIv4Document, agentName: string): DiagramNode {
  const map = agentMap(doc);
  const onPath = new Set<string>();

  const routeNode = (parent: string, rk: string, r: Route): DiagramNode => ({
    id: parent + "::route::" + rk,
    label: rk,
    kind: "route",
    tier: r.tier ?? "resident",
    badges: [...(r.guarantee ? ["⚙ " + r.guarantee] : []), ...(r.scope?.length ? ["🔑 " + r.scope.join(" ")] : [])],
  });

  const build = (name: string, local: string, isRoot: boolean): DiagramNode => {
    const a = map[name];
    if (!a) return { id: local + "@missing", label: local, kind: "subagent", badges: ["⚠ missing: " + name] };
    if (onPath.has(name)) return { id: local + "@cycle", label: local + " ↩", kind: "subagent", badges: ["⚠ cycle → " + name] };
    onPath.add(name);
    const children: DiagramNode[] = [];

    // skills (model-bearing — the LLM tier)
    const skills = Object.entries(a.skills ?? {});
    if (skills.length) children.push({
      id: name + "::skills", label: "Skills", kind: "group", badges: [String(skills.length)],
      children: skills.map(([sk, s]) => ({
        id: name + "::skill::" + sk, label: sk, kind: "skill", tier: s.tier, note: s.whenToUse,
        badges: [
          s.model?.length ? "🧠 " + s.model[0] + (s.model.length > 1 ? " +" + (s.model.length - 1) : "") : s.modelProfile ? "🧠 profile " + s.modelProfile : "🧠 NEEDS-derived",
          ...(s.modelResolve ? ["↳ resolve " + s.modelResolve] : []),
          ...(s.tier ? ["▣ tier " + s.tier] : []),
          ...(s.scope?.length ? ["🔑 " + s.scope.join(" ")] : []),
        ],
      })),
    });

    // routes (deterministic — split by tier so the tier-trim is visible at a glance)
    const routes = Object.entries(a.routes ?? {});
    const resident = routes.filter(([, r]) => r.tier !== "cold-tail");
    const cold = routes.filter(([, r]) => r.tier === "cold-tail");
    if (resident.length) children.push({
      id: name + "::routes::resident", label: "Resident routes", kind: "group", tier: "resident",
      badges: [String(resident.length), "default-served"], children: resident.map(([rk, r]) => routeNode(name, rk, r)),
    });
    if (cold.length) children.push({
      id: name + "::routes::cold", label: "Cold-tail routes", kind: "group", tier: "cold-tail", collapsed: true,
      badges: [String(cold.length), "behind discover_tools"], children: cold.map(([rk, r]) => routeNode(name, rk, r)),
    });

    // sub-agents (recurse — drill into the nested tree)
    const subs = childKeys(a);
    if (subs.length) children.push({
      id: name + "::agents", label: "Sub-agents", kind: "group", badges: [String(subs.length)],
      children: subs.map((c) => build(c.key ?? "", c.local, false)),
    });

    onPath.delete(name);
    return {
      id: name,
      label: isRoot ? name : local + " → " + name,
      kind: isRoot ? "agent" : "subagent",
      note: a.description,
      badges: [
        ...(a.trustBoundary ? ["🛡 trust " + a.trustBoundary] : []),
        ...(a.maxDepth != null ? ["⤓ maxDepth " + a.maxDepth] : []),
        ...(a.scope?.length ? ["🔑 " + a.scope.join(" ")] : []),
      ],
      children,
    };
  };

  return build(agentName, agentName, true);
}

export interface AgentDiagramOptions {
  title?: string;
  /** override the D3 source (default: jsDelivr CDN). Pass a vendored path for an offline/CSP-locked host. */
  d3Src?: string;
}

/** Render the agent as ONE self-contained, interactive HTML page (collapsible + zoomable D3 tree). */
export function agentDiagramHtml(doc: OpenAPIv4Document, agentName: string, opts: AgentDiagramOptions = {}): string {
  const data = agentDiagram(doc, agentName);
  const title = opts.title ?? "Agent — " + agentName;
  const d3Src = opts.d3Src ?? "https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js";
  return HTML
    .replace(/__TITLE__/g, escapeHtml(title))
    .replace("__D3SRC__", escapeHtml(d3Src))
    .replace("__DATA__", JSON.stringify(data).replace(/</g, "\\u003c"));
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
}

// The page. Placeholders __TITLE__ / __D3SRC__ / __DATA__ are substituted above. The embedded script uses NO template
// literals (single-quoted concat) so this outer template literal stays parse-safe.
const HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>__TITLE__</title>
<style>
  :root{--bg:#0b0e17;--panel:#141926;--fg:#e6eaf2;--muted:#9aa6bd;--line:#222a3d}
  *{box-sizing:border-box} html,body{margin:0;height:100%;background:var(--bg);color:var(--fg);font:13px/1.4 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
  header{display:flex;align-items:baseline;gap:12px;padding:12px 18px;border-bottom:1px solid var(--line)}
  header h1{font-size:15px;margin:0;font-weight:700;letter-spacing:-.01em}
  header .sub{color:var(--muted);font-size:12px}
  header .hint{margin-left:auto;color:var(--muted);font-size:12px}
  #legend{display:flex;flex-wrap:wrap;gap:10px 16px;padding:8px 18px;border-bottom:1px solid var(--line);color:var(--muted);font-size:12px}
  #legend b{display:inline-flex;align-items:center;gap:6px;color:var(--fg);font-weight:500}
  #legend i{width:11px;height:11px;border-radius:3px;display:inline-block}
  #chart{width:100%;height:calc(100% - 92px)}
  .link{fill:none;stroke:var(--line);stroke-width:1.4px}
  .node-card{cursor:pointer}
  .node-card rect{rx:7;stroke-width:1.4px}
  .node-card .lbl{font-weight:600;fill:var(--fg)}
  .node-card .cnt{fill:#0b0e17;font-weight:700;font-size:10px}
  .node-card.collapsible .lbl{text-decoration:none}
  .tip{position:fixed;pointer-events:none;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:9px 11px;max-width:340px;box-shadow:0 8px 30px rgba(0,0,0,.5);opacity:0;transition:opacity .12s;z-index:9}
  .tip h4{margin:0 0 5px;font-size:13px}
  .tip .note{color:var(--muted);margin:0 0 6px}
  .tip .pills{display:flex;flex-wrap:wrap;gap:4px}
  .tip .pill{background:#1d2435;border:1px solid var(--line);border-radius:999px;padding:1px 8px;font-size:11px}
</style></head>
<body>
<header><h1>__TITLE__</h1><span class="sub">x-suluk-agents · C027</span><span class="hint">click a node to expand/collapse · scroll to zoom · drag to pan</span></header>
<div id="legend">
  <b><i style="background:#4f46e5"></i>agent</b>
  <b><i style="background:#e11d48"></i>sub-agent</b>
  <b><i style="background:#7c3aed"></i>skill (LLM)</b>
  <b><i style="background:#059669"></i>route · resident</b>
  <b><i style="background:#d97706"></i>route · cold-tail</b>
  <b><i style="background:#94a3b8"></i>group</b>
</div>
<div id="chart"></div>
<div class="tip" id="tip"></div>
<script src="__D3SRC__"></script>
<script>
var DATA = __DATA__;
function color(d){var k=d.data.kind,t=d.data.tier;
  if(k==='agent')return '#4f46e5'; if(k==='subagent')return '#e11d48'; if(k==='skill')return '#7c3aed';
  if(k==='route')return t==='cold-tail'?'#d97706':'#059669'; return '#94a3b8';}
function childCount(d){var n=(d.children||d._children||[]); var c=n.length; for(var i=0;i<n.length;i++){var g=n[i]; if(g.data && g.data.kind!=='group') c+=0;} return c;}

var root=d3.hierarchy(DATA);
root.descendants().forEach(function(d){ if(d.data.collapsed && d.children){ d._children=d.children; d.children=null; } });
var dx=30, dy=232;
var tree=d3.tree().nodeSize([dx,dy]);
var diagonal=d3.linkHorizontal().x(function(d){return d.y;}).y(function(d){return d.x;});

var svg=d3.select('#chart').append('svg').attr('width','100%').attr('height','100%').style('font','12px ui-sans-serif,system-ui,sans-serif');
var g=svg.append('g');
var gLink=g.append('g');
var gNode=g.append('g');
var zoom=d3.zoom().scaleExtent([0.25,2.5]).on('zoom',function(e){ g.attr('transform',e.transform); });
svg.call(zoom);
var tip=d3.select('#tip');

function showTip(e,d){
  var pills=(d.data.badges||[]).map(function(b){return '<span class="pill">'+esc(b)+'</span>';}).join('');
  var note=d.data.note?'<p class="note">'+esc(d.data.note)+'</p>':'';
  tip.html('<h4>'+esc(d.data.label)+'</h4>'+note+'<div class="pills">'+pills+'</div>')
     .style('left',(e.clientX+14)+'px').style('top',(e.clientY+12)+'px').style('opacity',1);
}
function hideTip(){ tip.style('opacity',0); }
function esc(s){ return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];}); }

function update(source){
  var nodes=root.descendants(), links=root.links();
  tree(root);
  var t=svg.transition().duration(220);

  var node=gNode.selectAll('g.node-card').data(nodes,function(d){return d.data.id;});
  var nodeEnter=node.enter().append('g').attr('class',function(d){return 'node-card'+((d.children||d._children)?' collapsible':'');})
    .attr('transform',function(){return 'translate('+source.y0+','+source.x0+')';})
    .on('click',function(ev,d){ if(d.children){d._children=d.children;d.children=null;} else {d.children=d._children;d._children=null;} update(d); })
    .on('mousemove',showTip).on('mouseleave',hideTip);

  // label width ~ by text length
  nodeEnter.each(function(d){ d._w=Math.min(210, 22+String(d.data.label).length*7.0+((d._children)?22:0)); });
  nodeEnter.append('rect').attr('x',0).attr('y',-11).attr('height',22).attr('rx',7)
    .attr('width',function(d){return d._w;})
    .attr('fill',function(d){return d.data.kind==='group'?'#141926':color(d);})
    .attr('stroke',function(d){return color(d);})
    .attr('opacity',function(d){return d.data.kind==='group'?1:0.92;});
  nodeEnter.append('text').attr('class','lbl').attr('x',9).attr('y',4)
    .attr('fill',function(d){return d.data.kind==='group'?color(d):'#0b0e17';})
    .style('font-weight',function(d){return d.data.kind==='group'?600:700;})
    .text(function(d){return d.data.label;});
  // collapsed-count chip
  nodeEnter.filter(function(d){return d._children;}).append('text').attr('class','cnt')
    .attr('x',function(d){return d._w-12;}).attr('y',4).attr('text-anchor','middle')
    .text(function(d){return '+';});

  node.merge(nodeEnter).transition(t).attr('transform',function(d){return 'translate('+d.y+','+d.x+')';});
  node.exit().transition(t).attr('transform',function(){return 'translate('+source.y+','+source.x+')';}).remove();

  var link=gLink.selectAll('path.link').data(links,function(d){return d.target.data.id;});
  var linkEnter=link.enter().append('path').attr('class','link')
    .attr('d',function(){var o={x:source.x0,y:source.y0};return diagonal({source:o,target:o});});
  link.merge(linkEnter).transition(t).attr('d',diagonal);
  link.exit().transition(t).attr('d',function(){var o={x:source.x,y:source.y};return diagonal({source:o,target:o});}).remove();

  root.eachBefore(function(d){ d.x0=d.x; d.y0=d.y; });
}
root.x0=0; root.y0=0;
update(root);
// initial fit: center the root, modest zoom
var b=g.node().getBBox();
var sc=Math.min(1.1, (window.innerHeight-160)/(b.height+80), (window.innerWidth-80)/(b.width+80));
svg.call(zoom.transform, d3.zoomIdentity.translate(70, window.innerHeight/2 - 60).scale(Math.max(0.35,sc)));
</script>
</body></html>`;
