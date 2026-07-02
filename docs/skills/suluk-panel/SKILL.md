---
description: "Contract-first admin panels, in the spirit of Payload but projected from one OpenAPI v4 document. Infers Payload-style field types from the contract, renders shadcn/theme-aware forms + data tables, and mounts a role-aware superadmin (and per-role dashboards) — no config DSL, no framework lock-in. CANDIDATE tooling."
name: suluk-panel
---

# @suluk/panel

Contract-first admin panels, in the spirit of Payload but projected from one OpenAPI v4 document. Infers Payload-style field types from the contract, renders shadcn/theme-aware forms + data tables, and mounts a role-aware superadmin (and per-role dashboards) — no config DSL, no framework lock-in. CANDIDATE tooling.

## Quick Start

```ts
import { Hono } from "hono";
import { panelApp } from "@suluk/panel";
import { document } from "./contract"; // your OpenAPI v4 document

const app = new Hono();

app.route(
  "/",
  panelApp({
    document,                 // the v4 doc (a value, or a per-request function of `c`)
    basePath: "/panel",       // default "/panel"
    title: "Acme",            // brand shown in the sidebar + titles
    authorize: (c) => isSignedIn(c), // default: deny everything
  }),
);
```

## Configuration

5 configuration interfaces — see references/config.md for details.

## Quick Reference

**fields:** `fieldsOf` (Infer the ordered field set for an entity), `titleField` (The entity's best "title" field — for list columns + relationship option labels), `humanize` ("coverImageUrl" → "Cover Image", "categoryId" → "Category"), `Field` (`@suluk/panel` — contract-first admin panels, in the spirit of Payload but projected from ONE OpenAPI v4 document), `FieldType` (Field-type inference — the Payload-parity core, contract-first)
**model:** `entityModels`, `EntityModel`
**widgets:** `renderInput`, `renderFieldRow` (One labelled field row (label · required mark · description · the input))
**list:** `renderList`
**form:** `renderForm`
**shell:** `renderShell`, `NavGroup`, `NavItem`, `PANEL_CSS`
**richtext:** `richtextEditor` (The editor markup for one rich-text field), `richtextScript` (Client init for every `[data-rt]` on the page — toolbar inserts markdown around the selection; the Preview tab
 renders the markdown with an inline, escape-first (XSS-safe) renderer), `RICHTEXT_CSS`
**media:** `mediaEditor`, `mediaScript` (Client init for every `[data-media]`: live preview on URL change + (if window), `MEDIA_CSS`
**app:** `panelApp`, `StatCard` (A KPI tile on the dashboard home), `PanelSection` (A custom, non-CRUD page mounted at `${basePath}/s/<id>`, rendered inside the panel shell), `PanelGroup` (Sidebar grouping: a titled section listing entity names and/or section ids, in order)

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)