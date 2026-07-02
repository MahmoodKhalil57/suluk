// @suluk/typedoc-umlclass — PlantUML-style UML class diagrams for TypeDoc, rendered with d3 (pure client-side
// SVG). No Java, no PlantUML, no external renderer. On each package/module page it emits a per-package model
// (every class & interface + their intra-package extends/implements edges — see model.js) into a placeholder,
// then a tiny client script (assets/umlclass.js) draws the diagram with d3, lazy-loaded from a CDN.
import { JSX, RendererEvent } from "typedoc";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { copyFileSync, mkdirSync } from "node:fs";
import { packageUmlModel } from "./model.js";

const ASSETS = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");

/** TypeDoc plugin entry. */
export function load(app) {
  // 1. Emit the per-package model at the top of any page whose reflection contains classes/interfaces
  //    (the module/project index) — `packageUmlModel` returns null for everything else.
  app.renderer.hooks.on("content.begin", (context) => {
    const model = packageUmlModel(context.page?.model, (r) => context.urlTo(r));
    if (!model) return JSX.createElement(JSX.Fragment, null);
    return JSX.createElement("div", { class: "tsd-umlclass", "data-uml": JSON.stringify(model) });
  });

  // 2. Load the styles + the (tiny) renderer on every page. The renderer self-gates on the presence of a diagram
  //    div and only then lazy-loads d3 from a CDN — so d3 never loads on pages without a diagram.
  app.renderer.hooks.on("head.end", (context) =>
    JSX.createElement(
      JSX.Fragment,
      null,
      JSX.createElement("link", { rel: "stylesheet", href: context.relativeURL("assets/umlclass.css") }),
      JSX.createElement("script", { defer: true, src: context.relativeURL("assets/umlclass.js") }),
    ),
  );

  // 3. Copy the client renderer + styles into each rendered output's assets/ dir.
  app.renderer.on(RendererEvent.END, (event) => {
    const out = join(event.outputDirectory, "assets");
    mkdirSync(out, { recursive: true });
    copyFileSync(join(ASSETS, "umlclass.js"), join(out, "umlclass.js"));
    copyFileSync(join(ASSETS, "umlclass.css"), join(out, "umlclass.css"));
  });
}
