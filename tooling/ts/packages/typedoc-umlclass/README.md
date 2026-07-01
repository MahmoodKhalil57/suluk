<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/typedoc-umlclass</h1>

<p align="center"><b>UML class diagrams for TypeDoc, drawn with d3 — pure client-side SVG. No Java, no PlantUML, no external renderer.</b></p>

A TypeDoc plugin that adds a compact UML class diagram to **every class and interface page**: the focal type
(with its `«stereotype»`, attributes and operations), its super types above (UML **generalization** and
**realization** edges) and its known subtypes below. Diagrams are rendered in the browser with [d3](https://d3js.org)
as inline SVG, themed off TypeDoc's own CSS variables (so they track light/dark and the active theme), and every
related type is a clickable link to its page.

> **Why not PlantUML?** The popular `typedoc-umlclass` shells out to a Java + Graphviz PlantUML process (or a
> remote server). This plugin renders entirely on the client with d3 — nothing to install, nothing to call out to.

> **CANDIDATE tooling** — part of [Suluk](https://github.com/MahmoodKhalil57/suluk), a single-contributor
> candidate for OpenAPI v4.0. Not affiliated with the OpenAPI Initiative.

## Install

```bash
bun add -d @suluk/typedoc-umlclass    # or npm i -D @suluk/typedoc-umlclass
```

## Use

Add it to your `typedoc.json` `plugin` array:

```jsonc
{
  "plugin": ["@suluk/typedoc-umlclass"]
}
```

That's it. Build your docs as usual — a diagram appears on each class/interface page.

## How it works

- **Server (build time):** for every class/interface reflection the plugin extracts a small JSON model
  (`src/model.js`) — name, stereotype, attributes (`+/-/#`, static), operations (with parameter names + return
  type), and the resolved super/sub types with page-relative URLs — and injects it into a `<div class="tsd-umlclass" data-uml="…">`
  placeholder via the `content.begin` render hook. It also copies the client renderer + stylesheet into the
  output `assets/`.
- **Client (view time):** `assets/umlclass.js` finds each placeholder, parses the model, and draws the diagram
  with d3 — class boxes with three compartments, hollow-triangle generalization/realization arrowheads (dashed
  for `implements`), a simple layered layout, and clickable related boxes. d3 is loaded from a CDN and only on
  pages that actually have a diagram.

## Styling

Everything is CSS-driven (`assets/umlclass.css`) off TypeDoc variables — `--color-background`, `--color-text`,
`--color-accent`, `--color-ts-class`, `--color-ts-interface`, `--color-ts-function`, `--color-text-aside`. Override
those (or the `.uml-*` classes) to restyle.

## Limitations (v0.1)

- Diagrams are per-page and focus on **direct** super/sub relations (not the full transitive hierarchy).
- Layout is a simple layered placement (focal centred, supers above, subs below), not a full graph layout.
- d3 is CDN-loaded (so the HTML site needs network to draw; the content/model is still in the HTML).

## License

Apache-2.0
