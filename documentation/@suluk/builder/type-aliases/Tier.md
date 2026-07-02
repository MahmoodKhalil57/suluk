[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / Tier

# Type Alias: Tier

> **Tier** = `"components"` \| `"blocks"` \| `"sections"` \| `"pages"`

Defined in: [dsl.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/dsl.ts#L22)

The composition DSL — the contract model.

Ported from ~/apps/multivendorbuilder's DSL and rebuilt on the Suluk discipline. The tier rule
(components → blocks → sections → pages) is secondary; the LOAD-BEARING idea is the contract:

  A document's `params` is EXACTLY and ONLY what the tier above may set.

Each tier consumes the full contract of the tier below, hardcodes most of it with literals, and
re-publishes a deliberately narrower `params` upward. "The owner can't change the form's fields" is not
a special rule — `fields` simply isn't in the section's `params`, so the validator rejects it like any
unknown key. The narrowing IS the contract surface. This is the SAME discipline as Suluk's per-viewer doc
projection (an operation you can't see isn't a rule — its scope just isn't in your principal), applied to
composition rather than visibility.

Bindings inside a document's `root` / `catalog`:
  { $bind: "paramName" }  → forward this document's resolved param value (object form so a literal stays literal)
  { $each: "listParam" }  → expand to the catalog entries the consumer selected (honouring the list controls)
  { $slot: true }         → where consumer-passed children render
