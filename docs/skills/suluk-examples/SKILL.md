---
description: "Example precedence + deterministic, origin-aware schema synthesis from a v4 'Suluk' contract. The shared, zero-dependency leaf both @suluk/journeys and @suluk/sdk read: resolveExample (public > maintainer > synthetic), a deterministic synthesizer, and the C041 field-origin discipline (x-suluk-origin input|sourced|computed + the wireable SourceRef). Pure, self-contained, faker-dep-free. CANDIDATE tooling."
name: suluk-examples
---

# @suluk/examples

Example precedence + deterministic, origin-aware schema synthesis from a v4 'Suluk' contract. The shared, zero-dependency leaf both @suluk/journeys and @suluk/sdk read: resolveExample (public > maintainer > synthetic), a deterministic synthesizer, and the C041 field-origin discipline (x-suluk-origin input|sourced|computed + the wireable SourceRef). Pure, self-contained, faker-dep-free. CANDIDATE tooling.

## Quick Start

```ts
import { resolveExample, synthesize, describeInputs } from "@suluk/examples";

const schema = {
  type: "object",
  required: ["email"],
  properties: {
    id:    { type: "string", "x-suluk-origin": "computed" }, // server-derived
    email: { type: "string", format: "email" },              // client input
  },
};

// Precedence: public > maintainer > schema example > synthetic.
resolveExample(schema, { maintainer: { email: "given@example.com" } });
// → { value: { email: "given@example.com" }, tier: "maintainer", synthetic: false, provenance: "maintainer-explicit" }

resolveExample(schema);
// → { value: { email: "user@example.com" }, tier: "synthetic", synthetic: true, provenance: "synthetic" }
//   (a REQUEST example drops the `computed` id — a client never sends it)

// A deterministic value for a RESPONSE (drops writeOnly, keeps computed fields):
synthesize(schema, "user", { direction: "response" });

// Which fields a client may freely fill, which are wired, which are server-computed:
describeInputs(schema);
// → [{ name: "id", origin: "computed", fakerable: false, required: false },
//    { name: "email", origin: "input", fakerable: true, required: true }]
```

## Configuration

**SynthOptions** (1 options — see references/config.md)

## Quick Reference

**Functions:** `fieldOrigin` (Read a property's origin: explicit `x-suluk-origin` wins; else `readOnly` ⇒ `computed`; else default `input`), `asSourceRef` (The structured source edge if `x-suluk-from` names an `op`; otherwise undefined (a free note is not wireable)), `describeInputs` (Describe the TOP-LEVEL fields of an object schema by origin — the surface a client / the @suluk/sdk generator uses to
know what it may freely fill (`fakerable`), what is wired from elsewhere (`source`), and what is server-computed), `resolveSourced` (Resolve a `sourced` field's value from a scenario-scoped bag of captured operation results (keyed by `op), `resolveExample` (Resolve a single example by precedence), `synthesize` (A deterministic, schema-shaped example value)
**Types:** `JsonSchema` (A JSON Schema 2020-12 object (the v4 inner-schema shape)), `ExampleTier` (Which source supplied the resolved value), `ExampleSources` (The two human-authored tiers a caller may supply; the synthetic tier is derived from the schema), `ResolvedExample`, `FieldOrigin` (`input` = the client is the authority (free, faker-able); `sourced` = retrieved elsewhere (wired); `computed` = server-derived), `SourceRef` (A machine-wireable source edge for a `sourced` field: pull `select` (default "id") from operation `op`'s response), `FieldSource` (`x-suluk-from` is EITHER a free human note (string, doc-only) OR a structured, wireable `SourceRef`), `FieldDescriptor`, `SynthDirection` (Direction controls origin handling: a "request" example omits server-`computed` fields a client never sends; a
 "response" example omits `writeOnly` fields)
**Constants:** `ORIGIN_KEYWORD`, `FROM_KEYWORD`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)