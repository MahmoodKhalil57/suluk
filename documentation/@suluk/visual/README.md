[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/visual

<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/visual</h1>

<p align="center"><b>Pixel-confidence by construction — verify each UI primitive's pixels ONCE, and confidence propagates to every generated UI by content-hashing, never by re-screenshotting.</b></p>

<p align="center">
  <em>Part of <a href="https://github.com/MahmoodKhalil57/suluk">Suluk</a> — one typed OpenAPI v4 contract projecting into every full-stack layer.</em>
</p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/visual
```

`@suluk/shadcn` is an optional peer — install it too if you want to decompose generated
`FormSpec` / `TableSpec` into primitives (`formPrimitives` / `tablePrimitives`). The hashing core
works without it.

## What it does

The whole Suluk model is *verify the source once, trust the deterministic projection*. `@suluk/visual`
applies that to **pixels**:

- A generated UI (a form, a table) is a **composition of leaf widget primitives** — a text input, a
  select, a switch, a cell — plus a layout. You verify each *primitive's* pixels exactly once: render
  it in isolation, screenshot it, approve it. The approval is recorded against the **content hash** of
  the source that drew those pixels.
- Thereafter any generated UI is **pixel-confident without a new screenshot** iff every primitive it
  uses is approved *and* its content hash is unchanged — decided by `checkConfidence`, which **hashes,
  never renders**.
- A primitive is re-verified only when **its** source changes (the hash drifts). Editing one widget's
  renderer flags exactly that widget for re-approval; every other widget — and every UI that doesn't
  use it — stays trusted.
- The core is **pure and dependency-free** (no Playwright dependency, no `node:fs`). It produces the
  standalone HTML you screenshot and consumes the screenshot's bytes you pass back in — it does not
  drive the browser.

## When to reach for it

Reach for it when you generate UI from a contract (e.g. the `@suluk/shadcn` form/table projection) and
want **visual-regression confidence over every generated screen without snapshotting every screen**.
You snapshot the small, finite set of *primitives*; confidence over the combinatorial set of generated
pages is then free and instant.

Don't reach for it for end-to-end screenshot testing of arbitrary hand-authored pages — it is built for
the *projected* UI surface, where the confidence-by-composition assumption holds.

## Usage

### The core loop — confidence by hashing

```ts
import {
  formPrimitives, checkConfidence, pendingVerification,
  approve, confidenceCoverage, snapshotHash, renderPrimitiveHtml,
  type Baseline, type PrimitiveSources, type Capture,
} from "@suluk/visual";
import { formSpec } from "@suluk/shadcn";

// 1. The primitive SOURCES — the exact component bytes that draw the pixels (what you content-hash).
const sources: PrimitiveSources = {
  formLayout: "<Form>{fields}</Form>",
  widgets: { text: "<input type=text>", number: "<input type=number>", select: "<select>" },
};

// 2. Decompose a generated form into the distinct primitives it is built from.
const spec = formSpec(PetSchema);            // a @suluk/shadcn FormSpec
const used = formPrimitives(spec, sources);  // [{ key: "form:layout", contentHash }, { key: "widget:text", … }, …]

// 3. A fresh UI is NOT confident — its primitives were never pixel-verified.
let baseline: Baseline = {};
checkConfidence(used, baseline).confident;   // false
pendingVerification(used, baseline);         // the primitives needing a one-time screenshot

// 4. Verify ONCE: render each primitive in isolation, screenshot it, record the approval.
const captures: Capture[] = pendingVerification(used, baseline).map((p) => {
  const html = renderPrimitiveHtml({ widget: p.key.replace("widget:", "") });
  const pngBytes = screenshot(html);         // YOUR Playwright/screenshot step — bytes in
  return { key: p.key, contentHash: p.contentHash, snapshotHash: snapshotHash(pngBytes), label: p.label };
});
baseline = approve(captures, baseline, Date.now());

// 5. Now the SAME UI — and ANY other UI reusing those primitives — is confident for free.
checkConfidence(used, baseline).confident;   // true
confidenceCoverage(used, baseline);          // 1
```

### Drift — re-verify only what changed

```ts
// Edit one widget's source. Only THAT primitive drifts; everything else stays trusted.
const changed = { ...sources, widgets: { ...sources.widgets, select: "<select class='v2'>" } };
const report = checkConfidence(formPrimitives(spec, changed), baseline);

report.confident;                 // false
report.drifted.map((d) => d.key); // ["widget:select"]  — re-screenshot just this one
report.approved;                  // ["form:layout", "widget:text", …] — still trusted
```

### The verify-once gate — isolated render + inline preview

```ts
import { renderPrimitiveHtml, knownWidgets, primitiveControl, primitiveCss } from "@suluk/visual";

renderPrimitiveHtml({ widget: "select" });   // a self-contained HTML page → the thing you screenshot
knownWidgets();                              // ["text","email","url","number","date","textarea","switch","checkbox","select"]

// For an inline preview inside a host UI (e.g. the VS Code cockpit webview):
const css  = primitiveCss();                 // the small stylesheet
const ctrl = primitiveControl("switch");     // just the control fragment, no surrounding page
```

### Tables

```ts
import { tablePrimitives } from "@suluk/visual";
import { tableSpec } from "@suluk/shadcn";

tablePrimitives(tableSpec(PetSchema), { tableLayout: "<Table>…</Table>" });
// [{ key: "table:layout", … }, { key: "widget:cell", … }]  — the cell primitive covers every column
```

## API

| Export | What it does |
| --- | --- |
| `hash` / `contentHash` / `snapshotHash` | Stable, fast djb2 hash of source text or raw bytes (the latter two are named aliases). |
| `formPrimitives` / `tablePrimitives` | Decompose a `@suluk/shadcn` `FormSpec` / `TableSpec` into the distinct primitives it composes, each content-hashed. |
| `checkConfidence` | Decide — **without rendering** — whether a UI built from `used` primitives is pixel-confident, returning `{ confident, approved, missing, drifted }`. |
| `pendingVerification` | Exactly the primitives needing a one-time pixel verification now (missing + drifted). |
| `approve` | Record approvals into the baseline (the "verify once") at a given timestamp. |
| `confidenceCoverage` | Fraction of used primitives that are approved + unchanged (`1` ⇒ fully confident). |
| `renderPrimitiveHtml` | A self-contained HTML page rendering one primitive — the input to your screenshot tool. |
| `knownWidgets` | The widget primitives this package can render in isolation. |
| `primitiveControl` / `primitiveCss` | The bare control fragment + its stylesheet, for an inline host preview. |

Types: `Baseline`, `BaselineEntry`, `UsedPrimitive`, `ConfidenceReport`, `Capture`, `PrimitiveSources`.

## Boundary

This is a **pure logic** package — the L3 line (*render/generate, never host*) applied to verification:
it emits the isolated HTML to screenshot and consumes the screenshot's bytes you hand back. The
**screenshot step is an injected port** — drive Playwright (or any tool) in your harness and pass the
PNG bytes to `snapshotHash`; `@suluk/visual` never owns a browser. The **baseline is yours** — persist
it as JSON and commit it. The widget *sources* you content-hash are also yours: feed in the real
`@suluk/shadcn` generator output so a renderer edit honestly drifts the affected primitives. The
cockpit / VS Code integration (`@suluk/cockpit`) layers the host webview, the per-entity report, and
the approve-from-the-cockpit action on top — this package stays renderless and unit-tested.

## License

Apache-2.0

## Interfaces

- [BaselineEntry](interfaces/BaselineEntry.md)
- [Capture](interfaces/Capture.md)
- [ConfidenceReport](interfaces/ConfidenceReport.md)
- [PrimitiveSources](interfaces/PrimitiveSources.md)
- [UsedPrimitive](interfaces/UsedPrimitive.md)

## Type Aliases

- [Baseline](type-aliases/Baseline.md)

## Variables

- [contentHash](variables/contentHash.md)
- [snapshotHash](variables/snapshotHash.md)

## Functions

- [approve](functions/approve.md)
- [checkConfidence](functions/checkConfidence.md)
- [confidenceCoverage](functions/confidenceCoverage.md)
- [formPrimitives](functions/formPrimitives.md)
- [hash](functions/hash.md)
- [knownWidgets](functions/knownWidgets.md)
- [pendingVerification](functions/pendingVerification.md)
- [primitiveControl](functions/primitiveControl.md)
- [primitiveCss](functions/primitiveCss.md)
- [renderPrimitiveHtml](functions/renderPrimitiveHtml.md)
- [tablePrimitives](functions/tablePrimitives.md)
