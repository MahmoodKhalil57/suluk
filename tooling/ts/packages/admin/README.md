<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/admin</h1>

<p align="center"><b>The <code>/superadmin</code> web panel — the same cockpit as the VS Code extension, rendered as superadmin-gated Hono pages.</b></p>

<p align="center">
  <em>Part of <a href="https://github.com/MahmoodKhalil57/suluk">Suluk</a> — one typed OpenAPI v4 contract projecting into every full-stack layer.</em>
</p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/admin
```

`hono` is a peer dependency; `@suluk/core` and `@suluk/cockpit` come along as deps.

## What it does

One brain, two faces: `@suluk/admin` renders the **same** [`@suluk/cockpit`](https://github.com/MahmoodKhalil57/suluk) models the VS Code extension shows — only as web pages mounted on your Hono app, behind a superadmin gate.

- **A web cockpit.** `adminApp(...)` returns a small Hono app whose routes paint the cycle, the builder tier-tree (with contract-narrowing), the Scalar docs, the contract checks, and the deploy plan — all server-rendered HTML, no build step.
- **A data admin projected from the contract.** Every CRUD-managed entity in `components.schemas` becomes a live list + create/edit/delete page, with the per-CRUD access scope read off `x-suluk-access`. The admin *is* the contract, so it can never drift from it.
- **An analytics dashboard over the cost facets.** Inline-SVG charts (cost by source, costliest operations, coverage gauges, background-cost summary) drawn from each operation's `x-suluk-cost` — a contract fact, not telemetry.
- **Default-deny.** Every route is gated; with no `authorize` supplied, the panel denies everyone.

## When to reach for it

Reach for `@suluk/admin` when you want the cockpit (validate · builder · docs · checks · deploy + data/analytics) as a **privileged web surface on your own app**, off the same v4 document the rest of the stack runs on — no separate dashboard build.

- vs **the VS Code extension** (`suluk-vscode`): same cockpit core, different face. Use the extension while authoring; mount `@suluk/admin` to give a deployed app a superadmin console.
- vs **[`@suluk/panel`](https://github.com/MahmoodKhalil57/suluk)**: `/panel` is the role-projected self-service surface for *every* signed-in user; `/superadmin` is the exhaustive raw-CRUD + cockpit console for power users only.
- vs **[`@suluk/scalar`](https://github.com/MahmoodKhalil57/suluk) / [`@suluk/reference`](https://github.com/MahmoodKhalil57/suluk)**: those render API *docs*. This is the operator panel — the docs page is one tab of it.

## Usage

Mount it on any Hono server. Pass the v4 `document` and an `authorize` gate (the panel is privileged by default — with no gate, it denies everyone).

```ts
import { Hono } from "hono";
import { adminApp } from "@suluk/admin";
import { parseDocument } from "@suluk/core";

const document = parseDocument(await Bun.file("openapi.yaml").text());

const app = new Hono();
app.get("/", (c) => c.text("home"));

// mounts at /superadmin (override with basePath)
app.route("/", adminApp({
  document,
  title: "Acme",
  authorize: (c) => isSuperadmin(c), // wire to your auth — see below
}));

export default app;
```

This serves, all superadmin-gated:

| Route | Page |
| --- | --- |
| `/superadmin` | the cycle overview |
| `/superadmin/builder` | the tier tree with contract-narrowing |
| `/superadmin/data` | the entity index (contract-projected CRUD) |
| `/superadmin/data/:entity` | a live list + create/edit/delete page |
| `/superadmin/analytics` | the cost-facet dashboard |
| `/superadmin/docs` | Scalar over the document |
| `/superadmin/checks` | the contract checks |
| `/superadmin/deploy` | the deploy plan |

### The gate

`authorize` runs on every route; return `true` to allow. Wire it to your real auth — in `saasuluk` it's a verified session, not a header:

```ts
import { principalFromSession } from "@suluk/better-auth";

adminApp({
  document,
  authorize: async (c) => (await principalFromSession(c))?.role === "superadmin",
});
```

### A live document

Pass a function for `document` to reflect per-request state (a role-projected or freshly-loaded doc):

```ts
adminApp({
  document: (c) => loadProjectedDoc(c), // value | Promise, resolved per request
  headHtml: themeHeadHtml(),            // inject a color-scheme sheet so the panel obeys the host theme
});
```

### The renderers, standalone

Each page is a pure function of a cockpit model, so you can render fragments yourself outside the mounted app:

```ts
import { entityModels, renderEntityForm, renderEntityTable, renderAnalytics } from "@suluk/admin";

const [product] = entityModels(document);          // fields (type/required/enum/format) + per-CRUD access
const form  = renderEntityForm(product, "create", "/superadmin/data/Product");
const table = renderEntityTable(product, rows);    // a column per field
const charts = renderAnalytics(document);          // the inline-SVG cost dashboard
```

## API

| Export | What it does |
| --- | --- |
| `adminApp(opts)` | build the gated `/superadmin` Hono app; mount with `app.route("/", adminApp(...))` |
| `AdminOptions` | options: `document`, `basePath?`, `authorize?`, `title?`, `headHtml?` |
| `layout` | the page chrome (nav + theme-aware CSS) wrapping a body |
| `renderCycle` / `renderBuilder` / `renderChecks` / `renderDeploy` | HTML for a `@suluk/cockpit` cycle / builder tree / checks / deploy plan |
| `entityModels(doc)` | project `components.schemas` → `EntityModel[]` (fields + per-CRUD access) |
| `renderEntityForm` / `renderEntityTable` | a create/edit form / list table for one `EntityModel` |
| `renderDataIndex` / `renderEntityAdmin` | the data-admin index / one entity's functional CRUD page |
| `renderAnalytics(doc)` | the inline-SVG cost-facet dashboard |
| `esc` | the HTML-escaper the renderers use |
| `EntityModel` / `EntityField` / `EntityAccess` | the data-admin model types |

The package has a single entry point (`@suluk/admin`); there are no sub-path exports and no CLI.

## Boundary

`@suluk/admin` is an L3 **renderer** — it renders the panel; it never becomes a runtime you can't own. It mounts onto *your* Hono app and runs against *your* document. The auth gate is an **injected port**: you bring `authorize` (default deny) and a real session. The data-admin pages *project* the contract into HTML and call the CRUD routes **your** app already serves (`@suluk/drizzle` `crudHandlers` over your injected db) — this package never holds a database, runs a deploy, or hosts anything. Analytics reads declared `x-suluk-cost` facets, not live telemetry.

## License

Apache-2.0
