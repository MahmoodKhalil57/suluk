---
description: "Intuitive, runnable BDD over a v4 'Suluk' contract. Projects a deterministic Gherkin step VOCABULARY from the contract (Given from x-suluk-access, When from each operation, Then from declared statuses + x-suluk-store + x-suluk-cost), binds authored .feature stories EXACT-or-UNBOUND with outcome steps resolved relative to the scenario's When-subject, and emits a BIDIRECTIONAL tri-state gap report (PARAPHRASE / NEEDS-DEV-GLUE / NEEDS-CONTRACT) + contract->authored coverage holes. A pure function of the document. CANDIDATE tooling."
name: suluk-journeys
---

# @suluk/journeys

Intuitive, runnable BDD over a v4 'Suluk' contract. Projects a deterministic Gherkin step VOCABULARY from the contract (Given from x-suluk-access, When from each operation, Then from declared statuses + x-suluk-store + x-suluk-cost), binds authored .feature stories EXACT-or-UNBOUND with outcome steps resolved relative to the scenario's When-subject, and emits a BIDIRECTIONAL tri-state gap report (PARAPHRASE / NEEDS-DEV-GLUE / NEEDS-CONTRACT) + contract->authored coverage holes. A pure function of the document. CANDIDATE tooling.

## Quick Start

```ts
import { generateVocabulary, parseFeature, bindFeatures, renderGapReport, renderPhrasebook } from "@suluk/journeys";
import { apiDocument } from "./contract"; // your v4 contract

const vocab = generateVocabulary(apiDocument());
console.log(renderPhrasebook(vocab)); // the palette an author picks from

const feature = parseFeature(await Bun.file("./billing.feature").text());
const report = bindFeatures(vocab, [feature], {
  aliases: { "given i am a logged in user": "given i am a signed-in user" }, // author-owned, no dev
});
console.log(renderGapReport(report));
```

## Configuration

7 configuration interfaces — see references/config.md for details.

## Quick Reference

75 exports (31 functions, 42 types, 2 constants) — see references/ for full API.

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)