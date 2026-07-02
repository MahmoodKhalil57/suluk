// Run the actual client renderer (assets/umlclass.js) in jsdom + real d3 against a per-package UML model, and
// assert the SVG it produces — the layout/rendering path end-to-end, without a browser.
import { test, expect } from "bun:test";
import { JSDOM } from "jsdom";
import * as d3 from "d3";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const CLIENT = readFileSync(join(HERE, "..", "assets", "umlclass.js"), "utf8");

// A small package: an interface, an abstract base, a concrete class that extends the base AND implements the
// interface, and a leaf subclass — i.e. every edge kind + every badge/visibility marker exercised.
const MODEL = {
  boxes: [
    {
      id: "IWorker", name: "IWorker", kind: "interface", stereotype: "interface",
      attributes: [], operations: [{ vis: "+", name: "work", static: false, kind: "op", params: "", type: "void" }],
      url: "interfaces/IWorker.html",
    },
    {
      id: "Animal", name: "Animal", kind: "class", stereotype: "abstract",
      attributes: [{ vis: "#", name: "name", static: false, kind: "attr", type: "string" }],
      operations: [{ vis: "+", name: "speak", static: false, kind: "op", params: "", type: "void" }],
      url: "classes/Animal.html",
    },
    {
      id: "Human", name: "Human", kind: "class", stereotype: null,
      attributes: [{ vis: "-", name: "secret", static: false, kind: "attr", type: "string" }],
      operations: [{ vis: "+", name: "create", static: true, kind: "op", params: "n", type: "Human" }],
      url: "classes/Human.html",
    },
    {
      id: "Zombie", name: "Zombie", kind: "class", stereotype: null,
      attributes: [], operations: [], url: "classes/Zombie.html",
    },
  ],
  edges: [
    { from: "Human", to: "Animal", kind: "extends" },
    { from: "Human", to: "IWorker", kind: "implements" },
    { from: "Zombie", to: "Human", kind: "extends" },
  ],
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
  // registers a listener instead of running boot() immediately. Fire it so boot() executes. (d3 is already a
  // global here, so the renderer runs synchronously without the CDN fetch.)
  dom.window.document.dispatchEvent(new dom.window.Event("DOMContentLoaded"));
  return dom.window.document;
}

test("renders every class/interface in the package as a box, with the inheritance edges", () => {
  const doc = renderInJsdom(MODEL);
  const svg = doc.querySelector("svg.uml-svg");
  expect(svg).toBeTruthy();
  expect(svg.getAttribute("viewBox")).toMatch(/^0 0 \d+ \d+$/);
  // one box per type
  expect(doc.querySelectorAll(".uml-box").length).toBe(4);
  // three inheritance edges; exactly one dashed (the `implements` realization)
  expect(doc.querySelectorAll(".uml-edge").length).toBe(3);
  expect(doc.querySelectorAll(".uml-edge-dashed").length).toBe(1);
  // the hollow-triangle marker exists
  expect(doc.querySelector("marker path.uml-tri")).toBeTruthy();
  // every box links to its page
  expect(doc.querySelectorAll("a.uml-box").length).toBe(4);
  // names present
  const names = [...doc.querySelectorAll(".uml-name")].map((t) => t.textContent);
  expect(names.sort()).toEqual(["Animal", "Human", "IWorker", "Zombie"]);
  // C/I badges: 3 classes → "C", 1 interface → "I"
  const badges = [...doc.querySelectorAll(".uml-badge")].map((t) => t.textContent);
  expect(badges.filter((b) => b === "C").length).toBe(3);
  expect(badges.filter((b) => b === "I").length).toBe(1);
  // stereotype line for the abstract class
  expect([...doc.querySelectorAll(".uml-stereo")].some((t) => t.textContent === "«abstract»")).toBe(true);
  // a static member is underlined
  expect([...doc.querySelectorAll(".uml-member tspan[text-decoration='underline']")].some((t) => t.textContent === "create(n)")).toBe(true);
});

test("a single-type package still renders one box and no edges", () => {
  const doc = renderInJsdom({
    boxes: [{ id: "Solo", name: "Solo", kind: "class", stereotype: null, attributes: [{ vis: "+", name: "id", static: false, kind: "attr", type: "string" }], operations: [], url: "classes/Solo.html" }],
    edges: [],
  });
  expect(doc.querySelectorAll(".uml-box").length).toBe(1);
  expect(doc.querySelectorAll(".uml-edge").length).toBe(0);
  expect(doc.querySelector(".uml-name").textContent).toBe("Solo");
});
