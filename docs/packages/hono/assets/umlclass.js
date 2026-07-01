// Client renderer for @suluk/typedoc-umlclass. Finds every `.tsd-umlclass` placeholder (with a `data-uml` JSON
// model emitted by the plugin) and draws a UML class diagram as SVG with d3: the focal class box (name +
// «stereotype», attributes, operations), its super types above (generalization / realization edges) and its
// known subtypes below. Boxes with a URL are clickable. Styled entirely off CSS (assets/umlclass.css).
(function () {
  "use strict";
  var ROW_H = 18, CHAR = 6.9, PAD_X = 10, GAP_X = 28, GAP_Y = 46, MARGIN = 10, MAX_W = 920;

  function estWidth(s) { return (s ? String(s).length : 0) * CHAR; }

  function memberLabel(m) {
    var t = m.type ? ": " + m.type : "";
    return m.kind === "op" ? m.vis + " " + m.name + "(" + (m.params || "") + ")" + t : m.vis + " " + m.name + t;
  }

  function boxSize(node) {
    var headerLines = node.stereotype ? 2 : 1;
    var headerH = headerLines * 16 + 10;
    var rows = node.compact ? [] : (node.attributes || []).concat(node.operations || []).map(memberLabel);
    var widths = [estWidth(node.name) + 22];
    if (node.stereotype) widths.push(estWidth("«" + node.stereotype + "»") + 22);
    rows.forEach(function (r) { widths.push(estWidth(r) + PAD_X * 2); });
    var w = Math.max.apply(null, [124].concat(widths));
    var bodyH = 0;
    if (!node.compact) {
      bodyH = (node.attributes.length ? node.attributes.length * ROW_H + 6 : 6) +
              (node.operations.length ? node.operations.length * ROW_H + 6 : 6);
    }
    return { w: Math.ceil(w), h: headerH + bodyH, headerH: headerH };
  }

  function drawBox(root, node, x, y, size) {
    var g = root.append(node.url ? "a" : "g")
      .attr("class", "uml-box uml-" + node.kind + (node.url ? " uml-link" : "") + (node.focal ? " uml-focal" : ""))
      .attr("transform", "translate(" + x + "," + y + ")");
    if (node.url) { g.attr("href", node.url).attr("xlink:href", node.url); }
    g.append("rect").attr("class", "uml-box-bg").attr("width", size.w).attr("height", size.h).attr("rx", 5);

    var header = g.append("text").attr("class", "uml-header").attr("text-anchor", "middle");
    var ty = node.stereotype ? 15 : 17;
    if (node.stereotype) {
      header.append("tspan").attr("class", "uml-stereo").attr("x", size.w / 2).attr("y", ty).text("«" + node.stereotype + "»");
      ty += 16;
    }
    header.append("tspan").attr("class", "uml-name").attr("x", size.w / 2).attr("y", ty).text(node.name);
    if (node.compact) return;

    g.append("line").attr("class", "uml-sep").attr("x1", 0).attr("x2", size.w).attr("y1", size.headerH).attr("y2", size.headerH);
    var yy = size.headerH + 14;
    node.attributes.forEach(function (m) {
      g.append("text").attr("class", "uml-member uml-attr" + (m.static ? " uml-static" : "")).attr("x", PAD_X).attr("y", yy).text(memberLabel(m));
      yy += ROW_H;
    });
    var opY = size.headerH + (node.attributes.length ? node.attributes.length * ROW_H + 6 : 6);
    g.append("line").attr("class", "uml-sep").attr("x1", 0).attr("x2", size.w).attr("y1", opY).attr("y2", opY);
    yy = opY + 14;
    node.operations.forEach(function (m) {
      g.append("text").attr("class", "uml-member uml-op" + (m.static ? " uml-static" : "")).attr("x", PAD_X).attr("y", yy).text(memberLabel(m));
      yy += ROW_H;
    });
  }

  // A generalization/realization edge from a child (x1,y1) to a parent (x2,y2); hollow-triangle head at the parent.
  function drawEdge(root, x1, y1, x2, y2, dashed, markerId) {
    root.append("path")
      .attr("class", "uml-edge" + (dashed ? " uml-edge-dashed" : ""))
      .attr("d", "M" + x1 + "," + y1 + " L" + x2 + "," + y2)
      .attr("marker-end", "url(#" + markerId + ")");
  }

  function render(div, i) {
    var model;
    try { model = JSON.parse(div.dataset.uml); } catch (e) { return; }
    var markerId = "uml-tri-" + i;

    var focal = { name: model.name, kind: model.kind, stereotype: model.stereotype, attributes: model.attributes, operations: model.operations, compact: false, focal: true };
    var supers = model.supers.map(function (s) {
      return { name: s.name, url: s.url, compact: true, relation: s.relation, kind: s.relation === "implements" ? "interface" : "class", stereotype: s.relation === "implements" ? "interface" : null };
    });
    var subs = model.subs.map(function (s) {
      return { name: s.name, url: s.url, compact: true, relation: s.relation, kind: "class", stereotype: null };
    });

    var focalSize = boxSize(focal);
    var superSizes = supers.map(boxSize);
    var subSizes = subs.map(boxSize);
    var rowW = function (sizes) { return sizes.reduce(function (a, s) { return a + s.w; }, 0) + Math.max(0, sizes.length - 1) * GAP_X; };
    var supersW = rowW(superSizes), subsW = rowW(subSizes);
    var innerW = Math.max(focalSize.w, supersW, subsW);
    var totalW = innerW + MARGIN * 2;
    var supersH = supers.length ? Math.max.apply(null, superSizes.map(function (s) { return s.h; })) : 0;
    var subsH = subs.length ? Math.max.apply(null, subSizes.map(function (s) { return s.h; })) : 0;
    var focalY = MARGIN + supersH + (supers.length ? GAP_Y : 0);
    var subsY = focalY + focalSize.h + (subs.length ? GAP_Y : 0);
    var totalH = subsY + subsH + MARGIN;

    div.textContent = "";
    var svg = d3.select(div).append("svg")
      .attr("class", "uml-svg").attr("viewBox", "0 0 " + totalW + " " + totalH)
      .attr("width", Math.min(totalW, MAX_W)).attr("role", "img")
      .attr("aria-label", "UML class diagram for " + model.name);

    var marker = svg.append("defs").append("marker")
      .attr("id", markerId).attr("viewBox", "0 0 12 12").attr("refX", 11).attr("refY", 6)
      .attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto-start-reverse");
    marker.append("path").attr("class", "uml-tri").attr("d", "M1,1 L11,6 L1,11 z");

    // super row (centered)
    var sx = MARGIN + (innerW - supersW) / 2, superPos = [];
    supers.forEach(function (n, k) { drawBox(svg, n, sx, MARGIN, superSizes[k]); superPos.push({ x: sx, w: superSizes[k].w, h: superSizes[k].h, dashed: n.relation === "implements" }); sx += superSizes[k].w + GAP_X; });
    // focal (centered)
    var fx = MARGIN + (innerW - focalSize.w) / 2;
    drawBox(svg, focal, fx, focalY, focalSize);
    // sub row (centered)
    var bx = MARGIN + (innerW - subsW) / 2, subPos = [];
    subs.forEach(function (n, k) { drawBox(svg, n, bx, subsY, subSizes[k]); subPos.push({ x: bx, w: subSizes[k].w, dashed: n.relation === "implementedBy" }); bx += subSizes[k].w + GAP_X; });

    // edges: focal (child) → each super (parent, head at super bottom)
    superPos.forEach(function (p) { drawEdge(svg, fx + focalSize.w / 2, focalY, p.x + p.w / 2, MARGIN + p.h, p.dashed, markerId); });
    // edges: each sub (child) → focal (parent, head at focal bottom)
    subPos.forEach(function (p) { drawEdge(svg, p.x + p.w / 2, subsY, fx + focalSize.w / 2, focalY + focalSize.h, p.dashed, markerId); });
  }

  function init() {
    if (typeof d3 === "undefined") return;
    var nodes = document.querySelectorAll(".tsd-umlclass");
    for (var i = 0; i < nodes.length; i++) render(nodes[i], i);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
