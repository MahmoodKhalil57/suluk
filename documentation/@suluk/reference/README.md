[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/reference

# @suluk/reference

**Render an OpenAPI v4 document NATIVELY — server HTML that shows what a 3.x renderer structurally cannot.**

One typed v4 contract in, a self-contained reference page out: an operation browser, a cost explorer, an
access "View-as" lens, an ADA signature-resolution playground, and an input-hardening report. No client
build, no CDN, no `eval` — it runs unchanged in a Cloudflare Worker.

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```bash
bun add @suluk/reference
```

## What it does

- **Renders v4 as v4** — the `4.0.0-candidate` identity, the named `requests` map (multiple requests can share
  one method on one path), `parameterSchema`, and effective-vs-authored composition (C012 shared params +
  `apiResponses`) — none of which survive a downgrade to a 3.1 view.
- **Surfaces the `x-suluk-*` facets** a 3.x tool can't host: **cost** (`x-suluk-cost` → per-op badge, coverage
  rollup, declared-vs-actual drift), **access** (`x-suluk-access` → a "View-as" projection + a 3-state
  reachability matrix), and signature **collisions** over requests that share a method (the ADA verdict).
- **Grades input hardening** — an A–F badge per operation plus a document rollup, via `@suluk/harden`.
- **Self-contained output** — one HTML string with inlined CSS + JS (try-it executor, filter, theme toggle).
  No bundler, no network on render; safe in a Worker, an Astro route, or any Bun server.
- **Degrades, never crashes** — a dangling `$ref` renders as a chip and emits a diagnostic instead of throwing.

## When to reach for it

Reach for `@suluk/reference` when you want a **native-v4** docs page or **embeddable v4 insight panels**,
server-rendered with zero client build.

- Want the **Scalar** UI instead (the polished three-column browser, native v4 via the fork or a 3.1
  fallback)? Use `@suluk/scalar` (`scalarV4Html`/`scalarHtml`).
- Need **Swagger UI** specifically? Use `@suluk/swagger`.
- Want an **editor** (CodeMirror + live preview)? Use `@suluk/editor`.

In practice the two compose: serve Scalar's browser at `/reference` and embed this package's
`referenceInsightsHtml` in a drawer next to it — so one page carries Scalar's polish *and* the v4-native
analytics Scalar can't render. That is exactly how `saasuluk` wires it.

## Usage

### A full reference page

```ts
import { referenceHtml, referenceResponse } from "@suluk/reference";
import type { OpenAPIv4Document } from "@suluk/core";

const doc: OpenAPIv4Document = /* your v4 'Suluk' document */;

// As a string (Bun.serve / Astro / anywhere):
const html = referenceHtml(doc, {
  pageTitle: "My API — OpenAPI v4 reference",
  costLedgerUrl: "/cost",        // same-origin URL returning the cost ledger → live declared-vs-actual drift
  whoamiUrl: "/api/whoami",      // same-origin URL returning { viewer: "<id>" } → auto-select that viewer's lens
  tryIt: true,                   // in-page try-it executor (same-origin fetch); default true
});

// Or as a Response (Workers / Hono):
app.get("/reference", () => referenceResponse(doc, { pageTitle: "My API" }));
```

### Just the v4 superpower panels (embeddable)

`referenceInsightsHtml` drops the operation-browser chrome and renders only the facets / cost explorer /
reachability matrix / ADA playground / hardening report — designed to be embedded (a drawer or iframe) next
to a Scalar browser on the same origin. This is the real `saasuluk` route:

```ts
import { referenceInsightsResponse } from "@suluk/reference";

app.get("/reference/insights", (c) =>
  referenceInsightsResponse(refProjected(c), { costLedgerUrl: "/cost", whoamiUrl: "/api/whoami" }));
```

### The access lens, used server-side

`DEFAULT_VIEWERS` + `reachState` are the same projection the page's "View-as" lens uses — so you can compute
the reachable operation set on the server (e.g. to scrub a document before sending it to a viewer):

```ts
import { DEFAULT_VIEWERS, reachState, type AccessFacet } from "@suluk/reference";

const VIEWER = Object.fromEntries(DEFAULT_VIEWERS.map((v) => [v.id, v])); // anon | user | admin
const v = VIEWER.user;

// keep an operation iff this viewer can reach it ("none" | "scoped" | "full")
if (reachState(req["x-suluk-access"] as AccessFacet | undefined, v) !== "none") keep(req);
```

### A multi-document portal

```ts
import { portalHtml, portalResponse, type PortalEntry } from "@suluk/reference";

const apis: PortalEntry[] = [
  { name: "store", title: "Store API", href: "/reference", version: "v4", description: "the shop" },
];

app.get("/", () => portalResponse(apis, { pageTitle: "APIs" }));
```

### Lower-level building blocks

The IR and the pure facet/panel functions are exported, so you can build your own surface:

```ts
import { normalize, crossCut, costRollup, codeSamples, auditDocument } from "@suluk/reference";

const ir = normalize(doc);          // raw v4 → the semantic IR (operations, models, webhooks, diagnostics)
const matrix = crossCut(doc);       // per-viewer reachability rows
const cost = costRollup(doc);       // { priced, undeclared, totalMicroUsd, deferred }
const audit = auditDocument(doc);   // A–F hardening grade + per-op findings (from @suluk/harden)
const samples = codeSamples(server, ir.operations[0], undefined); // [{ lang: "curl" | "js" | "python", ... }]
```

## API

| Export | What it does |
| --- | --- |
| `referenceHtml(doc, opts?)` / `referenceResponse(...)` | the full reference page — string / `Response` |
| `referenceInsightsHtml(doc, opts?)` / `referenceInsightsResponse(...)` | the v4 superpower panels only (embeddable) — string / `Response` |
| `portalHtml(entries, opts?)` / `portalResponse(...)` | a multi-document index landing — string / `Response` |
| `normalize(doc)` | raw v4 → the semantic IR (`RefDoc`) — the only place raw v4 shapes are read |
| `crossCut` · `reachable` · `reachState` · `costRollup` | pure facet computations (access projection + cost rollup) |
| `DEFAULT_VIEWERS` | the built-in `anon` / `user` / `admin` viewers for the access lens |
| `costExplorer` · `adaPlayground` · `projectionMap` · `hardeningPanel` · `hardenBadge` · `facetsPanel` | pure HTML-returning panel functions (compose your own page) |
| `schemaHtml` · `sampleOf` · `constraintNotes` | schema → HTML / sample value / constraint notes |
| `codeSamples(server, op, body)` | multi-language request samples (`curl` / `js` / `python`) |
| `auditDocument` · `auditOperation` · `assertGrade` | re-exported from `@suluk/harden` |
| `escapeHtml` | HTML-attribute-safe escaper (escapes `'` too) |

Types: `ReferenceOptions`, `ReferencePlugin`, `RefDoc`, `NormalizedOperation`, `Viewer`, `AccessFacet`,
`CostModel`, `CrossCutRow`, `PortalEntry`, `PortalOptions`, `DocAudit`, `OpAudit`, `Grade`.

### Plugin seam

`ReferenceOptions.plugins` accepts plugins locked at v1: an `onNormalize(ir)` hook to mutate the IR, and
render `slots` (`heroAfter`, `opCardAfter`) to inject HTML:

```ts
import type { ReferencePlugin } from "@suluk/reference";

const plugin: ReferencePlugin = {
  name: "my-plugin",
  onNormalize: (ir) => { ir.info.title = "Plugged"; return ir; },
  slots: { opCardAfter: (op) => `<!-- extra HTML after ${op.name} -->` },
};

referenceHtml(doc, { plugins: [plugin] });
```

## Boundary

This is an **L3 renderer: it renders, it never hosts.** The output is one inert HTML string — no runtime to
call home to, no black box. The interactive features depend on **same-origin URLs you provide and own**:
`costLedgerUrl` (your cost ledger), `whoamiUrl` (your session→viewer endpoint), `sdkUrl` / `conformanceUrl`
(download affordances), and the try-it executor's same-origin `fetch`. The page reads facets off the document
it's handed — it does **not** scrub them; **projecting the right document per viewer stays app-side** (use the
exported `reachState` / `DEFAULT_VIEWERS` to do it, then pass the projected doc in).

All facet computation is **pure functions over the v4 document** (no DOM), and every panel is a pure
HTML-returning function — embeddable, testable in isolation, and Workers-safe. New v4-only insights belong
here, as panels.

## License

Apache-2.0.

## Interfaces

- [AccessFacet](interfaces/AccessFacet.md)
- [CostModel](interfaces/CostModel.md)
- [CrossCutRow](interfaces/CrossCutRow.md)
- [DocAudit](interfaces/DocAudit.md)
- [NormalizedOperation](interfaces/NormalizedOperation.md)
- [OpAudit](interfaces/OpAudit.md)
- [PortalEntry](interfaces/PortalEntry.md)
- [PortalOptions](interfaces/PortalOptions.md)
- [RefDoc](interfaces/RefDoc.md)
- [ReferenceOptions](interfaces/ReferenceOptions.md)
- [ReferencePlugin](interfaces/ReferencePlugin.md)
- [Viewer](interfaces/Viewer.md)

## Type Aliases

- [Grade](type-aliases/Grade.md)

## Variables

- [DEFAULT\_VIEWERS](variables/DEFAULT_VIEWERS.md)

## Functions

- [adaPlayground](functions/adaPlayground.md)
- [assertGrade](functions/assertGrade.md)
- [auditDocument](functions/auditDocument.md)
- [auditOperation](functions/auditOperation.md)
- [codeSamples](functions/codeSamples.md)
- [constraintNotes](functions/constraintNotes.md)
- [costExplorer](functions/costExplorer.md)
- [costRollup](functions/costRollup.md)
- [crossCut](functions/crossCut.md)
- [escapeHtml](functions/escapeHtml.md)
- [facetsPanel](functions/facetsPanel.md)
- [hardenBadge](functions/hardenBadge.md)
- [hardeningPanel](functions/hardeningPanel.md)
- [normalize](functions/normalize.md)
- [portalHtml](functions/portalHtml.md)
- [portalResponse](functions/portalResponse.md)
- [projectionMap](functions/projectionMap.md)
- [reachable](functions/reachable.md)
- [reachState](functions/reachState.md)
- [referenceHtml](functions/referenceHtml.md)
- [referenceInsightsHtml](functions/referenceInsightsHtml.md)
- [referenceInsightsResponse](functions/referenceInsightsResponse.md)
- [referenceResponse](functions/referenceResponse.md)
- [sampleOf](functions/sampleOf.md)
- [schemaHtml](functions/schemaHtml.md)
