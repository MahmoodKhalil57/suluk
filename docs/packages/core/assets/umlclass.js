// Client renderer for @suluk/typedoc-umlclass. Finds each `.tsd-umlclass` placeholder (a per-package UML model
// in `data-uml`, emitted by the plugin) and draws a PlantUML-style class diagram with d3: every class/interface
// as a box with a C/I badge, visibility-marked members (`+` green circle · `#` orange diamond · `-` red square),
// `name: Type` rows, laid out top-down by inheritance with hollow-triangle generalization (solid) / realization
// (dashed) edges. Boxes with a URL are clickable. d3 is lazy-loaded from a CDN, only when a diagram is present.
(function () {
  "use strict";
  var ROW_H = 17, HDR1 = 24, HDR2 = 36, PADX = 8, ICON_X = 9, TEXT_X = 20, CHAR = 6.35, NCHAR = 7.0,
    GAP_X = 44, GAP_Y = 52, MARGIN = 16, MAX_ROW_W = 1180;
  var SK = { fill: "#fdfdf0", stroke: "#8a7f4f", sep: "#c7bf95", name: "#20222a", type: "#9b8b57", edge: "#5f6672" };
  var BADGE = {
    class: { fill: "#add1b2", stroke: "#367c3f", letter: "C" },
    interface: { fill: "#b8abe0", stroke: "#5546a3", letter: "I" },
  };

  function opLabel(m) { return m.name + "(" + (m.params || "") + ")"; }
  function memberText(m) { return (m.kind === "op" ? opLabel(m) : m.name) + (m.type ? ": " + m.type : ""); }

  function boxSize(box) {
    var rows = box.attributes.concat(box.operations);
    var headerH = box.stereotype ? HDR2 : HDR1;
    var nameW = NCHAR * box.name.length + 46;
    var w = Math.max(122, nameW);
    rows.forEach(function (m) { w = Math.max(w, TEXT_X + CHAR * memberText(m).length + PADX); });
    var attrH = box.attributes.length ? box.attributes.length * ROW_H + 8 : 6;
    var opH = box.operations.length ? box.operations.length * ROW_H + 8 : 6;
    return { w: Math.ceil(w), h: headerH + attrH + opH, headerH: headerH, attrH: attrH };
  }

  function visIcon(g, vis, x, y) {
    if (vis === "-") g.append("rect").attr("x", x - 3.5).attr("y", y - 3.5).attr("width", 7).attr("height", 7).attr("fill", "#c0392b");
    else if (vis === "#") g.append("path").attr("d", "M" + x + "," + (y - 4) + " L" + (x + 4) + "," + y + " L" + x + "," + (y + 4) + " L" + (x - 4) + "," + y + " z").attr("fill", "#e0a11c");
    else g.append("circle").attr("cx", x).attr("cy", y).attr("r", 3.6).attr("fill", "#3aa63a");
  }

  function memberRow(g, m, y, w) {
    visIcon(g, m.vis, ICON_X, y - 4);
    var t = g.append("text").attr("x", TEXT_X).attr("y", y).attr("class", "uml-member");
    t.append("tspan").attr("fill", SK.name).attr("text-decoration", m.static ? "underline" : null)
      .text(m.kind === "op" ? opLabel(m) : m.name);
    if (m.type) t.append("tspan").attr("fill", SK.type).text(": " + m.type);
  }

  function drawBox(root, box, x, y, size) {
    var g = root.append(box.url ? "a" : "g")
      .attr("class", "uml-box" + (box.url ? " uml-link" : "")).attr("transform", "translate(" + x + "," + y + ")");
    if (box.url) { g.attr("href", box.url).attr("xlink:href", box.url); }
    g.append("rect").attr("width", size.w).attr("height", size.h).attr("rx", 3).attr("fill", SK.fill).attr("stroke", SK.stroke);

    // header: centred [badge + name], with an optional «stereotype» line above the name
    var b = BADGE[box.kind] || BADGE.class;
    var pairW = 18 + 6 + NCHAR * box.name.length;
    var bx = Math.max(11, (size.w - pairW) / 2 + 9);
    var nameY = box.stereotype ? 30 : 16;
    if (box.stereotype && box.kind !== "interface") {
      g.append("text").attr("x", size.w / 2).attr("y", 13).attr("text-anchor", "middle").attr("class", "uml-stereo").attr("fill", SK.type).text("«" + box.stereotype + "»");
    }
    g.append("circle").attr("cx", bx).attr("cy", nameY - 5).attr("r", 8).attr("fill", b.fill).attr("stroke", b.stroke);
    g.append("text").attr("x", bx).attr("y", nameY - 1.5).attr("text-anchor", "middle").attr("class", "uml-badge").attr("fill", "#20222a").text(b.letter);
    g.append("text").attr("x", bx + 14).attr("y", nameY).attr("class", "uml-name").attr("fill", SK.name)
      .attr("font-style", box.kind === "interface" ? "italic" : null).text(box.name);

    g.append("line").attr("x1", 0).attr("x2", size.w).attr("y1", size.headerH).attr("y2", size.headerH).attr("stroke", SK.sep);
    var yy = size.headerH + 13;
    box.attributes.forEach(function (m) { memberRow(g, m, yy, size.w); yy += ROW_H; });
    var opY = size.headerH + (box.attributes.length ? box.attributes.length * ROW_H + 8 : 6);
    g.append("line").attr("x1", 0).attr("x2", size.w).attr("y1", opY).attr("y2", opY).attr("stroke", SK.sep);
    yy = opY + 13;
    box.operations.forEach(function (m) { memberRow(g, m, yy, size.w); yy += ROW_H; });
  }

  // top-down layered layout: a box's row = 0 if it has no parent in the set, else 1 + max(parent rows).
  function layout(boxes, edges, size) {
    var parents = {}; boxes.forEach(function (b) { parents[b.id] = []; });
    edges.forEach(function (e) { if (parents[e.from]) parents[e.from].push(e.to); });
    var lay = {};
    function L(id, stack) {
      if (id in lay) return lay[id];
      if (stack[id]) return 0;
      stack[id] = 1;
      var ps = parents[id] || [];
      var l = ps.length ? 1 + Math.max.apply(null, ps.map(function (p) { return L(p, stack); })) : 0;
      delete stack[id];
      return (lay[id] = l);
    }
    boxes.forEach(function (b) { L(b.id, {}); });
    var maxL = Math.max(0, Math.max.apply(null, boxes.map(function (b) { return lay[b.id]; })));
    var layers = []; for (var l = 0; l <= maxL; l++) layers.push(boxes.filter(function (b) { return lay[b.id] === l; }).sort(function (a, b) { return a.name.localeCompare(b.name); }));

    // wrap each inheritance layer into one or more sub-rows so a layer full of unrelated types (common: many
    // interfaces with no edges) grids instead of stretching into one mile-wide row.
    var rows = [];
    layers.forEach(function (layer) {
      var cur = [], w = 0;
      layer.forEach(function (b) {
        var bw = size[b.id].w;
        if (cur.length && w + GAP_X + bw > MAX_ROW_W) { rows.push(cur); cur = []; w = 0; }
        cur.push(b); w += (cur.length > 1 ? GAP_X : 0) + bw;
      });
      if (cur.length) rows.push(cur);
    });

    var rowW = rows.map(function (r) { return r.reduce(function (a, b) { return a + size[b.id].w; }, 0) + Math.max(0, r.length - 1) * GAP_X; });
    var totalW = Math.max.apply(null, rowW.concat([0]));
    var pos = {}, y = MARGIN;
    rows.forEach(function (row, li) {
      var rowH = row.length ? Math.max.apply(null, row.map(function (b) { return size[b.id].h; })) : 0;
      var x = MARGIN + (totalW - rowW[li]) / 2;
      row.forEach(function (b) { pos[b.id] = { x: x, y: y }; x += size[b.id].w + GAP_X; });
      y += rowH + GAP_Y;
    });
    return { pos: pos, width: totalW + MARGIN * 2, height: y - GAP_Y + MARGIN };
  }

  function render(div) {
    var model;
    try { model = JSON.parse(div.dataset.uml); } catch (e) { return; }
    var boxes = model.boxes || [], edges = model.edges || [];
    if (!boxes.length) return;
    var size = {}; boxes.forEach(function (b) { size[b.id] = boxSize(b); });
    var lo = layout(boxes, edges, size);

    div.textContent = "";
    var svg = d3.select(div).append("svg").attr("class", "uml-svg")
      .attr("viewBox", "0 0 " + lo.width + " " + lo.height).attr("width", Math.min(lo.width, 960))
      .attr("font-family", "Helvetica, Arial, sans-serif").attr("role", "img")
      .attr("aria-label", "UML class diagram (" + boxes.length + " types)");
    var defs = svg.append("defs");
    defs.append("marker").attr("id", "uml-tri").attr("viewBox", "0 0 12 12").attr("refX", 11).attr("refY", 6)
      .attr("markerWidth", 13).attr("markerHeight", 13).attr("orient", "auto-start-reverse")
      .append("path").attr("class", "uml-tri").attr("d", "M1,1 L11,6 L1,11 z").attr("fill", "#fdfdf0").attr("stroke", SK.edge);

    // edges: child (below) → parent (above); hollow triangle at the parent's bottom.
    edges.forEach(function (e) {
      var c = lo.pos[e.from], p = lo.pos[e.to];
      if (!c || !p) return;
      var x1 = c.x + size[e.from].w / 2, y1 = c.y;
      var x2 = p.x + size[e.to].w / 2, y2 = p.y + size[e.to].h;
      var my = (y1 + y2) / 2;
      svg.append("path").attr("class", "uml-edge" + (e.kind === "implements" ? " uml-edge-dashed" : ""))
        .attr("fill", "none").attr("stroke", SK.edge).attr("stroke-width", 1)
        .attr("stroke-dasharray", e.kind === "implements" ? "6 4" : null)
        .attr("d", "M" + x1 + "," + y1 + " C" + x1 + "," + my + " " + x2 + "," + my + " " + x2 + "," + y2)
        .attr("marker-end", "url(#uml-tri)");
    });
    boxes.forEach(function (b) { drawBox(svg, b, lo.pos[b.id].x, lo.pos[b.id].y, size[b.id]); });
  }

  function run() { document.querySelectorAll(".tsd-umlclass").forEach(render); }
  function boot() {
    if (!document.querySelector(".tsd-umlclass")) return; // no diagram on this page → don't load d3
    if (typeof d3 !== "undefined") return run();
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js";
    s.crossOrigin = "anonymous";
    s.onload = run;
    document.head.appendChild(s);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
