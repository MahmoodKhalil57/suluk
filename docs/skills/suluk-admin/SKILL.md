---
description: "The /superadmin web admin panel — the same cockpit as the vscode extension (@suluk/cockpit core), rendered as a Hono-served web UI. Superadmin-gated. CANDIDATE tooling."
name: suluk-admin
---

# @suluk/admin

The /superadmin web admin panel — the same cockpit as the vscode extension (@suluk/cockpit core), rendered as a Hono-served web UI. Superadmin-gated. CANDIDATE tooling.

## Quick Start

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

## Configuration

**AdminOptions** — `@suluk/admin` — the /superadmin web admin panel. The SAME cockpit as the vscode extension (@suluk/cockpit
core), rendered as Hono-served web pages and gated to superadmins. One brain, two faces. Mount it on your
app: `app.route("/", adminApp({ document, authorize }))`. CANDIDATE tooling — NOT official OAS. (5 options — see references/config.md)

## Quick Reference

**app:** `adminApp` (Build the /superadmin Hono app)
**render:** `layout`, `renderCycle`, `renderBuilder`, `renderChecks`, `renderDeploy`, `esc`
**render-data:** `entityModels` (Project a v4 document's component schemas into admin entity models (fields + per-CRUD access scope), sorted), `renderEntityForm` (A create/edit form for an entity, derived from its schema), `renderEntityTable` (A list table for an entity — a column per field; `rows` are optional sample data to fill it), `renderDataIndex` (The data-admin index: every CRUD-managed entity + its access scopes, linking to its per-entity page), `renderEntityAdmin` (One entity's data-admin page — a FULLY FUNCTIONAL CRUD UI (saastarter's Payload admin, projected): a live list
table (loaded from the entity's CRUD endpoint), a create/edit form, and per-row Edit + Delete — all driven by
inline vanilla JS hitting the same admin-gated CRUD routes the contract already serves, so the admin can never
drift from the schema AND actually writes), `EntityModel`, `EntityField`, `EntityAccess`
**analytics:** `renderAnalytics` (Render the analytics dashboard for a document)

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)