---
description: "Pixel-confidence by construction: verify each UI primitive's pixels ONCE (a golden snapshot), and confidence propagates to every generated UI via content-hashing + the deterministic generator — re-verify a primitive only when its source changes. CANDIDATE tooling."
name: suluk-visual
---

# @suluk/visual

Pixel-confidence by construction: verify each UI primitive's pixels ONCE (a golden snapshot), and confidence propagates to every generated UI via content-hashing + the deterministic generator — re-verify a primitive only when its source changes. CANDIDATE tooling.

## Quick Start

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

## Quick Reference

**baseline:** `hash` (Stable, fast, non-cryptographic hash (djb2) of source text or raw bytes — for change detection only), `checkConfidence` (Decide, WITHOUT rendering, whether a UI built from `used` primitives is pixel-confident given the baseline), `pendingVerification` (Exactly the primitives that need a (one-time) pixel verification right now: the missing + the drifted), `approve` (Record approvals into the baseline (the "verify once"): each capture marks its primitive verified-at-hash), `confidenceCoverage` (Coverage = fraction of used primitives that are approved + unchanged), `Baseline` (The approved baseline — primitive key → its verified entry), `BaselineEntry` (`@suluk/visual` — pixel-confidence by construction), `UsedPrimitive` (A primitive USED by a generated UI: its key + the CURRENT content hash of its source), `ConfidenceReport` (`@suluk/visual` — pixel-confidence by construction), `Capture` (A capture from the verify-once gate: the primitive, its content hash, and its approved screenshot's hash), `contentHash` (Hash of the render-affecting source of a primitive (its component code, variant, tokens)), `snapshotHash` (Hash of an approved screenshot's bytes — the recorded identity of "what was verified")
**shadcn:** `formPrimitives` (The distinct primitives a generated FORM is composed of: its layout + each widget it uses), `tablePrimitives` (The distinct primitives a generated TABLE is composed of: its layout + the cell primitive), `PrimitiveSources`
**capture:** `renderPrimitiveHtml` (A self-contained HTML page that renders exactly one primitive — the thing you screenshot to approve it), `knownWidgets` (The widget primitives this package knows how to render in isolation (for the verify-once gate)), `primitiveControl` (Just the control fragment (no surrounding page) — for an inline preview in a host UI (the cockpit webview)), `primitiveCss` (A small stylesheet for the control fragments above — so a host can render `primitiveControl` inline)

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)