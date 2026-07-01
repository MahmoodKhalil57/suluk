// Run the actual client renderer (assets/umlclass.js) in jsdom + real d3 against a sample model, and assert the
// SVG it produces — the layout/rendering path end-to-end, without a browser. Also exercises model.js.
import { test, expect } from "bun:test";
import { JSDOM } from "jsdom";
import * as d3 from "d3";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const CLIENT = readFileSync(join(HERE, "..", "assets", "umlclass.js"), "utf8");

const MODEL = {
  name: "Foo",
  kind: "class",
  stereotype: null,
  attributes: [{ vis: "+", name: "count", static: false, kind: "attr", type: "number" }],
  operations: [{ vis: "+", name: "run", static: true, kind: "op", params: "input", type: "void" }],
  supers: [
    { name: "Base", relation: "extends", url: "../classes/Base.html" },
    { name: "Named", relation: "implements", url: "../interfaces/Named.html" },
  ],
  subs: [{ name: "SubFoo", relation: "extendedBy", url: "../classes/SubFoo.html" }],
};

function renderInJsdom(model) {
  const dom = new JSDOM(
    `<!DOCTYPE html><body><div class="tsd-umlclass" data-uml='${JSON.stringify(model).replace(/'/g, "&apos;")}'></div></body>`,
  );
  const g = globalThis;
  g.window = dom.window;
  g.document = dom.window.document;
  g.d3 = d3;
  // eslint-disable-next-line no-new-func
  new Function(CLIENT)(); // run the browser IIFE against the jsdom globals
  // jsdom already fired DOMContentLoaded during construction but reports readyState "loading", so the IIFE
  // registers a listener instead of running init() immediately (a real <script defer> runs at "interactive").
  // Fire it so init() executes. (Harmless if init already ran.)
  dom.window.document.dispatchEvent(new dom.window.Event("DOMContentLoaded"));
  return dom.window.document;
}

test("renders a class box + super/sub boxes + edges", () => {
  const doc = renderInJsdom(MODEL);
  const svg = doc.querySelector("svg.uml-svg");
  expect(svg).toBeTruthy();
  expect(svg.getAttribute("viewBox")).toMatch(/^0 0 \d+ \d+$/);
  // focal + 2 supers + 1 sub = 4 boxes
  expect(doc.querySelectorAll(".uml-box").length).toBe(4);
  expect(doc.querySelectorAll(".uml-focal").length).toBe(1);
  expect(doc.querySelector(".uml-focal .uml-name").textContent).toBe("Foo");
  // 2 generalization/realization edges to supers + 1 from the sub
  expect(doc.querySelectorAll(".uml-edge").length).toBe(3);
  // exactly one dashed (the `implements` realization)
  expect(doc.querySelectorAll(".uml-edge-dashed").length).toBe(1);
  // the hollow-triangle marker exists
  expect(doc.querySelector("marker path.uml-tri")).toBeTruthy();
  // related boxes are clickable links
  expect(doc.querySelectorAll("a.uml-box").length).toBe(3);
  // members rendered
  expect([...doc.querySelectorAll(".uml-attr")].some((t) => t.textContent.includes("count"))).toBe(true);
  expect([...doc.querySelectorAll(".uml-op.uml-static")].some((t) => t.textContent.includes("run("))).toBe(true);
});

test("a standalone interface (no relations, only members) still renders one box", () => {
  const doc = renderInJsdom({
    name: "Bar",
    kind: "interface",
    stereotype: "interface",
    attributes: [{ vis: "+", name: "id", static: false, kind: "attr", type: "string" }],
    operations: [],
    supers: [],
    subs: [],
  });
  expect(doc.querySelectorAll(".uml-box").length).toBe(1);
  expect(doc.querySelector(".uml-stereo").textContent).toBe("«interface»");
  expect(doc.querySelectorAll(".uml-edge").length).toBe(0);
});
