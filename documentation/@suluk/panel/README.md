[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/panel

<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/panel</h1>

<p align="center"><b>Contract-first admin panels — Payload-style field types and a role-aware dashboard, projected from ONE OpenAPI v4 document. No config DSL, no DB coupling.</b></p>

<p align="center">
  <em>Part of <a href="https://github.com/MahmoodKhalil57/suluk">Suluk</a> — one typed OpenAPI v4 contract projecting into every full-stack layer.</em>
</p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```bash
bun add @suluk/panel
```

Peer-depends on [`hono`](https://hono.dev) (the panel is a `Hono` app you mount on your router).

## What it does

- **Infers Payload-style field types from the contract.** Each entity's `components.schemas` JSON-Schema is mapped to the right widget — `text` / `textarea` / `richtext` / `number` / `boolean` / `select` / `date` / `datetime` / `email` / `url` / `media` / `json` / `relationship` — including enum options, required/nullable flags, and relationships (a `categoryId` whose `Category` is itself an entity). The contract IS the config; there's no separate collection DSL.
- **Renders a Payload-style two-pane admin** — a sidebar of collections plus a content pane with searchable, sortable, paginated data tables and create/edit forms. Ships a light + OS-following dark theme out of the box (themed entirely with CSS variables, so it can inherit the host site's vocabulary via `headHtml`).
- **Role-aware by projection.** Pass a *per-role projected* document and you get a per-role panel for free: the available CRUD ops are derived from the operations present in the doc, so an op a role can't perform simply isn't there. Admin sees everything; a user sees only their own rows.
- **A dashboard framework, not just CRUD.** Beyond the auto collections it mounts host-injected stat cards, sidebar groups, a bespoke home overview, and custom non-CRUD sections (profile, billing, danger zone) — each of which may be a per-request *function* of the logged-in user.
- **Never touches your database.** Forms and tables drive the contract's own REST endpoints (`fetch` GET/POST/PATCH/DELETE) — there is no DB adapter, so there's no config drift between the spec and the panel.

## When to reach for it

Reach for `@suluk/panel` when you want a working admin UI **derived from the contract** — a Payload-equivalent that you didn't have to configure, mounted in-process on the same Hono app that serves your API.

- vs **`@suluk/admin`** — that's the Suluk *cockpit* (`/superadmin`): the exhaustive raw-CRUD console for the spec author. `@suluk/panel` is the product-facing, role-projected dashboard you ship to end users.
- vs **`@suluk/shadcn`** — that *generates owned React/shadcn TSX* you commit and edit. `@suluk/panel` renders a complete server-side HTML panel at runtime; reach for shadcn when you want owned components in your own frontend instead.

## Usage

### Mount a panel (the common case)

`panelApp` returns a `Hono` instance. Mount it on your router and gate it with `authorize`:

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

That mounts, under `/panel`: a card-grid home, and a list + create/edit form for every CRUD-managed entity the document exposes. The forms and tables call your contract's REST endpoints directly.

### Per-role dashboards (project the document per request)

`document` (and `stats` / `groups` / `sections` / `home` / `homeHeading`) may each be a **function of the request context**, so one mount serves every audience off a role-projected document:

```ts
panelApp({
  document: (c) => projectDocument(doc, viewerOf(c)), // per-role projection → per-role panel
  basePath: "/panel",
  authorize: (c) => isSignedIn(c),
  homeHeading: (c) => (isAdmin(c) ? "Owner dashboard" : "Your account"),
  hideEntities: ["AuthToken"],                        // omit some entities entirely
  groups:   (c) => (isAdmin(c) ? [...userGroups, ...adminGroups] : userGroups),
  sections: (c) => (isAdmin(c) ? [...userSections, ...adminSections] : userSections),
  stats:    (c) => (isAdmin(c) ? adminStats() : userStats(c)),
  home:     (c) => renderOverview({ admin: isAdmin(c) }), // replaces the auto card-grid
});
```

A `StatCard` is `{ label, value, hint?, href? }`. A `PanelSection` is a custom non-CRUD page mounted at `${basePath}/s/<id>`, rendered inside the panel shell:

```ts
import type { PanelSection, StatCard } from "@suluk/panel";

const sections: PanelSection[] = [
  {
    id: "billing",
    label: "Billing",
    summary: "Plan & invoices",
    render: (c) => `<div class="pf-section">…your billing HTML…</div>`,
  },
];
```

### Media uploads

Media fields (`image` / `cover` / `avatar` / `logo` / …) degrade to paste-a-URL unless you point them at an upload endpoint that accepts a `multipart/form-data` `file` and returns `{ url }`:

```ts
panelApp({ document, authorize, uploadPath: "/upload" }); // e.g. an R2-backed worker route
```

### Render pieces directly (lower-level building blocks)

The inference + render helpers are exported standalone, so you can compose your own surface without `panelApp`:

```ts
import { entityModels, renderList, renderForm, renderShell, fieldsOf } from "@suluk/panel";

const models = entityModels(document);       // EntityModel[] — name, REST path, fields, title, access
const product = models.find((m) => m.name === "Product")!;

const list = renderList(product, { basePath: "/panel" });
const form = renderForm(product, { basePath: "/panel", relPaths: { Category: "/category" }, canDelete: true });

const html = renderShell({
  title: "Acme", brand: "Acme", basePath: "/panel",
  entities: models.map((m) => ({ name: m.name })),
  active: "Product", heading: "Product", body: list,
});

// Or just infer the field set from a raw schema:
const fields = fieldsOf(document.components.schemas.Product, new Set(["Product", "Category"]));
```

## API

| Export | What it does |
| --- | --- |
| `panelApp(opts)` | Build a `Hono` admin/dashboard app. Options: `document`, `basePath`, `title`, `authorize`, `headHtml`, `hide`, `hideEntities`, `uploadPath`, `stats`, `groups`, `sections`, `home`, `homeHeading`, `homeLabel`. |
| `entityModels(doc, opts?)` | Read the v4 doc → an `EntityModel[]` (REST path, inferred fields, title field, CRUD `access` derived from present ops). |
| `fieldsOf(schema, entities?, opts?)` | Infer the ordered `Field[]` for one entity schema (widget type, required/nullable/readOnly, enum options, relationships). |
| `titleField(fields)` | The entity's best "title" field — for list columns + relationship labels. |
| `humanize(name)` | `"coverImageUrl"` → `"Cover Image URL"`, `"categoryId"` → `"Category"`. |
| `renderList(model, { basePath })` | Data-table HTML (client-side search / sort / paginate, per-row edit·delete) over the entity's REST list endpoint. |
| `renderForm(model, { basePath, relPaths, canDelete, uploadPath? })` | Create/edit form HTML (loads the record on edit, coerces by type, POSTs/PATCHes to REST). |
| `renderInput(field, value?)` / `renderFieldRow(field, value?)` | One widget / one labelled field row for a `Field`. |
| `renderShell(opts)` | The two-pane panel chrome (sidebar nav + content); accepts a flat `entities` list or grouped `nav`. |
| `richtextEditor` / `richtextScript` / `RICHTEXT_CSS` | The dependency-free markdown rich-text editor (toolbar + Write/Preview) and its client init + styles. |
| `mediaEditor` / `mediaScript` / `MEDIA_CSS` | The media/upload widget (URL input + preview + optional file picker) and its client init + styles. |
| `PANEL_CSS` | The panel's theme stylesheet (CSS-variable vocabulary). |

Types: `PanelOptions`, `StatCard`, `PanelSection`, `PanelGroup`, `EntityModel`, `Field`, `FieldType`, `FieldsOptions`, `ListOptions`, `FormOptions`, `ShellOptions`, `NavGroup`, `NavItem`.

## Boundary

`@suluk/panel` **renders; it does not host or persist** (the Suluk L3 line — render/generate, never host). It emits HTML + client JS that drive *your* contract's REST endpoints; the database, the auth/session, and file storage stay app-side:

- **Inject the document.** The panel reads a v4 doc you pass in (or project per request). It never owns the spec.
- **Inject the gate.** `authorize` is yours; the panel defaults to deny-all. CRUD availability is read off the (projected) operations — projection is how you scope per role.
- **Inject the bytes.** Media uploads POST to *your* `uploadPath` (e.g. an R2-backed route) that returns `{ url }`. Without one, media fields are paste-a-URL. Storage is the host's concern.
- **No DB adapter.** Lists, forms, and deletes are `fetch` calls to the contract's own endpoints — so there's no second source of truth to drift.

## License

Apache-2.0

## Interfaces

- [EntityModel](interfaces/EntityModel.md)
- [Field](interfaces/Field.md)
- [FieldsOptions](interfaces/FieldsOptions.md)
- [FormOptions](interfaces/FormOptions.md)
- [ListOptions](interfaces/ListOptions.md)
- [NavGroup](interfaces/NavGroup.md)
- [NavItem](interfaces/NavItem.md)
- [PanelGroup](interfaces/PanelGroup.md)
- [PanelOptions](interfaces/PanelOptions.md)
- [PanelSection](interfaces/PanelSection.md)
- [ShellOptions](interfaces/ShellOptions.md)
- [StatCard](interfaces/StatCard.md)

## Type Aliases

- [FieldType](type-aliases/FieldType.md)

## Variables

- [MEDIA\_CSS](variables/MEDIA_CSS.md)
- [PANEL\_CSS](variables/PANEL_CSS.md)
- [RICHTEXT\_CSS](variables/RICHTEXT_CSS.md)

## Functions

- [entityModels](functions/entityModels.md)
- [fieldsOf](functions/fieldsOf.md)
- [humanize](functions/humanize.md)
- [mediaEditor](functions/mediaEditor.md)
- [mediaScript](functions/mediaScript.md)
- [panelApp](functions/panelApp.md)
- [renderFieldRow](functions/renderFieldRow.md)
- [renderForm](functions/renderForm.md)
- [renderInput](functions/renderInput.md)
- [renderList](functions/renderList.md)
- [renderShell](functions/renderShell.md)
- [richtextEditor](functions/richtextEditor.md)
- [richtextScript](functions/richtextScript.md)
- [titleField](functions/titleField.md)
