// @suluk/typedoc-umlclass — UML class diagrams for TypeDoc, rendered with d3 (pure client-side SVG). No Java,
// no PlantUML, no external renderer. For every class & interface page it emits a compact JSON model (see
// model.js) into a placeholder <div>, then a tiny client script (assets/umlclass.js) draws the diagram with the
// bundled d3. Themed off TypeDoc's own CSS variables; related classes are clickable.
import { JSX, ReflectionKind, RendererEvent } from "typedoc";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { copyFileSync, mkdirSync } from "node:fs";
import { umlModel } from "./model.js";

const ASSETS = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");
// d3 is loaded from a CDN (kept out of the docs output — the HTML site is web-hosted; the offline artifact is
// the markdown mirror, which has no diagrams). Pin the major so the API can't shift under the renderer.
const D3_CDN = "https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js";
const K = ReflectionKind;

const isClassLike = (refl) => !!refl && typeof refl.kindOf === "function" && refl.kindOf(K.Class | K.Interface);
const hasContent = (m) => m.supers.length || m.subs.length || m.attributes.length || m.operations.length;

/** TypeDoc plugin entry. */
export function load(app) {
  // 1. Emit the diagram placeholder + model at the top of every class/interface page.
  app.renderer.hooks.on("content.begin", (context) => {
    const model = umlModel(context.page?.model, (r) => context.urlTo(r));
    if (!model || !hasContent(model)) return JSX.createElement(JSX.Fragment, null);
    return JSX.createElement("div", { class: "tsd-umlclass", "data-uml": JSON.stringify(model) });
  });

  // 2. Load the d3 bundle + the client renderer + styles — only on class/interface pages (keeps d3 off the rest).
  app.renderer.hooks.on("head.end", (context) => {
    if (!isClassLike(context.page?.model)) return JSX.createElement(JSX.Fragment, null);
    return JSX.createElement(
      JSX.Fragment,
      null,
      JSX.createElement("link", { rel: "stylesheet", href: context.relativeURL("assets/umlclass.css") }),
      JSX.createElement("script", { defer: true, src: D3_CDN, crossorigin: "anonymous" }),
      JSX.createElement("script", { defer: true, src: context.relativeURL("assets/umlclass.js") }),
    );
  });

  // 3. Copy the (small) client renderer + styles into each rendered output's assets/ dir.
  app.renderer.on(RendererEvent.END, (event) => {
    const out = join(event.outputDirectory, "assets");
    mkdirSync(out, { recursive: true });
    copyFileSync(join(ASSETS, "umlclass.js"), join(out, "umlclass.js"));
    copyFileSync(join(ASSETS, "umlclass.css"), join(out, "umlclass.css"));
  });
}
